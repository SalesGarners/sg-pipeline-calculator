/**
 * GTM Readiness Score and Pipeline Calculation Engine
 * Industry-aware benchmark funnel + reverse engineered pipeline logic
 */

// ─── Industry Benchmark Table ───────────────────────────────────────────────
const INDUSTRY_BENCHMARKS = {
  'SaaS':                 { openRate: 0.42, engageRate: 0.08, highIntent: 0.30, sqlRate: 0.25, meetingRate: 0.65 },
  'AI':                   { openRate: 0.45, engageRate: 0.10, highIntent: 0.35, sqlRate: 0.22, meetingRate: 0.60 },
  'FinTech':              { openRate: 0.38, engageRate: 0.07, highIntent: 0.28, sqlRate: 0.20, meetingRate: 0.58 },
  'IT Services / Consulting': { openRate: 0.45, engageRate: 0.09, highIntent: 0.30, sqlRate: 0.30, meetingRate: 0.70 },
  'E-commerce / MarTech': { openRate: 0.48, engageRate: 0.11, highIntent: 0.35, sqlRate: 0.28, meetingRate: 0.72 },
  'Other':                { openRate: 0.40, engageRate: 0.08, highIntent: 0.30, sqlRate: 0.25, meetingRate: 0.65 },
}

// ─── Midpoint Lookup Tables ──────────────────────────────────────────────────
const ACV_VALUES = {
  'less_than_5k':   2500,
  '5k_10k':         7500,
  '10k_25k':        17500,
  '25k_50k':        37500,
  'more_than_50k':  75000,
}

const MQL_SQL_RATES = {
  'less_than_10': 0.07,
  '10_20':        0.15,
  '20_30':        0.25,
  'more_than_30': 0.35,
}

const SQL_CUSTOMER_RATES = {
  'less_than_10': 0.07,
  '10_20':        0.15,
  '20_30':        0.25,
  'more_than_30': 0.35,
}

const MEETING_VALUES = {
  '0_10':    5,
  '10_25':   17,
  '25_50':   37,
  '50_plus': 60,
}

const DATABASE_VALUES = {
  'less_than_5k':   2500,
  '5k_20k':         12500,
  '20k_50k':        35000,
  '50k_100k':       75000,
  'more_than_100k': 150000,
}

const MQL_VALUES = {
  '0_50':     25,
  '50_100':   75,
  '100_250':  175,
  '250_plus': 300,
}

// ─── Scoring Tables ──────────────────────────────────────────────────────────
const INDUSTRY_SCORES = {
  'SaaS': 10, 'AI': 10, 'FinTech': 8,
  'IT Services / Consulting': 7, 'E-commerce / MarTech': 6, 'Other': 4,
}

const ACV_SCORES = {
  'more_than_50k': 15, '25k_50k': 12, '10k_25k': 9, '5k_10k': 6, 'less_than_5k': 3,
}

const MQL_SQL_SCORES = {
  'more_than_30': 15, '20_30': 12, '10_20': 8, 'less_than_10': 4,
}

const SQL_CUSTOMER_SCORES = {
  'more_than_30': 10, '20_30': 8, '10_20': 6, 'less_than_10': 3,
}

const OUTBOUND_SCORES = {
  'Multi-channel outbound': 20, 'SDR Calling': 16,
  'LinkedIn Outreach': 12, 'Cold Email': 8, 'None': 2,
}

const DATABASE_SIZE_SCORES = {
  'more_than_100k': 10, '50k_100k': 8, '20k_50k': 6, '5k_20k': 4, 'less_than_5k': 2,
}

const DATABASE_ACCURACY_SCORES = {
  'more_than_90': 10, '75_90': 7, '60_75': 4, 'less_than_60': 1,
}

// ─── Plans ───────────────────────────────────────────────────────────────────
const PLANS = {
  foundation: {
    name: 'Foundation Plan', price: '$5K/month',
    minMeetings: 0, maxMeetings: 24,
    outcomes: ['Up to 25 qualified meetings/month', 'Outbound foundation setup', 'Pipeline visibility and tracking'],
  },
  growth: {
    name: 'Growth Pipeline Engine', price: '$7.5K/month',
    minMeetings: 25, maxMeetings: 60,
    outcomes: ['40–60 qualified meetings/month', 'Predictable pipeline generation', 'Revenue acceleration'],
  },
  scale: {
    name: 'Scale Plan', price: '$10K+/month',
    minMeetings: 61, maxMeetings: Infinity,
    outcomes: ['60+ qualified meetings/month', 'Full multi-channel outbound', 'Market dominance strategy'],
  },
}

// ─── GTM Score ───────────────────────────────────────────────────────────────
function calculateGTMScore(data) {
  const marketScore = data.targetMarket === 'United States' ? 10
    : data.targetMarket === 'Global' ? 9
    : data.targetMarket === 'Europe' ? 8
    : data.targetMarket === 'APAC' ? 6 : 4

  const total =
    (INDUSTRY_SCORES[data.industry] || 4) +
    (ACV_SCORES[data.acv] || 3) +
    (MQL_SQL_SCORES[data.mqlToSql] || 4) +
    (SQL_CUSTOMER_SCORES[data.sqlToCustomer] || 3) +
    (OUTBOUND_SCORES[data.outboundType] || 2) +
    (DATABASE_SIZE_SCORES[data.databaseSize] || 2) +
    (DATABASE_ACCURACY_SCORES[data.databaseAccuracy] || 1) +
    marketScore

  return Math.min(100, Math.max(0, total))
}

