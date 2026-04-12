import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Lock, Shield, Zap } from "lucide-react";
import { Link } from "wouter";

import { fetchJson } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type EncryptionLayer = {
  id: number;
  layerName: string;
  status: string;
  encryptionStrength: number;
};

type QuantumProtocol = {
  id: number;
  protocolName: string;
  protocolType: string;
  targetType: string;
  isActive: boolean;
  effectiveness: number;
};

export default function QuantumEncryption() {
  const layersQuery = useQuery({
    queryKey: ["/api/encryption-layers"],
    queryFn: () => fetchJson<EncryptionLayer[]>("/api/encryption-layers"),
  });

  const protocolsQuery = useQuery({
    queryKey: ["/api/quantum-protocols"],
    queryFn: () => fetchJson<QuantumProtocol[]>("/api/quantum-protocols"),
  });

  return (
    <div className="min-h-screen bg-navy-900 text-slate-100 p-4">
      <div className="mx-auto max-w-6xl">
        <Link href="/dashboard">
          <Button variant="ghost" className="mb-6 text-slate-300 hover:bg-navy-800 hover:text-white">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="bg-navy-800 border-navy-600">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Shield className="mr-2 h-5 w-5 text-cyber-green" />
                Encryption Layers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(layersQuery.data ?? []).map((layer) => (
                <div key={layer.id} className="rounded-lg border border-navy-600 bg-navy-700 p-4">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="font-medium text-white">{layer.layerName}</p>
                    <Badge variant="outline" className="border-navy-500 text-slate-200">{layer.status}</Badge>
                  </div>
                  <p className="text-sm text-slate-300">{layer.encryptionStrength}-bit strength</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-navy-800 border-navy-600">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Zap className="mr-2 h-5 w-5 text-cyber-blue" />
                Quantum Protocols
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(protocolsQuery.data ?? []).map((protocol) => (
                <div key={protocol.id} className="rounded-lg border border-navy-600 bg-navy-700 p-4">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="font-medium text-white">{protocol.protocolName}</p>
                    <Badge className={protocol.isActive ? "bg-cyber-green/20 text-cyber-green" : "bg-red-500/20 text-red-300"}>
                      {protocol.isActive ? "ACTIVE" : "INACTIVE"}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-slate-300">
                    <p>Type: {protocol.protocolType}</p>
                    <p>Target: {protocol.targetType}</p>
                    <p>Effectiveness: {protocol.effectiveness}%</p>
                  </div>
                </div>
              ))}
              {!protocolsQuery.isLoading && (protocolsQuery.data ?? []).length === 0 && (
                <div className="rounded-lg border border-navy-600 bg-navy-700 p-4 text-sm text-slate-400">
                  No active quantum protocols are currently registered.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
