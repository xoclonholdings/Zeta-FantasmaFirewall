import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useWallet } from "@/hooks/useWallet";
import { Shield, Twitter, Instagram, Eye, EyeOff } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const { user, isLoading } = useAuth();
  const { connectWallet, isConnecting } = useWallet();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isAdminLogging, setIsAdminLogging] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      setLocation("/");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  const handleSocialLogin = (provider: string) => {
    window.location.href = `/api/auth/${provider}`;
  };

  const handleWalletConnect = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error('Wallet connection failed:', error);
    }
  };

  const handleAdminLogin = async () => {
    if (!adminPassword.trim()) {
      toast({
        title: "Password Required",
        description: "Please enter the admin password",
        variant: "destructive",
      });
      return;
    }

    setIsAdminLogging(true);
    try {
      const response = await fetch('/api/auth/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: adminPassword }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Admin Access Granted",
          description: "Redirecting to dashboard...",
        });
        setLocation("/dashboard");
      } else {
        toast({
          title: "Access Denied",
          description: "Invalid admin password",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Unable to connect to server",
        variant: "destructive",
      });
    } finally {
      setIsAdminLogging(false);
      setAdminPassword("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div 
            className="mx-auto h-16 w-16 bg-blue-600 rounded-lg flex items-center justify-center mb-6 cursor-pointer hover:bg-blue-500 transition-colors"
            onClick={() => setShowAdminLogin(!showAdminLogin)}
            title="Admin Access"
          >
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Fantasma Firewall</h1>
          <p className="text-gray-400">Choose your authentication method</p>
        </div>

        <div className="space-y-4">
          <Button 
            onClick={handleWalletConnect}
            disabled={isConnecting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-lg disabled:opacity-50"
          >
            {isConnecting ? "Connecting..." : "Connect Web3 Wallet"}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-gray-900 px-3 text-gray-500">or</span>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={() => handleSocialLogin('twitter')}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white h-11"
            >
              <Twitter className="h-4 w-4 mr-2" />
              Continue with X
            </Button>

            <Button 
              onClick={() => handleSocialLogin('instagram')}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white h-11"
            >
              <Instagram className="h-4 w-4 mr-2" />
              Continue with Instagram
            </Button>

            <Button 
              onClick={() => handleSocialLogin('snapchat')}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white h-11"
            >
              <span className="mr-2">👻</span>
              Continue with Snapchat
            </Button>
          </div>
        </div>

        {showAdminLogin && (
          <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Admin Access</h3>
            <div className="space-y-3">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Admin password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                  className="bg-gray-700 border-gray-600 text-white pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Button
                onClick={handleAdminLogin}
                disabled={isAdminLogging}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                {isAdminLogging ? "Authenticating..." : "Admin Login"}
              </Button>
            </div>
          </div>
        )}

        <p className="text-xs text-gray-500 text-center">
          Secure authentication for ZEBULON Web3 Interface
        </p>
      </div>
    </div>
  );
}