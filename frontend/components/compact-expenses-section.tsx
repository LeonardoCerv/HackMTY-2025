"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useTransactions } from "@/lib/hooks"
import { Transaction } from "@/types/financial"

export function CompactExpensesSection() {
  const { transactions, isLoading } = useTransactions()

  // Process expenses data
  const expensesByCategory = transactions
    .filter((txn: Transaction) => txn.type === 'debit')
    .reduce((acc: Record<string, number>, txn: Transaction) => {
      const category = txn.category
      acc[category] = (acc[category] || 0) + Math.abs(txn.amount)
      return acc
    }, {})

  const expensesData = Object.entries(expensesByCategory).map(([category, amount]) => ({
    category,
    amount
  }))

  const totalExpenses = expensesData.reduce((sum, item) => sum + item.amount, 0)

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
        <div className="rounded-lg bg-accent/5 p-3 border border-accent/10">
          <p className="text-xs font-medium text-muted-foreground mb-1">Monthly Expenses</p>
          <p className="text-base font-bold text-accent">${totalExpenses.toLocaleString()}</p>
        </div>

        <div>
          <p className="text-sm font-medium text-card-foreground mb-2">Monthly Breakdown</p>
          <ResponsiveContainer width="100%" height={80}>
            <BarChart data={expensesData}>
              <XAxis dataKey="category" stroke="#A0A0A0" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#A0A0A0"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value: number) => `$${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#2D2D2D",
                  border: "1px solid #3D3D3D",
                  borderRadius: "6px",
                  color: "#FFFFFF",
                  fontSize: "12px",
                }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, "Spent"]}
              />
              <Bar dataKey="amount" fill="#CB2426" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-card-foreground">Category Details</p>
            <p className="text-sm font-semibold text-card-foreground">Total: ${totalExpenses.toLocaleString()}</p>
          </div>
          {expensesData.map((item) => {
            const percentage = (item.amount / totalExpenses) * 100
            return (
              <div key={item.category} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-accent" />
                  <span className="text-sm text-muted-foreground">{item.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{percentage.toFixed(0)}%</span>
                  <span className="text-sm font-semibold text-card-foreground">${item.amount.toLocaleString()}</span>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}