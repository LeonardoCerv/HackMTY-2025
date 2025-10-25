import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // In a real implementation, this would fetch from Capital One's API
    // For now, returning mock data
    const creditScore = 742
    const scoreRange = 'Good'

    return NextResponse.json({
      creditScore,
      scoreRange,
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching credit score:', error)
    return NextResponse.json(
      { error: 'Failed to fetch credit score' },
      { status: 500 }
    )
  }
}