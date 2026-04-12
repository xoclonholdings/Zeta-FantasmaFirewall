import { storage } from "../storage";
import type { InsertSecurityEvent, InsertSystemMetric } from "@shared/schema";

export class FirewallService {
  private threatCounters = {
    aiInjection: 0,
    corporateSabotage: 0,
    marketManipulation: 0,
    totalBlocked: 0,
  };

  async detectThreat(source: string, target: string, threatType: string): Promise<boolean> {
    const patterns = await storage.getThreatPatterns();
    const matchingPattern = patterns.find(p => p.patternType === threatType);
    
    if (matchingPattern && matchingPattern.confidence > 80) {
      // Log security event
      await storage.createSecurityEvent({
        eventType: threatType,
        severity: this.getSeverityForThreatType(threatType),
        source,
        target,
        description: `${threatType} detected from ${source} targeting ${target}`,
        metadata: { patternId: matchingPattern.id, confidence: matchingPattern.confidence },
        status: "ACTIVE",
      });

      // Update counters
      this.updateThreatCounters(threatType);
      
      return true;
    }
    
    return false;
  }

  private getSeverityForThreatType(threatType: string): string {
    switch (threatType) {
      case "AI_INJECTION":
      case "CORPORATE_SABOTAGE":
        return "CRITICAL";
      case "MARKET_MANIPULATION":
        return "HIGH";
      default:
        return "MEDIUM";
    }
  }

  private updateThreatCounters(threatType: string) {
    this.threatCounters.totalBlocked++;
    
    switch (threatType) {
      case "AI_INJECTION":
        this.threatCounters.aiInjection++;
        break;
      case "CORPORATE_SABOTAGE":
        this.threatCounters.corporateSabotage++;
        break;
      case "MARKET_MANIPULATION":
        this.threatCounters.marketManipulation++;
        break;
    }
  }

  getThreatCounters() {
    return this.threatCounters;
  }

  async updateSystemMetrics() {
    // Simulate system metrics
    const metrics = [
      { metricType: "CPU", value: Math.floor(Math.random() * 30) + 15, unit: "%" },
      { metricType: "MEMORY", value: Math.floor(Math.random() * 40) + 50, unit: "%" },
      { metricType: "NETWORK", value: Math.floor(Math.random() * 30) + 30, unit: "%" },
      { metricType: "ENCRYPTION_STATUS", value: 100, unit: "%" },
    ];

    for (const metric of metrics) {
      await storage.createSystemMetric(metric);
    }
  }

  async verifyZwapSecurity(): Promise<boolean> {
    const protectionStatus = await storage.getZwapProtectionStatus();
    return protectionStatus.every(component => component.status === "SECURE" && component.integrityScore >= 90);
  }

  async simulateThreatDetection() {
    // Simulate various threat scenarios for demonstration
    const threats = [
      { source: "192.168.1.47", target: "ZWAP_API", type: "AI_INJECTION" },
      { source: "10.0.0.23", target: "XHI_CONTRACT", type: "CORPORATE_SABOTAGE" },
      { source: "172.16.0.15", target: "TRADING_ENGINE", type: "MARKET_MANIPULATION" },
    ];

    const randomThreat = threats[Math.floor(Math.random() * threats.length)];
    await this.detectThreat(randomThreat.source, randomThreat.target, randomThreat.type);
  }
}

export const firewallService = new FirewallService();
