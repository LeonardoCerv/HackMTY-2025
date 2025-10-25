"use client"

import { TrendingUp } from "lucide-react"

export function CompactDashboardHeader() {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary p-2">
            <TrendingUp className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">FinSights</h1>
            <p className="text-xs text-muted-foreground">AI-Powered Financial Insights</p>
          </div>
        </div>
      </div>
    </div>
  )
}