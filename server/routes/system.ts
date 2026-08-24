import type { Express } from "express";
import { cache } from "../cache";
import { performanceMonitor } from "../performance-monitor";
import { storage } from "../storage";
import { asyncRoute } from "../security/async-route";
import { requirePrincipal } from "../security/authentication";
import { requireExecutionReservation } from "../security/execution-reservation";
const monitoring = requirePrincipal({ scopes: ["integrity:monitoring:read"] }), rootRead = requirePrincipal({ scopes: ["zcos:root:operations:read"], roles: ["platform-owner"] }), rootWrite = requirePrincipal({ scopes: ["zcos:root:operations:write"], roles: ["platform-owner"] });
export function registerSystemRoutes(app: Express) {
  app.get("/api/system-metrics", monitoring, asyncRoute(async (_req, res) => res.json(await storage.getLatestSystemMetrics())));
  app.get("/api/integrations/config", requirePrincipal({ scopes: ["integrations:catalog:read"] }), (_req, res) => res.json({ availableIntegrations: [{ id: "zebulon", name: "Zebulon" }, { id: "custom_api", name: "Custom API" }], setupGuide: "Use ZCOS Settings → Integrations." }));
  app.get("/api/performance", rootRead, asyncRoute(async (_req, res) => res.json(await performanceMonitor.getPerformanceStats())));
  app.post("/api/cache/clear", rootWrite, requireExecutionReservation("zena.cache.clear"), (_req, res) => { cache.invalidateDashboard(); cache.invalidateMetrics(); cache.invalidateUser(); res.json({ message: "Caches cleared" }); });
  app.get("/api/cache/stats", rootRead, (_req, res) => res.json(cache.getStats()));
}
