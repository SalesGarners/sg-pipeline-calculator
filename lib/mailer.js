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
  return `$${value}`
}

function buildEmailHTML(formData, results) {
  const { name, email, acv, targetMarket, monthlyMeetingTarget, currentMeetings, databaseSize, runningOutbound, revenueTarget } = formData
  const { meetings, pipeline, revenue, gtmScore, plan } = results

  return `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; font-size: 14px; color: #000000; background: #ffffff; margin: 0; padding: 20px;">

      <p style="font-size: 18px; font-weight: bold; margin-bottom: 4px;">New Pipeline Assessment Lead</p>
      <p style="margin: 0 0 20px 0;">Submitted on ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

      <p style="font-weight: bold; margin-bottom: 8px;">Lead Information</p>
      <table cellpadding="6" cellspacing="0" border="1" style="border-collapse: collapse; width: 100%; max-width: 500px;">
        <tr><td>Name</td><td>${name}</td></tr>
        <tr><td>Email</td><td>${email}</td></tr>
        <tr><td>Deal Size (ACV)</td><td>$${Number(acv).toLocaleString()}</td></tr>
        <tr><td>Target Market</td><td>${targetMarket.toUpperCase()}</td></tr>
        <tr><td>Monthly Meeting Target</td><td>${monthlyMeetingTarget}</td></tr>
        <tr><td>Current Meetings / Month</td><td>${currentMeetings}</td></tr>
        <tr><td>Database Size</td><td>${Number(databaseSize).toLocaleString()}</td></tr>
        <tr><td>Running Outbound</td><td>${runningOutbound ? 'Yes' : 'No'}</td></tr>
        <tr><td>Revenue Target (2 Quarters)</td><td>${formatCurrency(revenueTarget)}</td></tr>
      </table>

      <br />

      <p style="font-weight: bold; margin-bottom: 8px;">Assessment Results</p>
      <table cellpadding="6" cellspacing="0" border="1" style="border-collapse: collapse; width: 100%; max-width: 500px;">
        <tr><td>Estimated Meetings / Month</td><td>${meetings.low}–${meetings.high}</td></tr>
        <tr><td>Pipeline per Quarter</td><td>${formatCurrency(pipeline)}</td></tr>
        <tr><td>Revenue Potential</td><td>${formatCurrency(revenue)}</td></tr>
        <tr><td>GTM Score</td><td>${gtmScore} / 100</td></tr>
        <tr><td>Recommended Plan</td><td>${plan.name}</td></tr>
      </table>

      <br />

      <p style="font-weight: bold; margin-bottom: 4px;">Plan Summary</p>
      <p style="margin: 0;">${plan.description}</p>

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
    subject: `New Lead: ${formData.name} — GTM Score ${results.gtmScore}/100`,
    html: buildEmailHTML(formData, results),
  }

  await transporter.sendMail(mailOptions)
}