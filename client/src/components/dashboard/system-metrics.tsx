import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

interface SystemMetric {
  id: number;
  metricType: string;
  value: number;
  unit: string;
}

interface SystemMetricsProps {
  data?: SystemMetric[];
}

export default function SystemMetrics({ data }: SystemMetricsProps) {
  const defaultMetrics = [
    { id: 1, metricType: "CPU", value: 23, unit: "%" },
    { id: 2, metricType: "MEMORY", value: 67, unit: "%" },
    { id: 3, metricType: "NETWORK", value: 45, unit: "%" },
  ];

  const metrics = data || defaultMetrics;
  const uptime = 99.98;
  const responseTime = 2.1;

  const getMetricColor = (metricType: string, value: number) => {
    switch (metricType) {
      case "CPU":
        return value < 50 ? "bg-cyber-green" : value < 80 ? "bg-cyber-orange" : "bg-red-400";
      case "MEMORY":
        return value < 70 ? "bg-cyber-blue" : value < 90 ? "bg-cyber-orange" : "bg-red-400";
      case "NETWORK":
        return value < 60 ? "bg-cyber-orange" : value < 80 ? "bg-cyber-orange" : "bg-red-400";
      default:
        return "bg-cyber-blue";
    }
  };

  const getMetricTextColor = (metricType: string, value: number) => {
    switch (metricType) {
      case "CPU":
        return value < 50 ? "cyber-green" : value < 80 ? "cyber-orange" : "text-red-400";
      case "MEMORY":
        return value < 70 ? "cyber-blue" : value < 90 ? "cyber-orange" : "text-red-400";
      case "NETWORK":
        return value < 60 ? "cyber-orange" : value < 80 ? "cyber-orange" : "text-red-400";
      default:
        return "cyber-blue";
    }
  };

  return (
    <Card className="bg-navy-800 border-navy-600">
      <CardHeader>
        <CardTitle className="flex items-center text-white">
          <BarChart3 className="cyber-blue mr-2" />
          System Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          {metrics.map((metric) => (
            <div key={metric.id} className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">{metric.metricType} Usage</span>
                <span className={`text-sm font-medium ${getMetricTextColor(metric.metricType, metric.value)}`}>
                  {metric.value}{metric.unit}
                </span>
              </div>
              <div className="w-full bg-navy-600 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${getMetricColor(metric.metricType, metric.value)}`}
                  style={{ width: `${metric.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-2 gap-2 mt-4">
          <div className="text-center bg-navy-700 rounded p-2">
            <p className="text-lg font-bold cyber-green">{uptime}%</p>
            <p className="text-xs text-slate-400">Uptime</p>
          </div>
          <div className="text-center bg-navy-700 rounded p-2">
            <p className="text-lg font-bold cyber-blue">{responseTime}s</p>
            <p className="text-xs text-slate-400">Response</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
