-- -- Migration: seed_data
-- -- Created: 2025-10-05T12:41:52.793Z
-- -- Description: Add description here

-- -- =====================================================
-- -- UP MIGRATION
-- -- =====================================================

-- =========================
-- 1. Branches
-- =========================
INSERT INTO branch (branch_id, branch_name, city, address) VALUES
(1, 'Colombo Central', 'Colombo', '123 Main St'),
(2, 'Kandy Lakeview', 'Kandy', '45 Lake Rd'),
(3, 'Galle Fort', 'Galle', '12 Fort Street');

-- =========================
-- 2. Room Types
-- =========================
INSERT INTO room_type (type_id, branch_id, type_name, daily_rate, late_checkout_rate, capacity, amenities) VALUES
(1, 1, 'Single', 50.00, 10.00, 1, 'WiFi, TV'),
(2, 1, 'Double', 80.00, 15.00, 2, 'WiFi, TV, Mini-fridge'),
(3, 1, 'Suite', 150.00, 25.00, 4, 'WiFi, TV, Mini-fridge, Jacuzzi'),
(4, 2, 'Single', 55.00, 10.00, 1, 'WiFi, TV'),
(5, 2, 'Double', 85.00, 15.00, 2, 'WiFi, TV, Mini-fridge'),
(6, 3, 'Suite', 160.00, 25.00, 4, 'WiFi, TV, Mini-fridge, Jacuzzi');

-- =========================
-- 3. Rooms
-- =========================
INSERT INTO room (room_id, branch_id, type_id, room_status) VALUES
(101, 1, 1, 'Available'),
(102, 1, 2, 'Available'),
(103, 1, 3, 'Available'),
(201, 2, 4, 'Available'),
(202, 2, 5, 'Available'),
(301, 3, 6, 'Available');

-- -- =========================
-- -- 4. Guests
-- -- =========================
INSERT INTO guest (guest_id, nic, name, age, contact_no, email, password) VALUES
(1, 901234567, 'John Doe', 30, 94771234567, 'john@example.com', 'pass123'),
(2, 902345678, 'Jane Smith', 28, 94779876543, 'jane@example.com', 'pass456'),
(3, 903456789, 'Alice Brown', 35, 94775678901, 'alice@example.com', 'pass789'),
(4, 904567890, 'Bob White', 40, 94772345678, 'bob@example.com', 'pass321'),
(5, 905678901, 'Charlie Black', 32, 94773456789, 'charlie@example.com', 'pass654'),
(6, '906789012', 'Emily Davis', 27, '94770123456', 'emily.davis@gmail.com', 'em123'),
(7, '907890123', 'Liam Johnson', 33, '94771239876', 'liam.j@gmail.com', 'liam456'),
(8, '908901234', 'Sophia Wilson', 29, '94778901234', 'sophia.w@gmail.com', 'soph999'),
(9, '909012345', 'Ethan Taylor', 41, '94775551234', 'ethan.t@gmail.com', 'ethanpw'),
(10, '910123456', 'Olivia Martinez', 26, '94772224567', 'olivia.m@gmail.com', 'livpass'),

(11, '911234567', 'Noah Anderson', 38, '94778889900', 'noah.a@gmail.com', 'noah777'),
(12, '912345678', 'Ava Thomas', 31, '94770001122', 'ava.t@gmail.com', 'ava321'),
(13, '913456789', 'William Jackson', 45, '94776667788', 'will.j@gmail.com', 'wjpass'),
(14, '914567890', 'Isabella Lee', 24, '94779998877', 'bella.lee@gmail.com', 'belle1'),
(15, '915678901', 'James Harris', 36, '94772233445', 'james.h@gmail.com', 'jh456'),

-- Foreign guests (passport-style NICs instead of NULL)
(16, 'P-DE-000016', 'Lucas Müller', 34, '4915123456789', 'lucas.muller@outlook.de', 'lm_pass'),
(17, 'P-SE-000017', 'Emma Johansson', 27, '46701234567', 'emma.johansson@sweden.se', 'emma567'),
(18, 'P-JP-000018', 'Hiroshi Tanaka', 39, '818012345678', 'hiroshi.t@japan.jp', 'hiro123'),
(19, 'P-IT-000019', 'Maria Rossi', 30, '393451234567', 'maria.rossi@italy.it', 'mrossi'),
(20, 'P-BR-000020', 'Carlos Silva', 42, '558198765432', 'carlos.silva@brazil.br', 'csilva'),

(21, '916789012', 'Ella Robinson', 25, '94775678912', 'ella.r@gmail.com', 'ella25'),
(22, '917890123', 'Mason Walker', 37, '94776543210', 'mason.w@gmail.com', 'mw999'),
(23, '918901234', 'Mia Hall', 28, '94779880011', 'mia.hall@gmail.com', 'mia123'),
(24, '919012345', 'Benjamin Allen', 35, '94770112233', 'ben.allen@gmail.com', 'benpw'),
(25, '920123456', 'Charlotte Young', 29, '94773334455', 'charlotte.y@gmail.com', 'charpw'),

(26, 'P-KR-000026', 'David Kim', 31, '821055667788', 'david.kim@korea.kr', 'dkim88'),
(27, 'P-RU-000027', 'Anna Petrova', 40, '74951234567', 'anna.petrova@russia.ru', 'apass99'),
(28, 'P-FR-000028', 'Léa Dupont', 26, '33678901234', 'lea.dupont@france.fr', 'lea2025'),
(29, 'P-EG-000029', 'Ahmed Hassan', 38, '201112223334', 'ahmed.hassan@egypt.eg', 'ahm321'),
(30, 'P-AU-000030', 'Jack Miller', 34, '61451234567', 'jack.miller@australia.au', 'jackpw'),