function getGTMLabel(score) {
  if (score >= 80) return 'Market Ready'
  if (score >= 65) return 'Growth Potential'
  if (score >= 40) return 'Developing'
  return 'Early Stage'
}

function getRecommendedPlan(expectedMeetings) {
  for (const [key, plan] of Object.entries(PLANS)) {
    if (expectedMeetings >= plan.minMeetings && expectedMeetings <= plan.maxMeetings) {
      return { key, ...plan }
    }
  }
  return { key: 'growth', ...PLANS.growth }
}

// ─── Master Calculate ─────────────────────────────────────────────────────────
export function calculate(data) {
  const acv = ACV_VALUES[data.acv] || 17500
  const sqlCustomerRate = SQL_CUSTOMER_RATES[data.sqlToCustomer] || 0.15
  const mqlSqlRate = MQL_SQL_RATES[data.mqlToSql] || 0.15
  const currentMeetingsVal = MEETING_VALUES[data.currentMeetings] || 5
  const dbSize = DATABASE_VALUES[data.databaseSize] || 2500
  const mqlCount = MQL_VALUES[data.mqlsPerMonth] || 25

  // Industry-aware benchmark funnel rates
  const benchmark = INDUSTRY_BENCHMARKS[data.industry] || INDUSTRY_BENCHMARKS['Other']

  // ── Current Funnel (industry benchmark applied to database) ──
  const currentEngaged    = Math.round(dbSize * benchmark.openRate * benchmark.engageRate)
  const currentHighIntent = Math.round(currentEngaged * benchmark.highIntent)
  const currentSQLs       = Math.round(currentHighIntent * benchmark.sqlRate)
  const currentMeetingsFunnel = Math.round(currentSQLs * benchmark.meetingRate)
  const expectedMeetings  = Math.max(1, currentMeetingsFunnel)

  const currentPipeline   = currentMeetingsVal * acv
  const currentRevenueForecast = currentPipeline * sqlCustomerRate

  // ── Reverse Engineered Funnel (what user NEEDS) ──
  const quarterlyTarget   = data.quarterlyRevenueTarget
  const monthlyTarget     = quarterlyTarget / 3

  // Required Deals
  const requiredDeals     = monthlyTarget / acv

  // Required Meetings = Required Deals / Close Rate
  const requiredMeetings  = Math.ceil(requiredDeals / sqlCustomerRate)

  // Required SQLs = Required Meetings / SQL→Meeting rate
  const requiredSQLs      = Math.ceil(requiredMeetings / benchmark.meetingRate)

  // Required Leads = Required SQLs / Lead→SQL rate
  const requiredLeads     = Math.ceil(requiredSQLs / benchmark.sqlRate)

  // Required High Intent = Required Leads / highIntent
  const requiredHighIntent = Math.ceil(requiredLeads / benchmark.highIntent)

  // Pipeline coverage 3x–5x rule
  const requiredPipelineLow  = monthlyTarget * 3 * 3   // 3x coverage, 3 months
  const requiredPipelineHigh = monthlyTarget * 3 * 5   // 5x coverage

  // ── Pipeline & Revenue Output ──
  const pipelineMonth   = expectedMeetings * acv
  const pipelineQuarter = pipelineMonth * 3
  const dealsClosed     = expectedMeetings * sqlCustomerRate
  const revenueMonthly  = dealsClosed * acv

  // ── Gap Analysis ──
  const meetingGap  = Math.max(0, requiredMeetings - currentMeetingsVal)
  const pipelineGap = Math.max(0, requiredPipelineLow - currentPipeline)
  const revenueGap  = Math.max(0, monthlyTarget - currentRevenueForecast)

  const gtmScore = calculateGTMScore(data)
  const gtmLabel = getGTMLabel(gtmScore)
  const plan     = getRecommendedPlan(expectedMeetings)

  return {
    // Current funnel
    currentEngaged,
    currentHighIntent,
    currentSQLs,
    currentMeetingsFunnel,
    currentMeetingsVal,
    currentPipeline,
    currentRevenueForecast,
    expectedMeetings,

    // Required funnel
    requiredLeads,
    requiredHighIntent,
    requiredSQLs,
    requiredMeetings,
    requiredDeals: Math.ceil(requiredDeals),
    requiredPipelineLow,
    requiredPipelineHigh,
    monthlyTarget,

    // Output
    pipelineMonth,
    pipelineQuarter,
    revenueMonthly,

    // Gaps
    meetingGap,
    pipelineGap,
    revenueGap,

    // Score & plan
    gtmScore,
    gtmLabel,
    plan,

    // Benchmark used (for display)
    benchmark,
    industry: data.industry,
  }
}