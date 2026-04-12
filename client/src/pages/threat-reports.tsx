import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowLeft, Shield } from "lucide-react";
import { Link } from "wouter";

export default function ThreatReports() {
  const { data: securityEvents, isLoading } = useQuery({
    queryKey: ['/api/security-events'],
    queryFn: async () => {
      const response = await fetch('/api/security-events?limit=100', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch security events');
      return response.json();
    },
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-600';
      case 'HIGH': return 'bg-orange-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'LOW': return 'bg-blue-500';
      default: return 'bg-gray-500';
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
                Threat Reports
              </h1>
              <p className="text-slate-400">Security event monitoring and analysis</p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyber-blue mx-auto"></div>
            <p className="text-slate-400 mt-2">Loading security events...</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {securityEvents?.map((event: any, index: number) => (
              <Card key={index} className="bg-navy-800 border-navy-600">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center text-white">
                      <Shield className="w-5 h-5 mr-2 text-cyber-blue" />
                      {event.eventType?.replace(/_/g, ' ') || 'Security Event'}
                    </CardTitle>
                    <Badge className={`${getSeverityColor(event.severity)} text-white`}>
                      {event.severity || 'UNKNOWN'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300 mb-2">{event.description}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Source:</span>
                      <span className="text-white ml-2">{event.source || 'Unknown'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Target:</span>
                      <span className="text-white ml-2">{event.target || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Status:</span>
                      <span className="text-white ml-2">{event.status || 'ACTIVE'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Timestamp:</span>
                      <span className="text-white ml-2">
                        {event.timestamp ? new Date(event.timestamp).toLocaleString() : 'Recent'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {(!securityEvents || securityEvents.length === 0) && (
              <Card className="bg-navy-800 border-navy-600">
                <CardContent className="text-center py-8">
                  <Shield className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-300">No security events detected</p>
                  <p className="text-slate-400 text-sm">All systems are secure</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}