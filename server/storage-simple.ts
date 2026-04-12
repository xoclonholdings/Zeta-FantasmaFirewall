import { 
  users, securityEvents, threatPatterns, systemMetrics, zwapProtection, 
  encryptionLayers, networkNodes, badActors, dataDeprecation, quantumProtocols,
  faqCategories, faqItems, howToGuides,
  type User, type InsertUser, type SecurityEvent, type InsertSecurityEvent,
  type ThreatPattern, type InsertThreatPattern, type SystemMetric, type InsertSystemMetric,
  type ZwapProtection, type InsertZwapProtection, type EncryptionLayer, type InsertEncryptionLayer,
  type NetworkNode, type InsertNetworkNode, type BadActor, type InsertBadActor,
  type DataDeprecation, type InsertDataDeprecation, type QuantumProtocol, type InsertQuantumProtocol,
  type FaqCategory, type InsertFaqCategory, type FaqItem, type InsertFaqItem,
  type HowToGuide, type InsertHowToGuide
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lt } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { cache } from "./cache";

// Disabled PostgresSessionStore to prevent IDX_session_expire error
// const PostgresSessionStore = connectPg(session);

export interface IStorage {
  sessionStore: any;
  
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByWallet(walletAddress: string): Promise<User | undefined>;
  getUserBySocialId(provider: string, socialId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createUserWithWallet(userData: { walletAddress: string; lastLoginAt?: Date }): Promise<User>;
  createSocialUser(userData: any): Promise<User>;
  updateUserLastLogin(userId: number): Promise<void>;

  // Security events
  getSecurityEvents(limit?: number, offset?: number): Promise<SecurityEvent[]>;
  getSecurityEventsByTimeRange(startTime: Date, endTime: Date): Promise<SecurityEvent[]>;
  getSecurityEventsByType(eventType: string, limit?: number): Promise<SecurityEvent[]>;
  createSecurityEvent(event: InsertSecurityEvent): Promise<SecurityEvent>;
  updateSecurityEventStatus(id: number, status: string): Promise<SecurityEvent | undefined>;
  bulkCreateSecurityEvents(events: InsertSecurityEvent[]): Promise<SecurityEvent[]>;

  // Threat patterns
  getThreatPatterns(): Promise<ThreatPattern[]>;
  createThreatPattern(pattern: InsertThreatPattern): Promise<ThreatPattern>;
  getActiveThreatPatterns(): Promise<ThreatPattern[]>;

  // System metrics
  getLatestSystemMetrics(): Promise<SystemMetric[]>;
  getSystemMetricsByType(metricType: string, limit?: number): Promise<SystemMetric[]>;
  createSystemMetric(metric: InsertSystemMetric): Promise<SystemMetric>;
  bulkCreateSystemMetrics(metrics: InsertSystemMetric[]): Promise<SystemMetric[]>;

  // ZWAP protection
  getZwapProtectionStatus(): Promise<ZwapProtection[]>;
  updateZwapProtection(id: number, status: string, integrityScore: number): Promise<ZwapProtection | undefined>;

  // Encryption layers
  getEncryptionLayers(): Promise<EncryptionLayer[]>;
  updateEncryptionLayer(id: number, status: string): Promise<EncryptionLayer | undefined>;

  // Network nodes
  getNetworkNodes(): Promise<NetworkNode[]>;
  updateNetworkNode(id: number, status: string): Promise<NetworkNode | undefined>;

  // Bad actor tracking
  getBadActors(limit?: number): Promise<BadActor[]>;
  getBadActorsByThreatLevel(minLevel: number): Promise<BadActor[]>;
  createBadActor(actor: InsertBadActor): Promise<BadActor>;
  updateBadActor(id: number, updates: Partial<BadActor>): Promise<BadActor | undefined>;
  escalateBadActor(identifier: string): Promise<BadActor | undefined>;

  // Data deprecation
  getActiveDeprecations(): Promise<DataDeprecation[]>;
  createDataDeprecation(deprecation: InsertDataDeprecation): Promise<DataDeprecation>;
  expireDeprecation(id: number): Promise<DataDeprecation | undefined>;

  // Quantum protocols
  getQuantumProtocols(): Promise<QuantumProtocol[]>;
  createQuantumProtocol(protocol: InsertQuantumProtocol): Promise<QuantumProtocol>;
  activateProtocol(id: number): Promise<QuantumProtocol | undefined>;
  
  // FAQ management
  getFaqCategories(): Promise<FaqCategory[]>;
  getFaqItems(): Promise<FaqItem[]>;
  createFaqItem(item: InsertFaqItem): Promise<FaqItem>;
  updateFaqItem(id: number, updates: Partial<InsertFaqItem>): Promise<FaqItem>;
  deleteFaqItem(id: number): Promise<void>;
  
  // How-To guides management
  getHowToGuides(): Promise<HowToGuide[]>;
  getHowToGuideById(id: number): Promise<HowToGuide | undefined>;
  createHowToGuide(guide: InsertHowToGuide): Promise<HowToGuide>;
  updateHowToGuide(id: number, updates: Partial<InsertHowToGuide>): Promise<HowToGuide>;
  deleteHowToGuide(id: number): Promise<void>;
}

// Simple Database Storage Implementation
export class DatabaseStorage implements IStorage {
  sessionStore = null; // Session management handled by application layer

