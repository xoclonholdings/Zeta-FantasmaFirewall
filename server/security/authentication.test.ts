import assert from "node:assert/strict"; import test from "node:test"; import type { Request } from "express";
import { authenticateZcosRequest, resetAuthenticationReplayCacheForTests, signGatewayRequest } from "./authentication"; import { sha256, stableStringify } from "./redaction";
const secret = "test-gateway-secret", now = Date.parse("2026-08-24T09:00:00.000Z");
function request(path = "/api/integrity/logs", nonce = "nonce-auth-12345"): Request { const input = { method: "GET", originalUrl: path, ownerId: "owner-123", actorId: "actor-123", roles: "zcos-execution", scopes: "integrity:read", authenticatedAt: new Date(now).toISOString(), nonce, contentHash: sha256(stableStringify({})) }; return { method: input.method, originalUrl: input.originalUrl, body: {}, headers: { "x-zcos-owner-id": input.ownerId, "x-zcos-actor-id": input.actorId, "x-zcos-roles": input.roles, "x-zcos-scopes": input.scopes, "x-zcos-auth-time": input.authenticatedAt, "x-zcos-auth-nonce": nonce, "x-zcos-content-sha256": input.contentHash, "x-zcos-auth-signature": signGatewayRequest(secret, input) } } as unknown as Request; }
test.beforeEach(() => { process.env.ZCOS_TRUSTED_GATEWAY_SECRET = secret; resetAuthenticationReplayCacheForTests(); });
test("authenticates request-bound owner", () => assert.equal(authenticateZcosRequest(request(), now).ownerId, "owner-123"));
test("rejects replay", () => { const req = request(); authenticateZcosRequest(req, now); assert.throws(() => authenticateZcosRequest(req, now), /replayed/i); });
test("rejects changed URL", () => { const req = request(); req.originalUrl = "/api/integrity/monitoring"; assert.throws(() => authenticateZcosRequest(req, now), /signature/i); });
test("rejects changed body", () => { const req = request(); req.body = { changed: true }; assert.throws(() => authenticateZcosRequest(req, now), /body hash/i); });
test("rejects expired context", () => assert.throws(() => authenticateZcosRequest(request(), now + 600000), /expired/i));
