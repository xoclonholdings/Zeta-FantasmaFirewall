import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ArrowLeft, Lock, Shield, Zap } from "lucide-react";
import { Link } from "wouter";

import { fetchJson } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type MitigationStatus = {
  totalBadActors: number;
  highThreatActors: number;
  activeProtocols: number;
  activeDeprecations: number;
  averageEffectiveness: number;
  criticalThreats: number;
};

export default function EmergencyProtocols() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const statusQuery = useQuery({
    queryKey: ["/api/threat-mitigation/status"],
    queryFn: () => fetchJson<MitigationStatus>("/api/threat-mitigation/status"),
  });

  const eventMutation = useMutation({
    mutationFn: (eventType: string) =>
      fetchJson("/api/security-events", {
        method: "POST",
        body: JSON.stringify({
          eventType,
          severity: eventType === "EMERGENCY_LOCKDOWN" ? "CRITICAL" : "HIGH",
          source: "EMERGENCY_PROTOCOLS",
          description: `${eventType} triggered from the emergency protocols screen`,
          status: "ACTIVE",
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/threat-mitigation/status"] });
      toast({ title: "Emergency event recorded", description: "The response action has been logged." });
    },
  });

  const status = statusQuery.data;

  return (
    <div className="min-h-screen bg-navy-900 text-slate-100 p-4">
      <div className="mx-auto max-w-6xl">
        <Link href="/dashboard">
          <Button variant="ghost" className="mb-6 text-slate-300 hover:bg-navy-800 hover:text-white">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <Card className="bg-navy-800 border-red-500/40">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <AlertTriangle className="mr-2 h-5 w-5 text-red-300" />
                Emergency Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              <Button variant="destructive" onClick={() => eventMutation.mutate("EMERGENCY_LOCKDOWN")}>
                <Lock className="mr-2 h-4 w-4" />
                Emergency Lockdown
              </Button>
              <Button className="bg-orange-600 hover:bg-orange-500" onClick={() => eventMutation.mutate("COUNTERMEASURE_ISOLATION")}>
                <Shield className="mr-2 h-4 w-4" />
                Isolation Protocol
              </Button>
              <Button className="bg-yellow-600 text-slate-950 hover:bg-yellow-500" onClick={() => eventMutation.mutate("COUNTERMEASURE_HONEYPOT")}>
                <Zap className="mr-2 h-4 w-4" />
                Activate Honeypot
              </Button>
              <Button className="bg-cyber-blue hover:bg-cyber-blue/80" onClick={() => eventMutation.mutate("COUNTERMEASURE_QUANTUM_DEFENSE")}>
                <Lock className="mr-2 h-4 w-4" />
                Quantum Defense
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-navy-800 border-navy-600">
            <CardHeader>
              <CardTitle className="text-white">Mitigation Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-slate-400">Tracked bad actors</span><span>{status?.totalBadActors ?? 0}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">High threat actors</span><span>{status?.highThreatActors ?? 0}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Active protocols</span><span>{status?.activeProtocols ?? 0}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Active deprecations</span><span>{status?.activeDeprecations ?? 0}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Critical threats</span><span>{status?.criticalThreats ?? 0}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Average effectiveness</span><span>{status?.averageEffectiveness ?? 0}%</span></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
