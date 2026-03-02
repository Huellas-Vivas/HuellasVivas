-- Migration: 20250115120900_create_escrows_table.sql
-- Description: Create the escrows table for Trustless Work escrow records

-- ────────────────────────────────────────────────────────────
-- UP
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS escrows (
  id                  UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_id         UUID         NOT NULL UNIQUE REFERENCES donations(id) ON DELETE CASCADE,
  trustless_work_id   TEXT,
  escrow_address      TEXT,
  status              VARCHAR(20)  NOT NULL DEFAULT 'CREATED' CHECK (status IN ('CREATED', 'FUNDED', 'RELEASING', 'RELEASED', 'DISPUTED', 'REFUNDED')),
  proof_url           TEXT,
  proof_submitted_at  TIMESTAMPTZ,
  proof_requested_at  TIMESTAMPTZ,
  released_at         TIMESTAMPTZ,
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_escrows_updated_at
  BEFORE UPDATE ON escrows
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ────────────────────────────────────────────────────────────
-- DOWN (rollback — do not run automatically)
-- DROP TRIGGER IF EXISTS trg_escrows_updated_at ON escrows;
-- DROP TABLE IF EXISTS escrows;
-- ────────────────────────────────────────────────────────────
