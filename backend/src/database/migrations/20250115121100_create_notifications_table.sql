-- Migration: 20250115121100_create_notifications_table.sql
-- Description: Create the notifications table for in-app user notifications

-- ────────────────────────────────────────────────────────────
-- UP
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        VARCHAR(50)  NOT NULL CHECK (type IN ('PROOF_REQUESTED', 'PROOF_SUBMITTED', 'DONATION_COMPLETED')),
  payload     JSONB        NOT NULL DEFAULT '{}',
  read_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications (user_id);

-- Partial index for unread notifications
CREATE INDEX IF NOT EXISTS idx_notifications_unread
  ON notifications (user_id, read_at)
  WHERE read_at IS NULL;

-- ────────────────────────────────────────────────────────────
-- DOWN (rollback — do not run automatically)
-- DROP INDEX IF EXISTS idx_notifications_unread;
-- DROP INDEX IF EXISTS idx_notifications_user_id;
-- DROP TABLE IF EXISTS notifications;
-- ────────────────────────────────────────────────────────────
