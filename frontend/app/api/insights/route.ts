import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { question, transactions } = await request.json()

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
        request: question,
        transactions: transactions // Pass the transaction data to avoid duplicate API calls
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Agent error response:', errorText)
      throw new Error(`Backend API error: ${response.status} - ${errorText}`)
    }

    const analysisResult = await response.json()

    // Transform the response to match expected frontend format
    return NextResponse.json({
      analysis: analysisResult.analysis,
      chart: analysisResult.chart, // Optional chart data
      userQuery: question, // Include the user's question
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