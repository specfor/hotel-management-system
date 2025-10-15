-- Migration: seed_data
-- Created: 2025-10-05T12:41:52.793Z
-- Description: Add description here

-- =====================================================
-- UP MIGRATION
-- =====================================================

-- =========================
-- 1. Branches
-- =========================
INSERT INTO branch (branch_name, city, address) VALUES
('Colombo Central', 'Colombo', '123 Main St'),
('Kandy Lakeview', 'Kandy', '45 Lake Rd'),
('Galle Fort', 'Galle', '12 Fort Street');

-- =========================
-- 2. Room Types
-- =========================
INSERT INTO room_type (branch_id, type_name, daily_rate, late_checkout_rate, capacity, amenities) VALUES
(1, 'Single', 50.00, 10.00, 1, 'WiFi, TV'),
(1, 'Double', 80.00, 15.00, 2, 'WiFi, TV, Mini-fridge'),
(1, 'Suite', 150.00, 25.00, 4, 'WiFi, TV, Mini-fridge, Jacuzzi'),
(2, 'Single', 55.00, 10.00, 1, 'WiFi, TV'),
(2, 'Double', 85.00, 15.00, 2, 'WiFi, TV, Mini-fridge'),
(3, 'Suite', 160.00, 25.00, 4, 'WiFi, TV, Mini-fridge, Jacuzzi');

-- =========================
-- 3. Rooms
-- =========================
INSERT INTO room (branch_id, type_id, room_status) VALUES
(1, 1, 'Available'),
(1, 2, 'Available'),
(1, 3, 'Available'),
(2, 4, 'Available'),
(2, 5, 'Available'),
(3, 6, 'Available');

-- =========================
-- 4. Guests
-- =========================
INSERT INTO guest (guest_id, nic, name, age, contact_no, email, password) VALUES
(1, 901234567, 'John Doe', 30, 94771234567, 'john@example.com', 'pass123'),
(2, 902345678, 'Jane Smith', 28, 94779876543, 'jane@example.com', 'pass456'),
(3, 903456789, 'Alice Brown', 35, 94775678901, 'alice@example.com', 'pass789'),
(4, 904567890, 'Bob White', 40, 94772345678, 'bob@example.com', 'pass321'),
(5, 905678901, 'Charlie Black', 32, 94773456789, 'charlie@example.com', 'pass654');

-- =========================
-- 5. Staff
-- =========================
INSERT INTO staff (staff_id, branch_id, name, contact_no, email, job_title, salary) VALUES
(1, 1, 'Alice Manager', 94771230001, 'alice.manager@example.com', 'Manager', 1500.00),
(2, 2, 'Bob Reception', 94771230002, 'bob.reception@example.com', 'Receptionist', 800.00),
(3, 3, 'Charlie Housekeeping', 94771230003, 'charlie.house@example.com', 'Housekeeping', 700.00);

-- =========================
-- 6. Users (staff login)
-- =========================
INSERT INTO "user" (staff_id, username, password_hash) VALUES
(1, 'alice', 'hashedpass1'),
(2, 'bob', 'hashedpass2'),
(3, 'charlie', 'hashedpass3');

-- =========================
-- 7. Chargable Services
-- =========================
INSERT INTO chargable_services (service_id, branch_id, service_name, unit_price, unit_type) VALUES
(1, 1, 'Room Service', 10.00, 'Per item'),
(2, 1, 'Laundry', 5.00, 'Per item'),
(3, 1, 'Spa', 30.00, 'Per session'),
(4, 2, 'Mini-bar', 15.00, 'Per item'),
(5, 2, 'Laundry', 6.00, 'Per item'),
(6, 3, 'Room Service', 12.00, 'Per item');

-- =========================
-- 8. Bookings
-- =========================
INSERT INTO booking (booking_id, user_id, guest_id, room_id, booking_status, payment_method, date_time, check_in, check_out) VALUES
(1, 1, 1, 1, 'Booked', 'Credit Card', NOW(), '2025-10-01 14:00', '2025-10-05 12:00'),
(2, 2, 2, 2, 'Checked-In', 'Cash', NOW(), '2025-09-28 15:00', '2025-10-02 11:00'),
(3, 1, 3, 3, 'Cancelled', 'Bank Transfer', NOW(), '2025-09-30 16:00', '2025-10-03 12:00');

-- =========================
-- 9. Service Usage
-- =========================
INSERT INTO service_usage (record_id, service_id, booking_id, date_time, quantity, total_price) VALUES
(1, 1, 1, '2025-10-02 10:00', 2, 20.00),
(2, 2, 1, '2025-10-03 09:00', 3, 15.00),
(3, 4, 2, '2025-09-29 18:00', 1, 15.00);

-- =========================
-- 10. Payments
-- =========================
-- INSERT INTO payment (payment_id, bill_id, paid_method, paid_amount, date_time) VALUES
-- (1, 1, 'Credit Card', 100.00, '2025-10-05 13:00'),
-- (2, 2, 'Cash', 50.00, '2025-09-28 16:00');

-- =========================
-- 11. Discounts
-- =========================
INSERT INTO discount (branch_id, discount_name, discount_type, discount_value, min_bill_amount, discount_condition, valid_from, valid_to) VALUES
(1, 'Summer Sale', 'percentage', 10.00, NULL, 'Min stay 3 nights', '2025-06-01', '2025-08-31'),
(2, 'Weekend Special', 'fixed', 1000.00, NULL, 'Friday to Sunday stays', '2025-01-01', '2025-12-31'),
(1, 'Big Spender Offer', 'percentage', 15.00, 20000.00, 'Applicable for bills over Rs. 20,000', '2025-03-01', '2025-05-31'),
(3, 'Holiday Deal', 'fixed', 750.00, 10000.00, 'Valid for bookings above Rs. 10,000', '2025-11-15', '2025-12-31');

-- =========================
-- 12. Revenue
-- =========================
INSERT INTO revenue (record_id, branch_id, month, calculated_data_time, amount) VALUES
(1, 1, 9, NOW(), 5000.00),
(2, 2, 9, NOW(), 3000.00),
(3, 3, 9, NOW(), 4000.00);

-- =========================
-- 13. Logs
-- =========================
INSERT INTO log (record_id, user_id, action, date_time, action_rec_id) VALUES
(1, 1, 'Created booking', NOW(), 1),
(2, 2, 'Checked-in guest', NOW(), 2);



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
