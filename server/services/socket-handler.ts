import { Server as SocketServer } from "socket.io";
import { Server } from "http";
import { storage } from "../storage";
import { zetaCore } from "./zeta-core";
import { firewallService } from "./firewall-service";

export function setupSocketHandlers(httpServer: Server) {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", async (socket) => {
    console.log("SOC Dashboard client connected");

    // Send initial data
    const zetaCoreStatus = await zetaCore.getStatus();
    socket.emit("initialData", {
      zetaCore: zetaCoreStatus,
      threatCounters: firewallService.getThreatCounters(),
    });

    // Real-time updates every 5 seconds
    const updateInterval = setInterval(async () => {
      try {
        const [securityEvents, systemMetrics, zwapProtection, encryptionLayers, networkNodes, zetaCoreStatus] = await Promise.all([
          storage.getSecurityEvents(10),
          storage.getLatestSystemMetrics(),
          storage.getZwapProtectionStatus(),
          storage.getEncryptionLayers(),
          storage.getNetworkNodes(),
          zetaCore.getStatus(),
        ]);

        socket.emit("securityUpdate", {
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
        console.error("Error sending security update:", error);
      }
    }, 5000);

    socket.on("disconnect", () => {
      console.log("SOC Dashboard client disconnected");
      clearInterval(updateInterval);
    });

    // Handle manual refresh requests
    socket.on("refreshData", async () => {
      try {
        const [securityEvents, systemMetrics, zwapProtection, encryptionLayers, networkNodes, zetaCoreStatus] = await Promise.all([
          storage.getSecurityEvents(10),
          storage.getLatestSystemMetrics(),
          storage.getZwapProtectionStatus(),
          storage.getEncryptionLayers(),
          storage.getNetworkNodes(),
          zetaCore.getStatus(),
        ]);

        socket.emit("securityUpdate", {
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
        console.error("Error refreshing data:", error);
      }
    });

    // Handle threat investigation
    socket.on("investigateThreat", async (eventId: number) => {
      try {
        await storage.updateSecurityEventStatus(eventId, "INVESTIGATING");
        socket.emit("threatUpdated", { eventId, status: "INVESTIGATING" });
      } catch (error) {
        console.error("Error investigating threat:", error);
      }
    });

    // Handle threat resolution
    socket.on("resolveThreat", async (eventId: number) => {
      try {
        await storage.updateSecurityEventStatus(eventId, "RESOLVED");
        socket.emit("threatUpdated", { eventId, status: "RESOLVED" });
      } catch (error) {
        console.error("Error resolving threat:", error);
      }
    });
  });

  return io;
}
