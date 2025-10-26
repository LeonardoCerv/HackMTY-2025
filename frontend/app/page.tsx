import { CompactDashboardHeader } from "@/components/compact-dashboard-header"
import { CompactIncomeExpensesSection } from "@/components/compact-income-expenses-section"
import { CompactAIChatAssistant } from "@/components/compact-ai-chat-assistant"
import { CombinedLoansCreditSection } from "@/components/combined-loans-credit-section"
import { TransactionsTable } from "@/components/transactions-table"

export const dynamic = 'force-dynamic'

export default function Home() {
  return (
    <main className="min-h-screen bg-background p-1 md:p-2">
      <div className="mx-auto">
        <CompactDashboardHeader />

        <div className="mt-2 grid gap-2 h-[calc(100vh-120px)]" style={{ gridTemplateColumns: '5fr 7fr' }}>
          {/* Transactions Table - 5/12 of the page (left side) */}
          <div className="w-full h-full">
            <TransactionsTable className="h-full" />
          </div>

          {/* Chat + Graphs Section - 7/12 of the page (right side) */}
          <div className="w-full h-full flex flex-col space-y-2">
            {/* Chat Input at the top - compact */}
            <CompactAIChatAssistant />

            {/* 2x1 Grid: income-expenses, loans-credit */}
            <div className="flex-1 grid gap-2 grid-cols-2">
              <CompactIncomeExpensesSection />
              <CombinedLoansCreditSection />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
