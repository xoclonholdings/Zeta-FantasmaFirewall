import { z } from "zod";

const opaqueRef = z.string().min(1).max(512).regex(/^[a-z][a-z0-9+.-]*:\/\/[A-Za-z0-9._:/-]+$/i);
export const severitySchema = z.enum(["INFO", "ATTENTION", "HIGH", "CRITICAL"]);
export const executionStateSchema = z.enum(["PENDING", "RUNNING", "SUCCEEDED", "FAILED", "PARTIAL", "CANCELLED", "UNAUTHORIZED", "BLOCKED", "UNKNOWN"]);
const signedTime = { signature: z.string().regex(/^[a-f0-9]{64}$/i), expiresAt: z.string().datetime() };

export const authorizationRequestSchema = z.object({
  requestId: z.string().min(1).max(128), traceId: z.string().min(1).max(128), ownerId: z.string().min(1).max(255),
  galaxy: z.string().min(1).max(100), capability: z.string().min(1).max(160),
  operation: z.enum(["READ", "WRITE", "EXECUTE", "DELETE", "SEND", "PUBLISH", "TRANSACT", "ADMIN"]),
  resourceRefs: z.array(opaqueRef).max(100),
  destination: z.object({ kind: z.enum(["INTERNAL", "SAME_OWNER", "CROSS_GALAXY", "EXTERNAL", "PROVIDER"]), ref: opaqueRef }).strict(),
  affectedData: z.enum(["PUBLIC", "INTERNAL", "CONFIDENTIAL", "RESTRICTED", "SECRET"]),
  reversibility: z.enum(["REVERSIBLE", "COMPENSATABLE", "IRREVERSIBLE", "UNKNOWN"]),
  sideEffectClass: z.enum(["NONE", "IDEMPOTENT", "NON_IDEMPOTENT"]),
  executionBinding: z.object({ method: z.enum(["POST", "PUT", "PATCH", "DELETE"]), path: z.string().startsWith("/").max(1000), bodyHash: z.string().regex(/^[a-f0-9]{64}$/i) }).strict().optional(),
  certification: z.object({ certificationId: z.string().min(1).max(255), capability: z.string().min(1).max(160), state: z.enum(["CERTIFIED", "PROVISIONAL", "UNCERTIFIED", "REVOKED"]), version: z.string().min(1).max(100), certifiedAt: z.string().datetime(), ...signedTime }).strict(),
  requiredScopes: z.array(z.string().min(1).max(255)).min(1).max(100),
  grant: z.object({ grantId: z.string().min(1).max(255), ownerId: z.string().min(1).max(255), version: z.string().min(1).max(100), authorizedScopeHash: z.string().regex(/^[a-f0-9]{64}$/i), scopes: z.array(z.string().min(1).max(255)).max(100), issuedAt: z.string().datetime(), expiresAt: z.string().datetime(), revoked: z.boolean(), signature: z.string().regex(/^[a-f0-9]{64}$/i) }).strict(),
  idempotencyKey: z.string().min(8).max(255),
  approval: z.object({ approvalId: z.string().min(1).max(255), ownerId: z.string().min(1).max(255), approved: z.literal(true), scopeHash: z.string().regex(/^[a-f0-9]{64}$/i), approvedAt: z.string().datetime(), expiresAt: z.string().datetime(), approverActorId: z.string().min(1).max(255), signature: z.string().regex(/^[a-f0-9]{64}$/i) }).strict().optional(),
  isolation: z.object({ kind: z.enum(["PROCESS", "CONTAINER", "BROWSER", "PROVIDER"]), boundaryId: z.string().min(1).max(255), ephemeral: z.boolean(), networkPolicy: z.enum(["NONE", "ALLOWLIST", "PROVIDER_ONLY"]), attestedAt: z.string().datetime(), expiresAt: z.string().datetime(), signature: z.string().regex(/^[a-f0-9]{64}$/i) }).strict().optional(),
  credentialReferences: z.array(z.object({ name: z.string().min(1).max(100), ref: z.string().regex(/^(secret|vault|provider):\/\/[A-Za-z0-9._:/-]+$/) }).strict()).max(50).default([]),
  untrustedInputs: z.array(z.object({ kind: z.enum(["UPLOAD", "WEBPAGE", "RETRIEVED_SOURCE", "EXTERNAL_MESSAGE", "TOOL_RESULT", "PROVIDER_OUTPUT"]), sourceRef: opaqueRef, contentHash: z.string().regex(/^[a-f0-9]{64}$/i), policyOverrideAttempt: z.boolean().default(false), quarantined: z.boolean().default(false) }).strict()).max(100).default([]),
  provider: z.string().regex(/^[A-Za-z0-9._:-]{1,160}$/).optional(), connector: z.string().regex(/^[A-Za-z0-9._:-]{1,160}$/).optional(),
}).strict();

export const executionResultSchema = z.object({
  requestId: z.string().min(1).max(128), traceId: z.string().min(1).max(128), state: executionStateSchema,
  providerOutcome: z.enum(["NOT_CALLED", "CONFIRMED", "REJECTED", "TIMED_OUT", "RATE_LIMITED", "UNKNOWN"]),
  sideEffects: z.array(z.object({ ref: opaqueRef, state: z.enum(["CONFIRMED", "FAILED", "PARTIAL", "UNKNOWN"]), verificationRef: opaqueRef.optional() }).strict()).max(100),
  verification: z.object({ verified: z.boolean(), method: z.string().min(1).max(255), evidenceRefs: z.array(opaqueRef).max(100) }).strict(),
  recovery: z.object({ action: z.string().min(1).max(500), safeToRetry: z.boolean(), reconciliationRef: opaqueRef.optional() }).strict(),
}).strict();

export type AuthorizationRequest = z.infer<typeof authorizationRequestSchema>;
export type ExecutionResult = z.infer<typeof executionResultSchema>;
export type ZcosPrincipal = { ownerId: string; actorId: string; roles: string[]; scopes: string[]; authenticatedAt: string; nonce: string; authenticationMethod: "ZCOS_GATEWAY" | "ZENA_INTEGRATION" };
export type AuthorizationDecision = { decision: "ALLOW" | "REQUIRE_APPROVAL" | "BLOCK"; riskLevel: "INFO" | "ATTENTION" | "HIGH" | "CRITICAL"; scopeHash: string; reasons: string[]; recovery: { action: string; safeToRetry: boolean }; executionId?: string };
