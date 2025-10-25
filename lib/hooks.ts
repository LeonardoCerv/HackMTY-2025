import useSWR from 'swr'
import { Account, Transaction } from '@/types/financial'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useAccounts() {
  const { data, error, isLoading } = useSWR('/api/accounts', fetcher)
  return {
    accounts: (data?.accounts || []) as Account[],
    isLoading,
    error
  }
}

export function useTransactions(accountId?: string) {
  const url = accountId ? `/api/transactions?accountId=${accountId}` : '/api/transactions'
  const { data, error, isLoading } = useSWR(url, fetcher)
  return {
    transactions: (data?.transactions || []) as Transaction[],
    isLoading,
    error
  }
}

export function useCreditScore() {
  const { data, error, isLoading } = useSWR('/api/credit-score', fetcher)
  return {
    creditScore: data?.creditScore || 742, // Default fallback
    scoreRange: data?.scoreRange || 'Good',
    isLoading,
    error
  }
}