"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageCircle, Send } from "lucide-react"
import { AgentResponseModal } from "@/components/agent-response-modal"
import { useTransactions } from "@/lib/hooks"

interface ChartData {
  id: string
  type: "line" | "bar" | "pie" | "area" | "scatter"
  title: string
  data: {
    data: any[]
    xAxisKey?: string
    yAxisKey?: string
  }
  justification?: string
}

interface AgentResponse {
  analysis: string
  chart?: ChartData
  success: boolean
  userQuery?: string
}

export function CompactAIChatAssistant() {
  const [input, setInput] = useState("")
  const [response, setResponse] = useState<AgentResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Get transaction data from shared hook
  const { transactions, isLoading: transactionsLoading } = useTransactions()

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    setIsLoading(true)
    setResponse(null)

    try {
      // Filter transactions to only include the last 6 months for better performance and relevance
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
      
      const recentTransactions = transactions.filter((tx: any) => {
        const txDate = new Date(tx.transaction_date)
        return txDate >= sixMonthsAgo
      })

      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: input,
          transactions: recentTransactions // Include only recent transaction data
        }),
      })

      const data = await res.json()
      if (data.success) {
        setResponse(data)
        setIsModalOpen(true) // Open modal when response is received
      } else {
        setResponse({
          analysis: data.error || "Sorry, I couldn't process your request.",
          success: false
        })
        setIsModalOpen(true) // Open modal even for errors
      }
    } catch {
      setResponse({
        analysis: "Sorry, I'm having trouble connecting. Please try again.",
        success: false
      })
      setIsModalOpen(true) // Open modal for connection errors
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <>
      <Card className="border-border bg-card h-full flex flex-col">
        <CardHeader className="pb-2 px-3 pt-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-card-foreground">
            <MessageCircle className="h-4 w-4" />
            AI Chatbot
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-3 pt-0 min-h-0 space-y-3">
          {/* Input Section */}
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about your finances..."
              className="flex-1 h-8 text-sm"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              size="sm"
              className="h-8 px-3"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
              ) : (
                <Send className="h-3 w-3" />
              )}
            </Button>
          </div>

          {/* Status Message */}
          {isLoading && (
            <div className="rounded-lg border border-border bg-secondary/30 p-3">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-sm text-muted-foreground">Analyzing your finances...</span>
              </div>
            </div>
          )}

          {/* Helpful tips when idle */}
          {!isLoading && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-2 p-4">
                <MessageCircle className="h-8 w-8 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">
                  Ask me anything about your finances
                </p>
                <p className="text-xs text-muted-foreground/70">
                  I can analyze spending patterns, create charts, and provide insights
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Response Modal */}
      <AgentResponseModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        response={response}
      />
    </>
  )
}