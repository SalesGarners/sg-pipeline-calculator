'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const SESSION_KEY = 'sg_assessment_data'

const STEPS = [
  {
    id: 1,
    title: 'Deal Size',
    question: 'What is your average deal size (ACV)?',
    subtitle: 'Annual Contract Value — the average revenue per customer per year.',
    field: 'acv',
    type: 'number',
    placeholder: 'e.g. 25000',
    prefix: '$',
    validation: (v) => Number(v) > 0 ? null : 'Please enter a valid deal size greater than 0',
  },
  {
    id: 2,
    title: 'Target Market',
    question: 'Which market are you targeting?',
    subtitle: 'Select your primary geographic focus for outbound activity.',
    field: 'targetMarket',
    type: 'select',
    options: [
      { value: 'us', label: 'United States' },
      { value: 'eu', label: 'Europe' },
      { value: 'apac', label: 'Asia Pacific' },
      { value: 'latam', label: 'Latin America' },
      { value: 'mea', label: 'Middle East & Africa' },
      { value: 'global', label: 'Global' },
    ],
    validation: (v) => v ? null : 'Please select a target market',
  },
  {
    id: 3,
    title: 'Meeting Target',
    question: 'How many qualified meetings do you want per month?',
    subtitle: 'Your ideal number of sales-ready demos or discovery calls.',
    field: 'monthlyMeetingTarget',
    type: 'number',
    placeholder: 'e.g. 20',
    validation: (v) => Number(v) > 0 ? null : 'Please enter a meeting target greater than 0',
  },
  {
    id: 4,
    title: 'Current Performance',
    question: 'How many qualified meetings are you getting right now per month?',
    subtitle: 'Be honest — this helps us calculate your pipeline gap accurately.',
    field: 'currentMeetings',
    type: 'number',
    placeholder: 'e.g. 5',
    validation: (v) => Number(v) >= 0 ? null : 'Please enter 0 or more',
  },
  {
    id: 5,
    title: 'Database Size',
    question: 'How large is your current prospect database or contact list?',
    subtitle: 'Total number of contacts you can reach via email or LinkedIn.',
    field: 'databaseSize',
    type: 'number',
    placeholder: 'e.g. 5000',
    validation: (v) => Number(v) > 0 ? null : 'Please enter a database size greater than 0',
  },
  {
    id: 6,
    title: 'Outbound Activity',
    question: 'Are you currently running any outbound campaigns?',
    subtitle: 'Cold email, LinkedIn outreach, or SDR calling sequences.',
    field: 'runningOutbound',
    type: 'radio',
    options: [
      { value: true, label: 'Yes, we are running outbound campaigns' },
      { value: false, label: 'No, we are not running outbound yet' },
    ],
    validation: (v) => v !== undefined && v !== null && v !== '' ? null : 'Please select an option',
  },
  {
    id: 7,
    title: 'Revenue Target',
    question: 'What is your revenue target for the next 2 quarters?',
    subtitle: 'Combined new revenue goal for Q1 and Q2 — or the next 6 months.',
    field: 'revenueTarget',
    type: 'number',
    placeholder: 'e.g. 500000',
    prefix: '$',
    validation: (v) => Number(v) > 0 ? null : 'Please enter a revenue target greater than 0',
  },
  {
    id: 8,
    title: 'Your Report',
    question: 'Where should we send your personalised pipeline report?',
    subtitle: 'You will receive a full PDF breakdown plus your GTM score instantly.',
    type: 'multi',
    fields: [
      { field: 'name', type: 'text', placeholder: 'Your full name', label: 'Full Name' },
      { field: 'email', type: 'email', placeholder: 'Work email address', label: 'Work Email' },
    ],
    validation: (v, formData) => {
      if (!formData.name?.trim()) return 'Please enter your name'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Please enter a valid work email'
      return null
    },
  },
]

const DEFAULT_FORM = {
  acv: '',
  targetMarket: '',
  monthlyMeetingTarget: '',
  currentMeetings: '',
  databaseSize: '',
  runningOutbound: null,
  revenueTarget: '',
  name: '',
  email: '',
}

