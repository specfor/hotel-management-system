-- Migration: create_final_bill_table
-- Created: 2025-09-26T03:59:02.838Z
-- Description: Add description here

-- =================================================
-- UP MIGRATION
-- =====================================================

CREATE TABLE final_bill (
    bill_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,                
    booking_id INT NOT NULL,              
    room_charges NUMERIC(10,2) NOT NULL DEFAULT 0,
    total_service_charges NUMERIC(10,2) NOT NULL DEFAULT 0,
    total_tax NUMERIC(10,2) NOT NULL DEFAULT 0,
    total_discount NUMERIC(10,2) NOT NULL DEFAULT 0,
    late_checkout_charge NUMERIC(10,2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(10,2),                         -- use a trigger to calculate this
    paid_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    outstanding_amount NUMERIC(10,2),                   -- use a trigger to calculate this
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES "user"(staff_id) ON DELETE CASCADE,
    CONSTRAINT fk_booking FOREIGN KEY (booking_id) REFERENCES booking(booking_id) ON DELETE CASCADE,
    
    CONSTRAINT chk_paid_amount CHECK (paid_amount >= 0),
    CONSTRAINT chk_room_charges CHECK (room_charges >= 0),
    CONSTRAINT chk_total_service_charges CHECK (total_service_charges >= 0),
    CONSTRAINT chk_total_tax CHECK (total_tax >= 0),
    CONSTRAINT chk_total_discount CHECK (total_discount >= 0),
    CONSTRAINT chk_late_checkout_charge CHECK (late_checkout_charge >= 0)
);

CREATE INDEX idx_bill_bookingids ON final_bill(booking_id);
CREATE INDEX idx_bill_outstanding ON final_bill(outstanding_amount);


-- Add your SQL statements here
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
