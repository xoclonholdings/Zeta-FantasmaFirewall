import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";

interface SecurityEvent {
  id: number;
  eventType: string;
  severity: string;
  description: string;
  timestamp: string;
}

interface AlertSystemProps {
  data?: SecurityEvent[];
}

export default function AlertSystem({ data }: AlertSystemProps) {
  const events = data || [];
  const recentAlerts = events.slice(0, 3);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL": return "text-red-400 bg-red-500/10 border-red-500/30";
      case "HIGH": return "cyber-orange bg-cyber-orange/10 border-cyber-orange/30";
      case "MEDIUM": return "cyber-blue bg-cyber-blue/10 border-cyber-blue/30";
      default: return "text-slate-400 bg-slate-400/10 border-slate-400/30";
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAlertMessage = (event: SecurityEvent) => {
    switch (event.eventType) {
      case "CORPORATE_SABOTAGE":
        return "Corporate interference attempt detected on ZWAP! smart contracts";
      case "MARKET_MANIPULATION":
        return "Unusual trading pattern identified - monitoring enhanced";
      case "SYSTEM_INTEGRITY":
        return "System integrity verification completed successfully";
      default:
        return event.description;
    }
  };

  return (
    <Card className="bg-navy-800 border-navy-600">
      <CardHeader>
        <CardTitle className="flex items-center text-white">
          <Bell className="cyber-orange mr-2" />
          Alert System
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {recentAlerts.length === 0 ? (
            <div className="text-center text-slate-400 py-4">
              No recent alerts
            </div>
          ) : (
            recentAlerts.map((alert) => (
              <div key={alert.id} className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{alert.severity.charAt(0) + alert.severity.slice(1).toLowerCase()}</span>
                  <span className="text-xs">{formatTime(alert.timestamp)}</span>
                </div>
                <p className="text-xs">{getAlertMessage(alert)}</p>
              </div>
            ))
          )}
        </div>
        
        <Button 
          variant="outline" 
          className="w-full bg-navy-700 hover:bg-navy-600 text-white border-navy-600"
        >
          View All Alerts
        </Button>
      </CardContent>
    </Card>
  );
}