export default function AssessmentPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState(DEFAULT_FORM)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.formData) setFormData(parsed.formData)
        if (parsed.currentStep) setCurrentStep(parsed.currentStep)
      }
    } catch (e) {}
  }, [])

  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ formData, currentStep }))
    } catch (e) {}
  }, [formData, currentStep])

  const step = STEPS[currentStep - 1]

  function updateField(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError('')
  }

  function validateCurrentStep() {
    const s = STEPS[currentStep - 1]
    if (s.type === 'multi') return s.validation(null, formData)
    if (s.field) return s.validation(formData[s.field])
    return null
  }

  function handleNext() {
    const err = validateCurrentStep()
    if (err) { setError(err); return }
    setError('')
    if (currentStep < STEPS.length) setCurrentStep((prev) => prev + 1)
  }

  function handleBack() {
    setError('')
    if (currentStep > 1) setCurrentStep((prev) => prev - 1)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      currentStep === STEPS.length ? handleSubmit() : handleNext()
    }
  }

  async function handleSubmit() {
    const err = validateCurrentStep()
    if (err) { setError(err); return }
    setSubmitting(true)
    setError('')

    try {
      const payload = {
        ...formData,
        acv: Number(formData.acv),
        monthlyMeetingTarget: Number(formData.monthlyMeetingTarget),
        currentMeetings: Number(formData.currentMeetings) || 0,
        databaseSize: Number(formData.databaseSize),
        revenueTarget: Number(formData.revenueTarget),
        runningOutbound: formData.runningOutbound === true || formData.runningOutbound === 'true',
      }

      const res = await fetch('/api/send-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || 'Submission failed')

      sessionStorage.setItem('sg_results', JSON.stringify({ formData: payload, results: data.results }))
      sessionStorage.removeItem(SESSION_KEY)
      router.push('/results')
    } catch (err) {
      setError('Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  const progressPercent = ((currentStep - 1) / (STEPS.length - 1)) * 100

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-violet-600 to-pink-500 text-white text-center text-sm font-medium py-2 tracking-wide">
        B2B CONTENT SYNDICATION SERVICES
      </div>

      <nav className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/">
            <img src="/SalesGarners_20250821_204042_0001.webp" alt="SalesGarners" className="h-8 w-auto" />
          </Link>
          <span className="text-sm text-gray-500 font-medium">Step {currentStep} of {STEPS.length}</span>
        </div>
      </nav>

      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span className="font-medium text-violet-700">{step.title}</span>
            <span>{Math.round(progressPercent)}% complete</span>
          </div>
          <div className="bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-violet-600 to-pink-500 rounded-full h-2 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            {STEPS.map((s) => (
              <div
                key={s.id}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  s.id < currentStep
                    ? 'bg-gradient-to-r from-violet-600 to-pink-500 text-white'
                    : s.id === currentStep
                    ? 'bg-violet-600 text-white ring-2 ring-violet-300'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {s.id < currentStep ? (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : s.id}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 lg:p-12">
          <div className="mb-8">
            <p className="text-sm font-semibold text-violet-700 uppercase tracking-wide mb-2">
              Question {currentStep} of {STEPS.length}
            </p>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900 mb-3">{step.question}</h1>
            <p className="text-gray-500">{step.subtitle}</p>
          </div>

          <div className="mb-6">
            {step.type === 'number' && (
              <div className="relative">
                {step.prefix && (
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-lg">
                    {step.prefix}
                  </span>
                )}
                <input
                  type="number"
                  min="0"
                  value={formData[step.field]}
                  onChange={(e) => updateField(step.field, e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={step.placeholder}
                  className={`w-full border-2 rounded-xl py-4 text-lg font-medium text-gray-900 focus:outline-none focus:border-violet-600 transition-colors ${
                    step.prefix ? 'pl-8 pr-4' : 'px-4'
                  } ${error ? 'border-red-400' : 'border-gray-200'}`}
                />
              </div>
            )}

            {step.type === 'select' && (
              <select
                value={formData[step.field]}
                onChange={(e) => updateField(step.field, e.target.value)}
                className={`w-full border-2 rounded-xl px-4 py-4 text-lg font-medium text-gray-900 focus:outline-none focus:border-violet-600 transition-colors bg-white ${
                  error ? 'border-red-400' : 'border-gray-200'
                }`}
              >
                <option value="">Select a market...</option>
                {step.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            )}

            {step.type === 'radio' && (
              <div className="space-y-3">
                {step.options.map((opt) => (
                  <label
                    key={String(opt.value)}
                    className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      formData[step.field] === opt.value
                        ? 'border-violet-600 bg-violet-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name={step.field}
                      checked={formData[step.field] === opt.value}
                      onChange={() => updateField(step.field, opt.value)}
                      className="accent-violet-600 w-5 h-5"
                    />
                    <span className="font-medium text-gray-900">{opt.label}</span>
                  </label>
                ))}
              </div>
            )}

            {step.type === 'multi' && (
              <div className="space-y-4">
                {step.fields.map((f) => (
                  <div key={f.field}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{f.label}</label>
                    <input
                      type={f.type}
                      value={formData[f.field]}
                      onChange={(e) => updateField(f.field, e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={f.placeholder}
                      className={`w-full border-2 rounded-xl px-4 py-4 text-lg font-medium text-gray-900 focus:outline-none focus:border-violet-600 transition-colors ${
                        error ? 'border-red-400' : 'border-gray-200'
                      }`}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <p className="text-red-500 text-sm font-medium mb-6 flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </p>
          )}

          <div className="flex items-center justify-between gap-4">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                currentStep === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 cursor-pointer'
              }`}
            >
              Back
            </button>

            {currentStep < STEPS.length ? (
              <button
                onClick={handleNext}
                className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-10 py-3 rounded-xl transition-colors cursor-pointer"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-10 py-3 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Calculating...
                  </>
                ) : 'Get My Results'}
              </button>
            )}
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            Your data is secure and will never be shared with third parties.
          </p>
        </div>
      </div>
    </div>
  )
}