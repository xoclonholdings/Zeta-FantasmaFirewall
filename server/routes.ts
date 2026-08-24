import type { Express } from "express";
import { createServer, type Server } from "http";

import { registerContentRoutes } from "./routes/content";
import { registerSecurityRoutes } from "./routes/security";
import { registerSystemRoutes } from "./routes/system";
import { registerIntegrityRoutes } from "./routes/integrity";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  app.get("/", (_req, _res, next) => {
    next();
  });

  registerSecurityRoutes(app);
  registerIntegrityRoutes(app);
  registerContentRoutes(app);
  registerSystemRoutes(app);

  return httpServer;
}
