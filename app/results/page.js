'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

function formatCurrency(value) {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
  return `$${Math.round(value)}`
}

function ScoreArc({ score, label }) {
  const circumference = Math.PI * 54
  const offset = circumference - (score / 100) * circumference
  const color = score >= 80 ? '#10b981' : score >= 65 ? '#7C3AED' : score >= 40 ? '#f59e0b' : '#ef4444'

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

function GapCard({ title, current, potential, gap, currentLabel, potentialLabel, gapLabel, isCurrency }) {
  const fmt = isCurrency ? formatCurrency : (v) => v
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <h3 className="font-bold text-gray-900 text-base mb-4">{title}</h3>
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">{currentLabel}</span>
          <span className="font-semibold text-gray-900">{fmt(current)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">{potentialLabel}</span>
          <span className="font-semibold text-violet-700">{fmt(potential)}</span>
        </div>
        <div className="border-t border-gray-100 pt-3 flex justify-between text-sm">
          <span className="font-semibold text-gray-700">{gapLabel}</span>
          <span className="font-bold text-green-600">+{fmt(gap)}</span>
        </div>
      </div>
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
      const {
        expectedMeetings, currentMeetings, meetingGap,
        currentPipeline, requiredPipeline, pipelineGap,
        monthlyRevenueTarget, revenueMonthly, revenueGap,
        pipelineQuarter, gtmScore, gtmLabel, plan,
      } = results

      const purple = [124, 58, 237]
      const dark = [17, 24, 39]
      const gray = [107, 114, 128]
      const lightGray = [243, 244, 246]

      // Header
      doc.setFillColor(...purple)
      doc.rect(0, 0, 210, 35, 'F')
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(255, 255, 255)
      doc.text('Your Pipeline & Revenue Assessment Results', 15, 14)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.text('Based on your inputs and industry benchmarks, here is your modeled pipeline opportunity.', 15, 22)
      doc.text(`Prepared for: ${formData.name} | ${formData.companyName} | ${formData.email}`, 15, 29)

      let y = 44

      // KPI Cards
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...dark)
      doc.text('Key Metrics', 15, y)
      y += 6
      doc.setDrawColor(...purple)
      doc.setLineWidth(0.5)
      doc.line(15, y, 195, y)
      y += 6

      const kpis = [
        { label: 'GTM Readiness Score', value: `${gtmScore}/100 — ${gtmLabel}` },
        { label: 'Expected Meetings/Month', value: String(expectedMeetings) },
        { label: 'Pipeline Potential/Quarter', value: formatCurrency(pipelineQuarter) },
        { label: 'Revenue Potential/Month', value: formatCurrency(revenueMonthly) },
      ]

      kpis.forEach((k, i) => {
        const col = i % 2
        const row = Math.floor(i / 2)
        const x = 15 + col * 95
        const boxY = y + row * 26
        doc.setFillColor(...lightGray)
        doc.roundedRect(x, boxY, 88, 20, 2, 2, 'F')
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(...gray)
        doc.text(k.label.toUpperCase(), x + 4, boxY + 7)
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(...purple)
        doc.text(k.value, x + 4, boxY + 16)
      })

      y += 58

      // Gap Analysis
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...dark)
      doc.text('Gap Analysis', 15, y)
      y += 6
      doc.setDrawColor(...purple)
      doc.line(15, y, 195, y)
      y += 6

      const gaps = [
        { label: 'Meeting Gap', current: `Current: ${currentMeetings}`, potential: `Potential: ${expectedMeetings}`, gap: `Gap: +${meetingGap} meetings/month` },
        { label: 'Pipeline Gap', current: `Current: ${formatCurrency(currentPipeline)}`, potential: `Required: ${formatCurrency(requiredPipeline)}`, gap: `Gap: ${formatCurrency(pipelineGap)}` },
        { label: 'Revenue Gap', current: `Target: ${formatCurrency(monthlyRevenueTarget)}/month`, potential: `Modeled: ${formatCurrency(revenueMonthly)}/month`, gap: `Gap: ${formatCurrency(revenueGap)}/month` },
      ]

      gaps.forEach((g) => {
        doc.setFillColor(...lightGray)
        doc.roundedRect(15, y, 180, 22, 2, 2, 'F')
        doc.setFontSize(9)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(...dark)
        doc.text(g.label, 19, y + 7)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(...gray)
        doc.text(`${g.current}   |   ${g.potential}   |   ${g.gap}`, 19, y + 15)
        y += 28
      })

      y += 4

      // Recommended Plan
      doc.setFillColor(...purple)
      doc.roundedRect(15, y, 180, 45, 3, 3, 'F')
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(255, 255, 255)
      doc.text('Recommended Plan', 22, y + 10)
      doc.setFontSize(13)
      doc.text(`${plan.name} — ${plan.price}`, 22, y + 20)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      plan.outcomes.forEach((outcome, i) => {
        doc.text(`• ${outcome}`, 22, y + 30 + i * 6)
      })

      y += 55

      // CTA
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...dark)
      doc.text('Review your assessment and pipeline opportunities with our team.', 15, y)
      y += 8
      doc.setFillColor(...purple)
      doc.roundedRect(15, y, 70, 10, 2, 2, 'F')
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(255, 255, 255)
      doc.text('Visit: salesgarners.com/contact-us', 19, y + 6.5)

      // Footer
      const footerY = Math.max(y + 20, 275)
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
  const {
    expectedMeetings, currentMeetings, meetingGap,
    currentPipeline, requiredPipeline, pipelineGap,
    monthlyRevenueTarget, revenueMonthly, revenueGap,
    pipelineQuarter, gtmScore, gtmLabel, plan,
  } = results

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
          <span className="text-sm text-gray-500 font-medium">Your Pipeline & Revenue Assessment Results</span>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Assessment Complete
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-3">
            Your Pipeline & Revenue Assessment Results
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            Based on your inputs and industry benchmarks, here is your modeled pipeline opportunity.
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 col-span-2 lg:col-span-1 flex flex-col items-center justify-center">
            <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide mb-3">GTM Readiness Score</p>
            <ScoreArc score={gtmScore} label={gtmLabel} />
          </div>
          <div className="bg-violet-600 rounded-2xl p-6 text-white">
            <p className="text-violet-200 text-sm font-semibold uppercase tracking-wide mb-2">Expected Meetings/Month</p>
            <p className="text-4xl font-extrabold">{expectedMeetings}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide mb-2">Pipeline Potential/Quarter</p>
            <p className="text-3xl font-extrabold text-gray-900">{formatCurrency(pipelineQuarter)}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide mb-2">Revenue Potential/Month</p>
            <p className="text-3xl font-extrabold text-gray-900">{formatCurrency(revenueMonthly)}</p>
          </div>
        </div>

        {/* Gap Analysis */}
        <div className="mb-8">
          <h2 className="text-xl font-extrabold text-gray-900 mb-4">Gap Analysis</h2>
          <div className="grid lg:grid-cols-3 gap-4">
            <GapCard
              title="Meeting Gap"
              current={currentMeetings}
              potential={expectedMeetings}
              gap={meetingGap}
              currentLabel="Current Meetings"
              potentialLabel="Potential Meetings"
              gapLabel="Gap Identified"
              isCurrency={false}
            />
            <GapCard
              title="Pipeline Gap"
              current={currentPipeline}
              potential={requiredPipeline}
              gap={pipelineGap}
              currentLabel="Current Pipeline"
              potentialLabel="Required Pipeline"
              gapLabel="Gap Identified"
              isCurrency={true}
            />
            <GapCard
              title="Revenue Gap"
              current={monthlyRevenueTarget}
              potential={revenueMonthly}
              gap={revenueGap}
              currentLabel="Target Revenue/Month"
              potentialLabel="Modeled Revenue/Month"
              gapLabel="Gap Identified"
              isCurrency={true}
            />
          </div>
        </div>

        {/* Recommended Plan */}
        <div className="bg-violet-600 rounded-2xl p-8 text-white mb-8">
          <p className="text-violet-200 text-sm font-semibold uppercase tracking-wide mb-1">Recommended Plan</p>
          <h2 className="text-2xl font-extrabold mb-1">{plan.name} — {plan.price}</h2>
          <p className="text-violet-200 text-sm mb-4">
            Based on your pipeline potential and revenue targets, we recommend the {plan.name}.
          </p>
          <p className="text-white font-semibold mb-3">Expected Outcome:</p>
          <ul className="space-y-2">
            {plan.outcomes.map((outcome, i) => (
              <li key={i} className="flex items-center gap-2 text-violet-100 text-sm">
                <svg className="w-4 h-4 text-violet-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {outcome}
              </li>
            ))}
          </ul>
        </div>

        {/* CTAs */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <h3 className="text-xl font-extrabold text-gray-900 mb-2">Book Your Pipeline Strategy Call</h3>
          <p className="text-gray-500 mb-6 max-w-lg mx-auto">
            Review your assessment and pipeline opportunities with our team.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://salesgarners.com/contact-us/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-8 py-3 rounded-md transition-colors cursor-pointer"
            >
              Book Your Pipeline Strategy Call
            </a>
            <button
              onClick={handleDownloadPDF}
              disabled={pdfLoading}
              className="border-2 border-violet-600 text-violet-600 hover:bg-violet-600 hover:text-white font-semibold px-8 py-3 rounded-md transition-colors disabled:opacity-60 cursor-pointer"
            >
              {pdfLoading ? 'Generating PDF...' : 'Download Your Full Pipeline Report'}
            </button>
          </div>
        </div>

        {/* Trust section */}
        <p className="text-center text-gray-400 text-sm mt-8 max-w-2xl mx-auto">
          SalesGarners helps B2B tech companies build predictable pipeline through data-driven outbound and revenue modeling.
        </p>
      </div>

      <footer className="py-8 px-6 text-center text-gray-400 text-sm">
        <p>© {currentYear} SalesGarners Marketing Pvt. Ltd. All rights reserved.</p>
      </footer>
    </div>
  )
}