import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function CommunityProtection() {
  const protectedUsers = 12847;
  const communityMetrics = [
    { name: "Credit System Security", status: "Optimal" },
    { name: "Anti-Censorship", status: "Active" },
    { name: "Privacy Protection", status: "Enhanced" },
  ];

  return (
    <Card className="bg-navy-800 border-navy-600">
      <CardHeader>
        <CardTitle className="flex items-center text-white">
          <Users className="cyber-green mr-2" />
          Community Protection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-3xl font-bold cyber-green">{protectedUsers.toLocaleString()}</p>
          <p className="text-sm text-slate-400">Protected Users</p>
        </div>
        
        <div className="space-y-3">
          {communityMetrics.map((metric, index) => (
            <div key={index} className="flex justify-between">
              <span className="text-sm text-slate-400">{metric.name}</span>
              <span className="text-sm cyber-green">{metric.status}</span>
            </div>
          ))}
        </div>
        
        <div className="bg-navy-700 rounded-lg p-3">
          <p className="text-xs text-slate-400 mb-2">Community Governance</p>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-cyber-green rounded-full" />
            <span className="text-sm cyber-green">Active Participation</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
