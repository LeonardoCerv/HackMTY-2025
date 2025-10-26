"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useTransactions, useAccounts } from "@/lib/hooks"
import { Transaction, Account } from "@/types/financial"

export function CompactExpensesSection() {
  const { transactions, isLoading } = useTransactions()
  const { accounts } = useAccounts()

  // Calculate metrics
  const monthlyExpenses = transactions
    .filter((txn: any) => txn.positive === false)
    .reduce((sum: number, txn: any) => sum + Math.abs(txn.amount), 0)

  // Process expenses data for chart - ensure 6 months of data
  const expensesByMonth = transactions
    .filter((txn: any) => txn.positive === false)
    .reduce((acc: Record<string, number>, txn: any) => {
      const date = new Date(txn.transaction_date)
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const year = String(date.getFullYear()).slice(-2)
      const monthKey = `${month}-${year}`
      acc[monthKey] = (acc[monthKey] || 0) + Math.abs(txn.amount)
      return acc
    }, {})

  // Generate last 6 months with data points
  const currentDate = new Date()
  const expensesData = []
  for (let i = 5; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = String(date.getFullYear()).slice(-2)
    const monthKey = `${month}-${year}`
    expensesData.push({
      month: monthKey,
      amount: expensesByMonth[monthKey] || 0
    })
  }

  // Expense breakdown by transaction type
  const expenseBreakdown = transactions
    .filter((txn: any) => txn.positive === false)
    .reduce((acc: Record<string, number>, txn: any) => {
      const source = txn.type
      acc[source] = (acc[source] || 0) + Math.abs(txn.amount)
      return acc
    }, {})

  const expenseSources = Object.entries(expenseBreakdown).map(([source, amount]) => ({
    source,
    amount,
    percentage: (amount / Object.values(expenseBreakdown).reduce((a, b) => a + b, 0)) * 100
  }))

  if (isLoading) {
    return (
      <Card className="border-border bg-card h-full">
        <CardHeader className="pb-2 px-3 pt-3">
          <CardTitle className="text-sm font-semibold text-card-foreground">Expenses</CardTitle>
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
        <CardTitle className="text-sm font-semibold text-card-foreground">Expenses</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 px-3 pb-2">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 gap-3">
          <div className="rounded-lg bg-red-50 dark:bg-red-950/20 p-3 border border-red-200 dark:border-red-800">
            <p className="text-xs font-medium text-muted-foreground mb-1">Monthly Expenses</p>
            <p className="text-base font-bold text-red-600 dark:text-red-400">${monthlyExpenses.toLocaleString()}</p>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-card-foreground mb-2">6-Month Trend</p>
          <ResponsiveContainer width="100%" height={80}>
            <LineChart data={expensesData}>
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
                formatter={(value: number) => [`$${value.toLocaleString()}`, "Expenses"]}
              />
              <Line type="monotone" dataKey="amount" stroke="#CB2426" strokeWidth={2} dot={{ fill: "#CB2426", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-card-foreground">Expense Sources</p>
          {expenseSources.map((item) => (
            <div key={item.source} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground capitalize">{item.source}</span>
                <span className="text-sm font-semibold text-card-foreground">${item.amount.toLocaleString()}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary/50">
                <div className="h-full bg-red-600 rounded-full transition-all duration-300" style={{ width: `${item.percentage}%` }} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}