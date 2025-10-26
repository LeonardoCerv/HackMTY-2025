"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Area, AreaChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, ComposedChart } from "recharts"
import { useTransactions } from "@/lib/hooks"
import { TrendingUp } from "lucide-react"

export function CompactIncomeExpensesSection() {
  const { transactions, isLoading } = useTransactions()

  // Calculate metrics
  const monthlyIncome = transactions
    .filter((txn: any) => txn.positive === true)
    .reduce((sum: number, txn: any) => sum + txn.amount, 0)

  const monthlyExpenses = transactions
    .filter((txn: any) => txn.positive === false)
    .reduce((sum: number, txn: any) => sum + Math.abs(txn.amount), 0)

  // Process income and expenses data for combined chart
  const incomeByMonth = transactions
    .filter((txn: any) => txn.positive === true)
    .reduce((acc: Record<string, number>, txn: any) => {
      const date = new Date(txn.transaction_date)
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const year = String(date.getFullYear()).slice(-2)
      const monthKey = `${month}-${year}`
      acc[monthKey] = (acc[monthKey] || 0) + txn.amount
      return acc
    }, {})

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
  const combinedData = []
  for (let i = 5; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = String(date.getFullYear()).slice(-2)
    const monthKey = `${month}-${year}`
    combinedData.push({
      month: monthKey,
      income: incomeByMonth[monthKey] || 0,
      expenses: expensesByMonth[monthKey] || 0
    })
  }

  // Income breakdown by transaction type
  const incomeBreakdown = transactions
    .filter((txn: any) => txn.positive === true)
    .reduce((acc: Record<string, number>, txn: any) => {
      const source = txn.type
      acc[source] = (acc[source] || 0) + txn.amount
      return acc
    }, {})

  const incomeSources = Object.entries(incomeBreakdown)
    .map(([source, amount]) => ({
      source,
      amount,
      percentage: (amount / Object.values(incomeBreakdown).reduce((a, b) => a + b, 0)) * 100
    }))
    .sort((a, b) => b.amount - a.amount) // Sort by amount descending

  // Expense breakdown by transaction type
  const expenseBreakdown = transactions
    .filter((txn: any) => txn.positive === false)
    .reduce((acc: Record<string, number>, txn: any) => {
      const source = txn.type
      acc[source] = (acc[source] || 0) + Math.abs(txn.amount)
      return acc
    }, {})

  const expenseSources = Object.entries(expenseBreakdown)
    .map(([source, amount]) => ({
      source,
      amount,
      percentage: (amount / Object.values(expenseBreakdown).reduce((a, b) => a + b, 0)) * 100
    }))
    .sort((a, b) => b.amount - a.amount) // Sort by amount descending

  if (isLoading) {
    return (
      <Card className="border-border bg-card h-full">
        <CardHeader className="pb-2 px-3 pt-3">
          <CardTitle className="text-sm font-semibold text-card-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Income & Expenses
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
        <CardTitle className="text-sm font-semibold text-card-foreground flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Income & Expenses
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 px-3 pb-2">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-primary/5 p-2 border border-primary/10">
            <p className="text-xs font-medium text-muted-foreground mb-1">Monthly Income</p>
            <p className="text-sm font-bold text-primary">${monthlyIncome.toLocaleString()}</p>
          </div>
          <div className="rounded-lg bg-red-50 dark:bg-red-950/20 p-2 border border-red-200 dark:border-red-800">
            <p className="text-xs font-medium text-muted-foreground mb-1">Monthly Expenses</p>
            <p className="text-sm font-bold text-red-600 dark:text-red-400">${monthlyExpenses.toLocaleString()}</p>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-card-foreground mb-2">6-Month Trend</p>
          <ResponsiveContainer width="100%" height={80}>
            <ComposedChart data={combinedData}>
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
                formatter={(value: number, name: string) => [
                  `$${value.toLocaleString()}`,
                  name === 'income' ? 'Income' : 'Expenses'
                ]}
              />
              {/* Income as filled area */}
              <Area
                type="monotone"
                dataKey="income"
                stroke="#156aa2"
                fill="#156aa2"
                fillOpacity={0.3}
                strokeWidth={2}
                name="income"
              />
              {/* Expenses as line */}
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="#CB2426"
                strokeWidth={2}
                dot={{ fill: "#CB2426", r: 2 }}
                name="expenses"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* 2-Column Grid for Sources */}
        <div className="grid grid-cols-2 gap-3">
          {/* Income Sources */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-card-foreground">Income Sources</p>
            <div className="space-y-1 max-h-20 overflow-y-auto">
              {incomeSources.slice(0, 3).map((item) => (
                <div key={item.source} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground capitalize truncate">{item.source}</span>
                    <span className="text-xs font-semibold text-card-foreground">${item.amount.toLocaleString()}</span>
                  </div>
                  <div className="h-1 w-full overflow-hidden rounded-full bg-secondary/50">
                    <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${item.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Expense Sources */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-card-foreground">Expense Sources</p>
            <div className="space-y-1 max-h-20 overflow-y-auto">
              {expenseSources.slice(0, 3).map((item) => (
                <div key={item.source} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground capitalize truncate">{item.source}</span>
                    <span className="text-xs font-semibold text-card-foreground">${item.amount.toLocaleString()}</span>
                  </div>
                  <div className="h-1 w-full overflow-hidden rounded-full bg-secondary/50">
                    <div className="h-full bg-red-600 rounded-full transition-all duration-300" style={{ width: `${item.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}