"use client"

import { useState, useEffect } from "react"

interface WalletState {
  address: string
  chainId: string
  chainName: string
  isConnected: boolean
  provider: string
}

export interface WalletProvider {
  id: string
  name: string
  icon: string
  available: boolean
}

declare global {
  interface Window {
    ethereum?: any
    okxwallet?: any
    coinbaseWalletExtension?: any
    trustwallet?: any
  }
}

export function useWallet() {
  const [wallet, setWallet] = useState<WalletState | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [showWalletSelector, setShowWalletSelector] = useState(false)
  const [availableProviders, setAvailableProviders] = useState<WalletProvider[]>([])

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

  // Detect available wallet providers
  useEffect(() => {
    const detectProviders = () => {
      const providers: WalletProvider[] = [
        {
          id: "okxwallet",
          name: "OKX Wallet",
          icon: "🟢",
          available: !!window.okxwallet
        },
        {
          id: "metamask",
          name: "MetaMask",
          icon: "🦊",
          available: !!window.ethereum && !window.ethereum.isOKXWallet
        },
        {
          id: "coinbase",
          name: "Coinbase Wallet",
          icon: "🔵",
          available: !!window.coinbaseWalletExtension
        },
        {
          id: "trustwallet",
          name: "Trust Wallet",
          icon: "🟡",
          available: !!window.trustwallet
        }
      ]
      setAvailableProviders(providers.filter(p => p.available))
    }

    detectProviders()

    // Re-detect when window loads
    window.addEventListener('load', detectProviders)
    return () => window.removeEventListener('load', detectProviders)
  }, [])

  const getProvider = (providerId: string) => {
    switch (providerId) {
      case "okxwallet":
        return window.okxwallet
      case "metamask":
        return window.ethereum
      case "coinbase":
        return window.coinbaseWalletExtension
      case "trustwallet":
        return window.trustwallet
      default:
        return window.ethereum
    }
  }

  const connectWallet = async (providerId?: string) => {
    // If no specific provider, show selector
    if (!providerId) {
      setShowWalletSelector(true)
      return
    }

    const provider = getProvider(providerId)
    if (!provider) {
      alert(`Please install ${providerId} wallet`)
      return
    }

    setIsConnecting(true)
    try {
      // Request account access
      const accounts = await provider.request({
        method: "eth_requestAccounts",
      })

      // Get chain ID
      const chainId = await provider.request({
        method: "eth_chainId",
      })

      if (accounts.length > 0) {
        const walletState: WalletState = {
          address: accounts[0],
          chainId: Number.parseInt(chainId, 16).toString(),
          chainName: getChainName(Number.parseInt(chainId, 16).toString()),
          isConnected: true,
          provider: providerId,
        }
        setWallet(walletState)
        setShowWalletSelector(false)
      }
    } catch (error) {
      console.error("Error connecting wallet:", error)
      alert("Failed to connect wallet. Please try again.")
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setWallet(null)
    setShowWalletSelector(false)
  }

  const closeWalletSelector = () => {
    setShowWalletSelector(false)
  }

  // Listen for account changes
  useEffect(() => {
    if (wallet?.provider) {
      const provider = getProvider(wallet.provider)
      if (provider) {
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

        provider.on("accountsChanged", handleAccountsChanged)
        provider.on("chainChanged", handleChainChanged)

        return () => {
          provider.removeListener("accountsChanged", handleAccountsChanged)
          provider.removeListener("chainChanged", handleChainChanged)
        }
      }
    }
  }, [wallet])

  // Check if already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      // Check OKX Wallet first (priority)
      if (window.okxwallet) {
        try {
          const accounts = await window.okxwallet.request({
            method: "eth_accounts",
          })

          if (accounts.length > 0) {
            const chainId = await window.okxwallet.request({
              method: "eth_chainId",
            })

            const walletState: WalletState = {
              address: accounts[0],
              chainId: Number.parseInt(chainId, 16).toString(),
              chainName: getChainName(Number.parseInt(chainId, 16).toString()),
              isConnected: true,
              provider: "okxwallet",
            }
            setWallet(walletState)
            return
          }
        } catch (error) {
          console.error("Error checking OKX wallet connection:", error)
        }
      }

      // Check MetaMask
      if (window.ethereum && !window.ethereum.isOKXWallet) {
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
              provider: "metamask",
            }
            setWallet(walletState)
            return
          }
        } catch (error) {
          console.error("Error checking MetaMask connection:", error)
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
    showWalletSelector,
    closeWalletSelector,
    availableProviders,
  }
}
