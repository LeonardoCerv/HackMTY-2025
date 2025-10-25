import { Transaction } from '@/types/financial'

export function analyzeRecurringExpenses(transactions: Transaction[]) {
  const expenses = transactions.filter(txn => txn.type === 'debit')

  // Group by merchant and check for recurring patterns
  const merchantGroups = expenses.reduce((acc, txn) => {
    const key = `${txn.merchant}-${txn.amount}`
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(txn)
    return acc
  }, {} as Record<string, Transaction[]>)

  // Find recurring expenses (same merchant, similar amount, multiple occurrences)
  const recurringExpenses = Object.entries(merchantGroups)
    .filter(([, txns]) => txns.length >= 2)
    .map(([, txns]) => {
      const total = txns.reduce((sum, txn) => sum + Math.abs(txn.amount), 0)
      const average = total / txns.length
      return {
        merchant: txns[0].merchant,
        amount: average,
        frequency: txns.length,
        totalSpent: total,
        category: txns[0].category,
        isSmall: average < 50 // Consider under $50 as small
      }
    })
    .sort((a, b) => b.totalSpent - a.totalSpent)

  return recurringExpenses
}

export function getExpenseInsights(transactions: Transaction[]) {
  const expenses = transactions.filter(txn => txn.type === 'debit')
  const totalExpenses = expenses.reduce((sum, txn) => sum + Math.abs(txn.amount), 0)

  const categoryBreakdown = expenses.reduce((acc, txn) => {
    acc[txn.category] = (acc[txn.category] || 0) + Math.abs(txn.amount)
    return acc
  }, {} as Record<string, number>)

  const topCategories = Object.entries(categoryBreakdown)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: (amount / totalExpenses) * 100
    }))
    .sort((a, b) => b.amount - a.amount)

  return {
    totalExpenses,
    topCategories,
    recurringExpenses: analyzeRecurringExpenses(transactions)
  }
}

export function calculateSavingsPotential(transactions: Transaction[]) {
  const insights = getExpenseInsights(transactions)
  const smallRecurring = insights.recurringExpenses.filter(exp => exp.isSmall)

  const potentialSavings = smallRecurring.reduce((sum, exp) => {
    // Assume 20% reduction potential for small recurring expenses
    return sum + (exp.totalSpent * 0.2)
  }, 0)

  return {
    potentialSavings,
    smallRecurringExpenses: smallRecurring,
    recommendations: smallRecurring.slice(0, 5).map(exp => ({
      merchant: exp.merchant,
      monthlySavings: exp.amount * 0.2,
      suggestion: `Consider reducing ${exp.merchant} spending by finding cheaper alternatives or cutting back.`
    }))
  }
}