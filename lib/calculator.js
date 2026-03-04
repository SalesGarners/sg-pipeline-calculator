/**
 * GTM Readiness Score and Pipeline Calculation Engine
 * Based on senior's specification document — exact formulas and scoring weights.
 */

// ACV midpoint values for calculations
const ACV_VALUES = {
  'less_than_5k': 2500,
  '5k_10k': 7500,
  '10k_25k': 17500,
  '25k_50k': 37500,
  'more_than_50k': 75000,
}

// Sales cycle midpoint in days
const SALES_CYCLE_DAYS = {
  'less_than_30': 15,
  '30_60': 45,
  '60_90': 75,
  '90_180': 135,
  'more_than_180': 210,
}

// MQL midpoint values
const MQL_VALUES = {
  '0_50': 25,
  '50_100': 75,
  '100_250': 175,
  '250_plus': 300,
}

// MQL to SQL conversion rate midpoints
const MQL_SQL_RATES = {
  'less_than_10': 0.07,
  '10_20': 0.15,
  '20_30': 0.25,
  'more_than_30': 0.35,
}

// SQL to Customer conversion rate midpoints
const SQL_CUSTOMER_RATES = {
  'less_than_10': 0.07,
  '10_20': 0.15,
  '20_30': 0.25,
  'more_than_30': 0.35,
}

// Current meetings midpoint values
const MEETING_VALUES = {
  '0_10': 5,
  '10_25': 17,
  '25_50': 37,
  '50_plus': 60,
}

// Current pipeline midpoint values
const PIPELINE_VALUES = {
  'less_than_100k': 50000,
  '100k_500k': 300000,
  '500k_1m': 750000,
  'more_than_1m': 1500000,
}

// Database size midpoint values
const DATABASE_VALUES = {
  'less_than_5k': 2500,
  '5k_20k': 12500,
  '20k_50k': 35000,
  '50k_100k': 75000,
  'more_than_100k': 150000,
}

// Industry scoring (max 10)
const INDUSTRY_SCORES = {
  'SaaS': 10,
  'AI': 10,
  'FinTech': 8,
  'IT Services / Consulting': 7,
  'E-commerce / MarTech': 6,
  'Other': 4,
}

// ACV scoring (max 15)
const ACV_SCORES = {
  'more_than_50k': 15,
  '25k_50k': 12,
  '10k_25k': 9,
  '5k_10k': 6,
  'less_than_5k': 3,
}

// MQL to SQL scoring (max 15)
const MQL_SQL_SCORES = {
  'more_than_30': 15,
  '20_30': 12,
  '10_20': 8,
  'less_than_10': 4,
}

// SQL to Customer scoring (max 10)
const SQL_CUSTOMER_SCORES = {
  'more_than_30': 10,
  '20_30': 8,
  '10_20': 6,
  'less_than_10': 3,
}

// Outbound scoring (max 20)
const OUTBOUND_SCORES = {
  'Multi-channel outbound': 20,
  'SDR Calling': 16,
  'LinkedIn Outreach': 12,
  'Cold Email': 8,
  'None': 2,
}

// Database size scoring (max 10)
const DATABASE_SIZE_SCORES = {
  'more_than_100k': 10,
  '50k_100k': 8,
  '20k_50k': 6,
  '5k_20k': 4,
  'less_than_5k': 2,
}

// Database accuracy scoring (max 10)
const DATABASE_ACCURACY_SCORES = {
  'more_than_90': 10,
  '75_90': 7,
  '60_75': 4,
  'less_than_60': 1,
}

// Plan recommendation based on expected meetings
const PLANS = {
  foundation: {
    name: 'Foundation Plan',
    price: '$5K/month',
    minMeetings: 0,
    maxMeetings: 24,
    outcomes: [
      'Up to 25 qualified meetings/month',
      'Outbound foundation setup',
      'Pipeline visibility and tracking',
    ],
  },
  growth: {
    name: 'Growth Pipeline Engine',
    price: '$7.5K/month',
    minMeetings: 25,
    maxMeetings: 60,
    outcomes: [
      '40–60 qualified meetings/month',
      'Predictable pipeline generation',
      'Revenue acceleration',
    ],
  },
  scale: {
    name: 'Scale Plan',
    price: '$10K+/month',
    minMeetings: 61,
    maxMeetings: Infinity,
    outcomes: [
      '60+ qualified meetings/month',
      'Full multi-channel outbound',
      'Market dominance strategy',
    ],
  },
}

/**
 * Industry benchmark funnel assumptions (from doc Section 4)
 */
const FUNNEL = {
  openRate: 0.40,
  engagementRate: 0.08,
  highIntentRate: 0.30,
  sqlRate: 0.25,
  meetingRate: 0.65,
}

/**
 * Calculate expected meetings using funnel model (Section 4)
 * Emails = database size (midpoint)
 * Engaged = Emails × openRate × engagementRate
 * HighIntent = Engaged × highIntentRate
 * SQLs = HighIntent × sqlRate
 * Meetings = SQLs × meetingRate
 */
