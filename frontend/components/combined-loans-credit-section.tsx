'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useState, useEffect } from 'react'
import { DollarSign } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface CreditScoreData {
  creditScore: number
  scoreRange: string
  lastUpdated: string
}

interface LoansData {
  loans: any[]
  total_loans: number
  total_loan_amount: number
  total_monthly_payments: number
  average_credit_score: number
}

export function CombinedLoansCreditSection() {
  const [creditScore, setCreditScore] = useState<CreditScoreData | null>(null)
  const [loansData, setLoansData] = useState<LoansData | null>(null)
  const [creditLoading, setCreditLoading] = useState(true)
  const [loansLoading, setLoansLoading] = useState(true)

  // Fetch credit score
  useEffect(() => {
    const fetchCreditScore = async () => {
      try {
        const response = await fetch('/api/credit-score')
        if (!response.ok) {
          throw new Error('Failed to fetch credit score')
        }
        const data = await response.json()
        setCreditScore(data)
      } catch (error) {
        console.error('Failed to fetch credit score:', error)
      } finally {
        setCreditLoading(false)
      }
    }

    fetchCreditScore()
  }, [])

  // Fetch loans data
  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const response = await fetch('/api/loans')
        if (!response.ok) {
          throw new Error('Failed to fetch loans')
        }
        const data = await response.json()
        setLoansData(data)
      } catch (error) {
        console.error('Failed to fetch loans:', error)
      } finally {
        setLoansLoading(false)
      }
    }

    fetchLoans()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Math.abs(amount))
  }

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

  const getGradientColors = (score: number) => {
    if (score >= 800) return { start: '#10b981', end: '#059669' }
    if (score >= 740) return { start: '#3b82f6', end: '#2563eb' }
    if (score >= 670) return { start: '#f59e0b', end: '#d97706' }
    if (score >= 580) return { start: '#f97316', end: '#ea580c' }
    return { start: '#ef4444', end: '#dc2626' }
  }

  if (creditLoading || loansLoading) {
    return (
      <Card className="border-border bg-card h-full">
        <CardHeader className="pb-2 px-3 pt-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-card-foreground">
            <DollarSign className="h-4 w-4" />
            Loans & Credit Score
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <div className="flex items-center justify-center h-24">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border bg-card h-full">
      <CardHeader className="pb-1 px-3 pt-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-card-foreground">
          <DollarSign className="h-4 w-4" />
          Loans & Credit Score
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col px-3 pb-2 pt-0">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
          {/* Loans Summary */}
          <div className="flex flex-col space-y-3 h-full">
            <h4 className="text-sm font-semibold text-card-foreground">Loans Overview</h4>

            <div className="flex-1 space-y-3">
              {/* Total Remaining Balance */}
              <div className="rounded-lg bg-red-50 dark:bg-red-950/20 p-3 border border-red-200 dark:border-red-800">
                <p className="text-xs font-medium text-muted-foreground mb-1">Total Remaining Balance</p>
                <p className="text-lg font-bold text-red-600 dark:text-red-400">
                  {loansData ? formatCurrency(loansData.total_loan_amount) : '$0.00'}
                </p>
              </div>

              {/* Monthly Payments */}
              <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 p-3 border border-blue-200 dark:border-blue-800">
                <p className="text-xs font-medium text-muted-foreground mb-1">Monthly Payments</p>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {loansData ? formatCurrency(loansData.total_monthly_payments) : '$0.00'}
                </p>
              </div>

              {/* Number of Active Loans */}
              <div className="rounded-lg bg-green-50 dark:bg-green-950/20 p-3 border border-green-200 dark:border-green-800">
                <p className="text-xs font-medium text-muted-foreground mb-1">Active Loans</p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                  {loansData ? loansData.total_loans : 0}
                </p>
              </div>
            </div>
          </div>

          {/* Credit Score */}
          <div className="flex flex-col space-y-3 h-full">
            <h4 className="text-sm font-semibold text-card-foreground">Credit Score</h4>

            {creditScore ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-3">
                {/* Circular Progress */}
                <div className="relative w-24 h-24">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                    {/* Background circle */}
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-muted-foreground/20"
                    />
                    {/* Progress circle with gradient */}
                    <defs>
                      <linearGradient id="creditGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={getGradientColors(creditScore.creditScore).start} />
                        <stop offset="100%" stopColor={getGradientColors(creditScore.creditScore).end} />
                      </linearGradient>
                    </defs>
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="url(#creditGradient)"
                      strokeWidth="2"
                      strokeDasharray={`${getScoreProgress(creditScore.creditScore)}, 100`}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  {/* Score text in center */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-xl font-bold ${getScoreColor(creditScore.creditScore)}`}>
                      {creditScore.creditScore}
                    </span>
                  </div>
                </div>

                {/* Score range */}
                <div className="text-center space-y-1">
                  <div className={`text-sm font-semibold ${getScoreColor(creditScore.creditScore)}`}>
                    {creditScore.scoreRange}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Updated {formatDate(creditScore.lastUpdated)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                Unable to load credit score
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}