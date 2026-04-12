import type { Express } from "express";
import { createServer, type Server } from "http";

import { performanceMonitor } from "./performance-monitor";
import { setupSocketHandlers } from "./services/socket-handler";
import { registerContentRoutes } from "./routes/content";
import { registerSecurityRoutes } from "./routes/security";
import { registerSystemRoutes } from "./routes/system";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  app.get("/", (_req, _res, next) => {
    next();
  });

  setupSocketHandlers(httpServer);
  registerSecurityRoutes(app);
  registerContentRoutes(app);
  registerSystemRoutes(app);

  performanceMonitor.start();
  console.log("Performance monitoring initialized");

  return httpServer;
}
