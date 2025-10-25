import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'
import { getExpenseInsights, calculateSavingsPotential } from '@/lib/financial-analysis'
import { Account, Transaction } from '@/types/financial'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '')

export async function POST(request: Request) {
  try {
    const { question, accounts, transactions } = await request.json()

    // Fetch current data if not provided
    let currentAccounts = accounts
    let currentTransactions = transactions

    if (!accounts || !transactions) {
      const [accountsRes, transactionsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/accounts`),
        fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/transactions`)
      ])

      currentAccounts = (await accountsRes.json()).accounts
      currentTransactions = (await transactionsRes.json()).transactions
    }

    // Perform financial analysis
    const expenseInsights = getExpenseInsights(currentTransactions)
    const savingsPotential = calculateSavingsPotential(currentTransactions)

    // Prepare financial context
    const context = {
      accounts: currentAccounts,
      transactions: currentTransactions.slice(0, 50), // Limit for token efficiency
      netWorth: currentAccounts.reduce((sum: number, acc: Account) => sum + acc.balance, 0),
      monthlyIncome: currentTransactions
        .filter((txn: Transaction) => txn.type === 'credit' && txn.category === 'Income')
        .reduce((sum: number, txn: Transaction) => sum + txn.amount, 0),
      monthlyExpenses: expenseInsights.totalExpenses,
      expenseInsights,
      savingsPotential
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

    const prompt = `
You are a financial advisor AI analyzing a user's financial data. Provide helpful, conversational insights about their finances.

Financial Data Context:
- Net Worth: $${context.netWorth.toLocaleString()}
- Monthly Income: $${context.monthlyIncome.toLocaleString()}
- Monthly Expenses: $${context.monthlyExpenses.toLocaleString()}
- Top Expense Categories: ${JSON.stringify(context.expenseInsights.topCategories.slice(0, 5), null, 2)}
- Recurring Expenses: ${JSON.stringify(context.savingsPotential.smallRecurringExpenses.slice(0, 5), null, 2)}
- Potential Monthly Savings: $${context.savingsPotential.potentialSavings.toFixed(0)}

User Question: ${question}

Please provide a clear, actionable response focusing on:
1. Direct answer to the question
2. Key insights from the data
3. Practical recommendations
4. Any warnings or opportunities

Keep the response conversational and under 300 words.
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    return NextResponse.json({
      answer: text,
      success: true
    })

  } catch (error) {
    console.error('Gemini API error:', error)
    return NextResponse.json({
      error: 'Failed to generate insights',
      success: false
    }, { status: 500 })
  }
}