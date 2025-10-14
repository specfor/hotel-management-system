-- Migration: create_revenue_table
-- Created: 2025-09-26T03:22:29.228Z
-- Description: Add description here

-- =====================================================
-- UP MIGRATION
-- =====================================================

-- Add your SQL statements here
-- Example:
CREATE TABLE revenue (
  record_id SERIAL PRIMARY KEY,
  branch_id INT ,
  month INT ,
  calculated_data_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  amount NUMERIC(11,2) CHECK (amount >= 0),
  CONSTRAINT fk_revenue_branch FOREIGN KEY (branch_id) REFERENCES branch(branch_id)
);
-- Composite index for filtering revenue data by month and branch_id. 
--Optimizes queries that filter by month alone or month+branch_id combinations.
CREATE INDEX idx_revenue_month_branch_id ON revenue(month, branch_id);


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
