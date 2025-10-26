'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useState, useEffect } from 'react'
import { useAccounts } from '@/lib/hooks'
import { Account } from '@/types/financial'
import { DollarSign } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface CreditScoreData {
  creditScore: number
  scoreRange: string
  lastUpdated: string
}

interface LoanTransaction {
  account_id: string
  account_type: string
  nickname: string
  amount: number
  positive: boolean
  transaction_date: string
  description: string
  type: string
}

export function CombinedLoansCreditSection() {
  const { accounts } = useAccounts()
  const [creditScore, setCreditScore] = useState<CreditScoreData | null>(null)
  const [creditLoading, setCreditLoading] = useState(true)
  const [loanTransactions, setLoanTransactions] = useState<LoanTransaction[]>([])
  const [loansLoading, setLoansLoading] = useState(true)

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

  // Fetch loan transactions
  useEffect(() => {
    const fetchLoanTransactions = async () => {
      try {
        const response = await fetch('/api/transactions')
        const data = await response.json()
        const allTransactions: LoanTransaction[] = data.transactions.map((tx: any) => ({
          account_id: tx.account_id ?? 'unknown_account',
          account_type: tx.account_type ?? 'Unknown',
          nickname: tx.nickname ?? tx.account_name ?? '—',
          amount: typeof tx.amount === 'number' ? tx.amount : Number(tx.amount ?? 0),
          positive: typeof tx.positive === 'boolean' ? tx.positive : (tx.positive === 'true' || (tx.amount && Number(tx.amount) >= 0)),
          transaction_date: tx.transaction_date ?? tx.date ?? new Date().toISOString(),
          description: tx.description ?? tx.memo ?? '—',
          type: tx.type ?? 'unknown'
        }))
        const loans = allTransactions.filter(tx => tx.type === 'loan')
        setLoanTransactions(loans)
      } catch (error) {
        console.error('Failed to fetch loan transactions:', error)
      } finally {
        setLoansLoading(false)
      }
    }

    fetchLoanTransactions()
  }, [])

  // Calculate debt metrics from loan transactions
  const loanAccounts = accounts.filter((acc: Account) => acc.type === 'loan')
  const totalLoanAmount = loanTransactions.reduce((sum: number, tx: LoanTransaction) => sum + tx.amount, 0)
  const monthlyPayments = loanAccounts.reduce((sum: number, acc: Account) => sum + (acc.monthlyPayment || 0), 0)
  
  // Additional loan statistics
  const numberOfLoans = loanTransactions.length
  const averageLoanAmount = numberOfLoans > 0 ? totalLoanAmount / numberOfLoans : 0
  const largestLoan = loanTransactions.length > 0 ? Math.max(...loanTransactions.map(tx => tx.amount)) : 0
  const recentLoans = loanTransactions.filter(tx => {
    const txDate = new Date(tx.transaction_date)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return txDate >= thirtyDaysAgo
  }).length

  // Overall financial metrics
  const netWorth = accounts.reduce((sum: number, acc: Account) => sum + acc.balance, 0)
  const totalDebt = accounts
    .filter((acc: any) => acc.type === 'loan' || (acc.type === 'Credit Card' && acc.balance < 0))
    .reduce((sum: number, acc: any) => sum + Math.abs(acc.balance < 0 ? acc.balance : acc.balance), 0)

  // Process loan data for chart - last 6 months
  const loansByMonth = loanTransactions
    .reduce((acc: Record<string, number>, tx: LoanTransaction) => {
      const date = new Date(tx.transaction_date)
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const year = String(date.getFullYear()).slice(-2)
      const monthKey = `${month}-${year}`
      acc[monthKey] = (acc[monthKey] || 0) + tx.amount
      return acc
    }, {})

  // Generate last 6 months with data points
  const currentDate = new Date()
  const loansChartData = []
  for (let i = 5; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = String(date.getFullYear()).slice(-2)
    const monthKey = `${month}-${year}`
    loansChartData.push({
      month: monthKey,
      amount: loansByMonth[monthKey] || 0
    })
  }

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
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 h-full">
          {/* Debt Information */}
          <div className="flex flex-col space-y-2 h-full">
            <h4 className="text-sm font-semibold text-card-foreground">Loans Overview</h4>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-red-50 dark:bg-red-950/20 p-2 border border-red-200 dark:border-red-800">
                <p className="text-xs font-medium text-muted-foreground mb-1">Total Loans</p>
                <p className="text-base font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(totalLoanAmount)}
                </p>
              </div>
              <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 p-2 border border-blue-200 dark:border-blue-800">
                <p className="text-xs font-medium text-muted-foreground mb-1">Number of Loans</p>
                <p className="text-base font-bold text-blue-600 dark:text-blue-400">
                  {numberOfLoans}
                </p>
              </div>
              <div className="rounded-lg bg-green-50 dark:bg-green-950/20 p-2 border border-green-200 dark:border-green-800">
                <p className="text-xs font-medium text-muted-foreground mb-1">Average Loan</p>
                <p className="text-base font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(averageLoanAmount)}
                </p>
              </div>
              <div className="rounded-lg bg-purple-50 dark:bg-purple-950/20 p-2 border border-purple-200 dark:border-purple-800">
                <p className="text-xs font-medium text-muted-foreground mb-1">Largest Loan</p>
                <p className="text-base font-bold text-purple-600 dark:text-purple-400">
                  {formatCurrency(largestLoan)}
                </p>
              </div>
              <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950/20 p-2 border border-yellow-200 dark:border-yellow-800">
                <p className="text-xs font-medium text-muted-foreground mb-1">Net Worth</p>
                <p className="text-base font-bold text-yellow-600 dark:text-yellow-400">
                  {formatCurrency(netWorth)}
                </p>
              </div>
              <div className="rounded-lg bg-orange-50 dark:bg-orange-950/20 p-2 border border-orange-200 dark:border-orange-800">
                <p className="text-xs font-medium text-muted-foreground mb-1">Total Debt</p>
                <p className="text-base font-bold text-orange-600 dark:text-orange-400">
                  {formatCurrency(totalDebt)}
                </p>
              </div>
            </div>

            {loanTransactions.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-card-foreground">Loan Trend (6 Months)</p>
                <ResponsiveContainer width="100%" height={60}>
                  <AreaChart data={loansChartData}>
                    <XAxis dataKey="month" stroke="#A0A0A0" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis
                      stroke="#A0A0A0"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value: number) => `$${value / 1000}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#2D2D2D",
                        border: "1px solid #3D3D3D",
                        borderRadius: "6px",
                        color: "#FFFFFF",
                        fontSize: "12px",
                      }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, "Loans"]}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#10b981" 
                      fill="#10b981" 
                      fillOpacity={0.3}
                      strokeWidth={2} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {loanTransactions.length > 0 && (
              <div className="flex-1 space-y-2 overflow-hidden">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-card-foreground">Recent Loan Activity</p>
                  <span className="text-xs text-muted-foreground bg-orange-50 dark:bg-orange-950/20 px-2 py-1 rounded-full">
                    {recentLoans} in last 30 days
                  </span>
                </div>
                <div className="space-y-1 overflow-y-auto max-h-24">
                  {loanTransactions.slice(0, 4).map((transaction, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                      <div className="flex-1 min-w-0">
                        <span className="text-sm text-card-foreground truncate block font-medium">
                          {transaction.description || 'Loan transaction'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(transaction.transaction_date)} • {transaction.account_type}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-green-600 dark:text-green-400 ml-2">
                        +{formatCurrency(transaction.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {loanTransactions.length === 0 && (
              <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                No loan transactions found
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