-- Migration: 20250115120300_create_refresh_tokens_table.sql
-- Description: Create the refresh_tokens table for JWT refresh token management

-- ────────────────────────────────────────────────────────────
-- UP
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  TEXT         NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ  NOT NULL,
  revoked_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens (user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token_hash ON refresh_tokens (token_hash);

-- ────────────────────────────────────────────────────────────
-- DOWN (rollback — do not run automatically)
-- DROP INDEX IF EXISTS idx_refresh_tokens_token_hash;
-- DROP INDEX IF EXISTS idx_refresh_tokens_user_id;
-- DROP TABLE IF EXISTS refresh_tokens;
-- ────────────────────────────────────────────────────────────
