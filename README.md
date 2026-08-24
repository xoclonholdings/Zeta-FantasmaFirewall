# ZENA Control

ZENA is the ZCOS security and Integrity authority. Control exposes the Integrity Desk through Logs, Diagnostics, and Monitoring. ZCOS remains the authenticated identity and grant authority; ZAR remains the general planner; FanFI / Fantasma Firewall remains an extension capability.

## Execution security boundary

- Protected routes require a ZCOS principal bound to method, full URL, owner, actor, authority, timestamp, nonce, and canonical body hash.
- Signed grants bind owner, capability, resource, destination, provider/connector, data class, required scopes, and exact mutation method/path/body hash.
- External, irreversible, uncertain, administrative, and non-idempotent actions require scope-bound approval.
- Terminal, code, browser, connector, external, and provider actions require signed current isolation attestations.
- Untrusted data enters only as typed source references and hashes; prompt-policy override attempts fail closed.
- Credentials remain `secret://`, `vault://`, or `provider://` references and are redacted from evidence.
- Duplicate, partial, and unknown effects are preserved and blocked from automatic retry.
- Evidence is append-only, owner-scoped, hashed, and visible in Integrity → Logs / Diagnostics / Monitoring.

## FanFI / Fantasma Firewall

FanFI is implemented as a governed cross-platform ZCOS Extension beneath this security boundary. It preserves the canonical FanScan → FanFlux → FanRES / FanREST model without pretending the server can inspect or alter protected mobile state by itself.

Current foundation:

- `server/fanfi/contracts.ts`: strict iOS/Android trigger, scan, approval, execution, verification, and evidence-facing contracts.
- `server/fanfi/capability-registry.ts`: platform-separated capability certification. Unsupported mic/camera/system-log surveillance remains explicitly unavailable.
- `server/fanfi/runtime.ts`: owner binding, truthful FanScan results, device-action issuance, idempotency guard, and post-action reconciliation.
- `server/routes/fanfi.ts`: ZCOS-authenticated FanFI API wired into ZENA Integrity evidence.

Protected API:

- `GET /api/fanfi/capabilities` — capability and certification discovery.
- `POST /api/fanfi/triggers` — receive an authorized, typed activation event.
- `POST /api/fanfi/fanscan` — evaluate requested signals without simulation; unavailable or unobserved signals remain `UNAVAILABLE` or `UNKNOWN`.
- `POST /api/fanfi/actions/vpn` — issue a bounded VPN containment/restoration action envelope. Requires a matching ZENA execution reservation in `x-zena-execution-id`; issuance is not reported as device success.
- `POST /api/fanfi/executions/:id/verify` — accept authoritative adapter/provider verification and reconcile the outcome.

The current repository implements the ZCOS/ZENA-side FanFI contract and execution gate. Actual iOS Network Extension/App Intent and Android `VpnService` device effects must be implemented and certified in signed native companion applications before the corresponding capability can be promoted from provisional to active. No private API, root assumption, simulated malware signal, or automatic evidence deletion is part of FanFI.

Apply `migrations/0001_zena_execution_security.sql`, configure the independent secrets in `production.env.example`, then run `npm run check`, `npm test`, and `npm run build`.
