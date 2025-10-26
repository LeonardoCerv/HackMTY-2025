'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Search, Receipt } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Transaction {
  account_id: string
  account_type: string
  nickname: string
  amount: number
  positive: boolean
  transaction_date: string
  description: string
  type: string
}

interface TransactionsTableProps {
  className?: string
}

function mapNessieTransaction(tx: any): Transaction {
  return {
    account_id: tx.account_id ?? 'unknown_account',
    account_type: tx.account_type ?? 'Unknown',
    nickname: tx.nickname ?? tx.account_name ?? '—',
    amount: typeof tx.amount === 'number' ? tx.amount : Number(tx.amount ?? 0),
    positive: typeof tx.positive === 'boolean' ? tx.positive : (tx.positive === 'true' || (tx.amount && Number(tx.amount) >= 0)),
    transaction_date: tx.transaction_date ?? tx.date ?? new Date().toISOString(),
    description: tx.description ?? tx.memo ?? '—',
    type: tx.type ?? 'unknown'
  }
}

export function TransactionsTable({ className }: TransactionsTableProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

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

    // if (typeFilter !== 'all') {
    //   const isPositive = typeFilter === 'credit'
    //   filtered = filtered.filter((t) => t.positive === isPositive)
    // }

    setFilteredTransactions(filtered)
    setCurrentPage(1)
  }, [transactions, searchTerm])

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)

  const indexOfLast = currentPage * itemsPerPage
  const indexOfFirst = indexOfLast - itemsPerPage
  const currentTransactions = filteredTransactions.slice(indexOfFirst, indexOfLast)
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Receipt className="h-5 w-5" />
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
          <Receipt className="h-5 w-5" />
          Recent Transactions
        </CardTitle>

        <div className="space-y-4 mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-xs"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 min-h-0">
        <div className="h-full overflow-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-background text-xs">
              <tr className="border-b">
                <th className="text-left py-2 px-2 font-medium text-card-foreground w-32">Date</th>
                <th className="text-left py-2 px-2 font-medium text-card-foreground w-48">Account</th>
                <th className="text-left py-2 px-2 font-medium text-card-foreground w-44">Amount</th>
                <th className="text-left py-2 px-2 font-medium text-card-foreground w-24">Type</th>
                <th className="text-left py-2 px-2 font-medium text-card-foreground w-24">Description</th>
              </tr>
            </thead>
            <tbody>
              {currentTransactions.map((tx, i) => (
                <tr key={i} className="border-b hover:bg-muted/50">
                  <td className="py-1 px-2 text-muted-foreground whitespace-nowrap">{formatDate(tx.transaction_date)}</td>

                  <td className="py-1 px-2 text-card-foreground whitespace-nowrap">
                    {tx.account_type}
                  </td>

                  <td className={`py-1 px-2 font-medium whitespace-nowrap ${tx.positive ? 'text-primary' : 'text-accent'}`}>
                    {tx.positive ? '+' : '-'}{formatCurrency(tx.amount)}
                  </td>

                  <td className="py-1 px-2 text-white capitalize whitespace-nowrap">{tx.type}</td>

                  <td className="py-1 px-2 text-muted-foreground truncate">{tx.description || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-4 text-muted-foreground text-xs">
              No transactions found matching your criteria.
            </div>
          )}

          {filteredTransactions.length > itemsPerPage && (
            <div className="flex justify-between items-center mt-2 text-xs">
              <Button
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>

              <span className="text-xs">
                Page {currentPage} of {totalPages}
              </span>

              <Button
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
