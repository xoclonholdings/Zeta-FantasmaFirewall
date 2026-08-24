import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import type { AuthorizationDecision, AuthorizationRequest, ZcosPrincipal } from "./contracts";
import { sha256, stableStringify } from "./redaction";

const consequential = new Set(["WRITE", "EXECUTE", "DELETE", "SEND", "PUBLISH", "TRANSACT", "ADMIN"]);
const isolated = /(^|:)(terminal|code|browser|provider|connector|external)(:|$)/i;
function hasScope(granted: string[], required: string): boolean { if (granted.includes("*") || granted.includes(required)) return true; const parts = required.split(":"); for (let i = parts.length - 1; i > 0; i--) if (granted.includes(`${parts.slice(0, i).join(":")}:*`)) return true; return false; }
function sign(secret: string, purpose: string, value: unknown): string { return createHmac("sha256", secret).update(`${purpose}\n${stableStringify(value)}`).digest("hex"); }
function safeEqual(a: string, b: string): boolean { const x = Buffer.from(a, "hex"), y = Buffer.from(b, "hex"); return x.length === y.length && timingSafeEqual(x, y); }
export const signAuthorizationGrant = (secret: string, value: Omit<AuthorizationRequest["grant"], "signature">) => sign(secret, "zcos-grant-v1", value);
export const signApproval = (secret: string, value: Omit<NonNullable<AuthorizationRequest["approval"]>, "signature">) => sign(secret, "zcos-approval-v1", value);
export const signCapabilityCertification = (secret: string, value: Omit<AuthorizationRequest["certification"], "signature">) => sign(secret, "zcos-capability-certification-v1", value);
export const signIsolationAttestation = (secret: string, value: Omit<NonNullable<AuthorizationRequest["isolation"]>, "signature">) => sign(secret, "zcos-isolation-attestation-v1", value);

export function computeAuthorizationScopeHash(request: Pick<AuthorizationRequest, "ownerId" | "galaxy" | "capability" | "operation" | "resourceRefs" | "destination" | "affectedData" | "reversibility" | "sideEffectClass" | "executionBinding" | "requiredScopes" | "provider" | "connector" | "credentialReferences">): string {
  return sha256(stableStringify({ ownerId: request.ownerId, galaxy: request.galaxy, capability: request.capability, operation: request.operation, resourceRefs: [...request.resourceRefs].sort(), destination: request.destination, affectedData: request.affectedData, reversibility: request.reversibility, sideEffectClass: request.sideEffectClass, executionBinding: request.executionBinding ?? null, requiredScopes: [...request.requiredScopes].sort(), provider: request.provider, connector: request.connector, credentialReferences: request.credentialReferences.map(({ name, ref }) => ({ name, ref })).sort((a, b) => a.name.localeCompare(b.name)) }));
}
export function computeApprovalScopeHash(request: AuthorizationRequest): string {
  return sha256(stableStringify({ authorizationScopeHash: computeAuthorizationScopeHash(request), certification: { id: request.certification.certificationId, state: request.certification.state, version: request.certification.version, expiresAt: request.certification.expiresAt }, grantId: request.grant.grantId, grantVersion: request.grant.version, grantAuthorizedScopeHash: request.grant.authorizedScopeHash, isolation: request.isolation ? { kind: request.isolation.kind, boundaryId: request.isolation.boundaryId, ephemeral: request.isolation.ephemeral, networkPolicy: request.isolation.networkPolicy, expiresAt: request.isolation.expiresAt } : null, untrustedInputs: request.untrustedInputs.map(({ kind, sourceRef, contentHash, policyOverrideAttempt, quarantined }) => ({ kind, sourceRef, contentHash, policyOverrideAttempt, quarantined })) }));
}
export function scopeAllows(granted: string[], required: string): boolean { return hasScope(granted, required); }

