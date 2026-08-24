import type { Express } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { asyncRoute } from "../security/async-route";
import { requirePrincipal } from "../security/authentication";
import { requireExecutionReservation } from "../security/execution-reservation";
const read = requirePrincipal({ scopes: ["zena:content:read"], roles: ["content-admin"] }), write = requirePrincipal({ scopes: ["zena:content:write"], roles: ["content-admin"] });
const faq = z.object({ categoryId: z.number().int().positive(), question: z.string().min(1).max(500), answer: z.string().min(1).max(10000), displayOrder: z.number().int().min(0).optional(), isActive: z.boolean().optional() }).strict();
const guide = z.object({ title: z.string().min(1).max(255), description: z.string().max(2000).nullable().optional(), content: z.string().min(1).max(100000), category: z.string().max(100).nullable().optional(), difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(), estimatedTime: z.string().max(50).nullable().optional(), displayOrder: z.number().int().min(0).optional(), isActive: z.boolean().optional() }).strict();
export function registerContentRoutes(app: Express) {
  app.get("/api/faq", asyncRoute(async (_req, res) => { const [categories, items] = await Promise.all([storage.getFaqCategories(), storage.getFaqItems()]); res.json({ categories, items }); }));
  app.get("/api/how-to-guides", asyncRoute(async (_req, res) => res.json(await storage.getHowToGuides())));
  app.get("/api/how-to-guides/:id", asyncRoute(async (req, res) => { const item = await storage.getHowToGuideById(Number(req.params.id)); item ? res.json(item) : res.status(404).json({ error: "GUIDE_NOT_FOUND" }); }));
  app.get("/api/admin/faq", read, asyncRoute(async (_req, res) => { const [categories, items] = await Promise.all([storage.getFaqCategories(), storage.getFaqItems()]); res.json({ categories, items }); }));
  app.post("/api/admin/faq/items", write, requireExecutionReservation("zena.content.faq.create"), asyncRoute(async (req, res) => res.json(await storage.createFaqItem(faq.parse(req.body)))));
  app.put("/api/admin/faq/items/:id", write, requireExecutionReservation("zena.content.faq.update"), asyncRoute(async (req, res) => res.json(await storage.updateFaqItem(Number(req.params.id), faq.parse(req.body)))));
  app.delete("/api/admin/faq/items/:id", write, requireExecutionReservation("zena.content.faq.archive"), asyncRoute(async (req, res) => { await storage.deleteFaqItem(Number(req.params.id)); res.json({ success: true }); }));
  app.get("/api/admin/how-to-guides", read, asyncRoute(async (_req, res) => res.json(await storage.getHowToGuides())));
  app.post("/api/admin/how-to-guides", write, requireExecutionReservation("zena.content.guide.create"), asyncRoute(async (req, res) => res.json(await storage.createHowToGuide(guide.parse(req.body)))));
  app.put("/api/admin/how-to-guides/:id", write, requireExecutionReservation("zena.content.guide.update"), asyncRoute(async (req, res) => res.json(await storage.updateHowToGuide(Number(req.params.id), guide.parse(req.body)))));
  app.delete("/api/admin/how-to-guides/:id", write, requireExecutionReservation("zena.content.guide.archive"), asyncRoute(async (req, res) => { await storage.deleteHowToGuide(Number(req.params.id)); res.json({ success: true }); }));
}
