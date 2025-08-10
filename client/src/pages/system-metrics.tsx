import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, ArrowLeft, Cpu, HardDrive, Wifi } from "lucide-react";
import { Link } from "wouter";

export default function SystemMetrics() {
  const { data: systemMetrics, isLoading } = useQuery({
    queryKey: ['/api/system-metrics'],
    queryFn: async () => {
      const response = await fetch('/api/system-metrics', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch system metrics');
      return response.json();
    },
  });

  const getMetricColor = (value: number) => {
    if (value >= 90) return 'text-red-400';
    if (value >= 70) return 'text-yellow-400';
    return 'text-cyber-green';
  };

  const getMetricIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'cpu': return <Cpu className="w-5 h-5" />;
      case 'memory': return <HardDrive className="w-5 h-5" />;
      case 'network': return <Wifi className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
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
                <Activity className="w-6 h-6 mr-2 text-cyber-blue" />
                System Metrics
              </h1>
              <p className="text-slate-400">Real-time system performance monitoring</p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyber-blue mx-auto"></div>
            <p className="text-slate-400 mt-2">Loading system metrics...</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {/* Current Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {systemMetrics?.map((metric: any, index: number) => (
                <Card key={index} className="bg-navy-800 border-navy-600">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`${getMetricColor(metric.value)} flex-shrink-0`}>
                          {getMetricIcon(metric.metricType)}
                        </div>
                        <div>
                          <p className="text-slate-400 text-sm uppercase tracking-wide">
                            {metric.metricType}
                          </p>
                          <p className={`text-2xl font-bold ${getMetricColor(metric.value)}`}>
                            {metric.value}%
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge 
                          className={
                            metric.value >= 90 ? 'bg-red-600' :
                            metric.value >= 70 ? 'bg-yellow-600' : 'bg-green-600'
                          }
                        >
                          {metric.value >= 90 ? 'CRITICAL' :
                           metric.value >= 70 ? 'WARNING' : 'NORMAL'}
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="w-full bg-navy-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            metric.value >= 90 ? 'bg-red-500' :
                            metric.value >= 70 ? 'bg-yellow-500' : 'bg-cyber-green'
                          }`}
                          style={{ width: `${metric.value}%` }}
                        ></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )) || (
                <div className="col-span-4 text-center py-8">
                  <Activity className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-300">No system metrics available</p>
                  <p className="text-slate-400 text-sm">Monitoring systems may be offline</p>
                </div>
              )}
            </div>

            {/* Detailed System Information */}
            <Card className="bg-navy-800 border-navy-600">
              <CardHeader>
                <CardTitle className="text-white">System Status Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <h3 className="font-medium text-white">Performance</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Uptime:</span>
                        <span className="text-cyber-green">99.9%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Response Time:</span>
                        <span className="text-cyber-green">12ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Throughput:</span>
                        <span className="text-cyber-green">1.2K req/s</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="font-medium text-white">Security</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Threats Blocked:</span>
                        <span className="text-cyber-green">247</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Encryption:</span>
                        <span className="text-cyber-green">Active</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Firewall:</span>
                        <span className="text-cyber-green">Enabled</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="font-medium text-white">Network</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Bandwidth:</span>
                        <span className="text-cyber-green">850 Mbps</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Latency:</span>
                        <span className="text-cyber-green">8ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Connections:</span>
                        <span className="text-cyber-green">1,247</span>
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