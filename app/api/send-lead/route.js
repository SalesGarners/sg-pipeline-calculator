import { NextResponse } from 'next/server'
import { calculate } from '@/lib/calculator'
import { sendLeadNotification } from '@/lib/mailer'

export async function POST(request) {
  try {
    const body = await request.json()

    const {
      name, companyName, email, companyWebsite, jobTitle,
      targetMarket, industry, acv, salesCycle,
      quarterlyRevenueTarget, mqlsPerMonth, mqlToSql, sqlToCustomer,
      currentMeetings, marketingSpend, outboundType,
      databaseSize, databaseAccuracy, crm,
    } = body

    if (!name || !email || !companyName || !targetMarket || !acv || !quarterlyRevenueTarget) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const formData = {
      name: String(name).trim(),
      companyName: String(companyName).trim(),
      email: String(email).trim(),
      companyWebsite: String(companyWebsite || '').trim(),
      jobTitle: String(jobTitle || '').trim(),
      targetMarket: String(targetMarket),
      industry: String(industry),
      acv: String(acv),
      salesCycle: String(salesCycle),
      quarterlyRevenueTarget: Number(quarterlyRevenueTarget),
      mqlsPerMonth: String(mqlsPerMonth),
      mqlToSql: String(mqlToSql),
      sqlToCustomer: String(sqlToCustomer),
      currentMeetings: String(currentMeetings),
      marketingSpend: String(marketingSpend),
      outboundType: String(outboundType),
      databaseSize: String(databaseSize),
      databaseAccuracy: String(databaseAccuracy),
      crm: String(crm),
    }

    const results = calculate(formData)

    let emailStatus = 'sent'
    let emailError = null

    try {
      await sendLeadNotification(formData, results)
    } catch (err) {
      emailError = err.message
      emailStatus = `failed: ${err.message}`
      console.error('[SalesGarners] Email notification failed:', err.message)
    }

    return NextResponse.json({
      success: true,
      results,
      emailStatus,
      ...(emailError && { emailError }),
    })
  } catch (error) {
    console.error('[SalesGarners] Send lead error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}