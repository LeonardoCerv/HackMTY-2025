"use client"

import { Wallet } from "lucide-react"

export function CompactDashboardHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-lg font-bold text-foreground">Financial Dashboard</h1>
        <p className="text-xs text-muted-foreground">Capital One Account Analysis</p>
      </div>
      <div className="flex items-center gap-1 rounded-lg bg-primary px-1.5 py-0.5">
        <Wallet className="h-2.5 w-2.5 text-primary-foreground" />
        <span className="text-xs font-medium text-primary-foreground">Connected</span>
      </div>
    </div>
  )
}