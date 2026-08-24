import { pgTable, text, integer, boolean, timestamp, jsonb, varchar, index, serial, uniqueIndex } from "drizzle-orm/pg-core";

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

export const integrityEvents = pgTable("integrity_events", {
  id: varchar("id", { length: 36 }).primaryKey(),
  ownerId: varchar("owner_id", { length: 255 }).notNull(),
  actorId: varchar("actor_id", { length: 255 }).notNull(),
  requestId: varchar("request_id", { length: 128 }).notNull(),
  traceId: varchar("trace_id", { length: 128 }).notNull(),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  severity: varchar("severity", { length: 20 }).notNull(),
  outcome: varchar("outcome", { length: 32 }).notNull(),
  capability: varchar("capability", { length: 160 }),
  provider: varchar("provider", { length: 160 }),
  connector: varchar("connector", { length: 160 }),
  destination: varchar("destination", { length: 255 }),
  summary: text("summary").notNull(),
  permissionScope: jsonb("permission_scope").notNull().default([]),
  risk: jsonb("risk").notNull().default({}),
  evidence: jsonb("evidence").notNull().default({}),
  recovery: jsonb("recovery").notNull().default({}),
  eventHash: varchar("event_hash", { length: 64 }).notNull(),
  occurredAt: timestamp("occurred_at").defaultNow().notNull(),
}, (table) => [
  index("IDX_integrity_events_owner_time").on(table.ownerId, table.occurredAt),
  index("IDX_integrity_events_trace").on(table.traceId),
  index("IDX_integrity_events_outcome").on(table.outcome),
]);

export const executionRecords = pgTable("execution_records", {
  id: varchar("id", { length: 36 }).primaryKey(),
  ownerId: varchar("owner_id", { length: 255 }).notNull(),
  actorId: varchar("actor_id", { length: 255 }).notNull(),
  requestId: varchar("request_id", { length: 128 }).notNull(),
  traceId: varchar("trace_id", { length: 128 }).notNull(),
  idempotencyKey: varchar("idempotency_key", { length: 255 }).notNull(),
  requestFingerprint: varchar("request_fingerprint", { length: 64 }).notNull(),
  executionBindingHash: varchar("execution_binding_hash", { length: 64 }),
  approvalScopeHash: varchar("approval_scope_hash", { length: 64 }),
  capability: varchar("capability", { length: 160 }).notNull(),
  operation: varchar("operation", { length: 50 }).notNull(),
  destination: varchar("destination", { length: 255 }).notNull(),
  sideEffectClass: varchar("side_effect_class", { length: 32 }).notNull(),
  riskLevel: varchar("risk_level", { length: 20 }).notNull(),
  state: varchar("state", { length: 32 }).notNull(),
  attempts: integer("attempts").notNull().default(1),
  resultEvidence: jsonb("result_evidence").notNull().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("UQ_execution_owner_idempotency").on(table.ownerId, table.idempotencyKey),
  index("IDX_execution_owner_state").on(table.ownerId, table.state),
  index("IDX_execution_trace").on(table.traceId),
]);

export const integrityFindings = pgTable("integrity_findings", {
  id: varchar("id", { length: 36 }).primaryKey(),
  ownerId: varchar("owner_id", { length: 255 }).notNull(),
  severity: varchar("severity", { length: 20 }).notNull(),
  state: varchar("state", { length: 32 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  summary: text("summary").notNull(),
  affectedScope: jsonb("affected_scope").notNull().default({}),
  evidenceEventIds: jsonb("evidence_event_ids").notNull().default([]),
  recovery: jsonb("recovery").notNull().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [index("IDX_integrity_findings_owner_state").on(table.ownerId, table.state)]);

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

// Types
export type InsertUser = typeof users.$inferInsert;
export type SecurityEvent = typeof securityEvents.$inferSelect;
export type InsertSecurityEvent = typeof securityEvents.$inferInsert;
export type IntegrityEvent = typeof integrityEvents.$inferSelect;
export type InsertIntegrityEvent = typeof integrityEvents.$inferInsert;
export type ExecutionRecord = typeof executionRecords.$inferSelect;
export type InsertExecutionRecord = typeof executionRecords.$inferInsert;
export type IntegrityFinding = typeof integrityFindings.$inferSelect;
export type InsertIntegrityFinding = typeof integrityFindings.$inferInsert;
export type ThreatPattern = typeof threatPatterns.$inferSelect;
export type InsertThreatPattern = typeof threatPatterns.$inferInsert;
export type SystemMetric = typeof systemMetrics.$inferSelect;
export type InsertSystemMetric = typeof systemMetrics.$inferInsert;
export type ZwapProtection = typeof zwapProtection.$inferSelect;
export type InsertZwapProtection = typeof zwapProtection.$inferInsert;
export type EncryptionLayer = typeof encryptionLayers.$inferSelect;
export type InsertEncryptionLayer = typeof encryptionLayers.$inferInsert;
export type NetworkNode = typeof networkNodes.$inferSelect;
export type InsertNetworkNode = typeof networkNodes.$inferInsert;
export type BadActor = typeof badActors.$inferSelect;
export type InsertBadActor = typeof badActors.$inferInsert;
export type DataDeprecation = typeof dataDeprecation.$inferSelect;
export type InsertDataDeprecation = typeof dataDeprecation.$inferInsert;
export type QuantumProtocol = typeof quantumProtocols.$inferSelect;
export type InsertQuantumProtocol = typeof quantumProtocols.$inferInsert;
export type FaqCategory = typeof faqCategories.$inferSelect;
export type InsertFaqCategory = typeof faqCategories.$inferInsert;
export type FaqItem = typeof faqItems.$inferSelect;
export type InsertFaqItem = typeof faqItems.$inferInsert;
export type HowToGuide = typeof howToGuides.$inferSelect;
export type InsertHowToGuide = typeof howToGuides.$inferInsert;
