import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Wallet } from "lucide-react"

export function DashboardHeader() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Financial Dashboard</h1>
          <p className="text-muted-foreground">Capital One Account Analysis</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2">
          <Wallet className="h-5 w-5 text-primary-foreground" />
          <span className="text-sm font-medium text-primary-foreground">Connected</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Net Worth</p>
                <p className="text-2xl font-bold text-card-foreground">$48,234</p>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
            </div>
            <p className="mt-2 text-xs text-primary">+12.5% from last month</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Income</p>
                <p className="text-2xl font-bold text-card-foreground">$6,850</p>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Last updated today</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Expenses</p>
                <p className="text-2xl font-bold text-card-foreground">$4,320</p>
              </div>
              <div className="rounded-full bg-accent/10 p-3">
                <TrendingDown className="h-6 w-6 text-accent" />
              </div>
            </div>
            <p className="mt-2 text-xs text-accent">+8.2% from last month</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
