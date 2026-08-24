import { z } from "zod";

export const fanfiPlatformSchema = z.enum(["IOS", "ANDROID"]);
export const fanfiPhaseSchema = z.enum(["FANSCAN", "FANFLUX", "FANRES", "FANREST"]);
export const implementationTierSchema = z.enum(["DIRECT", "NATIVE_COMPANION", "PROVIDER", "MANAGED_DEVICE", "UNAVAILABLE", "VERIFY_REQUIRED"]);
export const supportStateSchema = z.enum(["SUPPORTED", "CONDITIONAL", "UNAVAILABLE", "UNKNOWN"]);
export const observationStateSchema = z.enum(["OBSERVED", "UNAVAILABLE", "UNKNOWN", "ERROR"]);
export const fanfiOutcomeSchema = z.enum(["SUCCEEDED", "DENIED", "BLOCKED", "FAILED", "PARTIAL", "CANCELLED", "UNKNOWN"]);
export const authorizationStateSchema = z.enum(["UNRESOLVED", "AUTHORIZED", "DENIED", "EXPIRED"]);

const ref = z.string().min(1).max(512).regex(/^[a-z][a-z0-9+.-]*:\/\/[A-Za-z0-9._:/-]+$/i);

export const triggerRecordSchema = z.object({
  triggerId: z.string().min(8).max(128),
  sourceType: z.string().min(1).max(120),
  platform: fanfiPlatformSchema,
  ownerRef: ref,
  deviceRef: ref,
  occurredAt: z.string().datetime(),
  requestedPhase: fanfiPhaseSchema,
  authorizationState: authorizationStateSchema,
  correlationId: z.string().min(8).max(128),
  sourceMetadataRef: ref.optional(),
}).strict();

export const scanRequestSchema = z.object({
  operationId: z.string().min(8).max(128),
  platform: fanfiPlatformSchema,
  implementationTier: implementationTierSchema,
  ownerRef: ref,
  deviceRef: ref,
  profileId: z.string().min(1).max(128),
  requestedSignals: z.array(z.string().min(1).max(120)).min(1).max(100),
  grantRef: ref,
  isolationRef: ref.optional(),
  trigger: triggerRecordSchema,
}).strict();

export const findingSchema = z.object({
  findingId: z.string().min(8).max(128),
  signalType: z.string().min(1).max(120),
  observation: observationStateSchema,
  severity: z.enum(["INFO", "ATTENTION", "HIGH", "CRITICAL"]).optional(),
  evidenceRefs: z.array(ref).max(50),
  explanation: z.string().min(1).max(1000),
  confidence: z.number().min(0).max(1).optional(),
}).strict();

export const approvalSchema = z.object({
  approvalId: z.string().min(1).max(128),
  ownerRef: ref,
  operationId: z.string().min(8).max(128),
  capability: z.string().min(1).max(160),
  exactScopeHash: z.string().regex(/^[a-f0-9]{64}$/i),
  executionBindingHash: z.string().regex(/^[a-f0-9]{64}$/i),
  approvedAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
  authenticatorRef: ref,
}).strict();

export const executionRequestSchema = z.object({
  operationId: z.string().min(8).max(128),
  platform: fanfiPlatformSchema,
  phase: z.enum(["FANFLUX", "FANRES", "FANREST"]),
  capability: z.string().min(1).max(160),
  ownerRef: ref,
  deviceRef: ref,
  affectedDataClass: z.enum(["PUBLIC", "INTERNAL", "CONFIDENTIAL", "RESTRICTED", "SECRET"]),
  destination: ref.optional(),
  reversibility: z.enum(["REVERSIBLE", "CONDITIONAL", "IRREVERSIBLE"]),
  sideEffectClass: z.enum(["NONE", "IDEMPOTENT", "NON_IDEMPOTENT"]),
  grantRef: ref,
  approval: approvalSchema.optional(),
  idempotencyKey: z.string().min(8).max(255),
  isolationRef: ref.optional(),
}).strict();

export const verificationReportSchema = z.object({
  operationId: z.string().min(8).max(128),
  observedState: z.enum(["EXPECTED", "DIFFERENT", "UNAVAILABLE", "UNKNOWN"]),
  method: z.string().min(1).max(255),
  evidenceRefs: z.array(ref).max(50),
  providerOutcome: z.enum(["NOT_CALLED", "CONFIRMED", "REJECTED", "TIMED_OUT", "UNKNOWN"]),
}).strict();

export type FanfiPlatform = z.infer<typeof fanfiPlatformSchema>;
export type FanfiPhase = z.infer<typeof fanfiPhaseSchema>;
export type TriggerRecord = z.infer<typeof triggerRecordSchema>;
export type ScanRequest = z.infer<typeof scanRequestSchema>;
export type Finding = z.infer<typeof findingSchema>;
export type ExecutionRequest = z.infer<typeof executionRequestSchema>;
export type VerificationReport = z.infer<typeof verificationReportSchema>;
