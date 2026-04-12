import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Brain,
  Lock,
  RefreshCw,
  Shield,
  Siren,
} from "lucide-react";

import { fetchJson } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type DashboardStatus = {
  zetaCore: {
    aiConfidence: number;
    neuralProcessing: number;
    threatsBlocked: number;
    isActive: boolean;
  };
  threatCounters: {
    aiInjection: number;
    corporateSabotage: number;
    marketManipulation: number;
    totalBlocked: number;
  };
  securityEvents: Array<{
    id: number;
    eventType: string;
    severity: string;
    description: string;
    timestamp: string;
  }>;
  systemMetrics: Array<{
    id: number;
    metricType: string;
    value: number;
    unit: string;
  }>;
  encryptionLayers: Array<{
    id: number;
    layerName: string;
    status: string;
  }>;
  timestamp: string;
};

const quickLinks = [
  { href: "/threat-reports", label: "Threat Reports", icon: AlertTriangle },
  { href: "/system-metrics", label: "System Metrics", icon: Activity },
  { href: "/quantum-encryption", label: "Quantum Encryption", icon: Lock },
  { href: "/emergency-protocols", label: "Emergency Protocols", icon: Siren },
  { href: "/faq", label: "FAQ", icon: Shield },
  { href: "/how-to", label: "How-To Guides", icon: BookOpen },
  { href: "/admin", label: "Admin Content", icon: Brain },
];

export default function Dashboard() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const statusQuery = useQuery({
    queryKey: ["/api/dashboard/status"],
    queryFn: () => fetchJson<DashboardStatus>("/api/dashboard/status"),
    refetchInterval: 15_000,
  });

  const lockdownMutation = useMutation({
    mutationFn: () =>
      fetchJson("/api/security-events", {
        method: "POST",
        body: JSON.stringify({
          eventType: "EMERGENCY_LOCKDOWN",
          severity: "CRITICAL",
          source: "DASHBOARD",
          description: "Emergency lockdown initiated from the dashboard",
          status: "ACTIVE",
        }),
      }),
    onSuccess: () => {
      toast({
        title: "Emergency event recorded",
        description: "The lockdown signal has been sent to the event stream.",
        variant: "destructive",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/status"] });
    },
    onError: () => {
      toast({
        title: "Lockdown failed",
        description: "The dashboard could not create the emergency event.",
        variant: "destructive",
      });
    },
  });

  const metrics = statusQuery.data?.systemMetrics ?? [];
  const recentEvents = statusQuery.data?.securityEvents?.slice(0, 5) ?? [];
  const encryptionLayers = statusQuery.data?.encryptionLayers ?? [];

  return (
    <div className="min-h-screen bg-navy-900 text-slate-100">
      <header className="border-b border-navy-600 bg-navy-800/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-cyber-blue">Fantasma Firewall</p>
            <h1 className="text-3xl font-semibold text-white">Operations Dashboard</h1>
            <p className="text-sm text-slate-400">
              The cleaned dashboard now routes directly to real pages and reflects backend data instead of demo-only detours.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              className="border-navy-500 bg-navy-700 text-slate-100 hover:bg-navy-600"
              onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/dashboard/status"] })}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button variant="destructive" onClick={() => lockdownMutation.mutate()} disabled={lockdownMutation.isPending}>
              <AlertTriangle className="mr-2 h-4 w-4" />
              {lockdownMutation.isPending ? "Sending..." : "Emergency Lockdown"}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="bg-navy-800 border-navy-600">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Brain className="mr-2 h-5 w-5 text-cyber-green" />
                Zeta Core
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Status</span>
                <Badge className={statusQuery.data?.zetaCore?.isActive ? "bg-cyber-green/20 text-cyber-green" : "bg-red-500/20 text-red-300"}>
                  {statusQuery.data?.zetaCore?.isActive ? "ACTIVE" : "OFFLINE"}
                </Badge>
              </div>
              <div className="text-3xl font-semibold text-white">{statusQuery.data?.zetaCore?.aiConfidence?.toFixed(1) ?? "--"}%</div>
              <p className="text-sm text-slate-400">AI confidence</p>
            </CardContent>
          </Card>

          <Card className="bg-navy-800 border-navy-600">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Shield className="mr-2 h-5 w-5 text-cyber-blue" />
                Threat Counters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-400">Total blocked</span><span>{statusQuery.data?.threatCounters.totalBlocked ?? 0}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">AI injection</span><span>{statusQuery.data?.threatCounters.aiInjection ?? 0}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Corporate sabotage</span><span>{statusQuery.data?.threatCounters.corporateSabotage ?? 0}</span></div>
            </CardContent>
          </Card>

          <Card className="bg-navy-800 border-navy-600">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Lock className="mr-2 h-5 w-5 text-cyber-green" />
                Encryption Layers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {encryptionLayers.slice(0, 4).map((layer) => (
                <div key={layer.id} className="flex items-center justify-between">
                  <span className="text-slate-400">{layer.layerName}</span>
                  <Badge variant="outline" className="border-navy-500 text-slate-200">
                    {layer.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-navy-800 border-navy-600">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Activity className="mr-2 h-5 w-5 text-cyber-orange" />
                Live Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {metrics.slice(0, 4).map((metric) => (
                <div key={metric.id} className="flex items-center justify-between">
                  <span className="text-slate-400">{metric.metricType}</span>
                  <span>{metric.value}{metric.unit}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <Card className="bg-navy-800 border-navy-600">
            <CardHeader>
              <CardTitle className="text-white">Recent Security Events</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentEvents.length === 0 ? (
                <p className="text-sm text-slate-400">
                  {statusQuery.isLoading ? "Loading security events..." : "No recent events were returned by the backend."}
                </p>
              ) : (
                recentEvents.map((event) => (
                  <div key={event.id} className="rounded-lg border border-navy-600 bg-navy-700 p-4">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <p className="font-medium text-white">{event.eventType.replace(/_/g, " ")}</p>
                      <Badge variant="outline" className="border-navy-500 text-slate-200">
                        {event.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-300">{event.description}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="bg-navy-800 border-navy-600">
            <CardHeader>
              <CardTitle className="text-white">Clean Navigation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickLinks.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href}>
                  <a className="flex items-center justify-between rounded-lg border border-navy-600 bg-navy-700 px-4 py-3 text-sm text-slate-100 transition hover:bg-navy-600">
                    <span className="flex items-center">
                      <Icon className="mr-3 h-4 w-4 text-cyber-blue" />
                      {label}
                    </span>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </a>
                </Link>
              ))}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
