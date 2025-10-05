-- Migration: create_service_usage_table
-- Created: 2025-09-26T03:58:02.049Z
-- Description: Add description here

-- =====================================================
-- UP MIGRATION
-- =====================================================

-- Add your SQL statements here
-- Example:
CREATE TABLE service_usage (
  record_id SERIAL PRIMARY KEY,
  service_id INT,
  booking_id INT,
  date_time TIMESTAMP,
  quantity DECIMAL(10,2),
  total_price DECIMAL(10,2),
  CONSTRAINT fk_service_usage_service FOREIGN KEY (service_id) REFERENCES chargable_services(service_id)
);

CREATE INDEX idx_serviceusage_serviceid on service_usage(service_id);
CREATE INDEX idx_serviceusage_bookingid on service_usage(booking_id);
CREATE INDEX idx_serviceusage_datetime on service_usage(date_time);


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
