'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const SESSION_KEY = 'sg_assessment_data'

const STEPS = [
  {
    id: 1,
    section: 'Market Context',
    question: 'Which market are you targeting?',
    field: 'targetMarket',
    type: 'radio',
    options: ['United States', 'Europe', 'APAC', 'Global'],
    validation: (v) => v ? null : 'Please select an option',
  },
  {
    id: 2,
    section: 'Market Context',
    question: 'Which industry does your company operate in?',
    field: 'industry',
    type: 'radio',
    options: ['SaaS', 'AI', 'FinTech', 'IT Services / Consulting', 'E-commerce / MarTech', 'Other'],
    validation: (v) => v ? null : 'Please select an option',
  },
  {
    id: 3,
    section: 'Deal Economics',
    question: 'What is your average deal size (ACV)?',
    field: 'acv',
    type: 'radio',
    options: [
      { label: 'Less than $5,000', value: 'less_than_5k' },
      { label: '$5,000 – $10,000', value: '5k_10k' },
      { label: '$10,000 – $25,000', value: '10k_25k' },
      { label: '$25,000 – $50,000', value: '25k_50k' },
      { label: 'More than $50,000', value: 'more_than_50k' },
    ],
    validation: (v) => v ? null : 'Please select an option',
  },
  {
    id: 4,
    section: 'Deal Economics',
    question: 'What is your average sales cycle?',
    field: 'salesCycle',
    type: 'radio',
    options: [
      { label: 'Less than 30 days', value: 'less_than_30' },
      { label: '30–60 days', value: '30_60' },
      { label: '60–90 days', value: '60_90' },
      { label: '90–180 days', value: '90_180' },
      { label: 'More than 180 days', value: 'more_than_180' },
    ],
    validation: (v) => v ? null : 'Please select an option',
  },
  {
    id: 5,
    section: 'Revenue Targets',
    question: 'What is your quarterly revenue target?',
    field: 'quarterlyRevenueTarget',
    type: 'number',
    placeholder: 'e.g. 900000',
    prefix: '$',
    validation: (v) => Number(v) > 0 ? null : 'Please enter a valid revenue target',
  },
  {
    id: 6,
    section: 'Funnel Performance',
    question: 'How many Marketing Qualified Leads (MQLs) do you generate per month?',
    field: 'mqlsPerMonth',
    type: 'radio',
    options: [
      { label: '0–50', value: '0_50' },
      { label: '50–100', value: '50_100' },
      { label: '100–250', value: '100_250' },
      { label: '250+', value: '250_plus' },
    ],
    validation: (v) => v ? null : 'Please select an option',
  },
  {
    id: 7,
    section: 'Funnel Performance',
    question: 'MQL to SQL conversion rate',
    field: 'mqlToSql',
    type: 'radio',
    options: [
      { label: 'Less than 10%', value: 'less_than_10' },
      { label: '10–20%', value: '10_20' },
      { label: '20–30%', value: '20_30' },
      { label: 'More than 30%', value: 'more_than_30' },
    ],
    validation: (v) => v ? null : 'Please select an option',
  },
  {
    id: 8,
    section: 'Funnel Performance',
    question: 'SQL to Customer conversion rate',
    field: 'sqlToCustomer',
    type: 'radio',
    options: [
      { label: 'Less than 10%', value: 'less_than_10' },
      { label: '10–20%', value: '10_20' },
      { label: '20–30%', value: '20_30' },
      { label: 'More than 30%', value: 'more_than_30' },
    ],
    validation: (v) => v ? null : 'Please select an option',
  },
  {
    id: 9,
    section: 'Funnel Performance',
    question: 'How many sales meetings does your team currently book per month?',
    field: 'currentMeetings',
    type: 'radio',
    options: [
      { label: '0–10', value: '0_10' },
      { label: '10–25', value: '10_25' },
      { label: '25–50', value: '25_50' },
      { label: '50+', value: '50_plus' },
    ],
    validation: (v) => v ? null : 'Please select an option',
  },
  {
    id: 10,
    section: 'Pipeline & Marketing',
    question: 'Monthly marketing spend',
    field: 'marketingSpend',
    type: 'radio',
    options: [
      { label: 'Less than $5K', value: 'less_than_5k' },
      { label: '$5K – $20K', value: '5k_20k' },
      { label: '$20K – $50K', value: '20k_50k' },
      { label: 'More than $50K', value: 'more_than_50k' },
    ],
    validation: (v) => v ? null : 'Please select an option',
  },
  {
    id: 11,
    section: 'Outbound Infrastructure',
    question: 'Are you currently running outbound campaigns?',
    field: 'outboundType',
    type: 'radio',
    options: ['None', 'Cold Email', 'LinkedIn Outreach', 'SDR Calling', 'Multi-channel outbound'],
    validation: (v) => v ? null : 'Please select an option',
  },
  {
    id: 12,
    section: 'Data Infrastructure',
    question: 'Database size',
    field: 'databaseSize',
    type: 'radio',
    options: [
      { label: 'Less than 5K', value: 'less_than_5k' },
      { label: '5K–20K', value: '5k_20k' },
      { label: '20K–50K', value: '20k_50k' },
      { label: '50K–100K', value: '50k_100k' },
      { label: 'More than 100K', value: 'more_than_100k' },
    ],
    validation: (v) => v ? null : 'Please select an option',
  },
  {
    id: 13,
    section: 'Data Infrastructure',
    question: 'Database accuracy',
    field: 'databaseAccuracy',
    type: 'radio',
    options: [
      { label: 'Less than 60%', value: 'less_than_60' },
      { label: '60–75%', value: '60_75' },
      { label: '75–90%', value: '75_90' },
      { label: 'More than 90%', value: 'more_than_90' },
    ],
    validation: (v) => v ? null : 'Please select an option',
  },
  {
    id: 14,
    section: 'CRM',
    question: 'Which CRM do you use?',
    field: 'crm',
    type: 'radio',
    options: ['HubSpot', 'Salesforce', 'Pipedrive', 'Zoho', 'Other', 'None'],
    validation: (v) => v ? null : 'Please select an option',
  },
  {
    id: 15,
    section: 'Contact Information',
    question: 'Where should we send your personalized pipeline report?',
    type: 'contact',
    fields: [
      { field: 'name', type: 'text', placeholder: 'Full Name', label: 'Full Name', required: true },
      { field: 'companyName', type: 'text', placeholder: 'Company Name', label: 'Company Name', required: true },
      { field: 'email', type: 'email', placeholder: 'Work Email', label: 'Work Email', required: true },
      { field: 'companyWebsite', type: 'text', placeholder: 'Company Website', label: 'Company Website', required: true },
      { field: 'jobTitle', type: 'text', placeholder: 'Job Title (optional)', label: 'Job Title', required: false },
    ],
    validation: (v, formData) => {
      if (!formData.name?.trim()) return 'Please enter your full name'
      if (!formData.companyName?.trim()) return 'Please enter your company name'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Please enter a valid work email'
      if (!formData.companyWebsite?.trim()) return 'Please enter your company website'
      return null
    },
  },
]

