-- Migration: 20250115120200_create_wallets_table.sql
-- Description: Create the wallets table for Stellar wallet storage

-- ────────────────────────────────────────────────────────────
-- UP
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wallets (
  id                    UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID  NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  public_key            TEXT  NOT NULL UNIQUE,
  encrypted_secret_key  TEXT  NOT NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets (user_id);

-- ────────────────────────────────────────────────────────────
-- DOWN (rollback — do not run automatically)
-- DROP INDEX IF EXISTS idx_wallets_user_id;
-- DROP TABLE IF EXISTS wallets;
-- ────────────────────────────────────────────────────────────
