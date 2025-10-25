import { DashboardHeader } from "@/components/dashboard-header"
import { EarningsSection } from "@/components/earnings-section"
import { ExpensesSection } from "@/components/expenses-section"
import { DebtSection } from "@/components/debt-section"

export default function Home() {
  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <DashboardHeader />

        <div className="grid gap-6 lg:grid-cols-2">
          <EarningsSection />
          <ExpensesSection />
        </div>

        <DebtSection />
      </div>
    </main>
  )
}
