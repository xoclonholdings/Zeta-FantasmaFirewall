import { randomUUID } from "node:crypto";
import type { ZcosPrincipal } from "../security/contracts";
import { recordIntegrityEvent } from "../security/integrity-audit";
import { getCapabilityManifest } from "./capability-registry";
import type { ExecutionRequest, Finding, ScanRequest, TriggerRecord, VerificationReport } from "./contracts";

const ownerRef = (ownerId: string) => `zcos://owner/${ownerId}`;
const seenTriggers = new Set<string>();
const issuedActions = new Map<string, { ownerId: string; request: ExecutionRequest; state: "AWAITING_DEVICE" | "VERIFIED" | "UNKNOWN"; createdAt: string }>();

export function assertOwnerBinding(principal: ZcosPrincipal, ref: string) {
  if (ref !== ownerRef(principal.ownerId)) throw new Error("OWNER_SCOPE_MISMATCH");
}

export async function acceptTrigger(principal: ZcosPrincipal, trigger: TriggerRecord) {
  assertOwnerBinding(principal, trigger.ownerRef);
  if (trigger.authorizationState !== "AUTHORIZED") throw new Error("TRIGGER_NOT_AUTHORIZED");
  if (seenTriggers.has(`${principal.ownerId}:${trigger.triggerId}`)) return { duplicate: true, triggerId: trigger.triggerId };
  seenTriggers.add(`${principal.ownerId}:${trigger.triggerId}`);
  await recordIntegrityEvent({
    principal, requestId: trigger.triggerId, traceId: trigger.correlationId,
    eventType: "FANFI_TRIGGER_RECEIVED", category: "INTEGRITY", severity: "INFO", outcome: "OBSERVED",
    capability: "fanfi.trigger", destination: trigger.deviceRef,
    summary: `FanFI received an authorized ${trigger.sourceType} trigger for ${trigger.requestedPhase}.`,
    evidence: { platform: trigger.platform, sourceType: trigger.sourceType, requestedPhase: trigger.requestedPhase, sourceMetadataRef: trigger.sourceMetadataRef },
    recovery: { action: "Continue only with certified FanFI capabilities." }
  });
  return { duplicate: false, triggerId: trigger.triggerId };
}

export async function runFanScan(principal: ZcosPrincipal, request: ScanRequest) {
  assertOwnerBinding(principal, request.ownerRef);
  assertOwnerBinding(principal, request.trigger.ownerRef);
  if (request.trigger.authorizationState !== "AUTHORIZED") throw new Error("TRIGGER_NOT_AUTHORIZED");
  const findings: Finding[] = request.requestedSignals.map((signalType) => {
    const manifest = getCapabilityManifest(request.platform, signalType);
    if (!manifest || manifest.certification === "UNAVAILABLE" || manifest.implementationTier === "UNAVAILABLE") {
      return { findingId: randomUUID(), signalType, observation: "UNAVAILABLE", evidenceRefs: [], explanation: "This signal is not available to the certified FanFI implementation on this platform." };
    }
    if (manifest.certification !== "ACTIVE") {
      return { findingId: randomUUID(), signalType, observation: "UNKNOWN", evidenceRefs: [], explanation: `The capability is ${manifest.certification}; FanFI will not simulate an observation.` };
    }
    return { findingId: randomUUID(), signalType, observation: "UNKNOWN", evidenceRefs: [], explanation: "The capability is certified, but no authenticated device observation was supplied to this server-side scan request." };
  });
  const unavailable = findings.filter((f) => f.observation === "UNAVAILABLE").length;
  const unknown = findings.filter((f) => f.observation === "UNKNOWN").length;
  await recordIntegrityEvent({
    principal, requestId: request.operationId, traceId: request.trigger.correlationId,
    eventType: "FANFI_FANSCAN_COMPLETED", category: "INTEGRITY", severity: unavailable || unknown ? "ATTENTION" : "INFO", outcome: "OBSERVED",
    capability: "fanfi.fanscan", destination: request.deviceRef,
    summary: `FanScan completed truthfully with ${findings.length} signal result(s); unavailable=${unavailable}, unknown=${unknown}.`,
    evidence: { platform: request.platform, implementationTier: request.implementationTier, profileId: request.profileId, findings },
    recovery: { action: unknown ? "Collect an authenticated observation from a certified platform adapter before drawing a device-security conclusion." : "Review FanScan evidence." }
  });
  return { operationId: request.operationId, phase: "FANSCAN" as const, findings, recommendation: "NO_AUTOMATIC_CONTAINMENT" as const, verifiedAt: new Date().toISOString() };
}

