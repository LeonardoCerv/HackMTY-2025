import { NextResponse } from 'next/server'

// Mock transaction data
const mockTransactions = [
  // Income transactions
  {
    id: 'txn_001',
    accountId: 'acc_001',
    amount: 6850,
    description: 'Monthly Salary',
    category: 'Income',
    subcategory: 'Salary',
    date: '2025-10-01',
    type: 'credit',
    merchant: 'Employer Inc.',
    isRecurring: true
  },
  {
    id: 'txn_002',
    accountId: 'acc_001',
    amount: 850,
    description: 'Freelance Project',
    category: 'Income',
    subcategory: 'Freelance',
    date: '2025-10-15',
    type: 'credit',
    merchant: 'Client Corp',
    isRecurring: false
  },
  // Expense transactions
  {
    id: 'txn_003',
    accountId: 'acc_001',
    amount: -1800,
    description: 'Monthly Rent',
    category: 'Housing',
    subcategory: 'Rent',
    date: '2025-10-01',
    type: 'debit',
    merchant: 'Property Management',
    isRecurring: true
  },
  {
    id: 'txn_004',
    accountId: 'acc_001',
    amount: -650,
    description: 'Grocery Shopping',
    category: 'Food',
    subcategory: 'Groceries',
    date: '2025-10-02',
    type: 'debit',
    merchant: 'Whole Foods',
    isRecurring: true
  },
  {
    id: 'txn_005',
    accountId: 'acc_001',
    amount: -420,
    description: 'Gas Station',
    category: 'Transportation',
    subcategory: 'Gas',
    date: '2025-10-03',
    type: 'debit',
    merchant: 'Shell',
    isRecurring: true
  },
  {
    id: 'txn_006',
    accountId: 'acc_001',
    amount: -580,
    description: 'Online Shopping',
    category: 'Shopping',
    subcategory: 'Retail',
    date: '2025-10-05',
    type: 'debit',
    merchant: 'Amazon',
    isRecurring: false
  },
  {
    id: 'txn_007',
    accountId: 'acc_001',
    amount: -380,
    description: 'Utilities',
    category: 'Bills',
    subcategory: 'Electricity',
    date: '2025-10-07',
    type: 'debit',
    merchant: 'Electric Company',
    isRecurring: true
  },
  {
    id: 'txn_008',
    accountId: 'acc_001',
    amount: -490,
    description: 'Subscription Services',
    category: 'Other',
    subcategory: 'Subscriptions',
    date: '2025-10-10',
    type: 'debit',
    merchant: 'Netflix/Spotify/etc',
    isRecurring: true
  },
  // Small recurring expenses
  {
    id: 'txn_009',
    accountId: 'acc_001',
    amount: -15,
    description: 'Coffee Shop',
    category: 'Food',
    subcategory: 'Dining Out',
    date: '2025-10-12',
    type: 'debit',
    merchant: 'Starbucks',
    isRecurring: true
  },
  {
    id: 'txn_010',
    accountId: 'acc_001',
    amount: -25,
    description: 'Parking',
    category: 'Transportation',
    subcategory: 'Parking',
    date: '2025-10-14',
    type: 'debit',
    merchant: 'City Parking',
    isRecurring: true
  },
  {
    id: 'txn_011',
    accountId: 'acc_001',
    amount: -12,
    description: 'App Subscription',
    category: 'Other',
    subcategory: 'Apps',
    date: '2025-10-16',
    type: 'debit',
    merchant: 'App Store',
    isRecurring: true
  }
]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const accountId = searchParams.get('accountId')
  const limit = parseInt(searchParams.get('limit') || '50')

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300))

  let filteredTransactions = mockTransactions

  if (accountId) {
    filteredTransactions = mockTransactions.filter(txn => txn.accountId === accountId)
  }

  // Sort by date descending
  filteredTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return NextResponse.json({
    transactions: filteredTransactions.slice(0, limit),
    total: filteredTransactions.length,
    success: true
  })
}