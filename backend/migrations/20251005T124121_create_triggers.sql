-- Migration: create_triggers
-- Created: 2025-10-05T12:41:21.562Z
-- Description: Add description here

-- =====================================================
-- UP MIGRATION
-- =====================================================

-- Add your SQL statements here



-- Trigger on Booking table
CREATE TRIGGER trg_update_room_status
AFTER UPDATE OF booking_status ON booking
FOR EACH ROW
EXECUTE FUNCTION update_room_status();


CREATE TRIGGER trg_prevent_double_booking
BEFORE INSERT OR UPDATE ON booking
FOR EACH ROW
EXECUTE FUNCTION prevent_double_booking();


CREATE TRIGGER trg_calc_service_total
BEFORE INSERT OR UPDATE ON service_usage
FOR EACH ROW
EXECUTE FUNCTION calc_service_total();


CREATE TRIGGER trg_update_outstanding
BEFORE INSERT OR UPDATE ON final_bill
FOR EACH ROW
EXECUTE FUNCTION update_outstanding_amount();




-- Example:
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
