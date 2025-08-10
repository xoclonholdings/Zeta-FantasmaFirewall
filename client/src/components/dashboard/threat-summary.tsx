import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface ThreatCounters {
  aiInjection: number;
  corporateSabotage: number;
  marketManipulation: number;
  totalBlocked: number;
}

interface ThreatSummaryProps {
  data?: ThreatCounters;
}

export default function ThreatSummary({ data }: ThreatSummaryProps) {
  const threatData = data || {
    aiInjection: 0,
    corporateSabotage: 0,
    marketManipulation: 0,
    totalBlocked: 0,
  };

  const activeThreats = 0; // No active threats currently
  const riskLevel = activeThreats === 0 ? "Low" : activeThreats < 5 ? "Medium" : "High";
  const riskPercentage = activeThreats === 0 ? 15 : activeThreats < 5 ? 50 : 85;

  return (
    <Card className="bg-navy-800 border-navy-600">
      <CardHeader>
        <CardTitle className="flex items-center text-white">
          <AlertTriangle className="cyber-orange mr-2" />
          Threat Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-3xl font-bold cyber-green">{activeThreats}</p>
          <p className="text-sm text-slate-400">Active Threats</p>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="bg-navy-700 rounded p-2">
            <p className="text-lg font-semibold cyber-blue">{threatData.totalBlocked}</p>
            <p className="text-xs text-slate-400">Blocked Today</p>
          </div>
          <div className="bg-navy-700 rounded p-2">
            <p className="text-lg font-semibold text-red-400">{threatData.corporateSabotage}</p>
            <p className="text-xs text-slate-400">High Priority</p>
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Risk Level</span>
            <span className={riskLevel === "Low" ? "cyber-green" : riskLevel === "Medium" ? "cyber-orange" : "text-red-400"}>
              {riskLevel}
            </span>
          </div>
          <div className="w-full bg-navy-600 rounded-full h-1">
            <div 
              className={`h-1 rounded-full ${riskLevel === "Low" ? "bg-cyber-green" : riskLevel === "Medium" ? "bg-cyber-orange" : "bg-red-400"}`}
              style={{ width: `${riskPercentage}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
