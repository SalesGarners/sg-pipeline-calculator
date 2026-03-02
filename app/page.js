'use client'

import Link from 'next/link'

export default function LandingPage() {
  const currentYear = new Date().getFullYear()

  return (
    <div className="min-h-screen bg-white">
      {/* Top banner */}
      <div className="bg-gradient-to-r from-violet-600 to-pink-500 text-white text-center text-sm font-medium py-2 tracking-wide">
        B2B CONTENT SYNDICATION SERVICES
      </div>

      {/* Navbar */}
      <nav className="border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <img src="/SalesGarners_20250821_204042_0001.webp" alt="SalesGarners" className="h-8 w-auto" />
          <Link
            href="/assessment"
            className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-5 py-2.5 rounded-md transition-colors"
          >
            Start Free Assessment
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-20 flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1">
          <div className="inline-block bg-violet-50 text-violet-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
            Free 90-Day Pipeline Forecast
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
            Calculate How Many{' '}
            <span className="bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-transparent">
              Sales Meetings & Pipeline
            </span>{' '}
            You Can Generate in 90 Days
          </h1>
          <p className="text-lg text-gray-600 mb-4 font-medium">
            For B2B SaaS & tech companies wanting predictable pipeline and qualified demos.
          </p>
          <p className="text-gray-500 mb-10 leading-relaxed">
            Stop guessing. In 3 minutes, get your personalized pipeline forecast, GTM score, and a step-by-step growth plan based on your actual numbers.
          </p>
          <Link
            href="/assessment"
            className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-8 py-4 rounded-md transition-colors text-base inline-block"
          >
            Start Free Pipeline Assessment
          </Link>
        </div>

        {/* What you get card */}
        <div className="flex-1 bg-gray-50 rounded-2xl p-8 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">In 3 minutes discover:</h2>
          <div className="space-y-4">
            {[
              { label: 'Expected meetings/month', desc: 'Realistic forecast based on your market and database' },
              { label: 'Pipeline potential', desc: 'Quarterly pipeline value you can realistically build' },
              { label: 'Revenue opportunity', desc: 'Revenue projection based on your ACV and close rate' },
              { label: 'GTM score', desc: 'How your go-to-market compares to top performers' },
              { label: 'Growth plan recommendation', desc: 'Personalised plan to hit your revenue targets' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-violet-600 to-pink-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{item.label}</p>
                  <p className="text-gray-500 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Link
              href="/assessment"
              className="bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 rounded-md transition-colors w-full block text-center"
            >
              Start Assessment
            </Link>
          </div>
        </div>
      </section>

      {/* Social proof strip */}
      <section className="bg-gray-50 border-y border-gray-100 py-10">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-gray-500 text-sm mb-6 font-medium uppercase tracking-wider">
            Trusted by B2B tech companies across
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {['North America', 'Europe', 'APAC', 'Middle East', 'LATAM'].map((region) => (
              <span key={region} className="bg-white border border-gray-200 text-gray-500 font-semibold text-sm px-4 py-2 rounded-lg">
                {region}
              </span>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-8 px-6 text-center text-gray-400 text-sm">
        <p>© {currentYear} SalesGarners Marketing Pvt. Ltd. All rights reserved.</p>
      </footer>
    </div>
  )
}