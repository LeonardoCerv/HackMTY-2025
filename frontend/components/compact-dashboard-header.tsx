"use client"

import { TrendingUp } from "lucide-react"

export function CompactDashboardHeader() {
  return (
    <div className="flex items-center justify-between p-1">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary p-3">
            <TrendingUp className="h-10 w-10 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-foreground">FinSights</h1>
            <p className="text-md text-muted-foreground">AI-Powered Financial Insights</p>
          </div>
        </div>
      </div>
    </div>
  )
}