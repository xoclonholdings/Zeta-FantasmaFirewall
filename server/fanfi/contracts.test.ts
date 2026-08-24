import test from "node:test";
import assert from "node:assert/strict";
import { executionRequestSchema, scanRequestSchema, triggerRecordSchema } from "./contracts";

const trigger = {
  triggerId: "trigger-0001", sourceType: "android.network.callback", platform: "ANDROID",
  ownerRef: "zcos://owner/alice", deviceRef: "fanfi://device/primary", occurredAt: "2026-08-24T10:00:00.000Z",
  requestedPhase: "FANSCAN", authorizationState: "AUTHORIZED", correlationId: "trace-0001"
};

test("accepts a minimal typed authorized trigger", () => {
  assert.equal(triggerRecordSchema.safeParse(trigger).success, true);
});

test("rejects raw protected fields not present in the canonical trigger contract", () => {
  assert.equal(triggerRecordSchema.safeParse({ ...trigger, wifiSsid: "private-network", ipAddress: "192.0.2.4", clipboard: "secret" }).success, false);
});

test("scan contract rejects untyped arbitrary observation payloads", () => {
  const parsed = scanRequestSchema.safeParse({ operationId: "scan-00001", platform: "ANDROID", implementationTier: "NATIVE_COMPANION", ownerRef: "zcos://owner/alice", deviceRef: "fanfi://device/primary", profileId: "default", requestedSignals: ["fanfi.signal.network_change"], grantRef: "zcos://grant/g1", trigger, claimedMalware: true });
  assert.equal(parsed.success, false);
});

test("FanFlux execution requires an explicit idempotency key", () => {
  const base = { operationId: "flux-00001", platform: "ANDROID", phase: "FANFLUX", capability: "fanfi.flux.vpn", ownerRef: "zcos://owner/alice", deviceRef: "fanfi://device/primary", affectedDataClass: "INTERNAL", reversibility: "REVERSIBLE", sideEffectClass: "IDEMPOTENT", grantRef: "zcos://grant/g1" };
  assert.equal(executionRequestSchema.safeParse(base).success, false);
  assert.equal(executionRequestSchema.safeParse({ ...base, idempotencyKey: "flux-idempotency-0001" }).success, true);
});
