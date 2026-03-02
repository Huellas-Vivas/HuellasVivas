-- Migration: 20250115121000_create_comments_table.sql
-- Description: Create the comments table for publication comments and replies

-- ────────────────────────────────────────────────────────────
-- UP
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS comments (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  publication_id  UUID         NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
  user_id         UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id       UUID         REFERENCES comments(id) ON DELETE CASCADE,
  content         TEXT         NOT NULL,
  deleted_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comments_publication_id ON comments (publication_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments (parent_id);

CREATE TRIGGER trg_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ────────────────────────────────────────────────────────────
-- DOWN (rollback — do not run automatically)
-- DROP TRIGGER IF EXISTS trg_comments_updated_at ON comments;
-- DROP INDEX IF EXISTS idx_comments_parent_id;
-- DROP INDEX IF EXISTS idx_comments_publication_id;
-- DROP TABLE IF EXISTS comments;
-- ────────────────────────────────────────────────────────────
