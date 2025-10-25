'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useState, useEffect } from 'react'
import { useAccounts } from '@/lib/hooks'
import { Account } from '@/types/financial'
import { DollarSign } from 'lucide-react'

interface CreditScoreData {
  creditScore: number
  scoreRange: string
  lastUpdated: string
}

export function CombinedLoansCreditSection() {
  const { accounts } = useAccounts()
  const [creditScore, setCreditScore] = useState<CreditScoreData | null>(null)
  const [creditLoading, setCreditLoading] = useState(true)

  // Fetch credit score
  useEffect(() => {
    const fetchCreditScore = async () => {
      try {
        const response = await fetch('/api/credit-score')
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

  // Calculate debt metrics
  const loanAccounts = accounts.filter((acc: Account) => acc.type === 'loan')
  const totalDebt = loanAccounts.reduce((sum: number, acc: Account) => sum + Math.abs(acc.balance), 0)
  const monthlyPayments = loanAccounts.reduce((sum: number, acc: Account) => sum + (acc.monthlyPayment || 0), 0)

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

  if (creditLoading) {
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
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 h-full">
          {/* Debt Information */}
          <div className="flex flex-col space-y-2 h-full">
            <h4 className="text-sm font-semibold text-card-foreground">Debt Overview</h4>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-red-50 dark:bg-red-950/20 p-2 border border-red-200 dark:border-red-800">
                <p className="text-xs font-medium text-muted-foreground mb-1">Total Debt</p>
                <p className="text-base font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(totalDebt)}
                </p>
              </div>
              <div className="rounded-lg bg-orange-50 dark:bg-orange-950/20 p-2 border border-orange-200 dark:border-orange-800">
                <p className="text-xs font-medium text-muted-foreground mb-1">Monthly Payments</p>
                <p className="text-base font-bold text-orange-600 dark:text-orange-400">
                  {formatCurrency(monthlyPayments)}
                </p>
              </div>
            </div>

            {loanAccounts.length > 0 && (
              <div className="flex-1 space-y-1 overflow-hidden">
                <p className="text-sm font-medium text-card-foreground">Loan Accounts</p>
                <div className="space-y-1 overflow-y-auto max-h-20">
                  {loanAccounts.map((account) => (
                    <div key={account.id} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{account.name}</span>
                      <span className="text-sm font-semibold text-card-foreground">
                        {formatCurrency(account.balance)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Credit Score */}
          <div className="flex flex-col space-y-2 h-full">
            <h4 className="text-sm font-semibold text-card-foreground">Credit Score</h4>

            {creditScore ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-2">
                {/* Circular Progress */}
                <div className="relative w-20 h-20">
                  <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
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
                        <stop offset="0%" stopColor={getScoreColor(creditScore.creditScore).includes('green') ? '#10b981' : getScoreColor(creditScore.creditScore).includes('blue') ? '#3b82f6' : getScoreColor(creditScore.creditScore).includes('yellow') ? '#f59e0b' : getScoreColor(creditScore.creditScore).includes('orange') ? '#f97316' : '#ef4444'} />
                        <stop offset="100%" stopColor={getScoreColor(creditScore.creditScore).includes('green') ? '#059669' : getScoreColor(creditScore.creditScore).includes('blue') ? '#2563eb' : getScoreColor(creditScore.creditScore).includes('yellow') ? '#d97706' : getScoreColor(creditScore.creditScore).includes('orange') ? '#ea580c' : '#dc2626'} />
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
                    <span className={`text-lg font-bold ${getScoreColor(creditScore.creditScore)}`}>
                      {creditScore.creditScore}
                    </span>
                  </div>
                </div>

                {/* Score range and labels */}
                <div className="text-center space-y-1">
                  <div className={`text-sm font-semibold ${getScoreColor(creditScore.creditScore)}`}>
                    {creditScore.scoreRange}
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground w-full max-w-[120px]">
                    <span>Poor</span>
                    <span>Fair</span>
                    <span>Good</span>
                    <span>Excellent</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Updated {new Date(creditScore.lastUpdated).toLocaleDateString()}
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