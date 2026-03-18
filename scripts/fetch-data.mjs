#!/usr/bin/env node

/**
 * AI Traffic Brief — PostHog Data Fetcher (Lens Architecture)
 *
 * Queries PostHog HogQL API per-Lens and outputs AllLensData JSON.
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

const PAGEVIEW_EVENT = '$pageview'

// ── Lens definitions ────────────────────────────────────

const LENSES = [
  {
    key: 'all',
    label: 'All Traffic',
    whereClause: '',
    distributionDimension: 'medium',
    visibleDimensions: ['country', 'source', 'medium', 'campaign', 'content', 'device', 'path'],
  },
  {
    key: 'paid-ads',
    label: 'Paid Ads',
    whereClause: `AND properties.utm_medium IN ('cpc', 'paid-social', 'display')`,
    distributionDimension: 'medium',
    visibleDimensions: ['source', 'campaign', 'content', 'country', 'device'],
  },
  {
    key: 'kol',
    label: 'KOL & Affiliate',
    whereClause: `AND properties.utm_medium = 'influencer'`,
    distributionDimension: 'source',
    visibleDimensions: ['source', 'campaign', 'content', 'country'],
  },
  {
    key: 'seo',
    label: 'SEO',
    whereClause: `AND (properties.utm_medium IS NULL OR properties.utm_medium = '' OR properties.utm_medium = 'social')`,
    distributionDimension: 'country',
    visibleDimensions: ['source', 'country', 'path', 'device'],
  },
  {
    key: 'growth-pm',
    label: 'Growth PM',
    whereClause: `AND properties.utm_medium IN ('referral-program', 'link', 'email')`,
    distributionDimension: 'medium',
    visibleDimensions: ['source', 'content', 'path'],
  },
]

const ALL_DIMENSIONS = {
  country:  { expr: `properties.$geoip_country_name`, label: 'Country' },
  source:   { expr: `properties.utm_source`,          label: 'UTM Source' },
  medium:   { expr: `properties.utm_medium`,          label: 'UTM Medium' },
  campaign: { expr: `properties.utm_campaign`,        label: 'UTM Campaign' },
  content:  { expr: `properties.utm_content`,         label: 'UTM Content' },
  device:   { expr: `properties.$device_type`,        label: 'Device Type' },
  path:     { expr: `properties.$pathname`,           label: 'Path Name' },
}

// ── API Helper ──────────────────────────────────────────

const sleep = (ms) => new Promise(r => setTimeout(r, ms))

async function hogqlQuery(query, retries = 3) {
  const url = `${HOST}/api/projects/${PROJECT_ID}/query/`
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
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
        if (attempt < retries && (res.status >= 500 || res.status === 429)) {
          console.warn(`    ⚠ API ${res.status}, retrying (${attempt}/${retries})...`)
          await sleep(2000 * attempt)
          continue
        }
        throw new Error(`PostHog API error ${res.status}: ${text.slice(0, 500)}`)
      }
      const data = await res.json()
      if (data.error) throw new Error(`HogQL error: ${data.error}`)
      return { columns: data.columns, results: data.results }
    } catch (err) {
      if (attempt < retries && err.cause?.code !== 'ERR_INVALID_URL') {
        console.warn(`    ⚠ ${err.message.slice(0, 80)}, retrying (${attempt}/${retries})...`)
        await sleep(2000 * attempt)
        continue
      }
      throw err
    }
  }
}

// ── Per-Lens Queries ────────────────────────────────────

async function fetchOverview(whereClause) {
  const { results } = await hogqlQuery(`
    SELECT
      sumIf(1, timestamp >= now() - interval 1 day) as current_pv,
      sumIf(1, timestamp >= now() - interval 2 day AND timestamp < now() - interval 1 day) as previous_pv,
      uniqIf(distinct_id, timestamp >= now() - interval 1 day) as current_users,
      uniqIf(distinct_id, timestamp >= now() - interval 2 day AND timestamp < now() - interval 1 day) as previous_users
    FROM events
    WHERE event = '${PAGEVIEW_EVENT}'
      AND timestamp >= now() - interval 2 day
      ${whereClause}
  `)
  const [currentPV, previousPV, currentUsers, previousUsers] = results[0]
  return {
    currentPV, previousPV, currentUsers, previousUsers,
    pvChangePct: previousPV === 0 ? 0 : (currentPV - previousPV) / previousPV,
    usersChangePct: previousUsers === 0 ? 0 : (currentUsers - previousUsers) / previousUsers,
  }
}

async function fetchTrends(whereClause) {
  const { results } = await hogqlQuery(`
    SELECT
      toDate(timestamp) as day,
      count() as pv,
      uniq(distinct_id) as users
    FROM events
    WHERE event = '${PAGEVIEW_EVENT}'
      AND timestamp >= now() - interval 7 day
      ${whereClause}
    GROUP BY day
    ORDER BY day ASC
  `)
  return results.map(([date, pv, users]) => ({ date, pv, users }))
}

async function fetchDimensionBreakdown(dimKey, dimConfig, whereClause) {
  const nullLabel = '(direct)'
  const { results } = await hogqlQuery(`
    SELECT
      coalesce(toString(${dimConfig.expr}), '${nullLabel}') as dim_value,
      sumIf(1, timestamp >= now() - interval 1 day) as current_pv,
      sumIf(1, timestamp >= now() - interval 2 day AND timestamp < now() - interval 1 day) as previous_pv,
      uniqIf(distinct_id, timestamp >= now() - interval 1 day) as current_users,
      uniqIf(distinct_id, timestamp >= now() - interval 2 day AND timestamp < now() - interval 1 day) as previous_users
    FROM events
    WHERE event = '${PAGEVIEW_EVENT}'
      AND timestamp >= now() - interval 2 day
      ${whereClause}
    GROUP BY dim_value
    HAVING current_users > 0 OR previous_users > 0
    ORDER BY current_users DESC
    LIMIT 10
  `)
  return {
    dimension: dimKey,
    label: dimConfig.label,
    items: results.map(([name, currentPV, previousPV, currentUsers, previousUsers]) => ({
      name: name || nullLabel,
      dimension: dimKey,
      currentPV, previousPV, currentUsers, previousUsers,
      pvChangePct: previousPV === 0 ? (currentPV > 0 ? 1 : 0) : (currentPV - previousPV) / previousPV,
      usersChangePct: previousUsers === 0 ? (currentUsers > 0 ? 1 : 0) : (currentUsers - previousUsers) / previousUsers,
    })),
  }
}

async function fetchDistribution(distDimKey, distDimConfig, whereClause) {
  const nullLabel = '(none)'
  const { results } = await hogqlQuery(`
    SELECT
      coalesce(toString(${distDimConfig.expr}), '${nullLabel}') as dim_value,
      uniqIf(distinct_id, timestamp >= now() - interval 1 day) as current_users,
      uniqIf(distinct_id, timestamp >= now() - interval 2 day AND timestamp < now() - interval 1 day) as previous_users
    FROM events
    WHERE event = '${PAGEVIEW_EVENT}'
      AND timestamp >= now() - interval 2 day
      ${whereClause}
    GROUP BY dim_value
    HAVING current_users > 0 OR previous_users > 0
    ORDER BY current_users DESC
    LIMIT 10
  `)

  const totalCurrent = results.reduce((s, r) => s + r[1], 0)
  const totalPrevious = results.reduce((s, r) => s + r[2], 0)

  return results.map(([name, currentUsers, previousUsers]) => ({
    name: name || nullLabel,
    currentUsers,
    previousUsers,
    currentPct: totalCurrent === 0 ? 0 : currentUsers / totalCurrent,
    previousPct: totalPrevious === 0 ? 0 : previousUsers / totalPrevious,
  }))
}

// ── Main ────────────────────────────────────────────────

async function main() {
  console.log('AI Traffic Brief — Fetching PostHog data (Lens Architecture)...\n')

  // Fetch "All" overview first for totalUsers
  const allOverview = await fetchOverview('')
  const totalUsers = allOverview.currentUsers
  console.log(`  Global total: ${totalUsers.toLocaleString()} users\n`)

  const lenses = {}

  for (const lens of LENSES) {
    console.log(`── ${lens.label} ──`)

    const overview = lens.key === 'all'
      ? allOverview
      : await fetchOverview(lens.whereClause)
    console.log(`  Overview: ${overview.currentUsers.toLocaleString()} users (${(overview.usersChangePct * 100).toFixed(1)}%)`)

    const trends = await fetchTrends(lens.whereClause)
    console.log(`  Trends: ${trends.length} days`)

    const dimensions = []
    for (const dimKey of lens.visibleDimensions) {
      const dimConfig = ALL_DIMENSIONS[dimKey]
      console.log(`  Dimension: ${dimConfig.label}...`)
      dimensions.push(await fetchDimensionBreakdown(dimKey, dimConfig, lens.whereClause))
      await sleep(500) // gentle rate limiting
    }

    const distDimConfig = ALL_DIMENSIONS[lens.distributionDimension]
    console.log(`  Distribution by ${distDimConfig.label}...`)
    const distribution = await fetchDistribution(
      lens.distributionDimension, distDimConfig, lens.whereClause
    )

    lenses[lens.key] = {
      overview,
      trends,
      dimensions,
      distribution,
      totalUsers,
    }

    console.log(`  ✓ ${lens.label} done\n`)
  }

  const output = {
    fetchedAt: new Date().toISOString(),
    lenses,
  }

  mkdirSync(OUTPUT_DIR, { recursive: true })
  const outPath = join(OUTPUT_DIR, 'latest.json')
  writeFileSync(outPath, JSON.stringify(output, null, 2))

  console.log(`✓ Data written to ${outPath}`)
  for (const lens of LENSES) {
    const d = lenses[lens.key]
    console.log(`  ${lens.label}: ${d.overview.currentUsers.toLocaleString()} users, ${d.dimensions.length} dims, ${d.distribution.length} dist items`)
  }
}

main().catch(err => {
  console.error('Error:', err.message)
  process.exit(1)
})
