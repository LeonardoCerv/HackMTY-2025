import { CompactDashboardHeader } from "@/components/compact-dashboard-header"
import { CompactEarningsSection } from "@/components/compact-earnings-section"
import { CompactExpensesSection } from "@/components/compact-expenses-section"
import { CompactAIChatAssistant } from "@/components/compact-ai-chat-assistant"
import { CompactDebtSection } from "@/components/compact-debt-section"
import { CompactCreditScoreSection } from "@/components/compact-credit-score-section"
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

            {/* 2x2 Grid: earnings, expenses, debt, credit score */}
            <div className="flex-1 grid gap-2 grid-cols-2 grid-rows-2">
              <CompactEarningsSection />
              <CompactExpensesSection />
              <CompactDebtSection />
              <CompactCreditScoreSection />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
