import { NextResponse } from 'next/server'
import { calculate } from '@/lib/calculator'
import { sendLeadNotification } from '@/lib/mailer'

export async function POST(request) {
  try {
    const body = await request.json()

    const {
      name,
      email,
      acv,
      targetMarket,
      monthlyMeetingTarget,
      currentMeetings,
      databaseSize,
      runningOutbound,
      revenueTarget,
    } = body

    if (!name || !email || !acv || !targetMarket || !monthlyMeetingTarget || !databaseSize || revenueTarget === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const formData = {
      name: String(name).trim(),
      email: String(email).trim(),
      acv: Number(acv),
      targetMarket: String(targetMarket),
      monthlyMeetingTarget: Number(monthlyMeetingTarget),
      currentMeetings: Number(currentMeetings) || 0,
      databaseSize: Number(databaseSize),
      runningOutbound: Boolean(runningOutbound),
      revenueTarget: Number(revenueTarget),
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
      ...(emailError && { emailError })
    })
  } catch (error) {
    console.error('[SalesGarners] Send lead error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}