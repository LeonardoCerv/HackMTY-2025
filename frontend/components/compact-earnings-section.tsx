"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useTransactions, useAccounts } from "@/lib/hooks"
import { Transaction, Account } from "@/types/financial"
import { formatDate } from "@/lib/utils"

export function CompactEarningsSection() {
  const { transactions, isLoading } = useTransactions()
  const { accounts } = useAccounts()

  // Calculate metrics
  const monthlyIncome = transactions
    .filter((txn: any) => txn.positive === true)
    .reduce((sum: number, txn: any) => sum + txn.amount, 0)

  // Process earnings data for chart - ensure 6 months of data
  const earningsByMonth = transactions
    .filter((txn: any) => txn.positive === true)
    .reduce((acc: Record<string, number>, txn: any) => {
      const date = new Date(txn.transaction_date)
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const year = String(date.getFullYear()).slice(-2)
      const monthKey = `${month}-${year}`
      acc[monthKey] = (acc[monthKey] || 0) + txn.amount
      return acc
    }, {})

  // Generate last 6 months with data points
  const currentDate = new Date()
  const earningsData = []
  for (let i = 5; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = String(date.getFullYear()).slice(-2)
    const monthKey = `${month}-${year}`
    earningsData.push({
      month: monthKey,
      amount: earningsByMonth[monthKey] || 0
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
        <div className="grid grid-cols-1 gap-3">
          <div className="rounded-lg bg-primary/5 p-3 border border-primary/10">
            <p className="text-xs font-medium text-muted-foreground mb-1">Monthly Income</p>
            <p className="text-base font-bold text-primary">${monthlyIncome.toLocaleString()}</p>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-card-foreground mb-2">6-Month Trend</p>
          <ResponsiveContainer width="100%" height={80}>
            <AreaChart data={earningsData}>
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
              <Area 
                type="monotone" 
                dataKey="amount" 
                stroke="#156aa2" 
                fill="#156aa2" 
                fillOpacity={0.3}
                strokeWidth={2} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-card-foreground">Income Sources</p>
          {incomeSources.map((item) => (
            <div key={item.source} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground capitalize">{item.source}</span>
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