const DEFAULT_FORM = {
  targetMarket: '', industry: '', acv: '', salesCycle: '',
  quarterlyRevenueTarget: '', mqlsPerMonth: '', mqlToSql: '',
  sqlToCustomer: '', currentMeetings: '', marketingSpend: '',
  outboundType: '', databaseSize: '', databaseAccuracy: '', crm: '',
  name: '', companyName: '', email: '', companyWebsite: '', jobTitle: '',
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
    if (s.type === 'contact') return s.validation(null, formData)
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

  async function handleSubmit() {
    const err = validateCurrentStep()
    if (err) { setError(err); return }
    setSubmitting(true)
    setError('')
    try {
      const payload = { ...formData, quarterlyRevenueTarget: Number(formData.quarterlyRevenueTarget) }
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
  const getOptionValue = (opt) => typeof opt === 'object' ? opt.value : opt
  const getOptionLabel = (opt) => typeof opt === 'object' ? opt.label : opt

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
            <span className="font-medium text-violet-700">{step.section}</span>
            <span>{Math.round(progressPercent)}% complete</span>
          </div>
          <div className="bg-gray-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-violet-600 to-pink-500 rounded-full h-2 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 lg:p-12">
          <div className="mb-8">
            <p className="text-sm font-semibold text-violet-700 uppercase tracking-wide mb-2">Question {currentStep} of {STEPS.length}</p>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900 mb-1">{step.question}</h1>
          </div>
          <div className="mb-6">
            {step.type === 'radio' && (
              <div className="space-y-3">
                {step.options.map((opt) => {
                  const val = getOptionValue(opt)
                  const label = getOptionLabel(opt)
                  return (
                    <label key={val} className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${formData[step.field] === val ? 'border-violet-600 bg-violet-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input type="radio" name={step.field} checked={formData[step.field] === val} onChange={() => updateField(step.field, val)} className="accent-violet-600 w-5 h-5" />
                      <span className="font-medium text-gray-900">{label}</span>
                    </label>
                  )
                })}
              </div>
            )}
            {step.type === 'number' && (
              <div className="relative">
                {step.prefix && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-lg">{step.prefix}</span>}
                <input
                  type="number" min="0"
                  value={formData[step.field]}
                  onChange={(e) => updateField(step.field, e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                  placeholder={step.placeholder}
                  className={`w-full border-2 rounded-xl py-4 text-lg font-medium text-gray-900 focus:outline-none focus:border-violet-600 transition-colors ${step.prefix ? 'pl-8 pr-4' : 'px-4'} ${error ? 'border-red-400' : 'border-gray-200'}`}
                />
              </div>
            )}
            {step.type === 'contact' && (
              <div className="space-y-4">
                {step.fields.map((f) => (
                  <div key={f.field}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{f.label}{!f.required ? ' (optional)' : ''}</label>
                    <input
                      type={f.type} value={formData[f.field]}
                      onChange={(e) => updateField(f.field, e.target.value)}
                      placeholder={f.placeholder}
                      className={`w-full border-2 rounded-xl px-4 py-3 text-base font-medium text-gray-900 focus:outline-none focus:border-violet-600 transition-colors ${error ? 'border-red-400' : 'border-gray-200'}`}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          {error && (
            <p className="text-red-500 text-sm font-medium mb-6 flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
              {error}
            </p>
          )}
          <div className="flex items-center justify-between gap-4">
            <button onClick={handleBack} disabled={currentStep === 1} className={`px-6 py-3 rounded-xl font-semibold transition-all ${currentStep === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 cursor-pointer'}`}>Back</button>
            {currentStep < STEPS.length ? (
              <button onClick={handleNext} className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-10 py-3 rounded-xl transition-colors cursor-pointer">Continue</button>
            ) : (
              <button onClick={handleSubmit} disabled={submitting} className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-10 py-3 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2">
                {submitting ? (<><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>Calculating...</>) : 'Get My Results'}
              </button>
            )}
          </div>
          <p className="text-center text-xs text-gray-400 mt-6">Your data is secure and will never be shared with third parties.</p>
        </div>
      </div>
    </div>
  )
}