'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

function formatCurrency(value) {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
  return `$${value}`
}

function ScoreArc({ score }) {
  const radius = 54
  const circumference = Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = score >= 80 ? '#10b981' : score >= 65 ? '#7C3AED' : score >= 40 ? '#f59e0b' : '#ef4444'
  const label = score >= 80 ? 'Excellent' : score >= 65 ? 'Strong' : score >= 40 ? 'Good' : 'Needs Work'

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width="140" height="80" viewBox="0 0 140 80">
          <path d="M 14 70 A 56 56 0 0 1 126 70" fill="none" stroke="#e5e7eb" strokeWidth="12" strokeLinecap="round" />
          <path
            d="M 14 70 A 56 56 0 0 1 126 70"
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
          />
        </svg>
        <div className="absolute bottom-0 inset-x-0 flex flex-col items-center">
          <span className="text-3xl font-extrabold text-gray-900">{score}</span>
          <span className="text-xs font-semibold text-gray-500">out of 100</span>
        </div>
      </div>
      <span className="mt-2 text-sm font-bold" style={{ color }}>{label}</span>
    </div>
  )
}

export default function ResultsPage() {
  const router = useRouter()
  const [data, setData] = useState(null)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const currentYear = new Date().getFullYear()

  useEffect(() => {
    setMounted(true)
    try {
      const raw = sessionStorage.getItem('sg_results')
      if (!raw) { router.push('/assessment'); return }
      setData(JSON.parse(raw))
    } catch (e) {
      router.push('/assessment')
    }
  }, [router])

  async function handleDownloadPDF() {
    if (!data) return
    setPdfLoading(true)
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const { formData, results } = data
      const { meetings, pipeline, revenue, gtmScore, plan, pipelineGap } = results

      const purple = [124, 58, 237]
      const dark = [17, 24, 39]
      const gray = [107, 114, 128]
      const lightGray = [243, 244, 246]

      doc.setFillColor(...purple)
      doc.rect(0, 0, 210, 32, 'F')
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(255, 255, 255)
      doc.text('Your 90-Day Pipeline & Sales Meeting Forecast', 15, 14)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(`Prepared for: ${formData.name}  |  ${formData.email}`, 15, 23)
      doc.text(`Generated: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`, 15, 29)

      let y = 42
      doc.setFontSize(13)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...dark)
      doc.text('Your Pipeline Forecast', 15, y)
      y += 6
      doc.setDrawColor(...purple)
      doc.setLineWidth(0.5)
      doc.line(15, y, 195, y)
      y += 8

      const metrics = [
        { label: 'Est. Meetings/Month', value: `${meetings.low}–${meetings.high}` },
        { label: 'Pipeline per Quarter', value: formatCurrency(pipeline) },
        { label: 'Revenue Potential', value: formatCurrency(revenue) },
        { label: 'GTM Score', value: `${gtmScore}/100` },
      ]

      metrics.forEach((m, i) => {
        const col = i % 2
        const row = Math.floor(i / 2)
        const x = 15 + col * 95
        const boxY = y + row * 26
        doc.setFillColor(...lightGray)
        doc.roundedRect(x, boxY, 88, 20, 2, 2, 'F')
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(...gray)
        doc.text(m.label.toUpperCase(), x + 4, boxY + 7)
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(...purple)
        doc.text(m.value, x + 4, boxY + 16)
      })

      y += 60
      doc.setFontSize(13)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...dark)
      doc.text('Pipeline Gap Analysis', 15, y)
      y += 6
      doc.setDrawColor(...purple)
      doc.line(15, y, 195, y)
      y += 8
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...gray)

      const gapLines = [
        `Meeting Gap: You are targeting ${formData.monthlyMeetingTarget} meetings/month but currently getting ${formData.currentMeetings}.`,
        `Forecast shows you can reach ${meetings.low}–${meetings.high} meetings/month with the right outbound motion.`,
        `Pipeline Gap: To hit your ${formatCurrency(formData.revenueTarget * 2)} annual target, you need ${formatCurrency(pipelineGap)} more quarterly pipeline.`,
      ]
      gapLines.forEach((line) => {
        const wrapped = doc.splitTextToSize(line, 175)
        doc.text(wrapped, 15, y)
        y += wrapped.length * 6 + 3
      })

      y += 4
      doc.setFontSize(13)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...dark)
      doc.text('Benchmark vs Market', 15, y)
      y += 6
      doc.setDrawColor(...purple)
      doc.line(15, y, 195, y)
      y += 8
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...gray)
      const benchLines = [
        'Top-performing B2B SaaS teams generate 15–30 qualified meetings per SDR per month.',
        'Average reply rates for intent-based outbound campaigns: 8–15%.',
        `Your GTM score of ${gtmScore}/100 places you in the ${plan.name} tier.`,
      ]
      benchLines.forEach((line) => {
        const wrapped = doc.splitTextToSize(line, 175)
        doc.text(wrapped, 15, y)
        y += wrapped.length * 6 + 3
      })

      y += 4
      doc.setFillColor(...purple)
      doc.roundedRect(15, y, 180, 40, 3, 3, 'F')
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(255, 255, 255)
      doc.text(`Recommended Plan: ${plan.name}`, 22, y + 11)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      const planText = doc.splitTextToSize(plan.description, 166)
      doc.text(planText, 22, y + 20)

      y += 50
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...dark)
      doc.text('Ready to Execute This Plan?', 15, y)
      y += 8
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...gray)
      doc.text('Contact the SalesGarners team to build your customised outbound pipeline plan.', 15, y)
      y += 10
      doc.setFillColor(...purple)
      doc.roundedRect(15, y, 80, 10, 2, 2, 'F')
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(255, 255, 255)
      doc.text('Visit: salesgarners.com', 19, y + 6.5)

      const footerY = Math.max(y + 10, 275)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...gray)
      doc.text('SalesGarners Marketing Pvt. Ltd.  |  salesgarners.com', 15, footerY)
      doc.text(`© ${currentYear} SalesGarners. Confidential — prepared exclusively for ${formData.name}`, 15, footerY + 6)

      doc.save(`SalesGarners_Pipeline_Report_${formData.name.replace(/\s+/g, '_')}.pdf`)
    } catch (err) {
      console.error('PDF error:', err)
      alert('PDF generation failed. Please try again.')
    } finally {
      setPdfLoading(false)
    }
  }

  if (!mounted || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500">
          <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          Loading your results...
        </div>
      </div>
    )
  }

  const { formData, results } = data
  const { meetings, pipeline, revenue, gtmScore, plan } = results

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-violet-600 to-pink-500 text-white text-center text-sm font-medium py-2 tracking-wide">
        B2B CONTENT SYNDICATION SERVICES
      </div>

      <nav className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/">
            <img src="/SalesGarners_20250821_204042_0001.webp" alt="SalesGarners" className="h-8 w-auto" />
          </Link>
          <span className="text-sm text-gray-500 font-medium">Your Pipeline Assessment Results</span>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Assessment Complete
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-3">
            Your 90-Day Pipeline Forecast,{' '}
            <span className="bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-transparent">
              {formData.name.split(' ')[0]}
            </span>
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            Based on your inputs, here is what your pipeline and sales meeting potential looks like over the next 90 days.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-violet-600 rounded-2xl p-6 text-white">
            <p className="text-violet-200 text-sm font-semibold uppercase tracking-wide mb-2">Est. Meetings/Month</p>
            <p className="text-3xl font-extrabold">{meetings.low}–{meetings.high}</p>
            <p className="text-violet-200 text-sm mt-1">Qualified demos & discovery calls</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide mb-2">Pipeline per Quarter</p>
            <p className="text-3xl font-extrabold text-gray-900">{formatCurrency(pipeline)}</p>
            <p className="text-gray-500 text-sm mt-1">Total addressable pipeline</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide mb-2">Revenue Potential</p>
            <p className="text-3xl font-extrabold text-gray-900">{formatCurrency(revenue)}</p>
            <p className="text-gray-500 text-sm mt-1">Based on 25% close rate</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col items-center justify-center">
            <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide mb-3">GTM Score</p>
            <ScoreArc score={gtmScore} />
          </div>
        </div>

        <div className="bg-violet-600 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex-1">
              <p className="text-violet-200 text-sm font-semibold uppercase tracking-wide mb-1">Recommended Plan</p>
              <h2 className="text-2xl font-extrabold mb-3">{plan.name}</h2>
              <p className="text-violet-100 leading-relaxed max-w-2xl">
                Based on your numbers — {plan.description}
              </p>
            </div>
            <div className="flex flex-col gap-3 min-w-[200px]">
              <button
                onClick={handleDownloadPDF}
                disabled={pdfLoading}
                className="border-2 border-white text-white font-bold px-6 py-3 rounded-xl text-center hover:bg-violet-700 transition-colors disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
              >
                {pdfLoading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Generating...
                  </>
                ) : 'Download Full Report'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 text-lg mb-4">Pipeline Gap Analysis</h3>
            <div className="space-y-4">
              {[
                { label: 'Current meetings/month', value: formData.currentMeetings, max: formData.monthlyMeetingTarget, color: 'bg-gray-400' },
                { label: 'Forecast meetings/month', value: results.meetings.estimated, max: formData.monthlyMeetingTarget, color: 'bg-gradient-to-r from-violet-600 to-pink-500' },
                { label: 'Target meetings/month', value: formData.monthlyMeetingTarget, max: formData.monthlyMeetingTarget, color: 'bg-gray-300' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">{item.label}</span>
                    <span className="font-bold text-gray-900">{item.value}</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className={`${item.color} rounded-full h-2`}
                      style={{ width: `${Math.min(100, (item.value / item.max) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 text-lg mb-4">Your Inputs Summary</h3>
            <div className="space-y-2 text-sm">
              {[
                { label: 'Deal Size (ACV)', value: `$${Number(formData.acv).toLocaleString()}` },
                { label: 'Target Market', value: formData.targetMarket.toUpperCase() },
                { label: 'Database Size', value: `${Number(formData.databaseSize).toLocaleString()} contacts` },
                { label: 'Running Outbound', value: formData.runningOutbound ? 'Yes' : 'No' },
                { label: 'Revenue Target (2Q)', value: formatCurrency(formData.revenueTarget) },
              ].map((item) => (
                <div key={item.label} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-gray-500">{item.label}</span>
                  <span className="font-semibold text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center bg-white rounded-2xl border border-gray-100 p-8">
          <h3 className="text-xl font-extrabold text-gray-900 mb-2">Ready to build this pipeline?</h3>
          <p className="text-gray-500 mb-6 max-w-lg mx-auto">
            Our team will walk you through a custom outbound plan based on your exact numbers — no generic advice, just execution.
          </p>
          <div className="flex justify-center">
            <button
              onClick={handleDownloadPDF}
              disabled={pdfLoading}
              className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-8 py-3 rounded-md transition-colors disabled:opacity-60 cursor-pointer"
            >
              {pdfLoading ? 'Generating PDF...' : 'Download Full Report PDF'}
            </button>
          </div>
        </div>
      </div>

      <footer className="py-8 px-6 text-center text-gray-400 text-sm">
        <p>© {currentYear} SalesGarners Marketing Pvt. Ltd. All rights reserved.</p>
      </footer>
    </div>
  )
}