export function evaluateAuthorization(principal: ZcosPrincipal, request: AuthorizationRequest, now = new Date()): AuthorizationDecision {
  const reasons: string[] = [], scopeHash = computeApprovalScopeHash(request);
  const { signature: grantSig, ...grant } = request.grant;
  const grantSecret = process.env.ZCOS_GRANT_SIGNING_SECRET?.trim();
  if (principal.ownerId !== request.ownerId || request.grant.ownerId !== request.ownerId) reasons.push("Authenticated ownership does not match the requested or granted owner scope.");
  if (!grantSecret || !safeEqual(grantSig, signAuthorizationGrant(grantSecret, grant))) reasons.push("The authorization grant could not be verified as a canonical ZCOS grant.");
  if (request.grant.revoked || new Date(request.grant.expiresAt) <= now || new Date(request.grant.issuedAt) > now) reasons.push("The authorization grant is revoked, expired, or not yet valid.");
  if (request.grant.authorizedScopeHash !== computeAuthorizationScopeHash(request)) reasons.push("The requested capability, resource, destination, or data scope exceeds the signed authorization grant.");
  const missing = [...request.requiredScopes.filter((s) => !hasScope(principal.scopes, s)), ...request.requiredScopes.filter((s) => !hasScope(request.grant.scopes, s))];
  if (missing.length) reasons.push(`Required authorization scope is missing: ${Array.from(new Set(missing)).join(", ")}.`);

  const { signature: certSig, ...cert } = request.certification;
  const certSecret = process.env.ZCOS_CAPABILITY_SIGNING_SECRET?.trim();
  if (request.certification.capability !== request.capability || !certSecret || !safeEqual(certSig, signCapabilityCertification(certSecret, cert)) || new Date(request.certification.expiresAt) <= now || new Date(request.certification.certifiedAt) > now) reasons.push("The capability certification could not be verified or is not current.");
  if (["REVOKED", "UNCERTIFIED"].includes(request.certification.state) || (request.certification.state === "PROVISIONAL" && consequential.has(request.operation))) reasons.push("The requested capability is not certified for this execution.");
  if (request.affectedData === "SECRET" && request.destination.kind !== "INTERNAL") reasons.push("Secret-classified data cannot leave its protected internal boundary.");
  if (request.untrustedInputs.some((input) => input.policyOverrideAttempt)) reasons.push("Untrusted input attempted to redefine system policy or authority.");
  if (request.untrustedInputs.some((input) => input.kind === "UPLOAD" && !input.quarantined)) reasons.push("An upload has not passed its quarantine boundary.");

  const isolationRequired = isolated.test(request.capability) || ["PROVIDER", "EXTERNAL"].includes(request.destination.kind);
  if (isolationRequired && !request.isolation) reasons.push("This operation requires an explicit isolated execution boundary.");
  if (request.isolation) { const { signature, ...attestation } = request.isolation; const secret = process.env.ZCOS_ISOLATION_SIGNING_SECRET?.trim(); if (!secret || !safeEqual(signature, signIsolationAttestation(secret, attestation)) || new Date(request.isolation.expiresAt) <= now || new Date(request.isolation.attestedAt) > now) reasons.push("The isolated execution boundary is not backed by a valid current attestation."); if (!request.isolation.ephemeral && consequential.has(request.operation)) reasons.push("Consequential isolated execution must use an ephemeral boundary."); }
  if (consequential.has(request.operation) && !request.executionBinding) reasons.push("Consequential execution is not bound to an exact method, path, and request body.");
  if (reasons.length) return { decision: "BLOCK", riskLevel: reasons.some((r) => /ownership|revoked|policy|Secret|certified|exceeds/i.test(r)) ? "CRITICAL" : "HIGH", scopeHash, reasons, recovery: { action: "Correct the owner, grant, certification, input quarantine, or isolation boundary and submit a new request.", safeToRetry: false } };

  const approvalRequired = ["DELETE", "SEND", "PUBLISH", "TRANSACT", "ADMIN"].includes(request.operation) || ["IRREVERSIBLE", "UNKNOWN"].includes(request.reversibility) || request.sideEffectClass === "NON_IDEMPOTENT" || ["EXTERNAL", "PROVIDER"].includes(request.destination.kind);
  const riskLevel: AuthorizationDecision["riskLevel"] = request.reversibility === "IRREVERSIBLE" || request.operation === "TRANSACT" ? "CRITICAL" : approvalRequired ? "HIGH" : consequential.has(request.operation) ? "ATTENTION" : "INFO";
  if (approvalRequired && !request.approval) return { decision: "REQUIRE_APPROVAL", riskLevel, scopeHash, reasons: ["The operation has consequential, external, uncertain, or non-idempotent effects."], recovery: { action: "Obtain an approval bound to the returned scope hash, then resubmit without changing scope.", safeToRetry: true } };
  if (request.approval) { const { signature, ...approval } = request.approval; const secret = process.env.ZCOS_APPROVAL_SIGNING_SECRET?.trim(); if (request.approval.ownerId !== request.ownerId || !secret || !safeEqual(signature, signApproval(secret, approval))) return { decision: "BLOCK", riskLevel: "CRITICAL", scopeHash, reasons: ["The approval is not a valid owner-bound ZCOS approval attestation."], recovery: { action: "Obtain a new owner-bound approval for this scope.", safeToRetry: false } }; if (request.approval.scopeHash !== scopeHash) return { decision: "BLOCK", riskLevel: "CRITICAL", scopeHash, reasons: ["The operation scope changed after approval."], recovery: { action: "Discard the stale approval and obtain a new approval for the current scope.", safeToRetry: false } }; if (new Date(request.approval.expiresAt) <= now || new Date(request.approval.approvedAt) > now) return { decision: "BLOCK", riskLevel: "HIGH", scopeHash, reasons: ["The approval is expired or not yet valid."], recovery: { action: "Obtain a current approval for the unchanged scope.", safeToRetry: false } }; }
  return { decision: "ALLOW", riskLevel, scopeHash, reasons: ["Authenticated ownership, grant scope, certification, isolation, and approval requirements passed."], recovery: { action: "No recovery action is required.", safeToRetry: false }, executionId: randomUUID() };
}
