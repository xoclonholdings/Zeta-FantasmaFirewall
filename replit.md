# ZENA Control implementation notes

ZENA evaluates and blocks security-sensitive execution, preserves owner-scoped evidence, and exposes Integrity → Logs, Diagnostics, and Monitoring. ZCOS owns identity and grants. ZAR owns general planning. FanFI remains an extension.

The service uses request-bound ZCOS authentication, signed grants/approvals/certifications/isolation attestations, database-backed idempotent execution reservations, strict reference-only untrusted-input contracts, secret redaction, and append-only Integrity evidence. It has no simulated threat stream, unauthenticated owner data, automatic countermeasure deployment, or live WebSocket broadcast.