  constructor() {
    // Session store disabled to prevent database errors
    // this.sessionStore = new PostgresSessionStore({ 
    //   conString: process.env.DATABASE_URL,
    //   createTableIfMissing: true 
    // });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const cacheKey = `user:${id}`;
    const cached = cache.getUser(cacheKey);
    if (cached) return cached;

    const [user] = await db.select().from(users).where(eq(users.id, id));
    if (user) {
      cache.setUser(cacheKey, user);
    }
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByWallet(walletAddress: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.walletAddress, walletAddress));
    return user;
  }

  async createUserWithWallet(userData: { walletAddress: string; lastLoginAt?: Date }): Promise<User> {
    const [user] = await db.insert(users).values({
      walletAddress: userData.walletAddress,
      lastLoginAt: userData.lastLoginAt || new Date(),
    }).returning();
    return user;
  }

  async updateUserLastLogin(userId: number): Promise<void> {
    await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, userId));
  }

  async getUserBySocialId(provider: string, socialId: string): Promise<User | undefined> {
    const column = provider === 'twitter' ? users.twitterId :
                   provider === 'instagram' ? users.instagramId :
                   provider === 'snapchat' ? users.snapchatId : null;
    
    if (!column) return undefined;
    
    const [user] = await db.select().from(users).where(eq(column, socialId));
    return user;
  }

  async createSocialUser(userData: any): Promise<User> {
    const [user] = await db.insert(users).values({
      ...userData,
      lastLoginAt: new Date(),
    }).returning();
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async upsertUser(userData: any): Promise<User> {
    // Check if user exists by ID (Replit Auth specific)
    if (userData.id) {
      const existingUser = await this.getUser(userData.id);
      if (existingUser) {
        // Update existing user
        const [updated] = await db.update(users)
          .set({
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            profileImageUrl: userData.profileImageUrl,
            lastLoginAt: new Date(),
          })
          .where(eq(users.id, userData.id))
          .returning();
        return updated;
      }
    }
    
    // Create new user
    const [newUser] = await db.insert(users).values({
      ...userData,
      lastLoginAt: new Date(),
    }).returning();
    return newUser;
  }

  // Security events
  async getSecurityEvents(limit: number = 50, offset: number = 0): Promise<SecurityEvent[]> {
    // Optimized query with proper limit handling for unlimited access
    const effectiveLimit = limit > 10000 ? 10000 : limit; // Performance cap
    const events = await db.select().from(securityEvents)
      .orderBy(desc(securityEvents.timestamp))
      .limit(effectiveLimit)
      .offset(offset);
    return events;
  }

  async getSecurityEventsByTimeRange(startTime: Date, endTime: Date): Promise<SecurityEvent[]> {
    const events = await db.select().from(securityEvents)
      .where(and(
        gte(securityEvents.timestamp, startTime),
        lt(securityEvents.timestamp, endTime)
      ))
      .orderBy(desc(securityEvents.timestamp));
    return events;
  }

  async getSecurityEventsByType(eventType: string, limit: number = 50): Promise<SecurityEvent[]> {
    const events = await db.select().from(securityEvents)
      .where(eq(securityEvents.eventType, eventType))
      .orderBy(desc(securityEvents.timestamp))
      .limit(limit);
    return events;
  }

  async bulkCreateSecurityEvents(events: InsertSecurityEvent[]): Promise<SecurityEvent[]> {
    if (events.length === 0) return [];
    
    // Optimize bulk inserts by batching
    const batchSize = 1000;
    const results: SecurityEvent[] = [];
    
    for (let i = 0; i < events.length; i += batchSize) {
      const batch = events.slice(i, i + batchSize);
      const created = await db.insert(securityEvents).values(batch).returning();
      results.push(...created);
    }
    
    return results;
  }

  async createSecurityEvent(event: InsertSecurityEvent): Promise<SecurityEvent> {
    const [securityEvent] = await db.insert(securityEvents).values(event).returning();
    // Invalidate cache when new events are created
    cache.invalidateDashboard();
    cache.invalidateMetrics();
    return securityEvent;
  }

  async updateSecurityEventStatus(id: number, status: string): Promise<SecurityEvent | undefined> {
    const [updated] = await db.update(securityEvents).set({ status }).where(eq(securityEvents.id, id)).returning();
    return updated || undefined;
  }

  // Threat patterns
  async getThreatPatterns(): Promise<ThreatPattern[]> {
    const patterns = await db.select().from(threatPatterns);
    return patterns;
  }

  async getActiveThreatPatterns(): Promise<ThreatPattern[]> {
    const patterns = await db.select().from(threatPatterns).where(eq(threatPatterns.isActive, true));
    return patterns;
  }

  async createThreatPattern(pattern: InsertThreatPattern): Promise<ThreatPattern> {
    const [threatPattern] = await db.insert(threatPatterns).values(pattern).returning();
    return threatPattern;
  }

  // System metrics
  async getLatestSystemMetrics(): Promise<SystemMetric[]> {
    const cacheKey = 'latest_metrics';
    const cached = cache.getMetrics(cacheKey);
    if (cached) return cached;

    // Optimized query with better performance for dashboard
    const metrics = await db.select().from(systemMetrics)
      .orderBy(desc(systemMetrics.timestamp))
      .limit(50); // Increased limit for better dashboard data
    
    cache.setMetrics(cacheKey, metrics);
    return metrics;
  }

  async getSystemMetricsByType(metricType: string, limit: number = 20): Promise<SystemMetric[]> {
    const metrics = await db.select().from(systemMetrics)
      .where(eq(systemMetrics.metricType, metricType))
      .orderBy(desc(systemMetrics.timestamp))
      .limit(limit);
    return metrics;
  }

  async bulkCreateSystemMetrics(metrics: InsertSystemMetric[]): Promise<SystemMetric[]> {
    if (metrics.length === 0) return [];
    
    // Optimize bulk inserts by batching  
    const batchSize = 1000;
    const results: SystemMetric[] = [];
    
    for (let i = 0; i < metrics.length; i += batchSize) {
      const batch = metrics.slice(i, i + batchSize);
      const created = await db.insert(systemMetrics).values(batch).returning();
      results.push(...created);
    }
    
    return results;
  }

  async createSystemMetric(metric: InsertSystemMetric): Promise<SystemMetric> {
    const [systemMetric] = await db.insert(systemMetrics).values(metric).returning();
    // Invalidate metrics cache when new data is added
    cache.invalidateMetrics();
    return systemMetric;
  }

  // ZWAP protection
  async getZwapProtectionStatus(): Promise<ZwapProtection[]> {
    const protection = await db.select().from(zwapProtection);
    return protection;
  }

  async updateZwapProtection(id: number, status: string, integrityScore: number): Promise<ZwapProtection | undefined> {
    const [updated] = await db.update(zwapProtection).set({ status, integrityScore }).where(eq(zwapProtection.id, id)).returning();
    return updated || undefined;
  }

  // Encryption layers
  async getEncryptionLayers(): Promise<EncryptionLayer[]> {
    const layers = await db.select().from(encryptionLayers).orderBy(encryptionLayers.layerNumber);
    return layers;
  }

  async updateEncryptionLayer(id: number, status: string): Promise<EncryptionLayer | undefined> {
    const [updated] = await db.update(encryptionLayers).set({ status }).where(eq(encryptionLayers.id, id)).returning();
    return updated || undefined;
  }

  // Network nodes
  async getNetworkNodes(): Promise<NetworkNode[]> {
    const nodes = await db.select().from(networkNodes);
    return nodes;
  }

  async updateNetworkNode(id: number, status: string): Promise<NetworkNode | undefined> {
    const [updated] = await db.update(networkNodes).set({ status }).where(eq(networkNodes.id, id)).returning();
    return updated || undefined;
  }

  // Bad actors
  async getBadActors(limit: number = 50): Promise<BadActor[]> {
    const actors = await db.select().from(badActors).limit(limit);
    return actors;
  }

  async getBadActorsByThreatLevel(minLevel: number): Promise<BadActor[]> {
    const actors = await db.select().from(badActors)
      .where(gte(badActors.threatLevel, minLevel))
      .orderBy(desc(badActors.threatLevel));
    return actors;
  }

  async createBadActor(actor: InsertBadActor): Promise<BadActor> {
    const [badActor] = await db.insert(badActors).values(actor).returning();
    return badActor;
  }

  async updateBadActor(id: number, updates: Partial<BadActor>): Promise<BadActor | undefined> {
    const [updated] = await db.update(badActors).set(updates).where(eq(badActors.id, id)).returning();
    return updated || undefined;
  }

  async escalateBadActor(identifier: string): Promise<BadActor | undefined> {
    const [actor] = await db.select().from(badActors).where(eq(badActors.identifier, identifier));
    if (actor) {
      const updated = await this.updateBadActor(actor.id, {
        threatLevel: Math.min(10, actor.threatLevel + 1),
        attempts: actor.attempts + 1,
        lastActivity: new Date(),
      });
      return updated;
    }
    return undefined;
  }

  // Data deprecation
  async getActiveDeprecations(): Promise<DataDeprecation[]> {
    const deprecations = await db.select().from(dataDeprecation)
      .where(eq(dataDeprecation.status, 'ACTIVE'));
    return deprecations;
  }

  async createDataDeprecation(deprecation: InsertDataDeprecation): Promise<DataDeprecation> {
    const [dataDeprecationItem] = await db.insert(dataDeprecation).values(deprecation).returning();
    return dataDeprecationItem;
  }

  async expireDeprecation(id: number): Promise<DataDeprecation | undefined> {
    const [updated] = await db.update(dataDeprecation).set({ status: "EXPIRED" }).where(eq(dataDeprecation.id, id)).returning();
    return updated || undefined;
  }

  // Quantum protocols
  async getQuantumProtocols(): Promise<QuantumProtocol[]> {
    const protocols = await db.select().from(quantumProtocols)
      .where(eq(quantumProtocols.isActive, true));
    return protocols;
  }

  async createQuantumProtocol(protocol: InsertQuantumProtocol): Promise<QuantumProtocol> {
    const [quantumProtocol] = await db.insert(quantumProtocols).values(protocol).returning();
    return quantumProtocol;
  }

  async activateProtocol(id: number): Promise<QuantumProtocol | undefined> {
    const [updated] = await db.update(quantumProtocols)
      .set({ isActive: true })
      .where(eq(quantumProtocols.id, id))
      .returning();
    return updated || undefined;
  }

  // FAQ management methods
  async getFaqCategories(): Promise<FaqCategory[]> {
    const categories = await db.select().from(faqCategories)
      .where(eq(faqCategories.isActive, true))
      .orderBy(faqCategories.displayOrder);
    return categories;
  }

  async getFaqItems(): Promise<FaqItem[]> {
    const items = await db.select().from(faqItems)
      .where(eq(faqItems.isActive, true))
      .orderBy(faqItems.displayOrder);
    return items;
  }

  async createFaqItem(item: InsertFaqItem): Promise<FaqItem> {
    const [created] = await db.insert(faqItems).values(item).returning();
    return created;
  }

  async updateFaqItem(id: number, updates: Partial<InsertFaqItem>): Promise<FaqItem> {
    const [updated] = await db.update(faqItems)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(faqItems.id, id))
      .returning();
    return updated;
  }

  async deleteFaqItem(id: number): Promise<void> {
    await db.update(faqItems)
      .set({ isActive: false })
      .where(eq(faqItems.id, id));
  }

  // How-To guides management methods
  async getHowToGuides(): Promise<HowToGuide[]> {
    const guides = await db.select().from(howToGuides)
      .where(eq(howToGuides.isActive, true))
      .orderBy(howToGuides.displayOrder);
    return guides;
  }

  async getHowToGuideById(id: number): Promise<HowToGuide | undefined> {
    const [guide] = await db.select().from(howToGuides)
      .where(eq(howToGuides.id, id));
    return guide;
  }

  async createHowToGuide(guide: InsertHowToGuide): Promise<HowToGuide> {
    const [created] = await db.insert(howToGuides).values(guide).returning();
    return created;
  }

  async updateHowToGuide(id: number, updates: Partial<InsertHowToGuide>): Promise<HowToGuide> {
    const [updated] = await db.update(howToGuides)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(howToGuides.id, id))
      .returning();
    return updated;
  }

  async deleteHowToGuide(id: number): Promise<void> {
    await db.update(howToGuides)
      .set({ isActive: false })
      .where(eq(howToGuides.id, id));
  }
}

// Use the simple database storage
export const storage = new DatabaseStorage();