"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageCircle, Send } from "lucide-react"
import { useAccounts, useTransactions } from "@/lib/hooks"

export function CompactAIChatAssistant() {
  const [input, setInput] = useState("")
  const [response, setResponse] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const { accounts } = useAccounts()
  const { transactions } = useTransactions()

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    setIsLoading(true)
    setResponse("")

    try {
      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: input,
          accounts,
          transactions
        }),
      })

      const data = await res.json()
      setResponse(data.answer || data.error || "Sorry, I couldn't process your request.")
    } catch {
      setResponse("Sorry, I'm having trouble connecting. Please try again.")
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
    <Card className="border-border bg-card">
      <CardHeader className="pb-2 px-3 pt-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-card-foreground">
          <MessageCircle className="h-4 w-4" />
          AI Assistant
        </CardTitle>
      </CardHeader>

      <CardContent className="p-3 pt-0 space-y-3">
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
            <Send className="h-3 w-3" />
          </Button>
        </div>

        {response && (
          <div className="text-sm text-muted-foreground bg-secondary/30 rounded-lg p-2 max-h-20 overflow-y-auto">
            {response}
          </div>
        )}

        {isLoading && (
          <div className="text-sm text-muted-foreground bg-secondary/30 rounded-lg p-2">
            Thinking...
          </div>
        )}
      </CardContent>
    </Card>
  )
}