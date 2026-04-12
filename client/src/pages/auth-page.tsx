import { Link } from "wouter";
import { Lock, Shield, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-navy-900 text-slate-100 flex items-center justify-center p-6">
      <Card className="w-full max-w-xl bg-navy-800 border-navy-600">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyber-blue/20 text-cyber-blue">
            <Shield className="h-7 w-7" />
          </div>
          <CardTitle className="text-white">Access Fantasma Firewall</CardTitle>
          <CardDescription className="text-slate-400">
            The cleanup removes the broken hybrid auth flow. Use the dashboard directly, or open the wallet screen if you want a local Web3 connection prompt.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Link href="/dashboard">
            <Button className="w-full bg-cyber-green text-navy-900 hover:bg-cyber-green/80">
              <Lock className="mr-2 h-4 w-4" />
              Enter Dashboard
            </Button>
          </Link>
          <Link href="/wallet-connect">
            <Button variant="outline" className="w-full border-navy-500 bg-navy-700 text-slate-100 hover:bg-navy-600">
              <Wallet className="mr-2 h-4 w-4" />
              Open Wallet Connection
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
