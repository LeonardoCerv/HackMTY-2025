import useSWR from 'swr'
import { Account, Transaction } from '@/types/financial'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useAccounts() {
  const { data, error, isLoading } = useSWR('/api/v1/accounts', fetcher)
  return {
    accounts: (Array.isArray(data) ? data : (data?.accounts || [])) as any[],
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