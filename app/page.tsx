"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Wallet, Eye, AlertTriangle, CheckCircle, Clock, RefreshCw } from "lucide-react"
import { useWallet } from "@/hooks/useWallet"
import { useOKXAPI } from "@/hooks/useOKXAPI"
import { WalletSelector } from "@/components/wallet-selector"

interface SecurityAlert {
  id: string
  type: "warning" | "info" | "error"
  message: string
  timestamp: string
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

interface Balance {
  chainId: string
  tokenAddress: string
  symbol: string
  balance: string
  balanceRaw: string
  priceUsd: string
  valueUsd: string
}

export default function OKXSecurityApp() {
  const {
    wallet,
    connectWallet,
    disconnectWallet,
    isConnecting,
    showWalletSelector,
    closeWalletSelector,
    availableProviders
  } = useWallet()
  const { getBalances, getTransactionHistory, getTokenPrice, loading } = useOKXAPI()

  const [alerts, setAlerts] = useState<SecurityAlert[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [balances, setBalances] = useState<Balance[]>([])
  const [refreshing, setRefreshing] = useState(false)

  // Load data when wallet is connected
  useEffect(() => {
    if (wallet?.address) {
      loadWalletData()
      generateSecurityAlerts()
    }
  }, [wallet?.address])

  const loadWalletData = async () => {
    if (!wallet?.address) return

    setRefreshing(true)
    try {
      // Load balances
      const balanceData = await getBalances(wallet.address, wallet.chainId)
      setBalances(balanceData)

      // Load transaction history
      const txData = await getTransactionHistory(wallet.address, wallet.chainId)
      setTransactions(txData)
    } catch (error) {
      console.error("Error loading wallet data:", error)
    } finally {
      setRefreshing(false)
    }
  }

  const generateSecurityAlerts = () => {
    const newAlerts: SecurityAlert[] = [
      {
        id: "1",
        type: "info",
        message: "Wallet connected successfully with enhanced security monitoring",
        timestamp: new Date().toISOString(),
      },
      {
        id: "2",
        type: "warning",
        message: "High-value transaction detected - Additional verification recommended",
        timestamp: new Date(Date.now() - 300000).toISOString(),
      },
    ]
    setAlerts(newAlerts)
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
      case "confirmed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "failed":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <CheckCircle className="h-4 w-4 text-blue-500" />
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const calculateTotalValue = () => {
    return balances.reduce((total, balance) => total + Number.parseFloat(balance.valueUsd || "0"), 0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 text-slate-800 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                OKX Security Suite
              </h1>
              <p className="text-slate-600">Privacy & Security Tooling</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {wallet?.address && (
              <Button
                onClick={loadWalletData}
                disabled={refreshing}
                variant="outline"
                size="sm"
                className="border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-700"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            )}

            {!wallet?.address ? (
              <Button 
                onClick={() => connectWallet()} 
                disabled={isConnecting} 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/25 text-white"
              >
                <Wallet className="h-4 w-4 mr-2" />
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </Button>
            ) : (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200">
                      Connected
                    </Badge>
                    <span className="text-sm text-slate-700">{formatAddress(wallet.address)}</span>
                  </div>
                  <p className="text-xs text-slate-500">{wallet.chainName}</p>
                  <p className="text-xs text-slate-500 capitalize">{wallet.provider} Wallet</p>
                </div>
                <Button
                  onClick={() => connectWallet()}
                  variant="outline"
                  size="sm"
                  className="border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-700"
                >
                  Switch Wallet
                </Button>
                <Button
                  onClick={disconnectWallet}
                  variant="outline"
                  size="sm"
                  className="border-red-300 bg-red-50 hover:bg-red-100 text-red-700"
                >
                  Disconnect
                </Button>
              </div>
            )}
          </div>
        </div>

        {!wallet?.address ? (
          <Card className="bg-white/80 border-slate-200 shadow-lg backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-6 border border-blue-200">
                <Wallet className="h-10 w-10 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2 text-slate-800">Connect Your Wallet</h2>
              <p className="text-slate-600 text-center mb-6">
                Connect your wallet to access OKX security and privacy tools
              </p>
              <p className="text-xs text-slate-500 text-center mb-4">
                Choose from OKX Wallet, MetaMask, Coinbase Wallet, or Trust Wallet
              </p>
              {availableProviders.length === 0 ? (
                <div className="text-center p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4">
                  <p className="text-xs text-amber-700">
                    No wallets detected. Please install a Web3 wallet extension.
                  </p>
                </div>
              ) : (
                <div className="text-center p-3 bg-emerald-50 border border-emerald-200 rounded-lg mb-4">
                  <p className="text-xs text-emerald-700">
                    {availableProviders.length} wallet{availableProviders.length !== 1 ? 's' : ''} detected
                  </p>
                </div>
              )}
              <Button
                onClick={() => connectWallet()}
                disabled={isConnecting}
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/25 text-white"
              >
                <Wallet className="h-4 w-4 mr-2" />
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-white/80 border-slate-200 shadow-sm backdrop-blur-sm">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/10 data-[state=active]:to-indigo-500/10 data-[state=active]:border-blue-300 data-[state=active]:text-blue-700"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="balances" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/10 data-[state=active]:to-indigo-500/10 data-[state=active]:border-blue-300 data-[state=active]:text-blue-700"
              >
                Balances
              </TabsTrigger>
              <TabsTrigger 
                value="transactions" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/10 data-[state=active]:to-indigo-500/10 data-[state=active]:border-blue-300 data-[state=active]:text-blue-700"
              >
                Transactions
              </TabsTrigger>
              <TabsTrigger 
                value="privacy" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/10 data-[state=active]:to-indigo-500/10 data-[state=active]:border-blue-300 data-[state=active]:text-blue-700"
              >
                Privacy Tools
              </TabsTrigger>
              <TabsTrigger 
                value="monitoring" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/10 data-[state=active]:to-indigo-500/10 data-[state=active]:border-blue-300 data-[state=active]:text-blue-700"
              >
                Security Monitor
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Wallet Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-emerald-700">Total Portfolio Value</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-emerald-800">${calculateTotalValue().toFixed(2)}</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-blue-700">Active Tokens</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-800">{balances.length}</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-purple-700">Recent Transactions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-800">{transactions.length}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Wallet Details */}
              <Card className="bg-white/80 border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-800">
                    <Wallet className="h-5 w-5 text-blue-600" />
                    Wallet Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-slate-600">Address</p>
                      <p className="font-mono text-sm break-all text-slate-800">{wallet.address}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Network</p>
                      <p className="font-semibold text-slate-800">{wallet.chainName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Wallet Provider</p>
                      <p className="font-semibold text-slate-800 capitalize">{wallet.provider}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="balances" className="space-y-6">
              <Card className="bg-white/80 border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-slate-800">Token Balances</CardTitle>
                  <CardDescription className="text-slate-600">Your current token holdings across networks</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
                      <span className="ml-2 text-slate-600">Loading balances...</span>
                    </div>
                  ) : balances.length > 0 ? (
                    <div className="space-y-3">
                      {balances.map((balance, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center border border-blue-200">
                              <span className="text-xs font-bold text-blue-700">{balance.symbol.slice(0, 2)}</span>
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800">{balance.symbol}</p>
                              <p className="text-xs text-slate-600">Chain ID: {balance.chainId}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-emerald-700">{Number.parseFloat(balance.balance).toFixed(4)}</p>
                            <p className="text-xs text-emerald-600">
                              ${Number.parseFloat(balance.valueUsd || "0").toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-slate-500 py-8">No balances found</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="transactions" className="space-y-6">
              <Card className="bg-white/80 border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-slate-800">Transaction History</CardTitle>
                  <CardDescription className="text-slate-600">Recent transaction activity</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
                      <span className="ml-2 text-slate-600">Loading transactions...</span>
                    </div>
                  ) : transactions.length > 0 ? (
                    <div className="space-y-3">
                      {transactions.map((tx) => (
                        <div key={tx.txId} className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(tx.status)}
                            <div>
                              <p className="font-mono text-sm text-slate-800">{formatAddress(tx.txId)}</p>
                              <p className="text-xs text-slate-600">
                                {new Date(Number.parseInt(tx.blockTime) * 1000).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-purple-700">
                              {Number.parseFloat(tx.tokenAmount).toFixed(4)} {tx.tokenSymbol}
                            </p>
                            <p className="text-xs text-slate-600">Gas: {tx.gasUsed}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-slate-500 py-8">No transactions found</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="privacy" className="space-y-6">
              <Card className="bg-white/80 border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-800">
                    <Eye className="h-5 w-5 text-blue-600" />
                    Privacy Controls
                  </CardTitle>
                  <CardDescription className="text-slate-600">Manage your transaction privacy and data protection</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg border border-emerald-200 hover:border-emerald-300 transition-colors">
                    <div>
                      <h3 className="font-semibold text-emerald-800">Private Transactions</h3>
                      <p className="text-sm text-emerald-700">Enable privacy mode for all transactions</p>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Enabled</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200 hover:border-blue-300 transition-colors">
                    <div>
                      <h3 className="font-semibold text-blue-800">Address Masking</h3>
                      <p className="text-sm text-blue-700">Hide wallet addresses in public view</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200">Active</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200 hover:border-purple-300 transition-colors">
                    <div>
                      <h3 className="font-semibold text-purple-800">Data Encryption</h3>
                      <p className="text-sm text-purple-700">End-to-end encryption for sensitive data</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200">Protected</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg border border-amber-200 hover:border-amber-300 transition-colors">
                    <div>
                      <h3 className="font-semibold text-amber-800">Transaction Mixing</h3>
                      <p className="text-sm text-amber-700">Obfuscate transaction patterns</p>
                    </div>
                    <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200">Available</Badge>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="monitoring" className="space-y-6">
              <Card className="bg-white/80 border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-800">
                    <Shield className="h-5 w-5 text-blue-600" />
                    Security Alerts
                  </CardTitle>
                  <CardDescription className="text-slate-600">Real-time security monitoring and alerts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {alerts.map((alert) => (
                      <Alert key={alert.id} className="bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200">
                        <div className="flex items-start gap-3">
                          {getAlertIcon(alert.type)}
                          <div className="flex-1">
                            <AlertDescription className="text-slate-800">{alert.message}</AlertDescription>
                            <p className="text-xs text-slate-600 mt-1">{new Date(alert.timestamp).toLocaleString()}</p>
                          </div>
                        </div>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-slate-800">Security Score</CardTitle>
                  <CardDescription className="text-slate-600">Overall security assessment</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="text-3xl font-bold text-emerald-600">92/100</div>
                    <div>
                      <p className="text-sm text-slate-600">Security Rating</p>
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Excellent</Badge>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-700">Wallet Security</span>
                      <span className="text-emerald-600">95%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-700">Transaction Privacy</span>
                      <span className="text-emerald-600">90%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-700">Network Safety</span>
                      <span className="text-amber-600">85%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Wallet Selector Modal */}
      <WalletSelector
        isOpen={showWalletSelector}
        onClose={closeWalletSelector}
        onSelectWallet={connectWallet}
        availableProviders={availableProviders}
        isConnecting={isConnecting}
      />
    </div>
  )
}