(31, '921234567', 'Grace Scott', 32, '94772334455', 'grace.s@gmail.com', 'gs321'),
(32, '922345678', 'Henry King', 39, '94775556677', 'henry.k@gmail.com', 'hkpass'),
(33, '923456789', 'Chloe Adams', 23, '94778889911', 'chloe.adams@gmail.com', 'chloepw'),
(34, '924567890', 'Daniel Baker', 44, '94771112233', 'dan.baker@gmail.com', 'dbpass'),
(35, '925678901', 'Zoe Carter', 27, '94770005566', 'zoe.carter@gmail.com', 'zoe88');


-- -- =========================
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
INSERT INTO chargeable_services (service_id, branch_id, service_name, unit_price, unit_type) VALUES
(1, 1, 'Room Service', 10.00, 'Per item'),
(2, 1, 'Laundry', 5.00, 'Per item'),
(3, 1, 'Spa', 30.00, 'Per session'),
(4, 2, 'Mini-bar', 15.00, 'Per item'),
(5, 2, 'Laundry', 6.00, 'Per item'),
(6, 3, 'Room Service', 12.00, 'Per item');

-- =========================
-- 8. Bookings
-- =========================
INSERT INTO booking (booking_id, user_id, guest_id, room_id, booking_status, date_time, check_in, check_out) VALUES
(1, 1, 1, 101, 'Booked', NOW(), '2025-10-01 14:00', '2025-10-05 12:00'),
(2, 2, 2, 102, 'Checked-In', NOW(), '2025-09-28 15:00', '2025-10-02 11:00'),
(3, 1, 3, 103, 'Cancelled', NOW(), '2025-09-30 16:00', '2025-10-03 12:00');

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
-- =========================
-- Final Bill Inserts (minimal for triggers)
-- =========================
INSERT INTO final_bill (bill_id, user_id, booking_id, total_tax) VALUES
-- Bill for booking 1
(1, 1, 1, 0),

-- Bill for booking 2
(2, 2, 2, 0),

-- Bill for booking 3
(3, 1, 3, 0);


INSERT INTO payment (payment_id, bill_id, paid_method, paid_amount, date_time) VALUES
(1, 1, 'Credit Card', 100.00, '2025-10-05 13:00'),
(2, 2, 'Cash', 50.00, '2025-09-28 16:00');

-- =========================
-- 11. Discounts
-- =========================
INSERT INTO discount (discount_id, branch_id, discount_name, discount_type, discount_value, min_bill_amount, discount_condition, valid_from, valid_to) VALUES
(1, 1, 'Summer Sale', 'percentage', 10.00, 0, 'Min stay 3 nights', '2025-06-01', '2025-08-31'),
(2, 2, 'Weekend Special', 'fixed', 15.00, 50, 'Friday to Sunday stays', '2025-01-01', '2025-12-31');

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

-- =========================
-- Reset Sequences
-- =========================
-- Reset all SERIAL sequences to continue from max ID + 1
SELECT setval('branch_branch_id_seq', (SELECT COALESCE(MAX(branch_id), 1) FROM branch));
SELECT setval('room_type_type_id_seq', (SELECT COALESCE(MAX(type_id), 1) FROM room_type));
SELECT setval('room_room_id_seq', (SELECT COALESCE(MAX(room_id), 1) FROM room));
SELECT setval('guest_guest_id_seq', (SELECT COALESCE(MAX(guest_id), 1) FROM guest));
SELECT setval('staff_staff_id_seq', (SELECT COALESCE(MAX(staff_id), 1) FROM staff));
SELECT setval('chargeable_services_service_id_seq', (SELECT COALESCE(MAX(service_id), 1) FROM chargeable_services));
SELECT setval('booking_booking_id_seq', (SELECT COALESCE(MAX(booking_id), 1) FROM booking));
SELECT setval('service_usage_record_id_seq', (SELECT COALESCE(MAX(record_id), 1) FROM service_usage));
SELECT setval('payment_payment_id_seq', (SELECT COALESCE(MAX(payment_id), 1) FROM payment));
SELECT setval('discount_discount_id_seq', (SELECT COALESCE(MAX(discount_id), 1) FROM discount));
SELECT setval('revenue_record_id_seq', (SELECT COALESCE(MAX(record_id), 1) FROM revenue));
SELECT setval('log_record_id_seq', (SELECT COALESCE(MAX(record_id), 1) FROM log));

-- -- Add your SQL statements here
-- -- Example:
-- -- CREATE TABLE example_table (
-- --   id SERIAL PRIMARY KEY,
-- --   name VARCHAR(255) NOT NULL,
-- --   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- -- );

-- -- =====================================================
-- -- NOTES
-- -- =====================================================
-- -- This migration will be executed in a transaction.
-- -- If any statement fails, the entire migration will be rolled back.
-- -- 
-- -- Best practices:
-- -- 1. Always include CREATE INDEX statements for foreign keys
-- -- 2. Use TIMESTAMP WITH TIME ZONE for datetime fields
-- -- 3. Add NOT NULL constraints where appropriate
-- -- 4. Consider adding default values for new columns
-- -- 5. Test migrations on a copy of production data first

-- =====================================================
-- ROLLBACK (Manual - for reference only)
-- =====================================================
-- If you need to manually rollback this migration:
-- DROP TABLE IF EXISTS example_table;
