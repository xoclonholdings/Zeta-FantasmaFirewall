import type { Express } from "express";

import { cache } from "../cache";
import { performanceMonitor } from "../performance-monitor";
import { storage } from "../storage";

export function registerSystemRoutes(app: Express) {
  app.get("/api/system-metrics", async (_req, res) => {
    try {
      res.json(await storage.getLatestSystemMetrics());
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch system metrics" });
    }
  });

  app.get("/api/integrations/config", (_req, res) => {
    res.json({
      availableIntegrations: [
        { id: "zebulon", name: "ZEBULON Web3 Interface" },
        { id: "zapier", name: "Zapier Automation" },
        { id: "custom_api", name: "Custom API Integration" },
      ],
      setupGuide: "See the how-to guides for integration instructions.",
    });
  });

  app.get("/api/performance", async (_req, res) => {
    try {
      res.json(await performanceMonitor.getPerformanceStats());
    } catch (error) {
      console.error("Performance stats error:", error);
      res.status(500).json({ error: "Failed to get performance statistics" });
    }
  });

  app.post("/api/cache/clear", (_req, res) => {
    cache.invalidateDashboard();
    cache.invalidateMetrics();
    cache.invalidateUser();
    res.json({ message: "All caches cleared successfully" });
  });

  app.get("/api/cache/stats", (_req, res) => {
    res.json(cache.getStats());
  });
}
