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

Apply `migrations/0001_zena_execution_security.sql`, configure the independent secrets in `production.env.example`, then run `npm run check`, `npm test`, and `npm run build`.
