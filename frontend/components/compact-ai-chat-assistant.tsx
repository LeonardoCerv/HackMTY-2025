"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageCircle, Send, BarChart3, Lightbulb, CheckCircle } from "lucide-react"

interface AgentResponse {
  analysis: string
  justification: string
  chart?: {
    id: string
    type: string
    title: string
    sql_query: string
    extra?: any
    justification: string
  }
  success: boolean
}

export function CompactAIChatAssistant() {
  const [input, setInput] = useState("")
  const [response, setResponse] = useState<AgentResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    setIsLoading(true)
    setResponse(null)

    try {
      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: input
        }),
      })

      const data = await res.json()
      if (data.success) {
        setResponse(data)
      } else {
        setResponse({
          analysis: data.error || "Sorry, I couldn't process your request.",
          justification: "",
          success: false
        })
      }
    } catch {
      setResponse({
        analysis: "Sorry, I'm having trouble connecting. Please try again.",
        justification: "",
        success: false
      })
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
    <Card className="border-border bg-card h-full flex flex-col">
      <CardHeader className="pb-2 px-3 pt-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-card-foreground">
          <MessageCircle className="h-4 w-4" />
          AI Assistant
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
            <Send className="h-3 w-3" />
          </Button>
        </div>

        {/* Response Section */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="space-y-3 pr-2">
            {response && (
              <>
                {/* Chart Section (if available) */}
                {response.chart && (
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                    <div className="flex items-start gap-2">
                      <BarChart3 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="text-xs font-medium text-card-foreground mb-1">
                          Generated Chart: {response.chart.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Type: {response.chart.type}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Analysis Section */}
                <div className="rounded-lg border border-border bg-secondary/30 p-3">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-xs font-medium text-card-foreground mb-2">
                        Analysis
                      </div>
                      <div className="text-sm text-muted-foreground leading-relaxed">
                        {response.analysis}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Justification Section */}
                {response.justification && (
                  <div className="rounded-lg border border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20 p-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="text-xs font-medium text-card-foreground mb-2">
                          Why This Analysis?
                        </div>
                        <div className="text-sm text-muted-foreground leading-relaxed">
                          {response.justification}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {isLoading && (
              <div className="rounded-lg border border-border bg-secondary/30 p-3">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span className="text-sm text-muted-foreground">Analyzing your finances...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}