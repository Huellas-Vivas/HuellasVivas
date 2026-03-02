-- Migration: 20250115120600_create_publications_table.sql
-- Description: Create the publications table for donation campaign posts

-- ────────────────────────────────────────────────────────────
-- UP
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS publications (
  id            UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID           NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id   UUID           NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  title         VARCHAR(120)   NOT NULL,
  description   TEXT           NOT NULL,
  goal_amount   NUMERIC(12,2)  NOT NULL CHECK (goal_amount > 0),
  raised_amount NUMERIC(12,2)  NOT NULL DEFAULT 0,
  status        VARCHAR(20)    NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED')),
  deleted_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ    NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ    NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_publications_user_id ON publications (user_id);
CREATE INDEX IF NOT EXISTS idx_publications_status ON publications (status);
CREATE INDEX IF NOT EXISTS idx_publications_category_id ON publications (category_id);
CREATE INDEX IF NOT EXISTS idx_publications_created_at ON publications (created_at DESC);

-- Composite index for feed queries
CREATE INDEX IF NOT EXISTS idx_publications_feed
  ON publications (category_id, status, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE TRIGGER trg_publications_updated_at
  BEFORE UPDATE ON publications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ────────────────────────────────────────────────────────────
-- DOWN (rollback — do not run automatically)
-- DROP TRIGGER IF EXISTS trg_publications_updated_at ON publications;
-- DROP INDEX IF EXISTS idx_publications_feed;
-- DROP INDEX IF EXISTS idx_publications_created_at;
-- DROP INDEX IF EXISTS idx_publications_category_id;
-- DROP INDEX IF EXISTS idx_publications_status;
-- DROP INDEX IF EXISTS idx_publications_user_id;
-- DROP TABLE IF EXISTS publications;
-- ────────────────────────────────────────────────────────────
