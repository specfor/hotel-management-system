-- Migration: create_room_type_table
-- Created: 2025-09-26T03:36:01.743Z
-- Description: Add description here

-- =====================================================
-- UP MIGRATION
-- =====================================================

-- Add your SQL statements here
-- Example:
CREATE TABLE room_type (
  type_id SERIAL PRIMARY KEY,
  branch_id INT ,
  type_name VARCHAR(50)  ,
  daily_rate DECIMAL(10,2)  ,
  late_checkout_rate DECIMAL(10,2)  ,
  capacity INT  ,
  amenities VARCHAR(255) ,
  CONSTRAINT fk_room_type_branch FOREIGN KEY (branch_id) REFERENCES branch(branch_id)
);

CREATE INDEX idx_roomtype_branchid ON room_type(branch_id);

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
