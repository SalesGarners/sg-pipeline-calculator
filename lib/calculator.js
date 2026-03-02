/**
 * Core scoring and calculation engine.
 * All formulas are based on industry benchmarks for B2B SaaS outbound.
 */

const MARKET_MULTIPLIERS = {
  us: 1.2,
  eu: 1.0,
  apac: 0.85,
  latam: 0.75,
  mea: 0.8,
  global: 1.1,
}

const PLAN_THRESHOLDS = {
  starter: { minScore: 0, maxScore: 39, name: 'Pipeline Starter', description: 'Your pipeline foundations need strengthening. Focus on building your outbound motion and database quality before scaling.' },
  growth: { minScore: 40, maxScore: 64, name: 'Growth Engine', description: 'You have the right ingredients. With the right outbound cadence and targeting, you can significantly increase qualified meetings.' },
  accelerator: { minScore: 65, maxScore: 79, name: 'Revenue Accelerator', description: 'Strong pipeline fundamentals in place. Time to scale your outbound, optimise conversion rates, and expand into new segments.' },
  dominance: { minScore: 80, maxScore: 100, name: 'Market Dominance', description: 'You are operating at a high level. Focus on compounding gains through ABM, intent data, and multi-channel sequences.' },
}

/**
 * Calculate estimated monthly meetings based on inputs.
 * Industry benchmark: 2-5% of database reachable per month via outbound.
 * Of those reached, 8-15% convert to meetings depending on ICP fit.
 */
function calculateMeetings(data) {
  const { databaseSize, runningOutbound, monthlyMeetingTarget, currentMeetings, targetMarket } = data
  const marketMultiplier = MARKET_MULTIPLIERS[targetMarket] || 1.0

  const reachRate = runningOutbound ? 0.04 : 0.015
  const conversionRate = runningOutbound ? 0.12 : 0.07

  const reachable = databaseSize * reachRate
  const estimated = Math.round(reachable * conversionRate * marketMultiplier)

  const low = Math.max(Math.round(estimated * 0.8), 1)
  const high = Math.round(estimated * 1.3)

  return { low, high, estimated }
}

/**
 * Pipeline per quarter = estimated monthly meetings * 3 months * ACV * close rate (25% B2B SaaS avg).
 */
function calculatePipeline(data, meetingEstimate) {
  const { acv } = data
  const closeRate = 0.25
  const quarterlyMeetings = meetingEstimate * 3
  const pipeline = Math.round(quarterlyMeetings * acv * (1 / closeRate))
  return pipeline
}

/**
 * Revenue opportunity = pipeline * close rate.
 */
function calculateRevenue(pipeline) {
  return Math.round(pipeline * 0.25)
}

/**
 * GTM Score (0-100) composed of 5 weighted factors.
 */
function calculateGTMScore(data) {
  const { acv, databaseSize, runningOutbound, currentMeetings, monthlyMeetingTarget, revenueTarget } = data

  // Factor 1: Database adequacy (0-25)
  // Benchmark: need at least 500 contacts per target meeting
  const dbScore = Math.min(25, Math.round((databaseSize / (monthlyMeetingTarget * 500)) * 25))

  // Factor 2: Outbound activity (0-20)
  const outboundScore = runningOutbound ? 20 : 5

  // Factor 3: Meeting performance vs target (0-20)
  const meetingRatio = currentMeetings / Math.max(monthlyMeetingTarget, 1)
  const meetingScore = Math.min(20, Math.round(meetingRatio * 20))

  // Factor 4: ACV health (0-20)
  // Benchmark: $10k+ ACV is strong for outbound ROI
  const acvScore = acv >= 50000 ? 20 : acv >= 20000 ? 16 : acv >= 10000 ? 12 : acv >= 5000 ? 8 : 4

  // Factor 5: Revenue target ambition vs realism (0-15)
  const annualTarget = revenueTarget * 2
  const revenueRatio = acv > 0 ? Math.min(annualTarget / (acv * 20), 1) : 0
  const revenueScore = Math.round(revenueRatio * 15)

  const total = dbScore + outboundScore + meetingScore + acvScore + revenueScore
  return Math.min(100, Math.max(0, total))
}

/**
 * Determine recommended plan based on GTM score.
 */
function getRecommendedPlan(score) {
  for (const [key, plan] of Object.entries(PLAN_THRESHOLDS)) {
    if (score >= plan.minScore && score <= plan.maxScore) {
      return { key, ...plan }
    }
  }
  return { key: 'growth', ...PLAN_THRESHOLDS.growth }
}

/**
 * Master calculate function — single entry point.
 */
export function calculate(data) {
  const meetings = calculateMeetings(data)
  const pipeline = calculatePipeline(data, meetings.estimated)
  const revenue = calculateRevenue(pipeline)
  const gtmScore = calculateGTMScore(data)
  const plan = getRecommendedPlan(gtmScore)

  const meetingGap = Math.max(0, data.monthlyMeetingTarget - meetings.estimated)
  const pipelineGap = Math.max(0, data.revenueTarget * 2 - pipeline)

  return {
    meetings,
    pipeline,
    revenue,
    gtmScore,
    plan,
    meetingGap,
    pipelineGap,
  }
}