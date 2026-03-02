-- Migration: 20250115120700_create_publication_media_table.sql
-- Description: Create the publication_media table for storing media files attached to publications

-- ────────────────────────────────────────────────────────────
-- UP
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS publication_media (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  publication_id  UUID         NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
  storage_url     TEXT         NOT NULL,
  mime_type       VARCHAR(50)  NOT NULL,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_publication_media_publication_id ON publication_media (publication_id);

-- ────────────────────────────────────────────────────────────
-- DOWN (rollback — do not run automatically)
-- DROP INDEX IF EXISTS idx_publication_media_publication_id;
-- DROP TABLE IF EXISTS publication_media;
-- ────────────────────────────────────────────────────────────
