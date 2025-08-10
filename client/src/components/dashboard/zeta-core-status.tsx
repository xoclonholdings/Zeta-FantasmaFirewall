import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, Brain } from "lucide-react";
import zetaLogo from "@assets/zeta-logo_1752971695045.png";

interface ZetaCoreData {
  aiConfidence: number;
  neuralProcessing: number;
  isActive: boolean;
  analysisPatterns: number;
  threatsBlocked: number;
}

interface ZetaCoreStatusProps {
  data?: ZetaCoreData;
}

export default function ZetaCoreStatus({ data }: ZetaCoreStatusProps) {
  if (!data) {
    return (
      <Card className="bg-navy-800 border-navy-600">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <div className="w-48 h-10 bg-navy-600 rounded flex items-center justify-center mr-2">
              <img 
                src={zetaLogo} 
                alt="Zeta Core AI" 
                className="max-w-full max-h-full object-contain filter brightness-150"
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-slate-400">
            Initializing AI Sentry...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-navy-800 border-navy-600">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-white">
            <div className="w-48 h-10 bg-navy-600 rounded flex items-center justify-center mr-2">
              <img 
                src={zetaLogo} 
                alt="Zeta Core AI" 
                className="max-w-full max-h-full object-contain filter brightness-150"
              />
            </div>
          </CardTitle>
          <Badge variant={data.isActive ? "default" : "destructive"} className="bg-cyber-green/20 text-cyber-green">
            {data.isActive ? "ACTIVE" : "OFFLINE"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-navy-700 rounded-lg p-4">
            <p className="text-sm text-slate-400 mb-1">AI Confidence</p>
            <p className="text-2xl font-bold cyber-green">{data.aiConfidence.toFixed(1)}%</p>
          </div>
          <div className="bg-navy-700 rounded-lg p-4">
            <p className="text-sm text-slate-400 mb-1">Threats Blocked</p>
            <p className="text-2xl font-bold cyber-blue">{data.threatsBlocked.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Neural Processing</span>
            <span className="cyber-green">{data.neuralProcessing}%</span>
          </div>
          <div className="w-full bg-navy-600 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-cyber-green to-cyber-blue h-2 rounded-full transition-all duration-500" 
              style={{ width: `${data.neuralProcessing}%` }}
            />
          </div>
        </div>
        
        <div className="p-3 bg-cyber-purple/10 rounded-lg border border-cyber-purple/30">
          <p className="text-sm cyber-purple">
            <Brain className="inline w-4 h-4 mr-2" />
            Currently analyzing {data.analysisPatterns} suspicious patterns. Corporate sabotage detection algorithms running at optimal performance.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
