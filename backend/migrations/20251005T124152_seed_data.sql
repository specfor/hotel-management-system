-- Branches
INSERT INTO branch (branch_id, branch_name, city, address) VALUES
(1, 'Colombo Central', 'Colombo', '123 Main St'),
(2, 'Kandy Lakeview', 'Kandy', '45 Lake Rd'),
(3, 'Galle Fort', 'Galle', '12 Fort Street');

-- Room Types
INSERT INTO room_type (type_id, branch_id, type_name, daily_rate, late_checkout_rate, capacity, amenities) VALUES
(1, 1, 'Single', 50.00, 10.00, 1, 'WiFi, TV'),
(2, 1, 'Double', 80.00, 15.00, 2, 'WiFi, TV, Mini-fridge'),
(3, 1, 'Suite', 150.00, 25.00, 4, 'WiFi, TV, Mini-fridge, Jacuzzi'),
(4, 2, 'Single', 55.00, 10.00, 1, 'WiFi, TV'),
(5, 2, 'Double', 85.00, 15.00, 2, 'WiFi, TV, Mini-fridge'),
(6, 3, 'Suite', 160.00, 25.00, 4, 'WiFi, TV, Mini-fridge, Jacuzzi');

-- Rooms (room_id must match bookings and be unique)
INSERT INTO room (room_id, branch_id, type_id, room_status) VALUES
(101, 1, 1, 'Available'),
(102, 1, 2, 'Available'),
(103, 1, 3, 'Available'),
(104, 2, 4, 'Available'),
(105, 2, 5, 'Available'),
(106, 3, 6, 'Available');

-- Guests
INSERT INTO guest (guest_id, nic, name, age, contact_no, email, password) VALUES
(1, '901234567V', 'John Doe', 30, '0771234567', 'john@example.com', 'pass123'),
(2, '902345678V', 'Jane Smith', 28, '0779876543', 'jane@example.com', 'pass456'),
(3, '903456789V', 'Alice Brown', 35, '0775678901', 'alice@example.com', 'pass789');

-- Staff
INSERT INTO staff (staff_id, branch_id, name, contact_no, email, job_title, salary) VALUES
(1, 1, 'Alice Manager', '07771230001', 'alice.manager@example.com', 'Manager', 1500.00),
(2, 2, 'Bob Reception', '07771230002', 'bob.reception@example.com', 'Receptionist', 800.00),
(3, 3, 'Charlie Housekeeping', '07771230003', 'charlie.house@example.com', 'Housekeeping', 700.00);

-- Users (staff login)
INSERT INTO "user" (user_id, staff_id, username, password_hash) VALUES
(1, 1, 'alice', 'hashedpass1'),
(2, 2, 'bob', 'hashedpass2'),
(3, 3, 'charlie', 'hashedpass3');

-- Bookings (room_id, user_id, guest_id must exist)
INSERT INTO booking (booking_id, user_id, guest_id, room_id, booking_status, date_time, check_in, check_out) VALUES
(1, 1, 1, 101, 'Booked', NOW(), '2025-10-01 14:00', '2025-10-05 12:00'),
(2, 2, 2, 102, 'Checked-In', NOW(), '2025-09-28 15:00', '2025-10-02 11:00'),
(3, 1, 3, 103, 'Cancelled', NOW(), '2025-09-30 16:00', '2025-10-03 12:00');

-- Chargeable Services
INSERT INTO chargeable_services (service_id, branch_id, service_name, unit_price, unit_type) VALUES
(1, 1, 'Room Service', 10.00, 'Per item'),
(2, 1, 'Laundry', 5.00, 'Per item'),
(3, 1, 'Spa', 30.00, 'Per session'),
(4, 2, 'Mini-bar', 15.00, 'Per item'),
(5, 2, 'Laundry', 6.00, 'Per item'),
(6, 3, 'Room Service', 12.00, 'Per item');

-- Service Usage (service_id and booking_id must exist)
INSERT INTO service_usage (record_id, service_id, booking_id, date_time, quantity, total_price) VALUES
(1, 1, 1, '2025-10-02 10:00', 2, 20.00),
(2, 2, 1, '2025-10-03 09:00', 3, 15.00),
(3, 4, 2, '2025-09-29 18:00', 1, 15.00);

