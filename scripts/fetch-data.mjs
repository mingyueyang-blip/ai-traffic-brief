#!/usr/bin/env node

/**
 * AI Traffic Brief — PostHog Data Fetcher
 *
 * Queries PostHog HogQL API and outputs structured JSON
 * for the frontend to consume.
 *
 * Usage: node scripts/fetch-data.mjs
 *    or: pnpm run fetch-data
 */

import 'dotenv/config'
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT_DIR = join(__dirname, '..', 'src', 'data', 'posthog')

// ── Config ──────────────────────────────────────────────

const HOST = process.env.POSTHOG_HOST
const PROJECT_ID = process.env.POSTHOG_PROJECT_ID
const API_KEY = process.env.POSTHOG_API_KEY

if (!HOST || !PROJECT_ID || !API_KEY) {
  console.error('Missing env vars. Ensure .env has POSTHOG_HOST, POSTHOG_PROJECT_ID, POSTHOG_API_KEY')
  process.exit(1)
}

// PostHog event name — single constant, easy to change
const PAGEVIEW_EVENT = '$pageview'

// Dimension configs: key used in output, HogQL expression, display label
const DIMENSIONS = [
  { key: 'country',     expr: `properties.$geoip_country_name`, label: 'Country' },
  { key: 'source',      expr: `properties.utm_source`,          label: 'UTM Source' },
  { key: 'medium',      expr: `properties.utm_medium`,          label: 'UTM Medium' },
  { key: 'campaign',    expr: `properties.utm_campaign`,        label: 'UTM Campaign' },
  { key: 'content',     expr: `properties.utm_content`,         label: 'UTM Content' },
  { key: 'device',      expr: `properties.$device_type`,        label: 'Device Type' },
  { key: 'path',        expr: `properties.$pathname`,           label: 'Path Name' },
]

// ── API Helper ──────────────────────────────────────────

async function hogqlQuery(query) {
  const url = `${HOST}/api/projects/${PROJECT_ID}/query/`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: { kind: 'HogQLQuery', query } }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`PostHog API error ${res.status}: ${text.slice(0, 500)}`)
  }
  const data = await res.json()
  if (data.error) throw new Error(`HogQL error: ${data.error}`)
  return { columns: data.columns, results: data.results }
}

// ── Queries ─────────────────────────────────────────────

async function fetchOverview() {
  console.log('  Fetching overview...')
  const { results } = await hogqlQuery(`
    SELECT
      sumIf(1, timestamp >= now() - interval 1 day) as current_pv,
      sumIf(1, timestamp >= now() - interval 2 day AND timestamp < now() - interval 1 day) as previous_pv,
      uniqIf(distinct_id, timestamp >= now() - interval 1 day) as current_users,
      uniqIf(distinct_id, timestamp >= now() - interval 2 day AND timestamp < now() - interval 1 day) as previous_users
    FROM events
    WHERE event = '${PAGEVIEW_EVENT}'
      AND timestamp >= now() - interval 2 day
  `)
  const [currentPV, previousPV, currentUsers, previousUsers] = results[0]
  return {
    currentPV, previousPV, currentUsers, previousUsers,
    pvChangePct: previousPV === 0 ? 0 : (currentPV - previousPV) / previousPV,
    usersChangePct: previousUsers === 0 ? 0 : (currentUsers - previousUsers) / previousUsers,
  }
}

async function fetchTrends() {
  console.log('  Fetching 7-day trends...')
  const { results } = await hogqlQuery(`
    SELECT
      toDate(timestamp) as day,
      count() as pv,
      uniq(distinct_id) as users
    FROM events
    WHERE event = '${PAGEVIEW_EVENT}'
      AND timestamp >= now() - interval 7 day
    GROUP BY day
    ORDER BY day ASC
  `)
  return results.map(([date, pv, users]) => ({ date, pv, users }))
}

async function fetchDimensionBreakdown(dim) {
  console.log(`  Fetching dimension: ${dim.label}...`)
  const nullLabel = '(direct)'
  const { results } = await hogqlQuery(`
    SELECT
      coalesce(toString(${dim.expr}), '${nullLabel}') as dim_value,
      sumIf(1, timestamp >= now() - interval 1 day) as current_pv,
      sumIf(1, timestamp >= now() - interval 2 day AND timestamp < now() - interval 1 day) as previous_pv,
      uniqIf(distinct_id, timestamp >= now() - interval 1 day) as current_users,
      uniqIf(distinct_id, timestamp >= now() - interval 2 day AND timestamp < now() - interval 1 day) as previous_users
    FROM events
    WHERE event = '${PAGEVIEW_EVENT}'
      AND timestamp >= now() - interval 2 day
    GROUP BY dim_value
    HAVING current_users > 0 OR previous_users > 0
    ORDER BY current_users DESC
    LIMIT 30
  `)
  return {
    dimension: dim.key,
    label: dim.label,
    items: results.map(([name, currentPV, previousPV, currentUsers, previousUsers]) => ({
      name: name || nullLabel,
      dimension: dim.key,
      currentPV, previousPV, currentUsers, previousUsers,
      pvChangePct: previousPV === 0 ? (currentPV > 0 ? 1 : 0) : (currentPV - previousPV) / previousPV,
      usersChangePct: previousUsers === 0 ? (currentUsers > 0 ? 1 : 0) : (currentUsers - previousUsers) / previousUsers,
    })),
  }
}

// ── Main ────────────────────────────────────────────────

async function main() {
  console.log('AI Traffic Brief — Fetching PostHog data...\n')

  const overview = await fetchOverview()
  const trends = await fetchTrends()

  const dimensions = []
  for (const dim of DIMENSIONS) {
    dimensions.push(await fetchDimensionBreakdown(dim))
  }

  const output = {
    fetchedAt: new Date().toISOString(),
    overview,
    trends,
    dimensions,
  }

  mkdirSync(OUTPUT_DIR, { recursive: true })
  const outPath = join(OUTPUT_DIR, 'latest.json')
  writeFileSync(outPath, JSON.stringify(output, null, 2))

  console.log(`\n✓ Data written to ${outPath}`)
  console.log(`  Overview: ${overview.currentUsers.toLocaleString()} users (${(overview.usersChangePct * 100).toFixed(1)}%)`)
  console.log(`  Trends: ${trends.length} days`)
  console.log(`  Dimensions: ${dimensions.map(d => `${d.label} (${d.items.length})`).join(', ')}`)
}

main().catch(err => {
  console.error('Error:', err.message)
  process.exit(1)
})
