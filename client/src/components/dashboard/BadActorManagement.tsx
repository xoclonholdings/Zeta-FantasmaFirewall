import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  AlertTriangle, 
  Lock, 
  Zap, 
  Eye, 
  UserX, 
  Activity,
  Target,
  Database,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BadActor {
  id: number;
  identifier: string;
  identifierType: string;
  threatLevel: number;
  firstDetected: string;
  lastActivity: string;
  attempts: number;
  status: string;
  countermeasures: string[];
  metadata?: any;
}

interface QuantumProtocol {
  id: number;
  protocolName: string;
  protocolType: string;
  targetType: string;
  isActive: boolean;
  triggerConditions: any;
  response: any;
  effectiveness: number;
  deployedAt: string;
}

interface DataDeprecation {
  id: number;
  dataType: string;
  deprecationReason: string;
  originalValue: string | null;
  newValue: string | null;
  deprecatedAt: string;
  expiresAt: string;
  status: string;
}

interface BadActorManagementProps {
  badActors: BadActor[];
  quantumProtocols: QuantumProtocol[];
  dataDeprecations: DataDeprecation[];
  threatMitigationStatus: {
    totalBadActors: number;
    highThreatActors: number;
    activeProtocols: number;
    activeDeprecations: number;
    averageEffectiveness: number;
    criticalThreats: number;
  };
}

export function BadActorManagement({ 
  badActors = [], 
  quantumProtocols = [], 
  dataDeprecations = [],
  threatMitigationStatus
}: BadActorManagementProps) {
  const getThreatLevelColor = (level: number) => {
    if (level >= 9) return "bg-red-500";
    if (level >= 7) return "bg-orange-500";
    if (level >= 5) return "bg-yellow-500";
    if (level >= 3) return "bg-blue-500";
    return "bg-green-500";
  };

  const getThreatLevelBadge = (level: number) => {
    if (level >= 9) return "destructive";
    if (level >= 7) return "secondary";
    if (level >= 5) return "outline";
    return "default";
  };

  const getProtocolIcon = (type: string) => {
    switch (type) {
      case "HONEYPOT": return <Eye className="w-4 h-4" />;
      case "DATA_POISON": return <Database className="w-4 h-4" />;
      case "MIRROR_TRAP": return <Target className="w-4 h-4" />;
      case "QUANTUM_ISOLATION": return <Lock className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Threat Mitigation Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="bg-navy-800 border-navy-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Bad Actors</p>
                <p className="text-2xl font-bold text-red-400">
                  {threatMitigationStatus?.totalBadActors || 0}
                </p>
              </div>
              <UserX className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-navy-800 border-navy-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Critical Threats</p>
                <p className="text-2xl font-bold text-orange-400">
                  {threatMitigationStatus?.criticalThreats || 0}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-navy-800 border-navy-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Active Protocols</p>
                <p className="text-2xl font-bold text-cyan-400">
                  {threatMitigationStatus?.activeProtocols || 0}
                </p>
              </div>
              <Zap className="w-8 h-8 text-cyan-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-navy-800 border-navy-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Data Deprecations</p>
                <p className="text-2xl font-bold text-purple-400">
                  {threatMitigationStatus?.activeDeprecations || 0}
                </p>
              </div>
              <Database className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-navy-800 border-navy-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Effectiveness</p>
                <p className="text-2xl font-bold text-green-400">
                  {threatMitigationStatus?.averageEffectiveness || 0}%
                </p>
              </div>
              <Activity className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-navy-800 border-navy-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">High Threat</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {threatMitigationStatus?.highThreatActors || 0}
                </p>
              </div>
              <Shield className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bad Actors List */}
        <Card className="bg-navy-800 border-navy-600">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <UserX className="w-5 h-5 text-red-400" />
              <span>Active Bad Actors</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {badActors.slice(0, 10).map((actor) => (
                <div
                  key={actor.id}
                  className="flex items-center justify-between p-3 bg-navy-700 rounded-lg border border-navy-600"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge 
                        variant={getThreatLevelBadge(actor.threatLevel)}
                        className="text-xs"
                      >
                        Level {actor.threatLevel}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {actor.identifierType}
                      </Badge>
                    </div>
                    <p className="text-sm text-white font-mono">
                      {actor.identifier.length > 30 
                        ? `${actor.identifier.substring(0, 30)}...` 
                        : actor.identifier
                      }
                    </p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-xs text-slate-400">
                        {actor.attempts} attempts
                      </span>
                      <span className="text-xs text-slate-400">
                        {actor.countermeasures.length} countermeasures
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <div 
                      className={cn(
                        "w-3 h-3 rounded-full",
                        getThreatLevelColor(actor.threatLevel)
                      )}
                    />
                    <span className="text-xs text-slate-400">
                      {formatTimestamp(actor.lastActivity).split(' ')[1]}
                    </span>
                  </div>
                </div>
              ))}
              {badActors.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  <UserX className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No bad actors detected</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quantum Protocols */}
        <Card className="bg-navy-800 border-navy-600">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              <span>Quantum Defense Protocols</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {quantumProtocols.slice(0, 10).map((protocol) => (
                <div
                  key={protocol.id}
                  className="p-3 bg-navy-700 rounded-lg border border-navy-600"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getProtocolIcon(protocol.protocolType)}
                      <span className="text-sm font-medium text-white">
                        {protocol.protocolName}
                      </span>
                    </div>
                    <Badge 
                      variant={protocol.isActive ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {protocol.isActive ? "ACTIVE" : "INACTIVE"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-slate-400">
                        {protocol.protocolType}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-400">
                        {protocol.targetType}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress 
                        value={protocol.effectiveness} 
                        className="w-16 h-2"
                      />
                      <span className="text-xs text-green-400">
                        {protocol.effectiveness}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {quantumProtocols.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  <Zap className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No protocols deployed</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Deprecations */}
      <Card className="bg-navy-800 border-navy-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Database className="w-5 h-5 text-purple-400" />
            <span>Active Data Deprecations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dataDeprecations.slice(0, 9).map((deprecation) => (
              <div
                key={deprecation.id}
                className="p-3 bg-navy-700 rounded-lg border border-navy-600"
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-xs">
                    {deprecation.dataType}
                  </Badge>
                  <Badge 
                    variant={deprecation.status === "ACTIVE" ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {deprecation.status}
                  </Badge>
                </div>
                <p className="text-sm text-white mb-1">
                  {deprecation.deprecationReason}
                </p>
                <div className="flex items-center space-x-2 text-xs text-slate-400">
                  <Clock className="w-3 h-3" />
                  <span>
                    Expires: {formatTimestamp(deprecation.expiresAt).split(' ')[0]}
                  </span>
                </div>
              </div>
            ))}
            {dataDeprecations.length === 0 && (
              <div className="col-span-full text-center py-8 text-slate-400">
                <Database className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No active data deprecations</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}