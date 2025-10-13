-- Migration: create_booking_table
-- Created: 2025-09-26T03:57:47.591Z
-- Description: Add description here

-- =====================================================
-- UP MIGRATION
-- =====================================================

-- Add your SQL statements here
-- Example:
CREATE TYPE booking_status_enum AS ENUM ('Booked', 'Checked-In', 'Checked-Out', 'Cancelled');
CREATE TYPE payment_method_enum AS ENUM ('Cash','Credit Card','Debit Card','Bank Transfer','Online Wallet');

CREATE TABLE booking (
  booking_id SERIAL PRIMARY KEY,
  user_id INT,
  guest_id INT NOT NULL,
  room_id INT NOT NULL,
  booking_status booking_status_enum,
  payment_method payment_method_enum,
  date_time TIMESTAMP,
  check_in TIMESTAMP,
  check_out TIMESTAMP,
  CONSTRAINT fk_booking_user FOREIGN KEY (user_id) REFERENCES "user"(staff_id) ON DELETE SET NULL,
  CONSTRAINT fk_booking_guest FOREIGN KEY (guest_id) REFERENCES guest(guest_id) ON DELETE CASCADE,
  CONSTRAINT fk_booking_room FOREIGN KEY (room_id) REFERENCES room(room_id) ON DELETE CASCADE
);

CREATE INDEX idx_booking_room_dates ON booking(room_id, check_in, check_out);
CREATE INDEX idx_booking_guestid ON booking(guest_id);
CREATE INDEX idx_booking_status ON booking(booking_status);


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
