import type { Express } from "express";
import { z } from "zod";

import { storage } from "../storage";
import { badActorService } from "../services/bad-actor-service";
import { firewallService } from "../services/firewall-service";
import { zetaCore } from "../services/zeta-core";

export function registerSecurityRoutes(app: Express) {
  app.get("/api/integration/firewall/status", async (req, res) => {
    const configuredToken = process.env.ZETA_SHARED_TOKEN?.trim();
    const bearerToken = req.headers.authorization?.replace(/^Bearer\s+/i, "").trim();
    const headerToken = typeof req.headers["x-zeta-integration-token"] === "string"
      ? req.headers["x-zeta-integration-token"].trim()
      : "";

    if (configuredToken && bearerToken !== configuredToken && headerToken !== configuredToken) {
      res.status(401).json({ message: "Unauthorized integration request" });
      return;
    }

    try {
      const [systemMetrics, securityEvents, zetaCoreStatus] = await Promise.all([
        storage.getLatestSystemMetrics(),
        storage.getSecurityEvents(10),
        zetaCore.getStatus(),
      ]);

      res.json({
        system: "Fantasma Firewall",
        status: "operational",
        visibility: {
          publicBaseUrl: process.env.ZETA_PUBLIC_BASE_URL?.trim() || "",
          vpnBaseUrl: process.env.ZETA_VPN_BASE_URL?.trim() || "",
          vpnProvider: process.env.ZETA_VPN_PROVIDER?.trim() || "",
        },
        zetaCore: zetaCoreStatus,
        threatCounters: firewallService.getThreatCounters(),
        latestMetrics: systemMetrics,
        recentSecurityEvents: securityEvents,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch firewall integration status" });
    }
  });

  app.get("/api/firewall/public-status", async (_req, res) => {
    try {
      const [systemMetrics, zetaCoreStatus] = await Promise.all([
        storage.getLatestSystemMetrics(),
        zetaCore.getStatus(),
      ]);

      res.json({
        system: "Fantasma Firewall",
        status: "operational",
        publicBaseUrl: process.env.ZETA_PUBLIC_BASE_URL?.trim() || "",
        vpnProvider: process.env.ZETA_VPN_PROVIDER?.trim() || "",
        zetaCore: zetaCoreStatus,
        threatCounters: firewallService.getThreatCounters(),
        latestMetrics: systemMetrics,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch public firewall status" });
    }
  });

  app.get("/api/dashboard/status", async (_req, res) => {
    try {
      const [securityEvents, systemMetrics, zwapProtection, encryptionLayers, networkNodes, zetaCoreStatus] =
        await Promise.all([
          storage.getSecurityEvents(20),
          storage.getLatestSystemMetrics(),
          storage.getZwapProtectionStatus(),
          storage.getEncryptionLayers(),
          storage.getNetworkNodes(),
          zetaCore.getStatus(),
        ]);

      res.json({
        zetaCore: zetaCoreStatus,
        threatCounters: firewallService.getThreatCounters(),
        securityEvents,
        systemMetrics,
        zwapProtection,
        encryptionLayers,
        networkNodes,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard status" });
    }
  });

  app.get("/api/security-events", async (req, res) => {
    try {
      const limit = Number(req.query.limit) || 50;
      const events = await storage.getSecurityEvents(limit);
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch security events" });
    }
  });

  app.post("/api/security-events", async (req, res) => {
    try {
      const eventSchema = z.object({
        eventType: z.string(),
        severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
        source: z.string(),
        target: z.string().optional(),
        description: z.string(),
        metadata: z.any().optional(),
        status: z.string().default("ACTIVE"),
      });

      const event = await storage.createSecurityEvent(eventSchema.parse(req.body));
      res.json(event);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid event data" });
    }
  });

  app.patch("/api/security-events/:id/status", async (req, res) => {
    try {
      if (!req.body.status) {
        res.status(400).json({ message: "Status is required" });
        return;
      }

      const event = await storage.updateSecurityEventStatus(Number(req.params.id), req.body.status);
      if (!event) {
        res.status(404).json({ message: "Security event not found" });
        return;
      }

      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to update security event status" });
    }
  });

  app.get("/api/threat-patterns", async (_req, res) => {
    try {
      res.json(await storage.getThreatPatterns());
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch threat patterns" });
    }
  });

  app.get("/api/zwap-protection", async (_req, res) => {
    try {
      res.json(await storage.getZwapProtectionStatus());
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch ZWAP protection status" });
    }
  });

  app.patch("/api/zwap-protection/:id", async (req, res) => {
    try {
      const { status, integrityScore } = req.body;
      if (!status || integrityScore === undefined) {
        res.status(400).json({ message: "Status and integrityScore are required" });
        return;
      }

      const protection = await storage.updateZwapProtection(Number(req.params.id), status, integrityScore);
      if (!protection) {
        res.status(404).json({ message: "ZWAP protection component not found" });
        return;
      }

      res.json(protection);
    } catch (error) {
      res.status(500).json({ message: "Failed to update ZWAP protection" });
    }
  });

  app.get("/api/encryption-layers", async (_req, res) => {
    try {
      res.json(await storage.getEncryptionLayers());
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch encryption layers" });
    }
  });

  app.get("/api/network-nodes", async (_req, res) => {
    try {
      res.json(await storage.getNetworkNodes());
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch network nodes" });
    }
  });

  app.get("/api/zeta-core/status", async (_req, res) => {
    try {
      res.json(await zetaCore.getStatus());
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch Zeta Core status" });
    }
  });

  app.post("/api/zeta-core/analyze", async (req, res) => {
    try {
      const confidence = await zetaCore.analyzeCorpopateSabotage(req.body.data);
      res.json({ confidence });
    } catch (error) {
      res.status(500).json({ message: "Failed to analyze data" });
    }
  });

  app.post("/api/firewall/detect-threat", async (req, res) => {
    try {
      const { source, target, threatType } = req.body;
      if (!source || !target || !threatType) {
        res.status(400).json({ message: "Source, target, and threatType are required" });
        return;
      }

      const detected = await firewallService.detectThreat(source, target, threatType);
      res.json({ detected, threatCounters: firewallService.getThreatCounters() });
    } catch (error) {
      res.status(500).json({ message: "Failed to detect threat" });
    }
  });

  app.get("/api/firewall/counters", (_req, res) => {
    res.json(firewallService.getThreatCounters());
  });

  app.get("/api/bad-actors", async (_req, res) => {
    try {
      res.json(await storage.getBadActors());
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bad actors" });
    }
  });

  app.post("/api/bad-actors/detect", async (req, res) => {
    try {
      const { identifier, identifierType, threatIndicators } = req.body;
      if (!identifier || !identifierType) {
        res.status(400).json({ message: "Identifier and identifierType are required" });
        return;
      }

      res.json(await badActorService.detectAndTrackBadActor(identifier, identifierType, threatIndicators || {}));
    } catch (error) {
      res.status(500).json({ message: "Failed to detect bad actor" });
    }
  });

  app.post("/api/bad-actors/:id/escalate", async (req, res) => {
    try {
      const actor = (await storage.getBadActors()).find((item) => item.id === Number(req.params.id));
      if (!actor) {
        res.status(404).json({ message: "Bad actor not found" });
        return;
      }

      res.json(await storage.escalateBadActor(actor.identifier));
    } catch (error) {
      res.status(500).json({ message: "Failed to escalate bad actor" });
    }
  });

  app.post("/api/bad-actors/:id/deploy-countermeasures", async (req, res) => {
    try {
      const actor = (await storage.getBadActors()).find((item) => item.id === Number(req.params.id));
      if (!actor) {
        res.status(404).json({ message: "Bad actor not found" });
        return;
      }

      const { countermeasureType } = req.body;
      switch (countermeasureType) {
        case "honeypot":
          res.json(await badActorService.deployHoneypotProtocol(actor.identifier));
          return;
        case "data_poisoning":
          res.json(await badActorService.deployDataPoisoningProtocol(actor.id, actor.threatLevel));
          return;
        case "quantum_isolation":
          res.json(await badActorService.deployQuantumIsolationProtocol(actor.id));
          return;
        case "data_deprecation":
          res.json(await badActorService.deployDataDeprecationProtocol(actor.id, "API_KEY", "SUSPICIOUS_ACCESS"));
          return;
        default:
          res.status(400).json({ message: "Invalid countermeasure type" });
      }
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to deploy countermeasure" });
    }
  });

  app.get("/api/data-deprecation", async (_req, res) => {
    try {
      res.json(await storage.getActiveDeprecations());
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch data deprecations" });
    }
  });

  app.get("/api/quantum-protocols", async (_req, res) => {
    try {
      res.json(await storage.getQuantumProtocols());
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch quantum protocols" });
    }
  });

  app.get("/api/threat-mitigation/status", async (_req, res) => {
    try {
      res.json(await badActorService.getActiveThreatMitigationStatus());
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch threat mitigation status" });
    }
  });
}
