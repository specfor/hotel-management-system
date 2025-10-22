-- Migration: create_room_table
-- Created: 2025-09-26T03:55:08.158Z
-- Description: Add description here

-- =====================================================
-- UP MIGRATION
-- =====================================================

-- Add your SQL statements here
-- Example:
CREATE TYPE room_status_enum AS ENUM ('Available', 'Occupied', 'Maintenance', 'Cleaning');

CREATE TABLE room (
  room_id SERIAL PRIMARY KEY,
  branch_id INT,
  type_id INT,
  room_status room_status_enum DEFAULT 'Available',
  CONSTRAINT fk_room_branch FOREIGN KEY (branch_id) REFERENCES branch(branch_id)
);

CREATE INDEX idx_room_branch_status ON room(branch_id, room_status);
CREATE INDEX idx_room_branch_typeid ON room(branch_id, type_id);
CREATE INDEX idx_room_typeid ON room(type_id);

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
