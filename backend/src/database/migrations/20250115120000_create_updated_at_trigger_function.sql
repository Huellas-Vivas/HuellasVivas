-- Migration: 20250115120000_create_updated_at_trigger_function.sql
-- Description: Shared trigger function to auto-update updated_at timestamp on row changes

-- ────────────────────────────────────────────────────────────
-- UP
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ────────────────────────────────────────────────────────────
-- DOWN (rollback — do not run automatically)
-- DROP FUNCTION IF EXISTS update_updated_at();
-- ────────────────────────────────────────────────────────────
