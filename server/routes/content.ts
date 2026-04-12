import type { Express } from "express";

import { storage } from "../storage";

export function registerContentRoutes(app: Express) {
  app.get("/api/faq", async (_req, res) => {
    try {
      const [categories, items] = await Promise.all([storage.getFaqCategories(), storage.getFaqItems()]);
      res.json({ categories, items });
    } catch (error) {
      console.error("Error fetching FAQ data:", error);
      res.status(500).json({ error: "Failed to fetch FAQ data" });
    }
  });

  app.get("/api/how-to-guides", async (_req, res) => {
    try {
      const guides = await storage.getHowToGuides();
      res.json(guides);
    } catch (error) {
      console.error("Error fetching how-to guides:", error);
      res.status(500).json({ error: "Failed to fetch how-to guides" });
    }
  });

  app.get("/api/how-to-guides/:id", async (req, res) => {
    try {
      const guide = await storage.getHowToGuideById(Number(req.params.id));
      if (!guide) {
        res.status(404).json({ error: "Guide not found" });
        return;
      }
      res.json(guide);
    } catch (error) {
      console.error("Error fetching how-to guide:", error);
      res.status(500).json({ error: "Failed to fetch how-to guide" });
    }
  });

  app.get("/api/admin/faq", async (_req, res) => {
    try {
      const [categories, items] = await Promise.all([storage.getFaqCategories(), storage.getFaqItems()]);
      res.json({ categories, items });
    } catch (error) {
      console.error("Error fetching admin FAQ data:", error);
      res.status(500).json({ error: "Failed to fetch FAQ data" });
    }
  });

  app.post("/api/admin/faq/items", async (req, res) => {
    try {
      const item = await storage.createFaqItem(req.body);
      res.json(item);
    } catch (error) {
      console.error("Error creating FAQ item:", error);
      res.status(500).json({ error: "Failed to create FAQ item" });
    }
  });

  app.put("/api/admin/faq/items/:id", async (req, res) => {
    try {
      const item = await storage.updateFaqItem(Number(req.params.id), req.body);
      res.json(item);
    } catch (error) {
      console.error("Error updating FAQ item:", error);
      res.status(500).json({ error: "Failed to update FAQ item" });
    }
  });

  app.delete("/api/admin/faq/items/:id", async (req, res) => {
    try {
      await storage.deleteFaqItem(Number(req.params.id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting FAQ item:", error);
      res.status(500).json({ error: "Failed to delete FAQ item" });
    }
  });

  app.get("/api/admin/how-to-guides", async (_req, res) => {
    try {
      const guides = await storage.getHowToGuides();
      res.json(guides);
    } catch (error) {
      console.error("Error fetching admin how-to guides:", error);
      res.status(500).json({ error: "Failed to fetch how-to guides" });
    }
  });

  app.post("/api/admin/how-to-guides", async (req, res) => {
    try {
      const guide = await storage.createHowToGuide(req.body);
      res.json(guide);
    } catch (error) {
      console.error("Error creating how-to guide:", error);
      res.status(500).json({ error: "Failed to create how-to guide" });
    }
  });

  app.put("/api/admin/how-to-guides/:id", async (req, res) => {
    try {
      const guide = await storage.updateHowToGuide(Number(req.params.id), req.body);
      res.json(guide);
    } catch (error) {
      console.error("Error updating how-to guide:", error);
      res.status(500).json({ error: "Failed to update how-to guide" });
    }
  });

  app.delete("/api/admin/how-to-guides/:id", async (req, res) => {
    try {
      await storage.deleteHowToGuide(Number(req.params.id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting how-to guide:", error);
      res.status(500).json({ error: "Failed to delete how-to guide" });
    }
  });
}
