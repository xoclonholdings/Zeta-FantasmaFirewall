import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Network } from "lucide-react";

interface NetworkNode {
  id: number;
  nodeName: string;
  nodeType: string;
  status: string;
}

interface NetworkTopologyProps {
  data?: NetworkNode[];
}

export default function NetworkTopology({ data }: NetworkTopologyProps) {
  const nodes = data || [];
  const secureNodes = nodes.filter(node => node.status === "ONLINE").length;
  const networkIntegrity = nodes.length > 0 ? Math.round((secureNodes / nodes.length) * 100) : 100;

  const getNodeIcon = (nodeType: string) => {
    switch (nodeType) {
      case "ZETA_CORE": return "🧠";
      case "FIREWALL": return "🛡️";
      case "ZWAP": return "💰";
      case "QUANTUM": return "⚛️";
      case "ZEBULON": return "🏠";
      default: return "🔹";
    }
  };

  const getNodeColor = (nodeType: string) => {
    switch (nodeType) {
      case "ZETA_CORE": return "from-cyber-purple to-cyber-blue";
      case "FIREWALL": return "cyber-green/30 border-cyber-green";
      case "ZWAP": return "cyber-orange/30 border-cyber-orange";
      case "QUANTUM": return "cyber-blue/30 border-cyber-blue";
      case "ZEBULON": return "from-cyan-400/30 to-cyan-600/30 border-cyan-400";
      default: return "navy-600";
    }
  };

  return (
    <Card className="bg-navy-800 border-navy-600">
      <CardHeader>
        <CardTitle className="flex items-center text-white">
          <Network className="cyber-green mr-2" />
          Network Security Topology
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative h-80 bg-navy-700 rounded-lg p-4 overflow-hidden">
          {/* Central Node - Zeta Core */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-16 h-16 bg-gradient-to-br from-cyber-purple to-cyber-blue rounded-full flex items-center justify-center animate-glow">
              <span className="text-2xl">🧠</span>
            </div>
            <p className="text-xs text-center text-white mt-2 font-medium">Zeta Core</p>
          </div>
          
          {/* Surrounding Nodes */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
            <div className="w-12 h-12 bg-cyber-green/30 border-2 border-cyber-green rounded-full flex items-center justify-center">
              <span className="text-lg">🛡️</span>
            </div>
            <p className="text-xs text-center cyber-green mt-1">Firewall</p>
          </div>
          
          <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
            <div className="w-12 h-12 bg-cyber-orange/30 border-2 border-cyber-orange rounded-full flex items-center justify-center">
              <span className="text-lg">💰</span>
            </div>
            <p className="text-xs text-center cyber-orange mt-1">ZWAP!</p>
          </div>
          
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="w-12 h-12 bg-cyber-blue/30 border-2 border-cyber-blue rounded-full flex items-center justify-center">
              <span className="text-lg">⚛️</span>
            </div>
            <p className="text-xs text-center cyber-blue mt-1">Quantum</p>
          </div>
          
          <div className="absolute top-1/2 left-4 transform -translate-y-1/2">
            <div className="w-12 h-12 bg-cyan-400/30 border-2 border-cyan-400 rounded-full flex items-center justify-center">
              <span className="text-lg">🏠</span>
            </div>
            <p className="text-xs text-center text-cyan-400 mt-1">Zebulon</p>
          </div>
          
          {/* Connection Lines */}
          <svg className="absolute inset-0 w-full h-full">
            <defs>
              <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: "var(--cyber-blue)", stopOpacity: 0.5 }} />
                <stop offset="100%" style={{ stopColor: "var(--cyber-purple)", stopOpacity: 0.5 }} />
              </linearGradient>
            </defs>
            <line x1="50%" y1="50%" x2="50%" y2="20%" stroke="url(#connectionGradient)" strokeWidth="2" strokeDasharray="5,5">
              <animate attributeName="stroke-dashoffset" values="0;10" dur="2s" repeatCount="indefinite"/>
            </line>
            <line x1="50%" y1="50%" x2="80%" y2="50%" stroke="url(#connectionGradient)" strokeWidth="2" strokeDasharray="5,5">
              <animate attributeName="stroke-dashoffset" values="0;10" dur="2s" repeatCount="indefinite"/>
            </line>
            <line x1="50%" y1="50%" x2="50%" y2="80%" stroke="url(#connectionGradient)" strokeWidth="2" strokeDasharray="5,5">
              <animate attributeName="stroke-dashoffset" values="0;10" dur="2s" repeatCount="indefinite"/>
            </line>
            <line x1="50%" y1="50%" x2="20%" y2="50%" stroke="url(#connectionGradient)" strokeWidth="2" strokeDasharray="5,5">
              <animate attributeName="stroke-dashoffset" values="0;10" dur="2s" repeatCount="indefinite"/>
            </line>
          </svg>
          
          {/* Scanning Effect */}
          <div className="absolute inset-0 opacity-30">
            <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyber-blue to-transparent animate-scan" />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-lg font-bold cyber-green">{secureNodes}</p>
            <p className="text-xs text-slate-400">Secure Nodes</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold cyber-blue">{networkIntegrity}%</p>
            <p className="text-xs text-slate-400">Network Integrity</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
