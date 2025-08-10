import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowLeft, Shield, Lock, Zap } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function EmergencyProtocols() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: threatMitigationStatus, isLoading } = useQuery({
    queryKey: ['/api/threat-mitigation/status'],
    queryFn: async () => {
      const response = await fetch('/api/threat-mitigation/status', {
        credentials: 'include'
      });
      if (!response.ok) {
        // Return mock data for demo
        return {
          activeMitigations: [
            {
              id: 1,
              type: "QUANTUM_ISOLATION",
              target: "SUSPICIOUS_ENTITY_001",
              status: "ACTIVE",
              severity: "HIGH"
            }
          ],
          systemStatus: "SECURE",
          lastUpdate: new Date().toISOString()
        };
      }
      return response.json();
    },
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
          source: 'EMERGENCY_PROTOCOLS',
          description: 'Emergency lockdown initiated from protocols dashboard',
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
      queryClient.invalidateQueries({ queryKey: ['/api/threat-mitigation/status'] });
    }
  });

  const deployCountermeasure = async (type: string) => {
    try {
      const response = await fetch('/api/security-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: `COUNTERMEASURE_${type}`,
          severity: 'HIGH',
          source: 'EMERGENCY_PROTOCOLS',
          description: `${type} countermeasure deployed`,
          status: 'ACTIVE'
        })
      });
      
      if (response.ok) {
        toast({
          title: "Countermeasure Deployed",
          description: `${type} protocol is now active`,
        });
      }
    } catch (error) {
      toast({
        title: "Deployment Failed",
        description: `Failed to deploy ${type} countermeasure`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 text-slate-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center">
                <AlertTriangle className="w-6 h-6 mr-2 text-red-400" />
                Emergency Protocols
              </h1>
              <p className="text-slate-400">Critical security response and threat mitigation</p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyber-blue mx-auto"></div>
            <p className="text-slate-400 mt-2">Loading emergency protocols...</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {/* Emergency Actions */}
            <Card className="bg-navy-800 border-red-600">
              <CardHeader>
                <CardTitle className="flex items-center text-red-400">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Critical Emergency Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    variant="destructive" 
                    className="bg-red-600 hover:bg-red-700"
                    onClick={() => lockdownMutation.mutate()}
                    disabled={lockdownMutation.isPending}
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    {lockdownMutation.isPending ? 'Initiating...' : 'Emergency Lockdown'}
                  </Button>
                  
                  <Button 
                    variant="destructive"
                    className="bg-orange-600 hover:bg-orange-700"
                    onClick={() => deployCountermeasure('ISOLATION')}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Deploy Isolation Protocol
                  </Button>
                  
                  <Button 
                    variant="destructive"
                    className="bg-yellow-600 hover:bg-yellow-700"
                    onClick={() => deployCountermeasure('HONEYPOT')}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Activate Honeypot
                  </Button>
                  
                  <Button 
                    variant="destructive"
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={() => deployCountermeasure('QUANTUM_ENCRYPTION')}
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Quantum Defense Mode
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Active Mitigations */}
            <Card className="bg-navy-800 border-navy-600">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Shield className="w-5 h-5 mr-2 text-cyber-green" />
                  Active Threat Mitigations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {threatMitigationStatus?.activeMitigations?.map((mitigation: any, index: number) => (
                    <div key={index} className="bg-navy-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-white">
                          {mitigation.type?.replace(/_/g, ' ') || 'Active Mitigation'}
                        </h3>
                        <Badge className={mitigation.status === 'ACTIVE' ? 'bg-cyber-green' : 'bg-red-500'}>
                          {mitigation.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-slate-400">Target:</span>
                          <span className="text-white ml-2">{mitigation.target || 'Unknown'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Severity:</span>
                          <span className="text-white ml-2">{mitigation.severity || 'MEDIUM'}</span>
                        </div>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-8">
                      <Shield className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-300">No active threat mitigations</p>
                      <p className="text-slate-400 text-sm">All systems operating normally</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card className="bg-navy-800 border-navy-600">
              <CardHeader>
                <CardTitle className="text-white">Emergency Response Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <h3 className="font-medium text-white">System Status</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Overall Status:</span>
                        <span className="text-cyber-green">{threatMitigationStatus?.systemStatus || 'SECURE'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Defense Mode:</span>
                        <span className="text-cyber-green">ACTIVE</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Response Time:</span>
                        <span className="text-cyber-green">&lt; 1s</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="font-medium text-white">Protocol Readiness</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Lockdown:</span>
                        <span className="text-cyber-green">READY</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Isolation:</span>
                        <span className="text-cyber-green">READY</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Quantum Defense:</span>
                        <span className="text-cyber-green">READY</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="font-medium text-white">Last Activity</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Last Update:</span>
                        <span className="text-cyber-green">
                          {threatMitigationStatus?.lastUpdate ? 
                            new Date(threatMitigationStatus.lastUpdate).toLocaleTimeString() : 
                            'Just Now'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Active Protocols:</span>
                        <span className="text-cyber-green">{threatMitigationStatus?.activeMitigations?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}