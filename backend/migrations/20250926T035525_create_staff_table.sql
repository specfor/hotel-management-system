-- Migration: create_staff_table
-- Created: 2025-09-26T03:55:25.347Z
-- Description: Add description here

-- =====================================================
-- UP MIGRATION
-- =====================================================

-- Add your SQL statements here
-- Example:

CREATE TABLE staff (
  staff_id SERIAL PRIMARY KEY,
  branch_id INT,
  name VARCHAR(100),
  contact_no BIGINT,
  email VARCHAR(50),
  job_title VARCHAR(50),
  salary DECIMAL(8,2),
  CONSTRAINT fk_staff_branch FOREIGN KEY (branch_id) REFERENCES branch(branch_id)
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
