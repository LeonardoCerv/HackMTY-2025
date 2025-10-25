import { NextResponse } from 'next/server'

// Mock Capital One API data
const mockAccounts = [
  {
    id: 'acc_001',
    type: 'checking',
    name: 'Capital One Checking',
    balance: 48234,
    availableBalance: 48234,
    currency: 'USD',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'acc_002',
    type: 'credit',
    name: 'Capital One Quicksilver',
    balance: -2450,
    availableCredit: 7550,
    creditLimit: 10000,
    apr: 18.99,
    currency: 'USD',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'acc_003',
    type: 'loan',
    name: 'Student Loan',
    balance: -18500,
    monthlyPayment: 285,
    apr: 4.5,
    remainingMonths: 72,
    currency: 'USD',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'acc_004',
    type: 'loan',
    name: 'Auto Loan',
    balance: -12800,
    monthlyPayment: 380,
    apr: 5.2,
    remainingMonths: 36,
    currency: 'USD',
    lastUpdated: new Date().toISOString()
  }
]

export async function GET() {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))

  return NextResponse.json({
    accounts: mockAccounts,
    success: true
  })
}