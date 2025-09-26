-- Migration: create_discount_table
-- Created: 2025-09-26T03:50:30.776Z
-- Description: Add description here

-- =====================================================
-- UP MIGRATION
-- =====================================================

-- Add your SQL statements here
-- Example:

CREATE TABLE discount (
  discount_id SERIAL PRIMARY KEY,
  branch_id INT,
  discount_name VARCHAR(50),
  discount_rate DECIMAL(5,2),
  discount_condition VARCHAR(100),
  valid_from DATE,
  valid_to DATE,
  CONSTRAINT fk_discount_branch FOREIGN KEY (branch_id) REFERENCES branch(branch_id)
);

-- CREATE TABLE example_table (
--   id SERIAL PRIMARY KEY,
--   name VARCHAR(255) NOT NULL,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- =====================================================
-- NOTES
-- =====================================================
-- This migration will be executed in a transaction.
-- If any statement fails, the entire migration will be rolled back.
-- 
-- Best practices:
-- 1. Always include CREATE INDEX statements for foreign keys
-- 2. Use TIMESTAMP WITH TIME ZONE for datetime fields
-- 3. Add NOT NULL constraints where appropriate
-- 4. Consider adding default values for new columns
-- 5. Test migrations on a copy of production data first

-- =====================================================
-- ROLLBACK (Manual - for reference only)
-- =====================================================
-- If you need to manually rollback this migration:
-- DROP TABLE IF EXISTS example_table;
