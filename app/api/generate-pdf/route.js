import { NextResponse } from 'next/server'

/**
 * This route returns the PDF data payload to the client.
 * The actual PDF is generated client-side using jsPDF to avoid
 * large server-side bundle issues and keep Vercel cold starts fast.
 * This route validates the request and returns structured data.
 */
export async function POST(request) {
  try {
    const body = await request.json()
    const { formData, results } = body

    if (!formData || !results) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 })
    }

    return NextResponse.json({ success: true, formData, results })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}