import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, CircleAlert } from "lucide-react";

interface ThreatCounters {
  aiInjection: number;
  corporateSabotage: number;
  marketManipulation: number;
  totalBlocked: number;
}

interface CorporateSabotageProps {
  data?: ThreatCounters;
}

export default function CorporateSabotage({ data }: CorporateSabotageProps) {
  const threatData = data || {
    aiInjection: 0,
    corporateSabotage: 0,
    marketManipulation: 0,
    totalBlocked: 0,
  };

  const patternRecognition = 89; // Simulated value

  return (
    <Card className="bg-navy-800 border-navy-600">
      <CardHeader>
        <CardTitle className="flex items-center text-white">
          <Search className="text-red-400 mr-2" />
          Corporate Sabotage Detection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">AI Injection Attempts</span>
            <span className="text-sm font-semibold text-red-400">{threatData.aiInjection} Blocked</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Access Blocking Attempts</span>
            <span className="text-sm font-semibold text-red-400">{threatData.corporateSabotage} Blocked</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Market Manipulation</span>
            <span className="text-sm font-semibold cyber-green">{threatData.marketManipulation} Detected</span>
          </div>
        </div>
        
        <div className="bg-navy-700 rounded-lg p-3">
          <p className="text-xs text-slate-400 mb-1">Pattern Recognition</p>
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-navy-600 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-red-500 to-cyber-orange h-2 rounded-full transition-all duration-500" 
                style={{ width: `${patternRecognition}%` }}
              />
            </div>
            <span className="text-xs font-semibold cyber-orange">{patternRecognition}%</span>
          </div>
        </div>
        
        <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/30">
          <p className="text-xs text-red-400">
            <CircleAlert className="inline w-3 h-3 mr-1" />
            High corporate threat activity detected. Enhanced monitoring enabled.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
