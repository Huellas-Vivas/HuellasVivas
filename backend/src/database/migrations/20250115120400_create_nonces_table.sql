-- Migration: 20250115120400_create_nonces_table.sql
-- Description: Create the nonces table for one-time blockchain operation nonces

-- ────────────────────────────────────────────────────────────
-- UP
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS nonces (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action      VARCHAR(50)  NOT NULL,
  value       TEXT         NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ  NOT NULL,
  used_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_nonces_value ON nonces (value);
CREATE INDEX IF NOT EXISTS idx_nonces_user_id ON nonces (user_id);

-- ────────────────────────────────────────────────────────────
-- DOWN (rollback — do not run automatically)
-- DROP INDEX IF EXISTS idx_nonces_user_id;
-- DROP INDEX IF EXISTS idx_nonces_value;
-- DROP TABLE IF EXISTS nonces;
-- ────────────────────────────────────────────────────────────
