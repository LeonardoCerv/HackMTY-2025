'use client'

import { useState, useEffect } from 'react'
import { Transaction } from '@/types/financial'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Search, Filter, ChevronDown } from 'lucide-react'

interface TransactionsTableProps {
  className?: string
}

export function TransactionsTable({ className }: TransactionsTableProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [loading, setLoading] = useState(true)

  // Fetch transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch('/api/transactions')
        const data = await response.json()
        setTransactions(data.transactions)
        setFilteredTransactions(data.transactions)
      } catch (error) {
        console.error('Failed to fetch transactions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [])

  // Filter transactions based on search and filters
  useEffect(() => {
    let filtered = transactions

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(transaction => transaction.category === categoryFilter)
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === typeFilter)
    }

    setFilteredTransactions(filtered)
  }, [transactions, searchTerm, categoryFilter, typeFilter])

  // Get unique categories for filter dropdown
  const categories = Array.from(new Set(transactions.map(t => t.category)))

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Math.abs(amount))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`${className} flex flex-col h-full`}>
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Filter className="h-5 w-5" />
          Recent Transactions
        </CardTitle>

        {/* Search and Filters */}
        <div className="space-y-4 mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>

            {(categoryFilter !== 'all' || typeFilter !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCategoryFilter('all')
                  setTypeFilter('all')
                }}
                className="text-muted-foreground"
              >
                Clear filters
              </Button>
            )}
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full p-2 border rounded-md bg-background"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Type</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full p-2 border rounded-md bg-background"
                >
                  <option value="all">All Types</option>
                  <option value="credit">Income</option>
                  <option value="debit">Expense</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 min-h-0">
        <div className="h-full overflow-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-background">
              <tr className="border-b">
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Date</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Description</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Category</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Merchant</th>
                <th className="text-right py-3 px-2 font-medium text-muted-foreground">Amount</th>
                <th className="text-center py-3 px-2 font-medium text-muted-foreground">Type</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="border-b hover:bg-muted/50">
                  <td className="py-3 px-2 text-sm">
                    {formatDate(transaction.date)}
                  </td>
                  <td className="py-3 px-2">
                    <div className="font-medium">{transaction.description}</div>
                    {transaction.isRecurring && (
                      <span className="text-xs bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded mt-1 inline-block">
                        Recurring
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-2 text-sm text-muted-foreground">
                    {transaction.category}
                  </td>
                  <td className="py-3 px-2 text-sm text-muted-foreground">
                    {transaction.merchant}
                  </td>
                  <td className={`py-3 px-2 text-right font-medium ${
                    transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span className={`text-xs px-2 py-1 rounded ${
                      transaction.type === 'credit'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {transaction.type === 'credit' ? 'Income' : 'Expense'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No transactions found matching your criteria.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}