function calculateExpectedMeetings(data) {
  const dbSize = DATABASE_VALUES[data.databaseSize] || 2500
  const engaged = dbSize * FUNNEL.openRate * FUNNEL.engagementRate
  const highIntent = engaged * FUNNEL.highIntentRate
  const sqls = highIntent * FUNNEL.sqlRate
  const meetings = Math.round(sqls * FUNNEL.meetingRate)
  return Math.max(1, meetings)
}

/**
 * Calculate required meetings from revenue target (Section 3)
 * Monthly_Revenue_Target = Quarterly / 3
 * Required_Deals = Monthly_Revenue_Target / ACV
 * Required_Meetings = Required_Deals / Close_Rate
 */
function calculateRequiredMeetings(data) {
  const acv = ACV_VALUES[data.acv] || 17500
  const sqlCustomerRate = SQL_CUSTOMER_RATES[data.sqlToCustomer] || 0.15
  const monthlyTarget = data.quarterlyRevenueTarget / 3
  const requiredDeals = monthlyTarget / acv
  const requiredMeetings = Math.ceil(requiredDeals / sqlCustomerRate)
  return requiredMeetings
}

/**
 * Calculate pipeline and revenue (Section 5)
 */
function calculatePipelineAndRevenue(data, expectedMeetings) {
  const acv = ACV_VALUES[data.acv] || 17500
  const sqlCustomerRate = SQL_CUSTOMER_RATES[data.sqlToCustomer] || 0.15

  const pipelineMonth = expectedMeetings * acv
  const pipelineQuarter = pipelineMonth * 3

  const dealsClosed = expectedMeetings * sqlCustomerRate
  const revenueMonthly = dealsClosed * acv

  return { pipelineMonth, pipelineQuarter, revenueMonthly }
}

/**
 * Calculate GTM Readiness Score (0–100)
 */
function calculateGTMScore(data) {
  const industryScore = INDUSTRY_SCORES[data.industry] || 4                    // max 10
  const acvScore = ACV_SCORES[data.acv] || 3                                   // max 15
  const mqlSqlScore = MQL_SQL_SCORES[data.mqlToSql] || 4                       // max 15
  const sqlCustomerScore = SQL_CUSTOMER_SCORES[data.sqlToCustomer] || 3        // max 10
  const outboundScore = OUTBOUND_SCORES[data.outboundType] || 2                // max 20
  const dbSizeScore = DATABASE_SIZE_SCORES[data.databaseSize] || 2             // max 10
  const dbAccuracyScore = DATABASE_ACCURACY_SCORES[data.databaseAccuracy] || 1 // max 10

  // Remaining 10 points from market fit (US/Global = 10, EU = 8, APAC = 6, others = 4)
  const marketScore = data.targetMarket === 'United States' ? 10
    : data.targetMarket === 'Global' ? 9
    : data.targetMarket === 'Europe' ? 8
    : data.targetMarket === 'APAC' ? 6 : 4

  const total = industryScore + acvScore + mqlSqlScore + sqlCustomerScore
    + outboundScore + dbSizeScore + dbAccuracyScore + marketScore

  return Math.min(100, Math.max(0, total))
}

/**
 * Get GTM score label
 */
function getGTMLabel(score) {
  if (score >= 80) return 'Market Ready'
  if (score >= 65) return 'Growth Potential'
  if (score >= 40) return 'Developing'
  return 'Early Stage'
}

/**
 * Get recommended plan based on expected meetings
 */
function getRecommendedPlan(expectedMeetings) {
  for (const [key, plan] of Object.entries(PLANS)) {
    if (expectedMeetings >= plan.minMeetings && expectedMeetings <= plan.maxMeetings) {
      return { key, ...plan }
    }
  }
  return { key: 'growth', ...PLANS.growth }
}

/**
 * Master calculate function — single entry point
 */
export function calculate(data) {
  const expectedMeetings = calculateExpectedMeetings(data)
  const requiredMeetings = calculateRequiredMeetings(data)
  const currentMeetings = MEETING_VALUES[data.currentMeetings] || 5
  const currentPipeline = PIPELINE_VALUES[data.currentPipeline] || 50000

  const { pipelineMonth, pipelineQuarter, revenueMonthly } = calculatePipelineAndRevenue(data, expectedMeetings)

  const monthlyRevenueTarget = data.quarterlyRevenueTarget / 3
  const requiredPipeline = monthlyRevenueTarget * 3 / (SQL_CUSTOMER_RATES[data.sqlToCustomer] || 0.15)

  // Gap Analysis (Section 6)
  const meetingGap = Math.max(0, expectedMeetings - currentMeetings)
  const pipelineGap = Math.max(0, requiredPipeline - currentPipeline)
  const revenueGap = Math.max(0, monthlyRevenueTarget - revenueMonthly)

  const gtmScore = calculateGTMScore(data)
  const gtmLabel = getGTMLabel(gtmScore)
  const plan = getRecommendedPlan(expectedMeetings)

  return {
    expectedMeetings,
    requiredMeetings,
    currentMeetings,
    currentPipeline,
    pipelineMonth,
    pipelineQuarter,
    revenueMonthly,
    monthlyRevenueTarget,
    requiredPipeline,
    meetingGap,
    pipelineGap,
    revenueGap,
    gtmScore,
    gtmLabel,
    plan,
  }
}