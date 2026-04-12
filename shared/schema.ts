import { pgTable, text, integer, boolean, timestamp, jsonb, varchar, index, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  walletAddress: varchar("wallet_address").unique(),
  username: varchar("username"),
  email: varchar("email"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  lastLoginAt: timestamp("last_login_at"),
  
  // Social media IDs for OAuth
  twitterId: varchar("twitter_id").unique(),
  instagramId: varchar("instagram_id").unique(),
  snapchatId: varchar("snapchat_id").unique(),
  
  // Social media profiles
  twitterUsername: varchar("twitter_username"),
  instagramUsername: varchar("instagram_username"),
  snapchatUsername: varchar("snapchat_username"),
  profileImageUrl: varchar("profile_image_url"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const securityEvents = pgTable("security_events", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  eventType: text("event_type").notNull(),
  severity: text("severity").notNull(), // LOW, MEDIUM, HIGH, CRITICAL
  source: text("source").notNull(),
  target: text("target"),
  description: text("description").notNull(),
  metadata: jsonb("metadata"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  status: text("status").notNull().default("ACTIVE"), // ACTIVE, RESOLVED, INVESTIGATING
});

export const threatPatterns = pgTable("threat_patterns", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  patternName: text("pattern_name").notNull(),
  patternType: text("pattern_type").notNull(), // CORPORATE_SABOTAGE, AI_INJECTION, MARKET_MANIPULATION
  signature: text("signature").notNull(),
  confidence: integer("confidence").notNull(), // 0-100
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const systemMetrics = pgTable("system_metrics", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  metricType: text("metric_type").notNull(), // CPU, MEMORY, NETWORK, ENCRYPTION_STATUS
  value: integer("value").notNull(),
  unit: text("unit").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const zwapProtection = pgTable("zwap_protection", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  componentType: text("component_type").notNull(), // SMART_CONTRACT, TRADING_ENGINE, CREDIT_SYSTEM
  componentName: text("component_name").notNull(),
  status: text("status").notNull(), // SECURE, VULNERABLE, UNDER_ATTACK
  integrityScore: integer("integrity_score").notNull(), // 0-100
  lastVerified: timestamp("last_verified").defaultNow().notNull(),
});

export const encryptionLayers = pgTable("encryption_layers", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  layerName: text("layer_name").notNull(), // PHYSICAL, NETWORK, TRANSPORT, APPLICATION
  layerNumber: integer("layer_number").notNull(),
  status: text("status").notNull(), // SECURE, COMPROMISED, UPDATING
  encryptionStrength: integer("encryption_strength").notNull(), // bits
  lastKeyRotation: timestamp("last_key_rotation").defaultNow().notNull(),
});

export const networkNodes = pgTable("network_nodes", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  nodeName: text("node_name").notNull(),
  nodeType: text("node_type").notNull(), // FIREWALL, ZWAP, QUANTUM, ZEBULON, ZETA_CORE
  ipAddress: text("ip_address"),
  status: text("status").notNull(), // ONLINE, OFFLINE, DEGRADED
  lastHeartbeat: timestamp("last_heartbeat").defaultNow().notNull(),
});

export const badActors = pgTable("bad_actors", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  identifier: text("identifier").notNull(), // IP, wallet address, device fingerprint
  identifierType: text("identifier_type").notNull(), // IP_ADDRESS, WALLET, DEVICE_ID, EMAIL
  threatLevel: integer("threat_level").notNull(), // 1-10
  firstDetected: timestamp("first_detected").defaultNow().notNull(),
  lastActivity: timestamp("last_activity").defaultNow().notNull(),
  attempts: integer("attempts").notNull().default(1),
  status: text("status").notNull().default("ACTIVE"), // ACTIVE, QUARANTINED, BANNED, DEPRECATED
  countermeasures: text("countermeasures").array().notNull().default([]),
  metadata: jsonb("metadata"),
});

export const dataDeprecation = pgTable("data_deprecation", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  dataType: text("data_type").notNull(), // API_KEY, TOKEN, CONTRACT, WALLET_SEED
  deprecationReason: text("deprecation_reason").notNull(), // COMPROMISED, SUSPICIOUS_ACCESS, ROTATION_POLICY
  originalValue: text("original_value"), // Encrypted reference
  newValue: text("new_value"), // New replacement reference
  deprecatedAt: timestamp("deprecated_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  status: text("status").notNull().default("ACTIVE"), // ACTIVE, EXPIRED, REPLACED
});

export const quantumProtocols = pgTable("quantum_protocols", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  protocolName: text("protocol_name").notNull(),
  protocolType: text("protocol_type").notNull(), // HONEYPOT, DECOY, MIRROR_TRAP, DATA_POISON
  targetType: text("target_type").notNull(), // BAD_ACTOR, UNKNOWN_ACCESS, PERSISTENT_THREAT
  isActive: boolean("is_active").notNull().default(true),
  triggerConditions: jsonb("trigger_conditions").notNull(),
  response: jsonb("response").notNull(),
  effectiveness: integer("effectiveness").notNull().default(0), // 0-100
  deployedAt: timestamp("deployed_at").defaultNow().notNull(),
});

