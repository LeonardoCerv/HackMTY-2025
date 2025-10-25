"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useTransactions, useAccounts } from "@/lib/hooks"
import { Transaction, Account } from "@/types/financial"

export function CompactEarningsSection() {
  const { transactions, isLoading } = useTransactions()
  const { accounts } = useAccounts()

  // Calculate metrics
  const netWorth = accounts.reduce((sum: number, acc: Account) => sum + acc.balance, 0)
  const monthlyIncome = transactions
    .filter((txn: Transaction) => txn.type === 'credit' && txn.category === 'Income')
    .reduce((sum: number, txn: Transaction) => sum + txn.amount, 0)

  // Process earnings data for chart
  const earningsByMonth = transactions
    .filter((txn: Transaction) => txn.type === 'credit' && txn.category === 'Income')
    .reduce((acc: Record<string, number>, txn: Transaction) => {
      const month = new Date(txn.date).toLocaleDateString('en-US', { month: 'short' })
      acc[month] = (acc[month] || 0) + txn.amount
      return acc
    }, {})

  const earningsData = Object.entries(earningsByMonth).map(([month, amount]) => ({
    month,
    amount
  }))

  // Income breakdown
  const incomeBreakdown = transactions
    .filter((txn: Transaction) => txn.type === 'credit' && txn.category === 'Income')
    .reduce((acc: Record<string, number>, txn: Transaction) => {
      const source = txn.subcategory
      acc[source] = (acc[source] || 0) + txn.amount
      return acc
    }, {})

  const incomeSources = Object.entries(incomeBreakdown).map(([source, amount]) => ({
    source,
    amount,
    percentage: (amount / Object.values(incomeBreakdown).reduce((a, b) => a + b, 0)) * 100
  }))

  if (isLoading) {
    return (
      <Card className="border-border bg-card h-full">
        <CardHeader className="pb-2 px-3 pt-3">
          <CardTitle className="text-sm font-semibold text-card-foreground">Earnings</CardTitle>
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
        <CardTitle className="text-sm font-semibold text-card-foreground">Earnings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 px-3 pb-2">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-primary/5 p-3 border border-primary/10">
            <p className="text-xs font-medium text-muted-foreground mb-1">Net Worth</p>
            <p className="text-base font-bold text-primary">${netWorth.toLocaleString()}</p>
          </div>
          <div className="rounded-lg bg-primary/5 p-3 border border-primary/10">
            <p className="text-xs font-medium text-muted-foreground mb-1">Monthly Income</p>
            <p className="text-base font-bold text-primary">${monthlyIncome.toLocaleString()}</p>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-card-foreground mb-2">6-Month Trend</p>
          <ResponsiveContainer width="100%" height={80}>
            <LineChart data={earningsData}>
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
                formatter={(value: number) => [`$${value.toLocaleString()}`, "Income"]}
              />
              <Line type="monotone" dataKey="amount" stroke="#156aa2" strokeWidth={2} dot={{ fill: "#156aa2", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-card-foreground">Income Sources</p>
          {incomeSources.map((item) => (
            <div key={item.source} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{item.source}</span>
                <span className="text-sm font-semibold text-card-foreground">${item.amount.toLocaleString()}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary/50">
                <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${item.percentage}%` }} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}