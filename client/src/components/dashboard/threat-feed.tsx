import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, RefreshCw } from "lucide-react";

interface SecurityEvent {
  id: number;
  eventType: string;
  severity: string;
  source: string;
  target?: string;
  description: string;
  timestamp: string;
  status: string;
}

interface ThreatFeedProps {
  data?: SecurityEvent[];
  lastUpdate?: string;
  onRefresh?: () => void;
}

export default function ThreatFeed({ data, lastUpdate, onRefresh }: ThreatFeedProps) {
  const events = data || [];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL": return "text-red-400 bg-red-400/20";
      case "HIGH": return "text-red-400 bg-red-400/20";
      case "MEDIUM": return "cyber-orange bg-cyber-orange/20";
      case "LOW": return "cyber-green bg-cyber-green/20";
      default: return "text-slate-400 bg-slate-400/20";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "BLOCKED": return "cyber-green bg-cyber-green/20";
      case "MONITORED": return "cyber-orange bg-cyber-orange/20";
      case "VERIFIED": return "cyber-green bg-cyber-green/20";
      case "SECURE": return "cyber-blue bg-cyber-blue/20";
      case "HIGH": return "text-red-400 bg-red-400/20";
      default: return "text-slate-400 bg-slate-400/20";
    }
  };

  const formatEventDescription = (event: SecurityEvent) => {
    switch (event.eventType) {
      case "AI_INJECTION":
        return "AI Injection Attempt Blocked";
      case "CORPORATE_SABOTAGE":
        return "Corporate Interference Detected";
      case "MARKET_MANIPULATION":
        return "Market Manipulation Pattern Detected";
      case "SYSTEM_INTEGRITY":
        return "System Integrity Verification";
      case "COUNTERMEASURE":
        return "AI Countermeasures Deployed";
      default:
        return event.description;
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <Card className="bg-navy-800 border-navy-600">
      <CardHeader>
        <CardTitle className="flex items-center text-white">
          <Activity className="cyber-blue mr-2" />
          Real-time Threat Feed
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {events.length === 0 ? (
            <div className="text-center text-slate-400 py-8">
              No security events detected
            </div>
          ) : (
            events.map((event) => (
              <div key={event.id} className="flex items-center space-x-3 p-3 bg-navy-700 rounded-lg">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  event.severity === "CRITICAL" ? "bg-red-400" :
                  event.severity === "HIGH" ? "bg-cyber-orange" :
                  "bg-cyber-green"
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {formatEventDescription(event)}
                  </p>
                  <p className="text-xs text-slate-400">
                    Source: {event.source} • {formatTime(event.timestamp)}
                  </p>
                </div>
                <Badge className={`text-xs ${getSeverityColor(event.severity)}`}>
                  {event.status}
                </Badge>
              </div>
            ))
          )}
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-400">
            Last updated: {lastUpdate ? formatTime(lastUpdate) : "Never"}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            className="text-cyber-blue hover:text-cyber-blue/80"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
