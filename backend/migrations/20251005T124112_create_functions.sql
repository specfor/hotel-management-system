-- Migration: create_functions
-- Created: 2025-10-05T12:41:12.117Z
-- Description: Add description here

-- =====================================================
-- UP MIGRATION
-- =====================================================

-- Add your SQL statements here

-- Function to update room status
CREATE OR REPLACE FUNCTION update_room_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.booking_status = 'Checked-In' THEN
        UPDATE room SET room_status = 'Occupied' WHERE room_id = NEW.room_id;
    ELSIF NEW.booking_status = 'Checked-Out' OR NEW.booking_status = 'Cancelled' THEN
        UPDATE room SET room_status = 'Available' WHERE room_id = NEW.room_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION prevent_double_booking()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM booking
        WHERE room_id = NEW.room_id
          AND booking_status IN ('Booked', 'Checked-In')
          AND tsrange(check_in, check_out) && tsrange(NEW.check_in, NEW.check_out)
          AND booking_id <> NEW.booking_id
    ) THEN
        RAISE EXCEPTION 'Room % is already booked for the given period.', NEW.room_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION calc_service_total()
RETURNS TRIGGER AS $$
BEGIN
    NEW.total_price := NEW.quantity * (SELECT unit_price FROM chargeable_services WHERE service_id = NEW.service_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION update_outstanding_amount()
RETURNS TRIGGER AS $$
BEGIN
    NEW.outstanding_amount := NEW.total_amount - NEW.paid_amount;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_bill_on_payment()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE final_bill
    SET paid_amount = paid_amount + NEW.paid_amount,
        outstanding_amount = total_amount - (paid_amount + NEW.paid_amount)
    WHERE bill_id = NEW.bill_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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
