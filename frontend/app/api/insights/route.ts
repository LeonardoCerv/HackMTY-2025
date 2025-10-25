import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { question } = await request.json()

    if (!question) {
      return NextResponse.json({
        error: 'Question is required',
        success: false
      }, { status: 400 })
    }

    // Call the backend agent for comprehensive analysis
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000'
    const response = await fetch(`${backendUrl}/api/generate-analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        request: question
      }),
    })

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`)
    }

    const analysisResult = await response.json()

    // Transform the response to match expected frontend format
    return NextResponse.json({
      analysis: analysisResult.analysis,
      justification: analysisResult.justification,
      chart: analysisResult.chart, // Optional chart data
      success: true
    })

  } catch (error) {
    console.error('Backend agent error:', error)
    return NextResponse.json({
      error: 'Failed to generate analysis',
      success: false
    }, { status: 500 })
  }
}