export interface Account {
  id: string
  type: 'checking' | 'credit' | 'savings' | 'loan'
  name: string
  balance: number
  availableBalance?: number
  availableCredit?: number
  creditLimit?: number
  monthlyPayment?: number
  apr?: number
  remainingMonths?: number
  currency: string
  lastUpdated: string
}

export interface Transaction {
  id: string
  accountId: string
  amount: number
  description: string
  category: string 
  subcategory: string
  date: string
  type: 'deposit' | 'withdrawal' | 'purchase' | 'transfer' | 'loan' | 'credit' | 'debit'
  merchant: string
  isRecurring: boolean
}

export interface FinancialData {
  accounts: Account[]
  transactions: Transaction[]
}