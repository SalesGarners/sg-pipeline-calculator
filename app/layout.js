import './globals.css'

export const metadata = {
  title: 'Pipeline Calculator | SalesGarners',
  description: 'Calculate how many sales meetings and pipeline you can generate in 90 days.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Jost:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body style={{ fontFamily: "'Jost', sans-serif" }} className="bg-white text-gray-900 antialiased">
        {children}
      </body>
    </html>
  )
}