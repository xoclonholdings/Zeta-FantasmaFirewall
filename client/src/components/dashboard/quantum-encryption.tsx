import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Atom, Key } from "lucide-react";

interface EncryptionLayer {
  id: number;
  layerName: string;
  layerNumber: number;
  status: string;
  encryptionStrength: number;
}

interface QuantumEncryptionProps {
  data?: EncryptionLayer[];
}

export default function QuantumEncryption({ data }: QuantumEncryptionProps) {
  const layers = data || [
    { id: 1, layerName: "Physical", layerNumber: 1, status: "SECURE", encryptionStrength: 2048 },
    { id: 2, layerName: "Network", layerNumber: 2, status: "SECURE", encryptionStrength: 2048 },
    { id: 3, layerName: "Transport", layerNumber: 3, status: "SECURE", encryptionStrength: 2048 },
    { id: 4, layerName: "Application", layerNumber: 4, status: "SECURE", encryptionStrength: 2048 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SECURE": return "cyber-green";
      case "UPDATING": return "cyber-orange";
      case "COMPROMISED": return "text-red-400";
      default: return "text-slate-400";
    }
  };

  return (
    <Card className="bg-navy-800 border-navy-600">
      <CardHeader>
        <CardTitle className="flex items-center text-white">
          <Atom className="cyber-blue mr-2" />
          Quantum Encryption
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {layers.map((layer) => (
            <div key={layer.id} className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Layer {layer.layerNumber} - {layer.layerName}</span>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${layer.status === "SECURE" ? "bg-cyber-green" : "bg-red-400"}`} />
                <span className={`text-xs ${getStatusColor(layer.status)}`}>
                  {layer.status === "SECURE" ? "Secure" : layer.status}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-3 bg-cyber-blue/10 rounded-lg">
          <p className="text-xs cyber-blue">
            <Key className="inline w-3 h-3 mr-1" />
            Quantum key distribution active. {layers[0]?.encryptionStrength || 2048}-bit entanglement verified.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
