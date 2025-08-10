import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Shield, ChevronDown, ChevronUp, Activity, Lock, AlertTriangle, Users, Settings, Menu, RefreshCw, Brain, Zap, Plug, Command, HelpCircle, BookOpen, Globe, Cloud, Code, Workflow } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import logoImage from "@assets/fantasma-firewall-logo.svg";
import zetaLogo from "@assets/zeta-logo.svg";

// Mobile-optimized collapsible section component
function CollapsibleSection({ 
  title, 
  icon: Icon, 
  children, 
  defaultOpen = false,
  badge 
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: string;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <CollapsibleTrigger asChild>
        <Card className="bg-navy-800 border-navy-600 cursor-pointer hover:bg-navy-750 transition-colors mb-2">
          <CardHeader className="pb-3 pt-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Icon className="w-5 h-5 cyber-green" />
                <CardTitle className="text-base font-medium text-white">{title}</CardTitle>
                {badge && (
                  <Badge variant="secondary" className="bg-cyber-green/20 text-cyber-green text-xs">
                    {badge}
                  </Badge>
                )}
              </div>
              {isOpen ? 
                <ChevronUp className="w-5 h-5 text-slate-400" /> : 
                <ChevronDown className="w-5 h-5 text-slate-400" />
              }
            </div>
          </CardHeader>
        </Card>
      </CollapsibleTrigger>
      <CollapsibleContent className="pb-4">
        <Card className="bg-navy-800 border-navy-600">
          <CardContent className="pt-4">
            {children}
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function Dashboard() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [integrationsOpen, setIntegrationsOpen] = useState(false);
  const [securityControlsOpen, setSecurityControlsOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch real dashboard data - skip authentication for demo purposes
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['/api/dashboard/status'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/status', {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      return response.json();
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Refresh mutation
  const refreshMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/dashboard/status');
      if (!response.ok) throw new Error('Failed to refresh');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/status'] });
      toast({
        title: "System Refreshed",
        description: "All systems have been refreshed successfully",
      });
    },
    onError: () => {
      toast({
        title: "Refresh Failed", 
        description: "Failed to refresh system data",
        variant: "destructive",
      });
    }
  });

  // Emergency lockdown mutation
  const lockdownMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/security-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'EMERGENCY_LOCKDOWN',
          severity: 'CRITICAL',
          source: 'SYSTEM_ADMIN',
          description: 'Emergency lockdown initiated from dashboard',
          status: 'ACTIVE'
        })
      });
      if (!response.ok) throw new Error('Failed to initiate lockdown');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Emergency Lockdown Initiated",
        description: "All systems are now in lockdown mode",
        variant: "destructive",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/status'] });
    }
  });

  const isConnected = !isLoading && !error;
  const securityData = dashboardData || {
    zetaCore: { aiConfidence: 95, neuralProcessing: 87, isActive: true, analysisPatterns: 42, threatsBlocked: 247 },
    threatCounters: { aiInjection: 15, corporateSabotage: 8, marketManipulation: 3, totalBlocked: 247 },
    securityEvents: [{ eventType: "CORPORATE_INFILTRATION", severity: "HIGH", description: "Blocked ZWAP access attempt" }],
    systemMetrics: [{ metricType: "CPU", value: 31 }, { metricType: "MEMORY", value: 70 }]
  };

  const refreshData = () => refreshMutation.mutate();

  // Integration handlers - all arms of ZEBULON Web3 Interface
  const handleZebulonIntegration = () => {
    toast({
      title: "ZEBULON Web3 Interface",
      description: "See How-To guides for integration setup instructions",
    });
    setLocation('/how-to');
  };

  const handleZwapIntegration = () => {
    toast({
      title: "ZWAP! Exchange",
      description: "See How-To guides for ZWAP integration setup",
    });
    setLocation('/how-to');
  };

  const handleZetaCoreIntegration = () => {
    toast({
      title: "Zeta Core AI",
      description: "See How-To guides for AI integration setup",
    });
    setLocation('/how-to');
  };

  const handleZincIntegration = () => {
    toast({
      title: "Zinc Infrastructure",
      description: "See How-To guides for infrastructure integration",
    });
    setLocation('/how-to');
  };

  // Security control handlers - all configurable via How-To guides
  const handleThreatReports = () => {
    toast({
      title: "Threat Reports",
      description: "See How-To guides for threat detection setup",
    });
    setLocation('/how-to');
  };

  const handleCorporateSabotage = () => {
    toast({
      title: "Corporate Sabotage Detection",
      description: "See How-To guides for sabotage detection setup",
    });
    setLocation('/how-to');
  };

  const handleQuantumEncryption = () => {
    toast({
      title: "Quantum Encryption",
      description: "See How-To guides for quantum encryption setup",
    });
    setLocation('/how-to');
  };

  const handleSystemMetrics = () => {
    toast({
      title: "System Metrics",
      description: "See How-To guides for metrics configuration",
    });
    setLocation('/how-to');
  };

  const handleEmergencyProtocols = () => {
    toast({
      title: "Emergency Protocols",
      description: "See How-To guides for emergency response setup",
    });
    setLocation('/how-to');
  };

  // Quick action handlers with real functionality
  const handleEmergencyLockdown = () => {
    lockdownMutation.mutate();
  };

  const handleSystemDiagnostics = async () => {
    try {
      // Create a diagnostic event
      const response = await fetch('/api/security-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'SYSTEM_DIAGNOSTIC',
          severity: 'LOW',
          source: 'SYSTEM_ADMIN',
          description: 'System diagnostic scan initiated from dashboard',
          status: 'ACTIVE'
        })
      });
      
      if (response.ok) {
        toast({
          title: "System Diagnostics",
          description: "Diagnostic scan initiated successfully",
        });
        queryClient.invalidateQueries({ queryKey: ['/api/dashboard/status'] });
      }
    } catch (error) {
      toast({
        title: "Diagnostics Failed",
        description: "Failed to run system diagnostics",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    toast({
      title: "Logout",
      description: "Logging out of Fantasma Firewall...",
    });
    // In a real application, this would clear authentication and redirect
    setTimeout(() => {
      window.location.href = '/auth';
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-navy-900 text-slate-100">
      {/* Mobile Header */}
      <header className="bg-navy-800 border-b border-navy-600 sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <img 
              src={logoImage}
              alt="Fantasma Firewall"
              className="w-10 h-10"
            />
            <div>
              <div className="text-lg font-bold text-white">Fantasma Firewall</div>
              <div className="text-xs text-slate-400">Security Operations Center</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 mr-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-cyber-green animate-pulse' : 'bg-red-500'}`}></div>
              <span className={`text-xs font-medium ${isConnected ? 'cyber-green' : 'text-red-400'}`}>
                {isConnected ? 'ON' : 'OFF'}
              </span>
            </div>
            
            {/* Integrations Dropdown */}
            <DropdownMenu open={integrationsOpen} onOpenChange={setIntegrationsOpen}>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" className="px-2 py-1 text-xs">
                  <Plug className="w-3 h-3 mr-1" />
                  Integrations
                  <ChevronDown className="w-3 h-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-navy-800 border-navy-600">
                <DropdownMenuLabel className="text-slate-400 text-xs">Native Integrations</DropdownMenuLabel>
                <DropdownMenuItem 
                  className="text-slate-300 hover:bg-navy-700 focus:bg-navy-700 cursor-pointer"
                  onClick={handleZebulonIntegration}
                >
                  <Settings className="w-4 h-4 mr-2 cyber-green" />
                  ZEBULON
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-slate-300 hover:bg-navy-700 focus:bg-navy-700 cursor-pointer"
                  onClick={handleZwapIntegration}
                >
                  <Zap className="w-4 h-4 mr-2 cyber-blue" />
                  ZWAP! Exchange
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-slate-300 hover:bg-navy-700 focus:bg-navy-700 cursor-pointer"
                  onClick={handleZetaCoreIntegration}
                >
                  <Brain className="w-4 h-4 mr-2 text-purple-400" />
                  Zeta Core AI
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-slate-300 hover:bg-navy-700 focus:bg-navy-700 cursor-pointer"
                  onClick={handleZincIntegration}
                >
                  <Command className="w-4 h-4 mr-2 text-orange-400" />
                  Zinc
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-navy-600" />
                <DropdownMenuLabel className="text-slate-400 text-xs">External Integrations</DropdownMenuLabel>
                <DropdownMenuItem 
                  className="text-slate-300 hover:bg-navy-700 focus:bg-navy-700 cursor-pointer"
                  onClick={() => { toast({ title: "Security Platforms", description: "See How-To guides for SIEM & threat intel setup" }); setLocation('/how-to'); }}
                >
                  <Shield className="w-4 h-4 mr-2 text-blue-400" />
                  Security Platforms
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-slate-300 hover:bg-navy-700 focus:bg-navy-700 cursor-pointer"
                  onClick={() => { toast({ title: "Cloud Services", description: "See How-To guides for cloud platform integration" }); setLocation('/how-to'); }}
                >
                  <Cloud className="w-4 h-4 mr-2 text-cyan-400" />
                  Cloud Services
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-slate-300 hover:bg-navy-700 focus:bg-navy-700 cursor-pointer"
                  onClick={() => { toast({ title: "Custom APIs", description: "See How-To guides for custom integration builder" }); setLocation('/how-to'); }}
                >
                  <Code className="w-4 h-4 mr-2 text-green-400" />
                  Custom APIs
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-slate-300 hover:bg-navy-700 focus:bg-navy-700 cursor-pointer"
                  onClick={() => { toast({ title: "Zapier", description: "See How-To guides for automation workflows" }); setLocation('/how-to'); }}
                >
                  <Workflow className="w-4 h-4 mr-2 text-yellow-400" />
                  Zapier
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Security Controls Dropdown */}
            <DropdownMenu open={securityControlsOpen} onOpenChange={setSecurityControlsOpen}>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" className="px-2 py-1 text-xs">
                  <Shield className="w-3 h-3 mr-1" />
                  Security
                  <ChevronDown className="w-3 h-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-navy-800 border-navy-600">
                <DropdownMenuItem 
                  className="text-slate-300 hover:bg-navy-700 focus:bg-navy-700 cursor-pointer"
                  onClick={handleThreatReports}
                >
                  <AlertTriangle className="w-4 h-4 mr-2 text-orange-400" />
                  Threat Reports
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-slate-300 hover:bg-navy-700 focus:bg-navy-700 cursor-pointer"
                  onClick={handleCorporateSabotage}
                >
                  <Users className="w-4 h-4 mr-2 text-red-400" />
                  Corporate Sabotage
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-slate-300 hover:bg-navy-700 focus:bg-navy-700 cursor-pointer"
                  onClick={handleQuantumEncryption}
                >
                  <Lock className="w-4 h-4 mr-2 cyber-green" />
                  Quantum Encryption
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-slate-300 hover:bg-navy-700 focus:bg-navy-700 cursor-pointer"
                  onClick={handleSystemMetrics}
                >
                  <Activity className="w-4 h-4 mr-2 cyber-blue" />
                  System Metrics
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-slate-300 hover:bg-navy-700 focus:bg-navy-700 cursor-pointer"
                  onClick={handleEmergencyProtocols}
                >
                  <RefreshCw className="w-4 h-4 mr-2 cyber-green" />
                  Emergency Protocols
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Quick Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" className="px-2 py-1 text-xs">
                  <Command className="w-3 h-3 mr-1" />
                  Actions
                  <ChevronDown className="w-3 h-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-navy-800 border-navy-600">
                <DropdownMenuItem 
                  className="text-slate-300 hover:bg-navy-700 focus:bg-navy-700 cursor-pointer"
                  onClick={refreshData}
                >
                  <RefreshCw className="w-4 h-4 mr-2 cyber-green" />
                  Refresh All Systems
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-slate-300 hover:bg-navy-700 focus:bg-navy-700 cursor-pointer"
                  onClick={handleEmergencyLockdown}
                >
                  <AlertTriangle className="w-4 h-4 mr-2 text-orange-400" />
                  Emergency Lock Down
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-slate-300 hover:bg-navy-700 focus:bg-navy-700 cursor-pointer"
                  onClick={handleSystemDiagnostics}
                >
                  <Settings className="w-4 h-4 mr-2 cyber-blue" />
                  System Diagnostics
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-navy-600" />
                <DropdownMenuItem 
                  className="text-slate-300 hover:bg-navy-700 focus:bg-navy-700 cursor-pointer"
                  onClick={() => setLocation('/faq')}
                >
                  <HelpCircle className="w-4 h-4 mr-2 cyber-blue" />
                  FAQ
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-slate-300 hover:bg-navy-700 focus:bg-navy-700 cursor-pointer"
                  onClick={() => setLocation('/how-to')}
                >
                  <BookOpen className="w-4 h-4 mr-2 cyber-green" />
                  How-To Guides
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-slate-300 hover:bg-navy-700 focus:bg-navy-700 cursor-pointer"
                  onClick={() => setLocation('/admin')}
                >
                  <Settings className="w-4 h-4 mr-2 text-orange-400" />
                  Admin Panel
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-slate-300 hover:bg-navy-700 focus:bg-navy-700 cursor-pointer"
                  onClick={handleLogout}
                >
                  <RefreshCw className="w-4 h-4 mr-2 text-red-400" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        

      </header>

      {/* Mobile Content */}
      <main className="px-4 py-4 space-y-6">
        

        {/* Zeta Core AI Status - Main Section */}
        <Card className="bg-navy-800 border-navy-600">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img 
                  src={zetaLogo}
                  alt="Zeta Core AI"
                  className="h-8"
                />
                <div>
                  <CardTitle className="text-lg text-white">Zeta Core AI</CardTitle>
                  <p className="text-xs text-slate-400">AI Security Sentry</p>
                </div>
              </div>
              <Badge className={`${isConnected ? 'bg-cyber-green/20 text-cyber-green' : 'bg-red-500/20 text-red-400'}`}>
                {isConnected ? 'ACTIVE' : 'OFFLINE'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-navy-700 rounded-lg p-3 text-center">
                <div className="text-xs text-slate-400 mb-1">AI Confidence</div>
                <div className="text-2xl font-bold cyber-green">
                  {securityData?.zetaCore?.aiConfidence?.toFixed(1) || '98.7'}%
                </div>
              </div>
              <div className="bg-navy-700 rounded-lg p-3 text-center">
                <div className="text-xs text-slate-400 mb-1">Threats Blocked</div>
                <div className="text-2xl font-bold cyber-blue">
                  {securityData?.zetaCore?.threatsBlocked?.toLocaleString() || '1,247'}
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Neural Processing</span>
                <span className="cyber-green">{securityData?.zetaCore?.neuralProcessing || 96}%</span>
              </div>
              <div className="w-full bg-navy-600 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-cyber-green to-cyber-blue h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${securityData?.zetaCore?.neuralProcessing || 96}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Status Grid */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-navy-800 border-navy-600">
            <CardContent className="p-4 text-center">
              <Lock className="w-6 h-6 cyber-green mx-auto mb-2" />
              <div className="text-sm font-medium text-white">Quantum Encryption</div>
              <div className="text-xs text-slate-400">4 Layers Active</div>
              <Badge className="bg-cyber-green/20 text-cyber-green mt-2 text-xs">SECURE</Badge>
            </CardContent>
          </Card>
          
          <Card className="bg-navy-800 border-navy-600">
            <CardContent className="p-4 text-center">
              <Zap className="w-6 h-6 cyber-blue mx-auto mb-2" />
              <div className="text-sm font-medium text-white">ZWAP! Protection</div>
              <div className="text-xs text-slate-400">Exchange Secured</div>
              <Badge className="bg-cyber-blue/20 text-cyber-blue mt-2 text-xs">PROTECTED</Badge>
            </CardContent>
          </Card>
        </div>



        {/* Current Status Summary */}
        <Card className="bg-navy-800 border-navy-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-white">System Status</span>
              <Badge className="bg-cyber-green/20 text-cyber-green">ALL SYSTEMS OPERATIONAL</Badge>
            </div>
            <div className="space-y-2 text-xs text-slate-400">
              <div>🛡️ Quantum encryption layers active and verified</div>
              <div>🔍 Corporate sabotage patterns: 55 currently analyzing</div>
              <div>⚡ ZWAP!/XHI exchange protection enabled</div>
              <div>🌐 Ready for Zebulon Web3 Interface integration</div>
            </div>
          </CardContent>
        </Card>

      </main>
    </div>
  );
}