-- Final Bills (booking_id must exist)
INSERT INTO final_bill (bill_id, user_id, booking_id, room_charges, total_service_charges, total_tax, total_discount, late_checkout_charge, total_amount, paid_amount, outstanding_amount, created_at) VALUES
(1, 1, 1, 200.00, 35.00, 20.00, 10.00, 0.00, 245.00, 100.00, 145.00, NOW()),
(2, 2, 2, 160.00, 15.00, 10.00, 0.00, 0.00, 185.00, 50.00, 135.00, NOW());

-- Payments (bill_id must exist)
INSERT INTO payment (payment_id, bill_id, paid_method, paid_amount, date_time) VALUES
(1, 1, 'Credit Card', 100.00, '2025-10-05 13:00'),
(2, 2, 'Cash', 50.00, '2025-09-28 16:00');

-- Discounts
INSERT INTO discount (discount_id, branch_id, discount_name, discount_type, discount_value, min_bill_amount, discount_condition, valid_from, valid_to) VALUES
(1, 1, 'Summer Sale', 'percentage', 10.00, NULL, 'Min stay 3 nights', '2025-06-01', '2025-08-31'),
(2, 2, 'Weekend Special', 'fixed', 1000.00, NULL, 'Friday to Sunday stays', '2025-01-01', '2025-12-31'),
(3, 1, 'Big Spender Offer', 'percentage', 15.00, 20000.00, 'Applicable for bills over Rs. 20,000', '2025-03-01', '2025-05-31'),
(4, 3, 'Holiday Deal', 'fixed', 750.00, 10000.00, 'Valid for bookings above Rs. 10,000', '2025-11-15', '2025-12-31');

-- Revenue
INSERT INTO revenue (record_id, branch_id, month, calculated_data_time, amount) VALUES
(1, 1, 9, NOW(), 5000.00),
(2, 2, 9, NOW(), 3000.00),
(3, 3, 9, NOW(), 4000.00);

-- Logs
INSERT INTO log (record_id, user_id, action, date_time, action_rec_id) VALUES
(1, 1, 'Created booking', NOW(), 1),
(2, 2, 'Checked-in guest', NOW(), 2);

-- Reset Sequences (if using SERIAL/identity columns)
SELECT setval('branch_branch_id_seq', (SELECT COALESCE(MAX(branch_id), 1) FROM branch));
SELECT setval('room_type_type_id_seq', (SELECT COALESCE(MAX(type_id), 1) FROM room_type));
SELECT setval('room_room_id_seq', (SELECT COALESCE(MAX(room_id), 1) FROM room));
SELECT setval('guest_guest_id_seq', (SELECT COALESCE(MAX(guest_id), 1) FROM guest));
SELECT setval('staff_staff_id_seq', (SELECT COALESCE(MAX(staff_id), 1) FROM staff));
SELECT setval('user_user_id_seq', (SELECT COALESCE(MAX(user_id), 1) FROM "user"));
SELECT setval('booking_booking_id_seq', (SELECT COALESCE(MAX(booking_id), 1) FROM booking));
SELECT setval('chargeable_services_service_id_seq', (SELECT COALESCE(MAX(service_id), 1) FROM chargeable_services));
SELECT setval('service_usage_record_id_seq', (SELECT COALESCE(MAX(record_id), 1) FROM service_usage));
SELECT setval('final_bill_bill_id_seq', (SELECT COALESCE(MAX(bill_id), 1) FROM final_bill));
SELECT setval('payment_payment_id_seq', (SELECT COALESCE(MAX(payment_id), 1) FROM payment));
SELECT setval('discount_discount_id_seq', (SELECT COALESCE(MAX(discount_id), 1) FROM discount));
SELECT setval('revenue_record_id_seq', (SELECT COALESCE(MAX(record_id), 1) FROM revenue));
SELECT setval('log_record_id_seq', (SELECT COALESCE(MAX(record_id), 1) FROM