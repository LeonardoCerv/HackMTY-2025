'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, CreditCard, AlertCircle, CheckCircle, Target } from 'lucide-react'
import { useAccounts } from '@/lib/hooks'
import { Account } from '@/types/financial'

interface CreditScoreData {
  creditScore: number
  scoreRange: string
  lastUpdated: string
}

export function CompactCreditScoreSection() {
  const [creditScore, setCreditScore] = useState<CreditScoreData | null>(null)
  const [loading, setLoading] = useState(true)
  const { accounts } = useAccounts()

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

  // Calculate credit utilization
  const creditCards = accounts.filter((acc: Account) => acc.type === 'credit')
  const totalCreditLimit = creditCards.reduce((sum, acc) => sum + (acc.creditLimit || 0), 0)
  const totalCreditUsed = creditCards.reduce((sum, acc) => sum + Math.abs(acc.balance), 0)
  const creditUtilization = totalCreditLimit > 0 ? (totalCreditUsed / totalCreditLimit) * 100 : 0

  // Mock score change (in real app, this would come from API)
  const scoreChange = Math.floor(Math.random() * 40) - 20 // -20 to +20
  const scoreChangeText = scoreChange > 0 ? `+${scoreChange}` : scoreChange.toString()

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

  const getUtilizationColor = (utilization: number) => {
    if (utilization <= 10) return 'text-green-600'
    if (utilization <= 30) return 'text-blue-600'
    if (utilization <= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getUtilizationAdvice = (utilization: number) => {
    if (utilization <= 10) return 'Excellent utilization'
    if (utilization <= 30) return 'Good utilization'
    if (utilization <= 50) return 'Moderate utilization'
    return 'High utilization - consider paying down'
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
      <CardContent className="space-y-3">
        {/* Main Score Display */}
        <div className="text-center space-y-1">
          <div className={`text-3xl font-bold ${getScoreColor(creditScore.creditScore)}`}>
            {creditScore.creditScore}
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className={`text-sm font-medium ${getScoreColor(creditScore.creditScore)}`}>
              {creditScore.scoreRange}
            </div>
            <div className={`flex items-center gap-1 text-xs ${scoreChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {scoreChange >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span>{scoreChangeText} this month</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>300</span>
            <span>850</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${getScoreProgress(creditScore.creditScore)}%` }}
            />
          </div>
          <div className="grid grid-cols-5 text-xs text-center text-muted-foreground">
            <div>Poor</div>
            <div>Fair</div>
            <div>Good</div>
            <div>Very Good</div>
            <div>Excellent</div>
          </div>
        </div>

        {/* Credit Utilization */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-card-foreground">Credit Utilization</span>
            <span className={`text-xs font-medium ${getUtilizationColor(creditUtilization)}`}>
              {creditUtilization.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-secondary rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all duration-500 ${
                creditUtilization <= 10 ? 'bg-green-500' :
                creditUtilization <= 30 ? 'bg-blue-500' :
                creditUtilization <= 50 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(creditUtilization, 100)}%` }}
            />
          </div>
          <div className="text-xs text-muted-foreground">
            {getUtilizationAdvice(creditUtilization)}
          </div>
        </div>

        {/* Key Factors */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-card-foreground">Key Factors</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
              <span className="text-muted-foreground">Payment history (35%)</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
              <span className="text-muted-foreground">Credit utilization (30%)</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <AlertCircle className="h-3 w-3 text-yellow-600 flex-shrink-0" />
              <span className="text-muted-foreground">Credit age (15%)</span>
            </div>
          </div>
        </div>

        {/* Quick Tip */}
        <div className="rounded-lg bg-primary/5 border border-primary/20 p-2">
          <div className="flex items-start gap-2">
            <Target className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-medium text-card-foreground">Quick Tip</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {creditUtilization > 30
                  ? "Pay down credit cards to improve your score"
                  : "Keep up the good work with low utilization!"
                }
              </div>
            </div>
          </div>
        </div>

        {/* Last Updated */}
        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground pt-1">
          <TrendingUp className="h-3 w-3" />
          <span>Updated {new Date(creditScore.lastUpdated).toLocaleDateString()}</span>
        </div>
      </CardContent>
    </Card>
  )
}