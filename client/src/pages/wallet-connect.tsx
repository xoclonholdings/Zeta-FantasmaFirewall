import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Shield, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string }) => Promise<string[]>;
    };
  }
}

export default function WalletConnect() {
  const [account, setAccount] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  async function handleConnect() {
    if (!window.ethereum) {
      setError("No injected wallet was detected in this browser.");
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0] ?? null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Wallet connection failed.");
    } finally {
      setIsConnecting(false);
    }
  }

  return (
    <div className="min-h-screen bg-navy-900 text-slate-100 p-6">
      <div className="mx-auto max-w-3xl">
        <Link href="/dashboard">
          <Button variant="ghost" className="mb-6 text-slate-300 hover:bg-navy-800 hover:text-white">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>

        <Card className="bg-navy-800 border-navy-600">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <Shield className="mr-2 h-5 w-5 text-cyber-blue" />
              Wallet Connection
            </CardTitle>
            <CardDescription className="text-slate-400">
              This screen now performs only a local wallet prompt instead of trying to force a missing backend auth flow.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleConnect} disabled={isConnecting} className="bg-cyber-blue hover:bg-cyber-blue/80">
              <Wallet className="mr-2 h-4 w-4" />
              {isConnecting ? "Connecting..." : "Request Wallet Access"}
            </Button>

            {account && (
              <div className="rounded-lg border border-cyber-green/30 bg-cyber-green/10 p-4 text-sm">
                Connected account: <span className="font-mono text-cyber-green">{account}</span>
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                {error}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
