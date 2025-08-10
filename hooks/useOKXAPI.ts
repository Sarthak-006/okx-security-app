"use client"

import { useState } from "react"

interface Balance {
  chainId: string
  tokenAddress: string
  symbol: string
  balance: string
  balanceRaw: string
  priceUsd: string
  valueUsd: string
}

interface Transaction {
  txId: string
  chainId: string
  from: string
  to: string
  tokenAmount: string
  tokenSymbol: string
  status: string
  blockTime: string
  gasUsed: string
}

export function useOKXAPI() {
  const [loading, setLoading] = useState(false)

  const getBalances = async (address: string, chainId: string): Promise<Balance[]> => {
    setLoading(true)
    try {
      const response = await fetch(`/api/okx/balances?address=${address}&chainId=${chainId}`)
      const data = await response.json()

      if (data.code === "0" && data.data) {
        return data.data.map((item: any) => ({
          chainId: item.chainId,
          tokenAddress: item.tokenAddress,
          symbol: item.symbol,
          balance: item.balance,
          balanceRaw: item.balanceRaw,
          priceUsd: item.priceUsd || "0",
          valueUsd: item.valueUsd || "0",
        }))
      }
      return []
    } catch (error) {
      console.error("Error fetching balances:", error)
      return []
    } finally {
      setLoading(false)
    }
  }

  const getTransactionHistory = async (address: string, chainId: string): Promise<Transaction[]> => {
    setLoading(true)
    try {
      const response = await fetch(`/api/okx/transactions?address=${address}&chainId=${chainId}`)
      const data = await response.json()

      if (data.code === "0" && data.data) {
        return data.data.map((item: any) => ({
          txId: item.txId,
          chainId: item.chainId,
          from: item.from,
          to: item.to,
          tokenAmount: item.tokenAmount,
          tokenSymbol: item.tokenSymbol,
          status: item.status,
          blockTime: item.blockTime,
          gasUsed: item.gasUsed || "0",
        }))
      }
      return []
    } catch (error) {
      console.error("Error fetching transactions:", error)
      return []
    } finally {
      setLoading(false)
    }
  }

  const getTokenPrice = async (tokenAddress: string, chainId: string) => {
    try {
      const response = await fetch(`/api/okx/price?tokenAddress=${tokenAddress}&chainId=${chainId}`)
      const data = await response.json()
      return data.data || null
    } catch (error) {
      console.error("Error fetching token price:", error)
      return null
    }
  }

  return {
    getBalances,
    getTransactionHistory,
    getTokenPrice,
    loading,
  }
}
