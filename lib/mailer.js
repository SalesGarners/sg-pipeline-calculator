import * as nodemailer from 'nodemailer'

function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })
}

function formatCurrency(value) {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
  return `$${Math.round(value)}`
}

function buildEmailHTML(formData, results) {
  const { name, companyName, email, companyWebsite, jobTitle, targetMarket, industry, acv, salesCycle, quarterlyRevenueTarget, mqlsPerMonth, mqlToSql, sqlToCustomer, currentMeetings, currentPipeline, marketingSpend, outboundType, databaseSize, databaseAccuracy, crm } = formData
  const { expectedMeetings, pipelineQuarter, revenueMonthly, gtmScore, gtmLabel, plan, meetingGap, pipelineGap, revenueGap } = results

  return `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; font-size: 14px; color: #000000; background: #ffffff; margin: 0; padding: 20px;">

      <p style="font-size: 18px; font-weight: bold; margin-bottom: 4px;">New Pipeline Assessment Lead</p>
      <p style="margin: 0 0 20px 0;">Submitted on ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

      <p style="font-weight: bold; margin-bottom: 8px;">Contact Information</p>
      <table cellpadding="6" cellspacing="0" border="1" style="border-collapse: collapse; width: 100%; max-width: 560px;">
        <tr><td>Full Name</td><td>${name}</td></tr>
        <tr><td>Company Name</td><td>${companyName}</td></tr>
        <tr><td>Work Email</td><td>${email}</td></tr>
        <tr><td>Company Website</td><td>${companyWebsite}</td></tr>
        <tr><td>Job Title</td><td>${jobTitle || '—'}</td></tr>
      </table>

      <br />

      <p style="font-weight: bold; margin-bottom: 8px;">Assessment Inputs</p>
      <table cellpadding="6" cellspacing="0" border="1" style="border-collapse: collapse; width: 100%; max-width: 560px;">
        <tr><td>Target Market</td><td>${targetMarket}</td></tr>
        <tr><td>Industry</td><td>${industry}</td></tr>
        <tr><td>Average Deal Size (ACV)</td><td>${acv}</td></tr>
        <tr><td>Average Sales Cycle</td><td>${salesCycle}</td></tr>
        <tr><td>Quarterly Revenue Target</td><td>${formatCurrency(quarterlyRevenueTarget)}</td></tr>
        <tr><td>MQLs per Month</td><td>${mqlsPerMonth}</td></tr>
        <tr><td>MQL to SQL Conversion</td><td>${mqlToSql}</td></tr>
        <tr><td>SQL to Customer Conversion</td><td>${sqlToCustomer}</td></tr>
        <tr><td>Current Meetings / Month</td><td>${currentMeetings}</td></tr>
        <tr><td>Current Monthly Pipeline</td><td>${currentPipeline}</td></tr>
        <tr><td>Monthly Marketing Spend</td><td>${marketingSpend}</td></tr>
        <tr><td>Outbound Campaigns</td><td>${outboundType}</td></tr>
        <tr><td>Database Size</td><td>${databaseSize}</td></tr>
        <tr><td>Database Accuracy</td><td>${databaseAccuracy}</td></tr>
        <tr><td>CRM</td><td>${crm}</td></tr>
      </table>

      <br />

      <p style="font-weight: bold; margin-bottom: 8px;">Assessment Results</p>
      <table cellpadding="6" cellspacing="0" border="1" style="border-collapse: collapse; width: 100%; max-width: 560px;">
        <tr><td>GTM Readiness Score</td><td>${gtmScore} / 100 — ${gtmLabel}</td></tr>
        <tr><td>Expected Meetings / Month</td><td>${expectedMeetings}</td></tr>
        <tr><td>Pipeline Potential / Quarter</td><td>${formatCurrency(pipelineQuarter)}</td></tr>
        <tr><td>Revenue Potential / Month</td><td>${formatCurrency(revenueMonthly)}</td></tr>
        <tr><td>Meeting Gap</td><td>+${meetingGap} meetings/month</td></tr>
        <tr><td>Pipeline Gap</td><td>${formatCurrency(pipelineGap)}</td></tr>
        <tr><td>Revenue Gap</td><td>${formatCurrency(revenueGap)}/month</td></tr>
        <tr><td>Recommended Plan</td><td>${plan.name} — ${plan.price}</td></tr>
      </table>

      <br />
      <p style="color: #666666; font-size: 12px;">SalesGarners Marketing Pvt. Ltd. — Pipeline Assessment Tool</p>

    </body>
    </html>
  `
}

export async function sendLeadNotification(formData, results) {
  const transporter = createTransporter()

  const recipients = process.env.SALES_NOTIFY_EMAIL
    ? process.env.SALES_NOTIFY_EMAIL.split(',').map((e) => e.trim()).filter(Boolean)
    : []

  if (recipients.length === 0) {
    console.warn('[SalesGarners] No SALES_NOTIFY_EMAIL configured. Skipping email notification.')
    return
  }

  const mailOptions = {
    from: `"SalesGarners Pipeline Tool" <${process.env.GMAIL_USER}>`,
    to: recipients.join(','),
    subject: `New Lead: ${formData.name} — ${formData.companyName} — GTM Score ${results.gtmScore}/100`,
    html: buildEmailHTML(formData, results),
  }

  await transporter.sendMail(mailOptions)
}