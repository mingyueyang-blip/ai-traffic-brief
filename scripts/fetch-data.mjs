#!/usr/bin/env node

/**
 * AI Traffic Brief — PostHog Data Fetcher (V3 · Multi-TimeSpan)
 *
 * Queries PostHog HogQL API for 4 department lenses x 2 time spans (7d, 30d).
 * Output: { lenses: { "paid-ads": { "7d": {...}, "30d": {...} }, ... } }
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
const SUBSCRIBED_COHORT_ID = 81876

// ── Time spans ──────────────────────────────────────────

const TIME_SPANS = [
  { key: '7d',  days: 7,  label: '7 Days' },
  { key: '30d', days: 30, label: '30 Days' },
]

// ── Lens definitions ────────────────────────────────────

const LENSES = [
  {
    key: 'paid-ads',
    label: 'Paid Ads',
    whereClause: `AND properties.utm_medium IN ('cpc', 'paid-social', 'display', 'paid', 'paid_social', 'ads')`,
    distributionDimension: 'source',
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
    distributionDimension: 'referring_domain',
    visibleDimensions: ['referring_domain', 'country', 'path', 'device'],
  },
  {
    key: 'growth-pm',
    label: 'Growth PM',
    whereClause: `AND properties.utm_medium IN ('referral-program', 'link', 'email')`,
    distributionDimension: 'source',
    visibleDimensions: ['source', 'share_type', 'path'],
    hasSubscription: true,
  },
]

const ALL_DIMENSIONS = {
  country:          { expr: `properties.$geoip_country_name`, label: 'Country' },
  source:           { expr: `properties.utm_source`,          label: 'UTM Source' },
  medium:           { expr: `properties.utm_medium`,          label: 'UTM Medium' },
  campaign:         { expr: `properties.utm_campaign`,        label: 'UTM Campaign' },
  content:          { expr: `properties.utm_content`,         label: 'UTM Content' },
  device:           { expr: `properties.$device_type`,        label: 'Device Type' },
  path:             { expr: `properties.$pathname`,           label: 'Path Name' },
  share_type:       { expr: `properties.share_type`,          label: 'Share Type' },
  referring_domain: { expr: `properties.$referring_domain`,   label: 'Referring Domain' },
}

// ── Mock AI Analysis ────────────────────────────────────

const AI_MOCK = {
  'paid-ads': `## Root Cause Analysis

**Google CPC traffic dropped -12.3% day-over-day**, contributing to the overall decline in Paid Ads acquired users.

### Key Findings
- **Google Ads**: CPC campaigns saw a significant drop, likely due to increased competition for "3d model generator" keywords pushing up bid costs. CTR remained stable at 3.2%, but impression volume dropped 18%.
- **Facebook Ads**: Paid social remained flat (+0.4%), suggesting the drop is Google-specific rather than a cross-platform trend.
- **Device shift**: Mobile Paid Ads users grew +5.2% while desktop dropped -8.1%, indicating a possible landing page performance issue on desktop.

### Recommended Next Steps
1. Check Google Ads dashboard for any paused campaigns or budget cap hits
2. Review desktop landing page load times (>3s may correlate with bounce rate spike)
3. Consider reallocating 10-15% of Google CPC budget to YouTube pre-roll which shows +22% ROAS this week`,

  'kol': `## Root Cause Analysis

**KOL traffic is concentrated on 2 creators** who account for 67% of all influencer-driven visits.

### Key Findings
- **Top performer**: @meshy3d_tutorials (YouTube) drove 340 users yesterday, up from 280 the day before (+21.4%)
- **Underperformer**: Instagram influencer campaigns saw -31% traffic. This correlates with the end of the "Meshy 5.0 launch" campaign window.
- **Affiliate links**: The via= parameter shows 12 active affiliates, but only 3 have driven >50 users in the past 7 days.

### Recommended Next Steps
1. Prioritize YouTube KOL partnerships — ROI is 3.2x higher than Instagram for this vertical
2. Reach out to inactive affiliates with refreshed creative assets
3. Set up automated weekly KOL performance reports to catch drops faster`,

  'seo': `## Root Cause Analysis

**Organic traffic is stable** but the composition is shifting from direct search to social referrals.

### Key Findings
- **Google organic**: Still the #1 source at 58% of SEO traffic, but growth has plateaued (+0.3% WoW)
- **Reddit referrals**: Emerging as a strong organic channel at +34% WoW, driven by community posts about AI 3D modeling
- **Content gap**: The /gallery and /features pages rank #1-3 for 23 keywords, but /pricing has dropped to page 2 for "ai 3d model pricing"
- **Core Web Vitals**: LCP improved to 2.1s (from 2.8s) after the CDN migration, which may explain the slight organic lift

### Recommended Next Steps
1. Create dedicated Reddit content strategy — this channel is growing organically
2. Optimize /pricing page SEO (meta title, structured data, internal linking)
3. Monitor Core Web Vitals weekly to maintain ranking advantage`,

  'growth-pm': `## Root Cause Analysis

**Referral traffic shows healthy growth** but email channel is underperforming expectations.

### Key Findings
- **Referral program**: Direct referral links (utm_medium=link) grew +8.2%, indicating strong word-of-mouth momentum
- **Email campaigns**: Email-driven traffic dropped -15.6%. The last campaign sent 3 days ago had a 12% open rate (vs 18% benchmark), suggesting subject line fatigue.
- **Share type analysis**: "workspace" shares are growing fastest (+24%), while "model" shares plateaued. Users are increasingly sharing collaborative workspaces rather than individual outputs.

### Recommended Next Steps
1. A/B test email subject lines — current templates have been unchanged for 6 weeks
2. Incentivize workspace sharing with a "team referral" bonus
3. Add share_type=workspace as a tracked conversion goal in PostHog`,
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

// ── Per-Lens Queries (parameterized by spanDays) ────────

async function fetchOverview(whereClause, spanDays) {
  const { results } = await hogqlQuery(`
    SELECT
      sumIf(1, timestamp >= now() - interval ${spanDays} day) as current_pv,
      sumIf(1, timestamp >= now() - interval ${spanDays * 2} day AND timestamp < now() - interval ${spanDays} day) as previous_pv,
      uniqIf(distinct_id, timestamp >= now() - interval ${spanDays} day) as current_users,
      uniqIf(distinct_id, timestamp >= now() - interval ${spanDays * 2} day AND timestamp < now() - interval ${spanDays} day) as previous_users
    FROM events
    WHERE event = '${PAGEVIEW_EVENT}'
      AND timestamp >= now() - interval ${spanDays * 2} day
      ${whereClause}
  `)
  const [currentPV, previousPV, currentUsers, previousUsers] = results[0]
  return {
    currentPV, previousPV, currentUsers, previousUsers,
    pvChangePct: previousPV === 0 ? 0 : (currentPV - previousPV) / previousPV,
    usersChangePct: previousUsers === 0 ? 0 : (currentUsers - previousUsers) / previousUsers,
  }
}

async function fetchTrends(whereClause, spanDays) {
  const { results } = await hogqlQuery(`
    SELECT
      toDate(timestamp) as day,
      count() as pv,
      uniq(distinct_id) as users
    FROM events
    WHERE event = '${PAGEVIEW_EVENT}'
      AND timestamp >= now() - interval ${spanDays} day
      ${whereClause}
    GROUP BY day
    ORDER BY day ASC
  `)
  return results.map(([date, pv, users]) => ({ date, pv, users }))
}

async function fetchDimensionBreakdown(dimKey, dimConfig, whereClause, spanDays) {
  const nullLabel = '(direct)'
  const { results } = await hogqlQuery(`
    SELECT
      coalesce(toString(${dimConfig.expr}), '${nullLabel}') as dim_value,
      sumIf(1, timestamp >= now() - interval ${spanDays} day) as current_pv,
      sumIf(1, timestamp >= now() - interval ${spanDays * 2} day AND timestamp < now() - interval ${spanDays} day) as previous_pv,
      uniqIf(distinct_id, timestamp >= now() - interval ${spanDays} day) as current_users,
      uniqIf(distinct_id, timestamp >= now() - interval ${spanDays * 2} day AND timestamp < now() - interval ${spanDays} day) as previous_users
    FROM events
    WHERE event = '${PAGEVIEW_EVENT}'
      AND timestamp >= now() - interval ${spanDays * 2} day
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

async function fetchDistribution(distDimKey, distDimConfig, whereClause, spanDays) {
  const nullLabel = '(none)'
  const { results } = await hogqlQuery(`
    SELECT
      coalesce(toString(${distDimConfig.expr}), '${nullLabel}') as dim_value,
      uniqIf(distinct_id, timestamp >= now() - interval ${spanDays} day) as current_users,
      uniqIf(distinct_id, timestamp >= now() - interval ${spanDays * 2} day AND timestamp < now() - interval ${spanDays} day) as previous_users
    FROM events
    WHERE event = '${PAGEVIEW_EVENT}'
      AND timestamp >= now() - interval ${spanDays * 2} day
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

async function fetchSubscription(spanDays) {
  const { results: overviewResults } = await hogqlQuery(`
    SELECT
      uniqIf(distinct_id, timestamp >= now() - interval ${spanDays} day) as current_users,
      uniqIf(distinct_id, timestamp >= now() - interval ${spanDays * 2} day AND timestamp < now() - interval ${spanDays} day) as previous_users
    FROM events
    WHERE event = '${PAGEVIEW_EVENT}'
      AND timestamp >= now() - interval ${spanDays * 2} day
      AND person_id IN COHORT ${SUBSCRIBED_COHORT_ID}
  `)

  const [currentUsers, previousUsers] = overviewResults[0]
  const changePct = previousUsers === 0 ? 0 : (currentUsers - previousUsers) / previousUsers

  const { results: countryResults } = await hogqlQuery(`
    SELECT
      coalesce(toString(properties.$geoip_country_name), '(unknown)') as country,
      uniqIf(distinct_id, timestamp >= now() - interval ${spanDays} day) as current_users,
      uniqIf(distinct_id, timestamp >= now() - interval ${spanDays * 2} day AND timestamp < now() - interval ${spanDays} day) as previous_users
    FROM events
    WHERE event = '${PAGEVIEW_EVENT}'
      AND timestamp >= now() - interval ${spanDays * 2} day
      AND person_id IN COHORT ${SUBSCRIBED_COHORT_ID}
    GROUP BY country
    HAVING current_users > 0 OR previous_users > 0
    ORDER BY current_users DESC
    LIMIT 10
  `)

  return {
    currentUsers,
    previousUsers,
    changePct,
    byCountry: countryResults.map(([country, cur, prev]) => ({
      country, currentUsers: cur, previousUsers: prev,
    })),
  }
}

// ── Fetch one lens for one time span ────────────────────

async function fetchLensSpan(lens, span) {
  const { days } = span
  console.log(`  [${span.key}] Overview...`)
  const overview = await fetchOverview(lens.whereClause, days)

  console.log(`  [${span.key}] Trends...`)
  const trends = await fetchTrends(lens.whereClause, days)

  const dimensions = []
  for (const dimKey of lens.visibleDimensions) {
    const dimConfig = ALL_DIMENSIONS[dimKey]
    console.log(`  [${span.key}] Dim: ${dimConfig.label}...`)
    dimensions.push(await fetchDimensionBreakdown(dimKey, dimConfig, lens.whereClause, days))
    await sleep(400)
  }

  const distDimConfig = ALL_DIMENSIONS[lens.distributionDimension]
  console.log(`  [${span.key}] Distribution...`)
  const distribution = await fetchDistribution(
    lens.distributionDimension, distDimConfig, lens.whereClause, days
  )

  const lensData = { overview, trends, dimensions, distribution, totalUsers: 0 }

  if (lens.hasSubscription) {
    console.log(`  [${span.key}] Subscription...`)
    lensData.subscription = await fetchSubscription(days)
  }

  return lensData
}

// ── Main ────────────────────────────────────────────────

async function main() {
  console.log('AI Traffic Brief — Fetching PostHog data (V3 · 7d + 30d)...\n')

  // Fetch global totals for both spans
  const globalTotals = {}
  for (const span of TIME_SPANS) {
    const g = await fetchOverview('', span.days)
    globalTotals[span.key] = g.currentUsers
    console.log(`  Global [${span.key}]: ${g.currentUsers.toLocaleString()} users`)
  }
  console.log()

  const lenses = {}

  for (const lens of LENSES) {
    console.log(`── ${lens.label} ──`)
    lenses[lens.key] = {}

    for (const span of TIME_SPANS) {
      const data = await fetchLensSpan(lens, span)
      data.totalUsers = globalTotals[span.key]

      // Inject mock AI analysis (same for both spans — it's static)
      data.aiDeepDiveAnalysis = AI_MOCK[lens.key] || ''

      lenses[lens.key][span.key] = data
      console.log(`  [${span.key}] ✓ ${data.overview.currentUsers.toLocaleString()} users`)
    }

    console.log(`  ✓ ${lens.label} done\n`)
  }

  const output = { fetchedAt: new Date().toISOString(), lenses }

  mkdirSync(OUTPUT_DIR, { recursive: true })
  const outPath = join(OUTPUT_DIR, 'latest.json')
  writeFileSync(outPath, JSON.stringify(output, null, 2))

  console.log(`✓ Data written to ${outPath}`)
  for (const lens of LENSES) {
    const d7 = lenses[lens.key]['7d']
    const d30 = lenses[lens.key]['30d']
    console.log(`  ${lens.label}: 7d=${d7.overview.currentUsers.toLocaleString()}, 30d=${d30.overview.currentUsers.toLocaleString()}`)
  }
}

main().catch(err => {
  console.error('Error:', err.message)
  process.exit(1)
})
