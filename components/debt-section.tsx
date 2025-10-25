"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, TrendingDown, AlertCircle } from "lucide-react"

const debtAccounts = [
  {
    name: "Capital One Quicksilver",
    type: "Credit Card",
    balance: 2450,
    limit: 10000,
    apr: 18.99,
    minPayment: 75,
  },
  {
    name: "Student Loan",
    type: "Loan",
    balance: 18500,
    monthlyPayment: 285,
    apr: 4.5,
    remainingMonths: 72,
  },
  {
    name: "Auto Loan",
    type: "Loan",
    balance: 12800,
    monthlyPayment: 380,
    apr: 5.2,
    remainingMonths: 36,
  },
]

export function DebtSection() {
  const totalDebt = debtAccounts.reduce((sum, account) => sum + account.balance, 0)

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-card-foreground">Loans, Credit & Debt</CardTitle>
          <div className="flex items-center gap-2 rounded-lg bg-accent/10 px-3 py-1">
            <AlertCircle className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium text-accent">${totalDebt.toLocaleString()} Total</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {debtAccounts.map((account) => {
            const creditUtilization = account.limit ? (account.balance / account.limit) * 100 : 0
            return (
            <div key={account.name} className="space-y-4 rounded-lg border border-border bg-secondary p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-accent/10 p-2">
                    {account.type === "Credit Card" ? (
                      <CreditCard className="h-4 w-4 text-accent" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-accent" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">{account.name}</p>
                    <p className="text-xs text-muted-foreground">{account.type}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Balance</span>
                  <span className="text-lg font-bold text-accent">${account.balance.toLocaleString()}</span>
                </div>

                {account.type === "Credit Card" && account.limit && (
                  <>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-background">
                      <div className="h-full bg-accent" style={{ width: `${creditUtilization}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{creditUtilization.toFixed(0)}% utilized</span>
                      <span className="text-muted-foreground">${account.limit.toLocaleString()} limit</span>
                    </div>
                  </>
                )}

                <div className="space-y-1 border-t border-border pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">APR</span>
                    <span className="text-card-foreground">{account.apr}%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {account.type === "Credit Card" ? "Min Payment" : "Monthly"}
                    </span>
                    <span className="text-card-foreground">
                      ${(account.minPayment || account.monthlyPayment)?.toLocaleString()}
                    </span>
                  </div>
                  {account.remainingMonths && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Remaining</span>
                      <span className="text-card-foreground">{account.remainingMonths} months</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )})}
        </div>

        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <TrendingDown className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-card-foreground">Debt Payoff Strategy</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Focus on paying off your Capital One card first (highest APR at 18.99%). Consider increasing monthly
                payment to $200 to save $450 in interest.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
