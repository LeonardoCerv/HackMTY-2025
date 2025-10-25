"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, TrendingDown, AlertCircle } from "lucide-react"
import { useAccounts } from "@/lib/hooks"

export function CompactDebtSection() {
  const { accounts, isLoading: accountsLoading } = useAccounts()

  // Filter for accounts that might have debt (Credit Card with balance, or loans)
  const debtAccounts = accounts.filter((acc: any) => 
    (acc.type === 'Credit Card' && acc.balance < 0) || acc.type === 'loan'
  )
  const totalDebt = debtAccounts.reduce((sum: number, account: any) => 
    sum + Math.abs(account.balance < 0 ? account.balance : 0), 0
  )
  const primaryLoan = debtAccounts.find((acc: any) => acc.type === 'loan') || debtAccounts[0]

  const isLoading = accountsLoading

  if (isLoading) {
    return (
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-card-foreground">Loans, Credit & Debt</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs">Loading...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border bg-card p-3">
      <CardHeader className="pb-1 px-0 pt-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs text-card-foreground">Loans, Credit & Debt</CardTitle>
          <div className="flex items-center gap-1 rounded-lg bg-accent/10 px-1.5 py-0.5">
            <AlertCircle className="h-2.5 w-2.5 text-accent" />
            <span className="text-xs font-medium text-accent">${totalDebt.toLocaleString()} Total</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 px-0 pb-0">
        {primaryLoan && (
          <div className="space-y-2 rounded-lg border border-border bg-secondary p-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-accent/10 p-1">
                  {primaryLoan.type === "Credit Card" ? (
                    <CreditCard className="h-4 w-4 text-accent" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-accent" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-card-foreground">{primaryLoan.nickname || 'Unnamed Account'}</p>
                  <p className="text-xs text-muted-foreground">{primaryLoan.type}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Balance</span>
                <span className="text-sm font-bold text-accent">${Math.abs(primaryLoan.balance).toLocaleString()}</span>
              </div>

              {primaryLoan.type === "Credit Card" && primaryLoan.balance < 0 && (
                <>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Credit Utilization</span>
                      <span className="text-muted-foreground">Calculating...</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-background">
                      <div className="h-full bg-accent" style={{ width: `30%` }} />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">${Math.abs(primaryLoan.balance).toLocaleString()} used</span>
                      <span className="text-muted-foreground">Limit unknown</span>
                    </div>
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Interest Rate</span>
                  <span className="text-xs font-medium text-card-foreground">N/A</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Monthly Payment</span>
                  <span className="text-xs font-medium text-card-foreground">N/A</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-lg border border-primary/20 bg-primary/5 p-2">
          <div className="flex items-start gap-1.5">
            <div className="rounded-full bg-primary/10 p-0.5">
              <TrendingDown className="h-3 w-3 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-card-foreground">Debt Management Tips</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Monitor your credit utilization and consider paying down high-interest debt first.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}