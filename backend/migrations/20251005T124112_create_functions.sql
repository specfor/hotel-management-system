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
    NEW.total_price := NEW.quantity * (SELECT unit_price FROM chargable_services WHERE service_id = NEW.service_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION update_final_bill_total_amount()
RETURNS TRIGGER AS $$
BEGIN
    NEW.total_amount := COALESCE(NEW.room_charges,0) 
                      + COALESCE(NEW.total_service_charges,0) 
                      + COALESCE(NEW.total_tax,0) 
                      + COALESCE(NEW.late_checkout_charge,0) 
                      - COALESCE(NEW.total_discount,0);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION update_final_bill_outstanding()
RETURNS TRIGGER AS $$
BEGIN
    NEW.outstanding_amount := COALESCE(NEW.total_amount,0) - COALESCE(NEW.paid_amount,0);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

--------------------------------------------------------------------

CREATE OR REPLACE FUNCTION calculate_room_charges(p_booking_id INT)
RETURNS NUMERIC AS $$
DECLARE
    nights INT;
    room_rate NUMERIC;
BEGIN
    SELECT EXTRACT(DAY FROM (b.check_out - b.check_in)) 
    INTO nights
    FROM booking b
    WHERE b.booking_id = p_booking_id;

    SELECT rt.daily_rate
    INTO room_rate
    FROM booking b
    JOIN room r ON b.room_id = r.room_id
    JOIN room_type rt ON r.type_id = rt.type_id
    WHERE b.booking_id = p_booking_id;

    RETURN COALESCE(room_rate * nights, 0);
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION calculate_total_service_charges(p_booking_id INT)
RETURNS NUMERIC AS $$
DECLARE
    service_total NUMERIC;
BEGIN
    SELECT COALESCE(SUM(su.total_price), 0)
    INTO service_total
    FROM service_usage su
    WHERE su.booking_id = p_booking_id;

    RETURN service_total;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION calculate_late_checkout_charge(p_booking_id INT)
RETURNS NUMERIC AS $$
DECLARE
    late_hours NUMERIC;
    late_rate NUMERIC;
    check_out_time TIMESTAMP;
BEGIN
    -- Get the scheduled checkout time and the room's late checkout rate
    SELECT b.check_out, rt.late_checkout_rate
    INTO check_out_time, late_rate
    FROM booking b
    JOIN room r ON b.room_id = r.room_id
    JOIN room_type rt ON r.type_id = rt.type_id
    WHERE b.booking_id = p_booking_id;

    -- Calculate hours late (if positive)
    late_hours := EXTRACT(EPOCH FROM (NOW() - check_out_time)) / 3600;

    IF late_hours < 0 THEN
        late_hours := 0; -- not late yet
    END IF;

    RETURN COALESCE(late_hours * late_rate, 0);
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION calculate_total_discount(p_booking_id INT)
RETURNS NUMERIC AS $$
DECLARE
    discount_total NUMERIC;
    room_charges NUMERIC;
    branch_id INT;
BEGIN
    -- Get room charges for this booking
    SELECT calculate_room_charges(p_booking_id) INTO room_charges;

    -- Get the branch of the booked room
    SELECT r.branch_id
    INTO branch_id
    FROM booking b
    JOIN room r ON b.room_id = r.room_id
    WHERE b.booking_id = p_booking_id;

    -- Sum all valid discounts for that branch
    SELECT COALESCE(SUM(d.discount_rate * room_charges / 100),0)
    INTO discount_total
    FROM discount d
    WHERE d.branch_id = branch_id
      AND d.valid_from <= CURRENT_DATE
      AND d.valid_to >= CURRENT_DATE;

    RETURN discount_total;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION trg_update_final_bill_charges()
RETURNS TRIGGER AS $$
BEGIN
    NEW.room_charges := calculate_room_charges(NEW.booking_id);
    NEW.late_checkout_charge := calculate_late_checkout_charge(NEW.booking_id);
    NEW.total_service_charges := calculate_total_service_charges(NEW.booking_id);
    NEW.total_discount := calculate_total_discount(NEW.booking_id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

--------------------------------------------------------------------







-- Trigger
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
