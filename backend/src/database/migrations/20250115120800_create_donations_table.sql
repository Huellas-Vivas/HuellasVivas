-- Migration: 20250115120800_create_donations_table.sql
-- Description: Create the donations table for tracking individual donations

-- ────────────────────────────────────────────────────────────
-- UP
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS donations (
  id                UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  publication_id    UUID           NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
  donor_id          UUID           NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount            NUMERIC(12,2)  NOT NULL CHECK (amount > 0),
  status            VARCHAR(20)    NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_ESCROW', 'RELEASED', 'DISPUTED')),
  escrow_requested  BOOLEAN        NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ    NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ    NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_donations_publication_id ON donations (publication_id);
CREATE INDEX IF NOT EXISTS idx_donations_donor_id ON donations (donor_id);

CREATE TRIGGER trg_donations_updated_at
  BEFORE UPDATE ON donations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ────────────────────────────────────────────────────────────
-- DOWN (rollback — do not run automatically)
-- DROP TRIGGER IF EXISTS trg_donations_updated_at ON donations;
-- DROP INDEX IF EXISTS idx_donations_donor_id;
-- DROP INDEX IF EXISTS idx_donations_publication_id;
-- DROP TABLE IF EXISTS donations;
-- ────────────────────────────────────────────────────────────
