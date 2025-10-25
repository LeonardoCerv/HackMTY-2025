"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const earningsData = [
  { month: "Jan", amount: 6200 },
  { month: "Feb", amount: 6500 },
  { month: "Mar", amount: 6300 },
  { month: "Apr", amount: 6800 },
  { month: "May", amount: 6850 },
  { month: "Jun", amount: 6850 },
]

const incomeBreakdown = [
  { source: "Salary", amount: 5800, percentage: 85 },
  { source: "Freelance", amount: 850, percentage: 12 },
  { source: "Investments", amount: 200, percentage: 3 },
]

export function EarningsSection() {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-card-foreground">Earnings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <p className="text-sm text-muted-foreground">6-Month Trend</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={earningsData}>
              <XAxis dataKey="month" stroke="#A0A0A0" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#A0A0A0"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value: number) => `$${value / 1000}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#2D2D2D",
                  border: "1px solid #3D3D3D",
                  borderRadius: "8px",
                  color: "#FFFFFF",
                }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, "Income"]}
              />
              <Line type="monotone" dataKey="amount" stroke="#156aa2" strokeWidth={2} dot={{ fill: "#156aa2", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-card-foreground">Income Sources</p>
          {incomeBreakdown.map((item) => (
            <div key={item.source} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{item.source}</span>
                <span className="font-medium text-card-foreground">${item.amount.toLocaleString()}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div className="h-full bg-primary" style={{ width: `${item.percentage}%` }} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
