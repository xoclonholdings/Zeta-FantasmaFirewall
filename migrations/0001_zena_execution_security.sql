CREATE TABLE IF NOT EXISTS "integrity_events" (
  "id" varchar(36) PRIMARY KEY NOT NULL, "owner_id" varchar(255) NOT NULL, "actor_id" varchar(255) NOT NULL,
  "request_id" varchar(128) NOT NULL, "trace_id" varchar(128) NOT NULL, "event_type" varchar(100) NOT NULL,
  "category" varchar(50) NOT NULL, "severity" varchar(20) NOT NULL, "outcome" varchar(32) NOT NULL,
  "capability" varchar(160), "provider" varchar(160), "connector" varchar(160), "destination" varchar(255),
  "summary" text NOT NULL, "permission_scope" jsonb DEFAULT '[]'::jsonb NOT NULL, "risk" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "evidence" jsonb DEFAULT '{}'::jsonb NOT NULL, "recovery" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "event_hash" varchar(64) NOT NULL, "occurred_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "IDX_integrity_events_owner_time" ON "integrity_events" ("owner_id", "occurred_at");
CREATE INDEX IF NOT EXISTS "IDX_integrity_events_trace" ON "integrity_events" ("trace_id");
CREATE INDEX IF NOT EXISTS "IDX_integrity_events_outcome" ON "integrity_events" ("outcome");

CREATE TABLE IF NOT EXISTS "execution_records" (
  "id" varchar(36) PRIMARY KEY NOT NULL, "owner_id" varchar(255) NOT NULL, "actor_id" varchar(255) NOT NULL,
  "request_id" varchar(128) NOT NULL, "trace_id" varchar(128) NOT NULL, "idempotency_key" varchar(255) NOT NULL,
  "request_fingerprint" varchar(64) NOT NULL, "execution_binding_hash" varchar(64), "approval_scope_hash" varchar(64),
  "capability" varchar(160) NOT NULL, "operation" varchar(50) NOT NULL, "destination" varchar(255) NOT NULL,
  "side_effect_class" varchar(32) NOT NULL, "risk_level" varchar(20) NOT NULL, "state" varchar(32) NOT NULL,
  "attempts" integer DEFAULT 1 NOT NULL, "result_evidence" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL, "updated_at" timestamp DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "UQ_execution_owner_idempotency" ON "execution_records" ("owner_id", "idempotency_key");
CREATE INDEX IF NOT EXISTS "IDX_execution_owner_state" ON "execution_records" ("owner_id", "state");
CREATE INDEX IF NOT EXISTS "IDX_execution_trace" ON "execution_records" ("trace_id");

CREATE TABLE IF NOT EXISTS "integrity_findings" (
  "id" varchar(36) PRIMARY KEY NOT NULL, "owner_id" varchar(255) NOT NULL, "severity" varchar(20) NOT NULL,
  "state" varchar(32) NOT NULL, "title" varchar(255) NOT NULL, "summary" text NOT NULL,
  "affected_scope" jsonb DEFAULT '{}'::jsonb NOT NULL, "evidence_event_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "recovery" jsonb DEFAULT '{}'::jsonb NOT NULL, "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "IDX_integrity_findings_owner_state" ON "integrity_findings" ("owner_id", "state");
