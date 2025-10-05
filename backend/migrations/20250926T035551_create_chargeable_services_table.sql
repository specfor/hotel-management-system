-- Migration: create_chargeable_services_table
-- Created: 2025-09-26T03:55:51.192Z
-- Description: Add description here

-- =====================================================
-- UP MIGRATION
-- =====================================================

-- Add your SQL statements here
-- Example:
CREATE TABLE chargable_services (
  service_id SERIAL PRIMARY KEY,
  branch_id INT,
  service_name VARCHAR(50),
  unit_price DECIMAL(10,2),
  unit_type VARCHAR(30),
  CONSTRAINT fk_chargable_services_branch FOREIGN KEY (branch_id) REFERENCES branch(branch_id)
);

CREATE INDEX idx_service_branch_name ON chargable_services(branch_id, service_name);


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
