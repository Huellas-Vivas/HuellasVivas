-- Migration: 20250115120500_create_categories_table.sql
-- Description: Create the categories table with animal category seed data

-- ────────────────────────────────────────────────────────────
-- UP
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id     UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  slug   VARCHAR(20)  NOT NULL UNIQUE,
  label  VARCHAR(50)  NOT NULL
);

-- Seed data
INSERT INTO categories (slug, label) VALUES
  ('DOG', 'Perro'),
  ('CAT', 'Gato'),
  ('RABBIT', 'Conejo'),
  ('OTHER', 'Otros')
ON CONFLICT (slug) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- DOWN (rollback — do not run automatically)
-- DELETE FROM categories WHERE slug IN ('DOG', 'CAT', 'RABBIT', 'OTHER');
-- DROP TABLE IF EXISTS categories;
-- ────────────────────────────────────────────────────────────
