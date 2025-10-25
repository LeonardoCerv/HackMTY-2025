'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Search, Filter, ChevronDown } from 'lucide-react'

interface Transaction {
  account_id: string
  account_type: string
  nickname: string
  type: string
  amount: number
  positive: boolean
  transaction_date: string
  description: string
}

interface TransactionsTableProps {
  className?: string
}

function mapNessieTransaction(tx: any): Transaction {
  return {
    id: `${tx.account_id}-${tx.type}-${tx.transaction_date}`, 
    accountId: tx.account_id,
    amount: tx.amount,
    description: tx.description || '—',
    category: tx.account_type || 'Unknown', 
    subcategory: tx.type || 'other',      
    date: tx.transaction_date,
    type: tx.positive ? 'credit' : 'debit',
    merchant: '—',                       
    isRecurring: false,                   
  }
}

export function TransactionsTable({ className }: TransactionsTableProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch('/api/transactions')
        const data = await response.json()
        const mapped: Transaction[] = data.transactions.map(mapNessieTransaction)
        setTransactions(mapped)
        setFilteredTransactions(mapped)
      } catch (error) {
        console.error('Failed to fetch transactions:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchTransactions()
  }, [])


  useEffect(() => {
    let filtered = transactions

    if (searchTerm) {
      filtered = filtered.filter((t) =>
        t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.nickname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.account_type?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (typeFilter !== 'all') {
      const isPositive = typeFilter === 'credit'
      filtered = filtered.filter((t) => t.positive === isPositive)
    }

    setFilteredTransactions(filtered)
  }, [transactions, searchTerm, typeFilter])

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })

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

            {typeFilter !== 'all' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTypeFilter('all')}
                className="text-muted-foreground"
              >
                Clear filters
              </Button>
            )}
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <label className="text-sm font-medium mb-2 block">Type</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full p-2 border rounded-md bg-background"
                >
                  <option value="all">All</option>
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
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Account</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Type</th>
                <th className="text-right py-3 px-2 font-medium text-muted-foreground">Amount</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((tx, i) => (
                <tr key={i} className="border-b hover:bg-muted/50">
                  <td className="py-3 px-2 text-sm">{formatDate(tx.transaction_date)}</td>
                  <td className="py-3 px-2 text-sm">{tx.description || '—'}</td>
                  <td className="py-3 px-2 text-sm text-muted-foreground">
                    {tx.nickname} ({tx.account_type})
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        tx.positive
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}
                    >
                      {tx.positive ? 'Income' : 'Expense'}
                    </span>
                  </td>
                  <td
                    className={`py-3 px-2 text-right font-medium ${
                      tx.positive ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {tx.positive ? '+' : '-'}{formatCurrency(tx.amount)}
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
