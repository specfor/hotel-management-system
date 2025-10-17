-- Migration: create_payment_table
-- Created: 2025-09-26T03:59:18.529Z
-- Description: Add description here

-- =====================================================
-- UP MIGRATION
-- =====================================================

-- Add your SQL statements here
-- Example:
CREATE TABLE payment (
  payment_id SERIAL PRIMARY KEY,
  bill_id INT,
  paid_method VARCHAR(50),
  paid_amount DECIMAL(10,2),
  date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_payment_bill FOREIGN KEY (bill_id) REFERENCES final_bill(bill_id)
);

CREATE INDEX idx_payment_billid ON payment(bill_id);
CREATE INDEX idx_payment_datetime ON payment(date_time);



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