// FAQ Categories table
export const faqCategories = pgTable("faq_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// FAQ Items table
export const faqItems = pgTable("faq_items", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => faqCategories.id),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// How-To Guides table
export const howToGuides = pgTable("how_to_guides", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  content: text("content").notNull(),
  category: varchar("category", { length: 100 }),
  difficulty: varchar("difficulty", { length: 20 }).default("beginner"), // beginner, intermediate, advanced
  estimatedTime: varchar("estimated_time", { length: 50 }), // e.g., "5 minutes", "30 minutes"
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type User = typeof users.$inferSelect;

// Insert schemas without problematic omits
export const insertUserSchema = createInsertSchema(users);
export const insertSecurityEventSchema = createInsertSchema(securityEvents);
export const insertThreatPatternSchema = createInsertSchema(threatPatterns);
export const insertSystemMetricSchema = createInsertSchema(systemMetrics);
export const insertZwapProtectionSchema = createInsertSchema(zwapProtection);
export const insertEncryptionLayerSchema = createInsertSchema(encryptionLayers);
export const insertNetworkNodeSchema = createInsertSchema(networkNodes);
export const insertBadActorSchema = createInsertSchema(badActors);
export const insertDataDeprecationSchema = createInsertSchema(dataDeprecation);
export const insertQuantumProtocolSchema = createInsertSchema(quantumProtocols);
export const insertFaqCategorySchema = createInsertSchema(faqCategories);
export const insertFaqItemSchema = createInsertSchema(faqItems);
export const insertHowToGuideSchema = createInsertSchema(howToGuides);

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type SecurityEvent = typeof securityEvents.$inferSelect;
export type InsertSecurityEvent = z.infer<typeof insertSecurityEventSchema>;
export type ThreatPattern = typeof threatPatterns.$inferSelect;
export type InsertThreatPattern = z.infer<typeof insertThreatPatternSchema>;
export type SystemMetric = typeof systemMetrics.$inferSelect;
export type InsertSystemMetric = z.infer<typeof insertSystemMetricSchema>;
export type ZwapProtection = typeof zwapProtection.$inferSelect;
export type InsertZwapProtection = z.infer<typeof insertZwapProtectionSchema>;
export type EncryptionLayer = typeof encryptionLayers.$inferSelect;
export type InsertEncryptionLayer = z.infer<typeof insertEncryptionLayerSchema>;
export type NetworkNode = typeof networkNodes.$inferSelect;
export type InsertNetworkNode = z.infer<typeof insertNetworkNodeSchema>;
export type BadActor = typeof badActors.$inferSelect;
export type InsertBadActor = z.infer<typeof insertBadActorSchema>;
export type DataDeprecation = typeof dataDeprecation.$inferSelect;
export type InsertDataDeprecation = z.infer<typeof insertDataDeprecationSchema>;
export type QuantumProtocol = typeof quantumProtocols.$inferSelect;
export type InsertQuantumProtocol = z.infer<typeof insertQuantumProtocolSchema>;
export type FaqCategory = typeof faqCategories.$inferSelect;
export type InsertFaqCategory = z.infer<typeof insertFaqCategorySchema>;
export type FaqItem = typeof faqItems.$inferSelect;
export type InsertFaqItem = z.infer<typeof insertFaqItemSchema>;
export type HowToGuide = typeof howToGuides.$inferSelect;
export type InsertHowToGuide = z.infer<typeof insertHowToGuideSchema>;