export async function issueDeviceAction(principal: ZcosPrincipal, request: ExecutionRequest) {
  assertOwnerBinding(principal, request.ownerRef);
  const manifest = getCapabilityManifest(request.platform, request.capability);
  if (!manifest || manifest.certification === "UNAVAILABLE" || manifest.implementationTier === "UNAVAILABLE") throw new Error("CAPABILITY_UNAVAILABLE");
  if (manifest.certification !== "ACTIVE" && manifest.certification !== "PROVISIONAL") throw new Error("CAPABILITY_NOT_CERTIFIED");
  if (manifest.approvalRequired && !request.approval) throw new Error("APPROVAL_REQUIRED");
  if (request.approval) {
    assertOwnerBinding(principal, request.approval.ownerRef);
    if (request.approval.operationId !== request.operationId || request.approval.capability !== request.capability || Date.parse(request.approval.expiresAt) <= Date.now()) throw new Error("APPROVAL_SCOPE_MISMATCH");
  }
  if (issuedActions.has(`${principal.ownerId}:${request.idempotencyKey}`)) throw new Error("DUPLICATE_EXECUTION");
  issuedActions.set(`${principal.ownerId}:${request.idempotencyKey}`, { ownerId: principal.ownerId, request, state: "AWAITING_DEVICE", createdAt: new Date().toISOString() });
  await recordIntegrityEvent({
    principal, requestId: request.operationId, traceId: request.operationId,
    eventType: "FANFI_DEVICE_ACTION_ISSUED", category: "EXECUTION", severity: "ATTENTION", outcome: "PENDING_DEVICE_VERIFICATION",
    capability: request.capability, destination: request.deviceRef,
    summary: `${request.phase} issued a bounded device action envelope. Server issuance is not proof that the device changed state.`,
    evidence: { platform: request.platform, phase: request.phase, reversibility: request.reversibility, sideEffectClass: request.sideEffectClass, verificationMethod: manifest.verificationMethod },
    recovery: { action: "The certified device adapter must execute the action and report authoritative post-state verification.", safeToRetry: false }
  });
  return { operationId: request.operationId, phase: request.phase, capability: request.capability, state: "AWAITING_DEVICE", verificationRequired: true, instruction: { deviceRef: request.deviceRef, platform: request.platform, capability: request.capability, verificationMethod: manifest.verificationMethod } };
}

export async function reconcileDeviceAction(principal: ZcosPrincipal, report: VerificationReport) {
  const entry = [...issuedActions.values()].find((x) => x.ownerId === principal.ownerId && x.request.operationId === report.operationId);
  if (!entry) throw new Error("EXECUTION_NOT_FOUND");
  const succeeded = report.observedState === "EXPECTED" && report.providerOutcome === "CONFIRMED";
  entry.state = succeeded ? "VERIFIED" : "UNKNOWN";
  await recordIntegrityEvent({
    principal, requestId: report.operationId, traceId: report.operationId,
    eventType: succeeded ? "FANFI_DEVICE_ACTION_VERIFIED" : "FANFI_DEVICE_ACTION_RECONCILIATION_REQUIRED",
    category: "EXECUTION", severity: succeeded ? "INFO" : "HIGH", outcome: succeeded ? "SUCCEEDED" : "UNKNOWN",
    capability: entry.request.capability, destination: entry.request.deviceRef,
    summary: succeeded ? "FanFI verified the requested device state after execution." : "FanFI could not verify the expected device state; consequential retry is blocked pending reconciliation.",
    evidence: { observedState: report.observedState, method: report.method, evidenceRefs: report.evidenceRefs, providerOutcome: report.providerOutcome },
    recovery: { action: succeeded ? "Continue according to the FanFI state model." : "Reconcile authoritative device/provider state before any retry or restoration.", safeToRetry: false }
  });
  return { operationId: report.operationId, state: entry.state, verified: succeeded, observedState: report.observedState };
}

export function resetFanfiRuntimeForTests() { seenTriggers.clear(); issuedActions.clear(); }
