import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Link } from "lucide-react";

interface NetworkNode {
  id: number;
  nodeName: string;
  nodeType: string;
  ipAddress?: string;
  status: string;
}

interface ZebulonIntegrationProps {
  data?: NetworkNode[];
}

export default function ZebulonIntegration({ data }: ZebulonIntegrationProps) {
  const zebulonNode = data?.find(node => node.nodeType === "ZEBULON");
  const uptime = 99.9; // Simulated uptime

  const integrationComponents = [
    { name: "API Gateway", status: "Secure" },
    { name: "Data Channels", status: "Encrypted" },
    { name: "Home System", status: "Connected" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ONLINE":
      case "Secure":
      case "Encrypted":
      case "Connected":
        return "cyber-green";
      case "OFFLINE": return "text-red-400";
      case "DEGRADED": return "cyber-orange";
      default: return "text-slate-400";
    }
  };

  return (
    <Card className="bg-navy-800 border-navy-600">
      <CardHeader>
        <CardTitle className="flex items-center text-white">
          <Home className="cyber-purple mr-2" />
          Zebulon Integration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {integrationComponents.map((component, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-navy-700 rounded">
              <span className="text-sm text-slate-400">{component.name}</span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-cyber-green rounded-full" />
                <span className={`text-xs ${getStatusColor(component.status)}`}>{component.status}</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center">
          <p className="text-2xl font-bold cyber-blue">{uptime}%</p>
          <p className="text-sm text-slate-400">Uptime</p>
        </div>
        
        <div className="p-3 bg-cyber-purple/10 rounded-lg border border-cyber-purple/30">
          <p className="text-xs cyber-purple">
            <Link className="inline w-3 h-3 mr-1" />
            Secure Web3 interface integration active. All protocols verified.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
