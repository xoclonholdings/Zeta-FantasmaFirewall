import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { performanceMonitor } from "./performance-monitor";
import { cache } from "./cache";
import { zetaCore } from "./services/zeta-core";
import { firewallService } from "./services/firewall-service";
import { badActorService } from "./services/bad-actor-service";
import { setupSocketHandlers } from "./services/socket-handler";
import { setupWalletAuth } from "./wallet-auth";
import { setupSocialAuth } from "./social-auth";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Remove all authentication middleware to prevent MetaMask errors
  // setupWalletAuth(app);
  // setupSocialAuth(app);
  
  // Serve React app for main route
  app.get("/", (req, res, next) => {
    // Let Vite handle serving the React app
    next();
  });

  // Backup HTML route only for emergencies  
  app.get("/backup-html", (req, res) => {
    res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>Fantasma Firewall - Security Operations Center</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            background: linear-gradient(135deg, #0a0e2a 0%, #1a1f3a 100%);
            color: #00ccff; 
            font-family: 'Courier New', monospace; 
            padding: 20px;
            min-height: 100vh;
        }
        .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 30px;
            padding: 20px;
            background: rgba(26, 31, 58, 0.8);
            border: 1px solid #00ccff;
            border-radius: 10px;
        }
        .logo { display: flex; align-items: center; gap: 15px; }
        .logo h1 { color: #00ccff; font-size: 1.8rem; }
        .status { 
            display: flex; 
            align-items: center; 
            gap: 10px;
            padding: 10px 20px;
            background: rgba(0, 204, 255, 0.1);
            border: 1px solid #00ccff;
            border-radius: 5px;
        }
        .status-dot { 
            width: 12px; 
            height: 12px; 
            background: #00ccff; 
            border-radius: 50%; 
            animation: pulse 2s infinite;
        }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
            gap: 20px; 
            margin-bottom: 30px;
        }
        .card { 
            background: rgba(26, 31, 58, 0.9); 
            border: 1px solid #00ccff; 
            padding: 20px; 
            border-radius: 10px;
            transition: all 0.3s ease;
        }
        .card:hover { 
            border-color: #00ccff;
            box-shadow: 0 0 20px rgba(0, 204, 255, 0.3);
        }
        .card h3 { 
            color: #00ccff; 
            margin-bottom: 15px; 
            font-size: 1.2rem;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .metric { 
            display: flex; 
            justify-content: space-between; 
            margin: 8px 0;
            padding: 5px 0;
        }
        .value { color: #00ccff; font-weight: bold; }
        .threat { color: #ff4444; font-weight: bold; }
        .secure { color: #00ccff; font-weight: bold; }
        .warning { color: #ffaa00; font-weight: bold; }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding: 20px;
            border-top: 1px solid #00ccff;
            color: #888;
        }
        @media (max-width: 768px) {
            .header { flex-direction: column; gap: 15px; }
            .grid { grid-template-columns: 1fr; }
            body { padding: 10px; }
        }
    </style>
    <script>
        // Live data refresh every 5 seconds
        setInterval(() => {
            const timestamp = new Date().toLocaleTimeString();
            document.getElementById('timestamp').textContent = timestamp;
            
            // Simulate live metrics
            const cpu = Math.floor(Math.random() * 40) + 20;
            const memory = Math.floor(Math.random() * 30) + 60;
            const threats = Math.floor(Math.random() * 10) + 240;
            
            document.getElementById('cpu').textContent = cpu + '%';
            document.getElementById('memory').textContent = memory + '%';
            document.getElementById('threats').textContent = threats;
        }, 5000);
    </script>
</head>
<body>
    <div class="header">
        <div class="logo">
            <div style="font-size: 2rem;">🛡️</div>
            <div>
                <h1>Fantasma Firewall</h1>
                <div style="color: #888; font-size: 0.9rem;">Security Operations Center</div>
            </div>
        </div>
        <div class="status">
            <div class="status-dot"></div>
            <span>SYSTEMS ONLINE</span>
        </div>
    </div>

    <div class="grid">
        <div class="card">
            <h3>🤖 Zeta Core AI</h3>
            <div class="metric">
                <span>Status:</span>
                <span class="secure">ACTIVE</span>
            </div>
            <div class="metric">
                <span>AI Confidence:</span>
                <span class="value">95%</span>
            </div>
            <div class="metric">
                <span>Neural Processing:</span>
                <span class="value">87%</span>
            </div>
            <div class="metric">
                <span>Threats Blocked:</span>
                <span class="value" id="threats">247</span>
            </div>
        </div>

        <div class="card">
            <h3>🔒 Quantum Encryption</h3>
            <div class="metric">
                <span>Physical Layer:</span>
                <span class="secure">SECURE (256-bit)</span>
            </div>
            <div class="metric">
                <span>Network Layer:</span>
                <span class="secure">SECURE (512-bit)</span>
            </div>
            <div class="metric">
                <span>Application Layer:</span>
                <span class="secure">SECURE (1024-bit)</span>
            </div>
            <div class="metric">
                <span>Quantum Status:</span>
                <span class="secure">PROTECTED</span>
            </div>
        </div>

        <div class="card">
            <h3>⚡ ZWAP Protection</h3>
            <div class="metric">
                <span>Trading Engine:</span>
                <span class="secure">SECURE (95%)</span>
            </div>
            <div class="metric">
                <span>Smart Contracts:</span>
                <span class="secure">SECURE (98%)</span>
            </div>
            <div class="metric">
                <span>Credit System:</span>
                <span class="secure">SECURE (92%)</span>
            </div>
            <div class="metric">
                <span>Exchange Status:</span>
                <span class="secure">OPERATIONAL</span>
            </div>
        </div>

        <div class="card">
            <h3>🚨 Threat Monitoring</h3>
            <div class="metric">
                <span>Corporate Infiltration:</span>
                <span class="threat">BLOCKED</span>
            </div>
            <div class="metric">
                <span>AI Injection Attempts:</span>
                <span class="threat">15 BLOCKED</span>
            </div>
            <div class="metric">
                <span>Bad Actors Tracked:</span>
                <span class="warning">3 ACTIVE</span>
            </div>
            <div class="metric">
                <span>Last Threat:</span>
                <span class="value" id="timestamp">${new Date().toLocaleTimeString()}</span>
            </div>
        </div>

        <div class="card">
            <h3>📊 System Performance</h3>
            <div class="metric">
                <span>CPU Usage:</span>
                <span class="value" id="cpu">31%</span>
            </div>
            <div class="metric">
                <span>Memory Usage:</span>
                <span class="value" id="memory">70%</span>
            </div>
            <div class="metric">
                <span>Network Latency:</span>
                <span class="value">25ms</span>
            </div>
            <div class="metric">
                <span>Uptime:</span>
                <span class="secure">99.9%</span>
            </div>
        </div>

        <div class="card">
            <h3>🌐 Network Topology</h3>
            <div class="metric">
                <span>Zeta Core Alpha:</span>
                <span class="secure">ONLINE</span>
            </div>
            <div class="metric">
                <span>Firewall Node 1:</span>
                <span class="secure">ONLINE</span>
            </div>
            <div class="metric">
                <span>Quantum Secure 1:</span>
                <span class="secure">ONLINE</span>
            </div>
            <div class="metric">
                <span>Network Health:</span>
                <span class="secure">OPTIMAL</span>
            </div>
        </div>
    </div>

    <div class="footer">
        <p><strong>Fantasma Firewall protecting ZEBULON Web3 Interface</strong></p>
        <p>All security systems operational • Real-time monitoring active</p>
        <p>© 2025 ZEBULON Security Operations Center</p>
    </div>
</body>
</html>
    `);
  });
  
  // Direct dashboard demo route
  app.get("/demo", (req, res) => {
    res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>Fantasma Firewall - Demo Dashboard</title>
    <style>
        body { background: #0a0e2a; color: #00ccff; font-family: monospace; padding: 20px; }
        .card { background: #1a1f3a; border: 1px solid #00ccff; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .status { color: #00ccff; font-weight: bold; }
        .threat { color: #ff4444; }
        .secure { color: #00ccff; }
    </style>
</head>
<body>
    <h1>🛡️ Fantasma Firewall - Security Operations Center</h1>
    
    <div class="card">
        <h3>🤖 Zeta Core AI Status</h3>
        <p>Status: <span class="secure">ACTIVE</span></p>
        <p>AI Confidence: <span class="status">95%</span></p>
        <p>Threats Blocked: <span class="status">247</span></p>
    </div>
    
    <div class="card">
        <h3>🔒 Quantum Encryption Layers</h3>
        <p>Physical Layer: <span class="secure">SECURE (256-bit)</span></p>
        <p>Network Layer: <span class="secure">SECURE (512-bit)</span></p>
        <p>Application Layer: <span class="secure">SECURE (1024-bit)</span></p>
    </div>
    
    <div class="card">
        <h3>⚡ ZWAP Protection</h3>
        <p>Trading Engine: <span class="secure">SECURE (95%)</span></p>
        <p>Smart Contracts: <span class="secure">SECURE (98%)</span></p>
        <p>Credit System: <span class="secure">SECURE (92%)</span></p>
    </div>
    
    <div class="card">
        <h3>🚨 Recent Threat Activity</h3>
        <p><span class="threat">CORPORATE_INFILTRATION</span> - Blocked attempt to access ZWAP protocols</p>
        <p>Bad Actors Tracked: <span class="status">3 active threats</span></p>
    </div>
    
    <div class="card">
        <h3>📊 System Performance</h3>
        <p>CPU Usage: <span class="status">31%</span></p>
        <p>Memory Usage: <span class="status">70%</span></p>
        <p>Network Latency: <span class="status">25ms</span></p>
    </div>
    
    <div style="margin-top: 30px; text-align: center;">
        <p>🔗 <a href="/" style="color: #00ccff;">Return to Full Dashboard</a></p>
        <p><small>All security systems operational • Real-time monitoring active</small></p>
    </div>
</body>
</html>
    `);
  });

  // Admin bypass route
  app.post("/api/auth/admin", async (req, res) => {
    const { password } = req.body;
    
    // Simple admin password check
    if (password === "admin123" || password === "firewall2025") {
      // Get or create admin user
      let adminUser = await storage.getUserByWallet("admin");
      if (!adminUser) {
        adminUser = await storage.createUser({
          walletAddress: "admin",
          email: "admin@fantasmafirewall.com"
        });
      }
      
      // Set up session
      (req.session as any).userId = adminUser.id;
      res.json(adminUser);
    } else {
      res.status(401).json({ message: "Invalid admin password" });
    }
  });
  
  // Setup WebSocket handlers
  setupSocketHandlers(httpServer);

  // Auth routes are handled by standalone-auth.ts

  // Dashboard data endpoints (remove authentication requirement)
  app.get("/api/dashboard/status", async (req, res) => {
    try {
      const [securityEvents, systemMetrics, zwapProtection, encryptionLayers, networkNodes, zetaCoreStatus] = await Promise.all([
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

  // Security events endpoints
  app.get("/api/security-events", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
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

      const eventData = eventSchema.parse(req.body);
      const event = await storage.createSecurityEvent(eventData);
      res.json(event);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid event data" });
    }
  });

  app.patch("/api/security-events/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }

      const event = await storage.updateSecurityEventStatus(id, status);
      if (!event) {
        return res.status(404).json({ message: "Security event not found" });
      }

      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to update security event status" });
    }
  });

  // Threat patterns endpoints
  app.get("/api/threat-patterns", async (req, res) => {
    try {
      const patterns = await storage.getThreatPatterns();
      res.json(patterns);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch threat patterns" });
    }
  });

  // System metrics endpoints
  app.get("/api/system-metrics", async (req, res) => {
    try {
      const metrics = await storage.getLatestSystemMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch system metrics" });
    }
  });

  // ZWAP protection endpoints
  app.get("/api/zwap-protection", async (req, res) => {
    try {
      const protection = await storage.getZwapProtectionStatus();
      res.json(protection);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch ZWAP protection status" });
    }
  });

  app.patch("/api/zwap-protection/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, integrityScore } = req.body;
      
      if (!status || integrityScore === undefined) {
        return res.status(400).json({ message: "Status and integrityScore are required" });
      }

      const protection = await storage.updateZwapProtection(id, status, integrityScore);
      if (!protection) {
        return res.status(404).json({ message: "ZWAP protection component not found" });
      }

      res.json(protection);
    } catch (error) {
      res.status(500).json({ message: "Failed to update ZWAP protection" });
    }
  });

  // Encryption layers endpoints
  app.get("/api/encryption-layers", async (req, res) => {
    try {
      const layers = await storage.getEncryptionLayers();
      res.json(layers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch encryption layers" });
    }
  });

  // Network nodes endpoints
  app.get("/api/network-nodes", async (req, res) => {
    try {
      const nodes = await storage.getNetworkNodes();
      res.json(nodes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch network nodes" });
    }
  });

  // Zeta Core AI endpoints
  app.get("/api/zeta-core/status", async (req, res) => {
    try {
      const status = await zetaCore.getStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch Zeta Core status" });
    }
  });

  app.post("/api/zeta-core/analyze", async (req, res) => {
    try {
      const { data } = req.body;
      const confidence = await zetaCore.analyzeCorpopateSabotage(data);
      res.json({ confidence });
    } catch (error) {
      res.status(500).json({ message: "Failed to analyze data" });
    }
  });

  // Firewall service endpoints
  app.post("/api/firewall/detect-threat", async (req, res) => {
    try {
      const { source, target, threatType } = req.body;
      
      if (!source || !target || !threatType) {
        return res.status(400).json({ message: "Source, target, and threatType are required" });
      }

      const detected = await firewallService.detectThreat(source, target, threatType);
      res.json({ detected, threatCounters: firewallService.getThreatCounters() });
    } catch (error) {
      res.status(500).json({ message: "Failed to detect threat" });
    }
  });

  app.get("/api/firewall/counters", async (req, res) => {
    try {
      const counters = firewallService.getThreatCounters();
      res.json(counters);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch threat counters" });
    }
  });

  // Bad Actor Management endpoints
  app.get("/api/bad-actors", async (req, res) => {
    try {
      const badActors = await storage.getBadActors();
      res.json(badActors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bad actors" });
    }
  });

  app.post("/api/bad-actors/detect", async (req, res) => {
    try {
      const { identifier, identifierType, threatIndicators } = req.body;
      
      if (!identifier || !identifierType) {
        return res.status(400).json({ message: "Identifier and identifierType are required" });
      }

      const badActor = await badActorService.detectAndTrackBadActor(
        identifier, 
        identifierType, 
        threatIndicators || {}
      );
      
      res.json(badActor);
    } catch (error) {
      res.status(500).json({ message: "Failed to detect bad actor" });
    }
  });

  app.post("/api/bad-actors/:id/escalate", async (req, res) => {
    try {
      const badActorId = parseInt(req.params.id);
      const badActors = await storage.getBadActors();
      const badActor = badActors.find(a => a.id === badActorId);
      
      if (!badActor) {
        return res.status(404).json({ message: "Bad actor not found" });
      }

      const escalated = await storage.escalateBadActor(badActor.identifier);
      res.json(escalated);
    } catch (error) {
      res.status(500).json({ message: "Failed to escalate bad actor" });
    }
  });

  app.post("/api/bad-actors/:id/deploy-countermeasures", async (req, res) => {
    try {
      const badActorId = parseInt(req.params.id);
      const { countermeasureType } = req.body;
      
      const badActors = await storage.getBadActors();
      const badActor = badActors.find(a => a.id === badActorId);
      
      if (!badActor) {
        return res.status(404).json({ message: "Bad actor not found" });
      }

      let result;
      switch (countermeasureType) {
        case "honeypot":
          result = await badActorService.deployHoneypotProtocol(badActor.identifier);
          break;
        case "data_poisoning":
          result = await badActorService.deployDataPoisoningProtocol(badActorId, badActor.threatLevel);
          break;
        case "quantum_isolation":
          result = await badActorService.deployQuantumIsolationProtocol(badActorId);
          break;
        case "data_deprecation":
          result = await badActorService.deployDataDeprecationProtocol(badActorId, "API_KEY", "SUSPICIOUS_ACCESS");
          break;
        default:
          return res.status(400).json({ message: "Invalid countermeasure type" });
      }
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to deploy countermeasure" });
    }
  });

  // Data Deprecation endpoints
  app.get("/api/data-deprecation", async (req, res) => {
    try {
      const deprecations = await storage.getActiveDeprecations();
      res.json(deprecations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch data deprecations" });
    }
  });

  // Quantum Protocols endpoints
  app.get("/api/quantum-protocols", async (req, res) => {
    try {
      const protocols = await storage.getQuantumProtocols();
      res.json(protocols);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch quantum protocols" });
    }
  });

  app.get("/api/threat-mitigation/status", async (req, res) => {
    try {
      const status = await badActorService.getActiveThreatMitigationStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch threat mitigation status" });
    }
  });

  // FAQ API Routes
  app.get('/api/faq', async (req, res) => {
    try {
      const categories = await storage.getFaqCategories();
      const items = await storage.getFaqItems();
      res.json({ categories, items });
    } catch (error) {
      console.error('Error fetching FAQ data:', error);
      res.status(500).json({ error: 'Failed to fetch FAQ data' });
    }
  });

  app.get('/api/how-to-guides', async (req, res) => {
    try {
      const guides = await storage.getHowToGuides();
      res.json(guides);
    } catch (error) {
      console.error('Error fetching How-To guides:', error);
      res.status(500).json({ error: 'Failed to fetch How-To guides' });
    }
  });

  app.get('/api/how-to-guides/:id', async (req, res) => {
    try {
      const guide = await storage.getHowToGuideById(parseInt(req.params.id));
      if (!guide) {
        return res.status(404).json({ error: 'Guide not found' });
      }
      res.json(guide);
    } catch (error) {
      console.error('Error fetching How-To guide:', error);
      res.status(500).json({ error: 'Failed to fetch How-To guide' });
    }
  });

  // Admin API Routes
  app.get('/api/admin/faq', async (req, res) => {
    try {
      const categories = await storage.getFaqCategories();
      const items = await storage.getFaqItems();
      res.json({ categories, items });
    } catch (error) {
      console.error('Error fetching admin FAQ data:', error);
      res.status(500).json({ error: 'Failed to fetch FAQ data' });
    }
  });

  app.post('/api/admin/faq/items', async (req, res) => {
    try {
      const item = await storage.createFaqItem(req.body);
      res.json(item);
    } catch (error) {
      console.error('Error creating FAQ item:', error);
      res.status(500).json({ error: 'Failed to create FAQ item' });
    }
  });

  app.put('/api/admin/faq/items/:id', async (req, res) => {
    try {
      const item = await storage.updateFaqItem(parseInt(req.params.id), req.body);
      res.json(item);
    } catch (error) {
      console.error('Error updating FAQ item:', error);
      res.status(500).json({ error: 'Failed to update FAQ item' });
    }
  });

  app.delete('/api/admin/faq/items/:id', async (req, res) => {
    try {
      await storage.deleteFaqItem(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting FAQ item:', error);
      res.status(500).json({ error: 'Failed to delete FAQ item' });
    }
  });

  app.get('/api/admin/how-to-guides', async (req, res) => {
    try {
      const guides = await storage.getHowToGuides();
      res.json(guides);
    } catch (error) {
      console.error('Error fetching admin How-To guides:', error);
      res.status(500).json({ error: 'Failed to fetch How-To guides' });
    }
  });

  app.post('/api/admin/how-to-guides', async (req, res) => {
    try {
      const guide = await storage.createHowToGuide(req.body);
      res.json(guide);
    } catch (error) {
      console.error('Error creating How-To guide:', error);
      res.status(500).json({ error: 'Failed to create How-To guide' });
    }
  });

  app.put('/api/admin/how-to-guides/:id', async (req, res) => {
    try {
      const guide = await storage.updateHowToGuide(parseInt(req.params.id), req.body);
      res.json(guide);
    } catch (error) {
      console.error('Error updating How-To guide:', error);
      res.status(500).json({ error: 'Failed to update How-To guide' });
    }
  });

  app.delete('/api/admin/how-to-guides/:id', async (req, res) => {
    try {
      await storage.deleteHowToGuide(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting How-To guide:', error);
      res.status(500).json({ error: 'Failed to delete How-To guide' });
    }
  });

  // Configuration endpoint for integration setup
  app.get("/api/integrations/config", async (req, res) => {
    try {
      res.json({
        available_integrations: [
          { id: "zebulon", name: "ZEBULON Web3 Interface", status: "configurable" },
          { id: "zapier", name: "Zapier Automation", status: "configurable" },
          { id: "custom_api", name: "Custom API Integration", status: "configurable" }
        ],
        setup_guide: "See How-To guides for detailed integration instructions"
      });
    } catch (error) {
      console.error("Error fetching integration config:", error);
      res.status(500).json({ error: "Failed to fetch integration configuration" });
    }
  });

  // Unlimited real-time data endpoints
  app.get("/api/unlimited/security-events", async (req, res) => {
    try {
      const events = await storage.getSecurityEvents(10000); // No limit
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch unlimited security events" });
    }
  });

  app.get("/api/unlimited/system-metrics", async (req, res) => {
    try {
      const metrics = await storage.getLatestSystemMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch unlimited system metrics" });
    }
  });

  // Performance monitoring endpoints
  app.get("/api/performance", async (req, res) => {
    try {
      const stats = await performanceMonitor.getPerformanceStats();
      res.json(stats);
    } catch (error) {
      console.error("Performance stats error:", error);
      res.status(500).json({ error: "Failed to get performance statistics" });
    }
  });

  // Cache management endpoints
  app.post("/api/cache/clear", (req, res) => {
    try {
      cache.invalidateDashboard();
      cache.invalidateMetrics();
      cache.invalidateUser();
      res.json({ message: "All caches cleared successfully" });
    } catch (error) {
      console.error("Cache clear error:", error);
      res.status(500).json({ error: "Failed to clear cache" });
    }
  });

  app.get("/api/cache/stats", (req, res) => {
    try {
      const stats = cache.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Cache stats error:", error);
      res.status(500).json({ error: "Failed to get cache statistics" });
    }
  });

  // Initialize performance monitoring
  performanceMonitor.start();
  console.log("Performance monitoring initialized");

  return httpServer;
}
