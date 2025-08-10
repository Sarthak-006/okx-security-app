"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { WalletProvider } from "@/hooks/useWallet"

interface WalletSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelectWallet: (providerId: string) => void
  availableProviders: WalletProvider[]
  isConnecting: boolean
}

export function WalletSelector({
  isOpen,
  onClose,
  onSelectWallet,
  availableProviders,
  isConnecting
}: WalletSelectorProps) {
  const getWalletIcon = (providerId: string) => {
    switch (providerId) {
      case "okxwallet":
        return "🟢"
      case "metamask":
        return "🦊"
      case "coinbase":
        return "🔵"
      case "trustwallet":
        return "🟡"
      default:
        return "💳"
    }
  }

  const getWalletDescription = (providerId: string) => {
    switch (providerId) {
      case "okxwallet":
        return "Official OKX Web3 wallet with enhanced security"
      case "metamask":
        return "Popular Ethereum wallet with extensive DApp support"
      case "coinbase":
        return "Coinbase's secure Web3 wallet"
      case "trustwallet":
        return "Binance's multi-chain mobile wallet"
      default:
        return "Connect your preferred wallet"
    }
  }

  if (availableProviders.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>No Wallets Available</DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <p className="text-slate-600 mb-4">
              No Web3 wallets detected. Please install one of the following:
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-3 p-3 bg-slate-50 rounded-lg">
                <span className="text-2xl">🟢</span>
                <div className="text-left">
                  <p className="font-semibold">OKX Wallet</p>
                  <p className="text-sm text-slate-600">Official OKX Web3 wallet</p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-3 p-3 bg-slate-50 rounded-lg">
                <span className="text-2xl">🦊</span>
                <div className="text-left">
                  <p className="font-semibold">MetaMask</p>
                  <p className="text-sm text-slate-600">Popular Ethereum wallet</p>
                </div>
              </div>
            </div>
            <div className="mt-6 space-y-2">
              <Button
                onClick={() => window.open('https://www.okx.com/web3', '_blank')}
                variant="outline"
                className="w-full"
              >
                Install OKX Wallet
              </Button>
              <Button
                onClick={() => window.open('https://metamask.io/', '_blank')}
                variant="outline"
                className="w-full"
              >
                Install MetaMask
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choose Your Wallet</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {availableProviders.map((provider) => (
            <Button
              key={provider.id}
              onClick={() => onSelectWallet(provider.id)}
              disabled={isConnecting}
              variant="outline"
              className="w-full h-auto p-4 justify-start gap-3 hover:bg-slate-50 transition-colors"
            >
              <span className="text-2xl">{getWalletIcon(provider.id)}</span>
              <div className="text-left flex-1">
                <p className="font-semibold text-slate-800">{provider.name}</p>
                <p className="text-sm text-slate-600">{getWalletDescription(provider.id)}</p>
              </div>
              {isConnecting && provider.id === "connecting" && (
                <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
              )}
            </Button>
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t border-slate-200">
          <Button
            onClick={onClose}
            variant="ghost"
            className="w-full"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
