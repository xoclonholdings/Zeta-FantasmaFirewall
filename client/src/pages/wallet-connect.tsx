import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useWallet, type WalletType } from "@/hooks/useWallet";
import { useAuth } from "@/hooks/useAuth";
import { Shield, Zap, Lock, AlertTriangle, Wallet } from "lucide-react";
import { useLocation } from "wouter";

export default function WalletConnect() {
  const { 
    account, 
    isConnected, 
    isConnecting, 
    connectWallet, 
    getAvailableWallets,
    isWalletAvailable,
    connectedWalletType,
    error: walletError 
  } = useWallet();
  const { walletAuthMutation, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  
  const availableWallets = getAvailableWallets();

  // Auto-authenticate when wallet is connected
  useEffect(() => {
    if (account && isConnected && !isAuthenticated) {
      walletAuthMutation.mutate(account);
    }
  }, [account, isConnected, isAuthenticated, walletAuthMutation]);

  // Redirect to dashboard when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, setLocation]);

  const handleConnect = async (walletType?: WalletType) => {
    await connectWallet(walletType);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8">
        {/* Left Column - Hero Section */}
        <div className="flex flex-col justify-center space-y-6 text-white">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Shield className="h-12 w-12 text-blue-400" />
              <h1 className="text-4xl font-bold">Fantasma Firewall</h1>
            </div>
            <p className="text-xl text-gray-300">
              Advanced Web3 Security Operations Center
            </p>
            <p className="text-gray-400 max-w-md">
              Protect the ZEBULON Web3 Interface with AI-powered threat detection, 
              quantum-level encryption, and real-time security monitoring.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Zap className="h-6 w-6 text-yellow-400" />
              <span className="text-gray-300">Zeta Core AI Sentry</span>
            </div>
            <div className="flex items-center space-x-3">
              <Lock className="h-6 w-6 text-green-400" />
              <span className="text-gray-300">4-Layer Quantum Encryption</span>
            </div>
            <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6 text-blue-400" />
              <span className="text-gray-300">ZWAP! Exchange Protection</span>
            </div>
          </div>
        </div>

        {/* Right Column - Wallet Connection */}
        <div className="flex items-center justify-center">
          <Card className="w-full max-w-md bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-white">Connect Wallet</CardTitle>
              <CardDescription className="text-gray-400">
                Connect your Web3 wallet to access the Fantasma Firewall security dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!isWalletAvailable ? (
                <div className="text-center space-y-4">
                  <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto" />
                  <p className="text-gray-300">
                    No Web3 wallet detected
                  </p>
                  <div className="space-y-2">
                    <Button 
                      onClick={() => window.open('https://metamask.io/download/', '_blank')}
                      className="w-full bg-orange-600 hover:bg-orange-700"
                    >
                      Install MetaMask
                    </Button>
                    <Button 
                      onClick={() => window.open('https://www.coinbase.com/wallet/downloads', '_blank')}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      variant="outline"
                    >
                      Install Coinbase Wallet
                    </Button>
                  </div>
                </div>
              ) : isConnected && account ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="h-12 w-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-green-400 font-medium">Wallet Connected</p>
                    <p className="text-gray-400 text-sm mt-1">
                      {connectedWalletType === "metamask" && "🦊 MetaMask: "}
                      {connectedWalletType === "coinbase" && "🔵 Coinbase: "}
                      {connectedWalletType === "other" && "🔗 Web3 Wallet: "}
                      {account.slice(0, 6)}...{account.slice(-4)}
                    </p>
                  </div>
                  
                  {walletAuthMutation.isPending && (
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
                      <p className="text-gray-400 mt-2">Authenticating...</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {availableWallets.length > 0 ? (
                    <div className="space-y-3">
                      <p className="text-gray-300 text-sm text-center">Choose your wallet:</p>
                      {availableWallets.map((wallet) => (
                        <Button 
                          key={wallet.type}
                          onClick={() => handleConnect(wallet.type)}
                          disabled={isConnecting}
                          className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg justify-start"
                          variant="outline"
                        >
                          {isConnecting ? (
                            <div className="flex items-center space-x-2">
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                              <span>Connecting...</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-3">
                              <span className="text-xl">{wallet.icon}</span>
                              <span>Connect {wallet.name}</span>
                            </div>
                          )}
                        </Button>
                      ))}
                      
                      {/* Fallback connect button for any Web3 wallet */}
                      <Button 
                        onClick={() => handleConnect()}
                        disabled={isConnecting}
                        className="w-full bg-gray-600 hover:bg-gray-700 h-12 text-lg"
                        variant="outline"
                      >
                        <div className="flex items-center space-x-2">
                          <Wallet className="h-5 w-5" />
                          <span>Connect Any Web3 Wallet</span>
                        </div>
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      onClick={() => handleConnect()}
                      disabled={isConnecting}
                      className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg"
                    >
                      {isConnecting ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Connecting...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Shield className="h-5 w-5" />
                          <span>Connect Wallet</span>
                        </div>
                      )}
                    </Button>
                  )}
                  
                  {walletError && (
                    <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg">
                      <p className="text-red-300 text-sm">{walletError}</p>
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500 text-center">
                    By connecting your wallet, you agree to the ZEBULON Web3 Interface security protocols
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}