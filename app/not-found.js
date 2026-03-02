import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className="bg-gradient-to-r from-violet-600 to-pink-500 text-white text-center text-sm font-medium py-2 tracking-wide w-full absolute top-0">
        B2B CONTENT SYNDICATION SERVICES
      </div>

      <img src="/SalesGarners_20250821_204042_0001.webp" alt="SalesGarners" className="h-8 w-auto mb-12" />

      <h1 className="text-8xl font-extrabold text-violet-600 mb-4">404</h1>
      <h2 className="text-2xl font-bold text-gray-900 mb-3">Page Not Found</h2>
      <p className="text-gray-500 text-center max-w-md mb-8">
        The page you are looking for does not exist or has been moved.
      </p>

      <Link
        href="/"
        className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-8 py-3 rounded-md transition-colors"
      >
        Back to Home
      </Link>
    </div>
  )
}