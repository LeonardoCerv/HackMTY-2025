"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const expensesData = [
  { category: "Housing", amount: 1800 },
  { category: "Food", amount: 650 },
  { category: "Transport", amount: 420 },
  { category: "Shopping", amount: 580 },
  { category: "Bills", amount: 380 },
  { category: "Other", amount: 490 },
]

export function ExpensesSection() {
  const totalExpenses = expensesData.reduce((sum, item) => sum + item.amount, 0)

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-card-foreground">Expenses</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <p className="text-sm text-muted-foreground">Monthly Breakdown</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={expensesData}>
              <XAxis dataKey="category" stroke="#A0A0A0" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#A0A0A0"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value: number) => `$${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#2D2D2D",
                  border: "1px solid #3D3D3D",
                  borderRadius: "8px",
                  color: "#FFFFFF",
                }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, "Spent"]}
              />
              <Bar dataKey="amount" fill="#CB2426" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-card-foreground">Category Details</p>
            <p className="text-sm font-medium text-card-foreground">Total: ${totalExpenses.toLocaleString()}</p>
          </div>
          {expensesData.map((item) => {
            const percentage = (item.amount / totalExpenses) * 100
            return (
              <div key={item.category} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-accent" />
                  <span className="text-muted-foreground">{item.category}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{percentage.toFixed(0)}%</span>
                  <span className="font-medium text-card-foreground">${item.amount.toLocaleString()}</span>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
