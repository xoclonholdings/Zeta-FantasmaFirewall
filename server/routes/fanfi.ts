import type { Express, Request, Response } from "express";
import { z } from "zod";
import { getPrincipal, requirePrincipal } from "../security/authentication";
import { asyncRoute } from "../security/async-route";
import { requireExecutionReservation } from "../security/execution-reservation";
import { recordIntegrityEvent } from "../security/integrity-audit";
import { listCapabilityManifests } from "../fanfi/capability-registry";
import { executionRequestSchema, fanfiPlatformSchema, scanRequestSchema, triggerRecordSchema, verificationReportSchema } from "../fanfi/contracts";
import { acceptTrigger, issueDeviceAction, reconcileDeviceAction, runFanScan } from "../fanfi/runtime";

const read = requirePrincipal({ scopes: ["fanfi:read"] });
const operate = requirePrincipal({ scopes: ["fanfi:operate"] });
const report = requirePrincipal({ scopes: ["fanfi:report"] });

async function reject(req: Request, res: Response, error: string, status = 400) {
  const principal = getPrincipal(req);
  await recordIntegrityEvent({
    principal, requestId: principal.nonce, traceId: principal.nonce,
    eventType: `FANFI_${error}`, category: "INPUT_SAFETY", severity: status >= 500 ? "HIGH" : "ATTENTION", outcome: "BLOCKED",
    capability: "fanfi", destination: req.path,
    summary: `FanFI blocked a request: ${error}.`, evidence: { route: req.path, method: req.method },
    recovery: { action: "Submit a typed, owner-bound request using only certified FanFI capabilities.", safeToRetry: false }
  });
  res.status(status).json({ error, message: "FanFI failed closed and made no device-security claim or consequential device change." });
}

function mapRuntimeError(req: Request, res: Response, error: unknown) {
  const code = error instanceof Error ? error.message : "FANFI_RUNTIME_ERROR";
  const status = ["OWNER_SCOPE_MISMATCH", "TRIGGER_NOT_AUTHORIZED", "APPROVAL_REQUIRED", "APPROVAL_SCOPE_MISMATCH"].includes(code) ? 403 : ["CAPABILITY_UNAVAILABLE", "CAPABILITY_NOT_CERTIFIED"].includes(code) ? 409 : code === "DUPLICATE_EXECUTION" ? 409 : code === "EXECUTION_NOT_FOUND" ? 404 : 400;
  return reject(req, res, code, status);
}

export function registerFanfiRoutes(app: Express) {
  app.get("/api/fanfi/capabilities", read, asyncRoute(async (req, res) => {
    const parsed = z.object({ platform: fanfiPlatformSchema.optional() }).safeParse(req.query);
    if (!parsed.success) return void await reject(req, res, "INVALID_PLATFORM");
    res.json({ capabilities: listCapabilityManifests(parsed.data.platform), generatedAt: new Date().toISOString() });
  }));

  app.post("/api/fanfi/triggers", operate, asyncRoute(async (req, res) => {
    const parsed = triggerRecordSchema.safeParse(req.body);
    if (!parsed.success) return void await reject(req, res, "INVALID_TRIGGER");
    try { res.status(202).json(await acceptTrigger(getPrincipal(req), parsed.data)); }
    catch (error) { await mapRuntimeError(req, res, error); }
  }));

  app.post("/api/fanfi/fanscan", operate, asyncRoute(async (req, res) => {
    const parsed = scanRequestSchema.safeParse(req.body);
    if (!parsed.success) return void await reject(req, res, "INVALID_SCAN_REQUEST");
    try { res.json(await runFanScan(getPrincipal(req), parsed.data)); }
    catch (error) { await mapRuntimeError(req, res, error); }
  }));

  app.post("/api/fanfi/actions/vpn", operate, requireExecutionReservation("fanfi.flux.vpn"), asyncRoute(async (req, res) => {
    const parsed = executionRequestSchema.safeParse(req.body);
    if (!parsed.success || parsed.data.capability !== "fanfi.flux.vpn") return void await reject(req, res, "INVALID_VPN_ACTION");
    try { res.status(202).json(await issueDeviceAction(getPrincipal(req), parsed.data)); }
    catch (error) { await mapRuntimeError(req, res, error); }
  }));

  app.post("/api/fanfi/executions/:id/verify", report, asyncRoute(async (req, res) => {
    const parsed = verificationReportSchema.safeParse({ ...req.body, operationId: req.params.id });
    if (!parsed.success) return void await reject(req, res, "INVALID_VERIFICATION_REPORT");
    try { res.json(await reconcileDeviceAction(getPrincipal(req), parsed.data)); }
    catch (error) { await mapRuntimeError(req, res, error); }
  }));
}
