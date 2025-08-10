"use client"

import { useState, useEffect } from "react"

interface WalletState {
  address: string
  chainId: string
  chainName: string
  isConnected: boolean
}

declare global {
  interface Window {
    ethereum?: any
  }
}

export function useWallet() {
  const [wallet, setWallet] = useState<WalletState | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  const getChainName = (chainId: string) => {
    const chains: { [key: string]: string } = {
      "1": "Ethereum Mainnet",
      "56": "BSC Mainnet",
      "137": "Polygon Mainnet",
      "43114": "Avalanche Mainnet",
      "250": "Fantom Mainnet",
      "42161": "Arbitrum One",
      "10": "Optimism Mainnet",
    }
    return chains[chainId] || `Chain ${chainId}`
  }

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask or another Web3 wallet")
      return
    }

    setIsConnecting(true)
    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      // Get chain ID
      const chainId = await window.ethereum.request({
        method: "eth_chainId",
      })

      if (accounts.length > 0) {
        const walletState: WalletState = {
          address: accounts[0],
          chainId: Number.parseInt(chainId, 16).toString(),
          chainName: getChainName(Number.parseInt(chainId, 16).toString()),
          isConnected: true,
        }
        setWallet(walletState)
      }
    } catch (error) {
      console.error("Error connecting wallet:", error)
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setWallet(null)
  }

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          setWallet(null)
        } else if (wallet) {
          setWallet({ ...wallet, address: accounts[0] })
        }
      }

      const handleChainChanged = (chainId: string) => {
        if (wallet) {
          const newChainId = Number.parseInt(chainId, 16).toString()
          setWallet({
            ...wallet,
            chainId: newChainId,
            chainName: getChainName(newChainId),
          })
        }
      }

      window.ethereum.on("accountsChanged", handleAccountsChanged)
      window.ethereum.on("chainChanged", handleChainChanged)

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
        window.ethereum.removeListener("chainChanged", handleChainChanged)
      }
    }
  }, [wallet])

  // Check if already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          })

          if (accounts.length > 0) {
            const chainId = await window.ethereum.request({
              method: "eth_chainId",
            })

            const walletState: WalletState = {
              address: accounts[0],
              chainId: Number.parseInt(chainId, 16).toString(),
              chainName: getChainName(Number.parseInt(chainId, 16).toString()),
              isConnected: true,
            }
            setWallet(walletState)
          }
        } catch (error) {
          console.error("Error checking wallet connection:", error)
        }
      }
    }

    checkConnection()
  }, [])

  return {
    wallet,
    connectWallet,
    disconnectWallet,
    isConnecting,
  }
}
