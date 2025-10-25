'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CreditCard } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface CreditScoreData {
  creditScore: number
  scoreRange: string
  lastUpdated: string
}

export function CompactCreditScoreSection() {
  const [creditScore, setCreditScore] = useState<CreditScoreData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCreditScore = async () => {
      try {
        const response = await fetch('/api/credit-score')
        const data = await response.json()
        setCreditScore(data)
      } catch (error) {
        console.error('Failed to fetch credit score:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCreditScore()
  }, [])

  const getScoreColor = (score: number) => {
    if (score >= 800) return 'text-green-600'
    if (score >= 740) return 'text-blue-600'
    if (score >= 670) return 'text-yellow-600'
    if (score >= 580) return 'text-orange-600'
    return 'text-red-600'
  }

  const getScoreProgress = (score: number) => {
    const min = 300
    const max = 850
    return ((score - min) / (max - min)) * 100
  }

  if (loading) {
    return (
      <Card className="border-border bg-card h-[200px]">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-1.5 text-sm text-card-foreground">
            <CreditCard className="h-4 w-4" />
            Credit Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-24">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!creditScore) {
    return (
      <Card className="border-border bg-card h-[200px]">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-1.5 text-sm text-card-foreground">
            <CreditCard className="h-4 w-4" />
            Credit Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-24 text-muted-foreground text-sm">
            Unable to load credit score
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-1.5 text-sm text-card-foreground">
          <CreditCard className="h-4 w-4" />
          Credit Score
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Circular Score Display */}
        <div className="flex flex-col items-center space-y-3">
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
              {/* Background circle */}
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-muted-foreground/20"
              />
              {/* Progress circle */}
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray={`${getScoreProgress(creditScore.creditScore)}, 100`}
                className={`${getScoreColor(creditScore.creditScore).replace('text-', 'stroke-')} transition-all duration-1000 ease-out`}
                strokeLinecap="round"
              />
            </svg>
            {/* Score text in center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-lg font-bold ${getScoreColor(creditScore.creditScore)}`}>
                {creditScore.creditScore}
              </span>
            </div>
          </div>

          <div className="text-center space-y-1">
            <div className={`text-sm font-semibold ${getScoreColor(creditScore.creditScore)}`}>
              {creditScore.scoreRange}
            </div>
            <div className="text-xs text-muted-foreground">
              Updated {formatDate(creditScore.lastUpdated)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}