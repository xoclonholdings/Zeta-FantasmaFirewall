import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lock, ArrowLeft, Shield, Zap } from "lucide-react";
import { Link } from "wouter";

export default function QuantumEncryption() {
  const { data: quantumProtocols, isLoading } = useQuery({
    queryKey: ['/api/quantum-protocols'],
    queryFn: async () => {
      const response = await fetch('/api/quantum-protocols', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch quantum protocols');
      return response.json();
    },
  });

  const { data: encryptionLayers } = useQuery({
    queryKey: ['/api/encryption-layers'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/status', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch encryption status');
      const data = await response.json();
      return data.encryptionLayers || [];
    },
  });

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
                <Lock className="w-6 h-6 mr-2 text-cyber-blue" />
                Quantum Encryption
              </h1>
              <p className="text-slate-400">Multi-layer quantum security protocols</p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyber-blue mx-auto"></div>
            <p className="text-slate-400 mt-2">Loading quantum protocols...</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {/* Encryption Layers Status */}
            <Card className="bg-navy-800 border-navy-600">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Shield className="w-5 h-5 mr-2 text-cyber-green" />
                  Encryption Layers Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {encryptionLayers?.map((layer: any, index: number) => (
                    <div key={index} className="bg-navy-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-white">{layer.layerName}</h3>
                        <Badge className={layer.isActive ? 'bg-cyber-green' : 'bg-red-500'}>
                          {layer.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </Badge>
                      </div>
                      <p className="text-slate-400 text-sm mb-2">{layer.encryptionType}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">Strength:</span>
                        <span className="text-cyber-blue">{layer.keyStrength}-bit</span>
                      </div>
                    </div>
                  )) || (
                    <div className="col-span-3 text-center py-4">
                      <p className="text-slate-400">No encryption layers configured</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quantum Protocols */}
            <Card className="bg-navy-800 border-navy-600">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                  Active Quantum Protocols
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {quantumProtocols?.map((protocol: any, index: number) => (
                    <div key={index} className="bg-navy-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-white">
                          {protocol.protocolType?.replace(/_/g, ' ') || 'Quantum Protocol'}
                        </h3>
                        <Badge className={protocol.isActive ? 'bg-cyber-green' : 'bg-red-500'}>
                          {protocol.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </Badge>
                      </div>
                      <p className="text-slate-400 text-sm mb-2">{protocol.description}</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-slate-400">Target:</span>
                          <span className="text-white ml-2">{protocol.targetEntity || 'Global'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Strength:</span>
                          <span className="text-cyber-blue ml-2">{protocol.strength || 'Maximum'}</span>
                        </div>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-8">
                      <Lock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-300">No quantum protocols detected</p>
                      <p className="text-slate-400 text-sm">System using standard encryption</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}