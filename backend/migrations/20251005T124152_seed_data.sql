-- -- -- Migration: seed_data
-- -- -- Created: 2025-10-05T12:41:52.793Z
-- -- -- Description: Add description here

-- -- -- =====================================================
-- -- -- UP MIGRATION
-- -- -- =====================================================

INSERT INTO branch (branch_name, city, address) VALUES
('Colombo Central', 'Colombo', '123 Main St'),
('Kandy Lakeview', 'Kandy', '45 Lake Rd'),
('Galle Fort', 'Galle', '12 Fort Street');

-- -- =========================
INSERT INTO room_type (branch_id, type_name, daily_rate, late_checkout_rate, capacity, amenities) VALUES
(1, 'Single', 50.00, 10.00, 1, 'WiFi, TV'),
(1, 'Double', 80.00, 15.00, 2, 'WiFi, TV, Mini-fridge'),
(1, 'Suite', 150.00, 25.00, 4, 'WiFi, TV, Mini-fridge, Jacuzzi'),
(2, 'Single', 55.00, 10.00, 1, 'WiFi, TV'),
(2, 'Double', 85.00, 15.00, 2, 'WiFi, TV, Mini-fridge'),
(3, 'Suite', 160.00, 25.00, 4, 'WiFi, TV, Mini-fridge, Jacuzzi');

-- -- =========================
INSERT INTO room (branch_id, type_id, room_status) VALUES
(1, 1, 'Available'),
(1, 2, 'Available'),
(1, 3, 'Available'),
(2, 4, 'Available'),
(2, 5, 'Available'),
(3, 6, 'Available');

-- -- -- =========================
-- -- -- 4. Guests
-- -- -- =========================
INSERT INTO guest (guest_id, nic, name, age, contact_no, email, password) VALUES
(1, 901234567, 'John Doe', 30, 94771234567, 'john@example.com', 'pass123'),
(2, 902345678, 'Jane Smith', 28, 94779876543, 'jane@example.com', 'pass456'),
(3, 903456789, 'Alice Brown', 35, 94775678901, 'alice@example.com', 'pass789'),
(4, 904567890, 'Bob White', 40, 94772345678, 'bob@example.com', 'pass321'),
(5, 905678901, 'Charlie Black', 32, 94773456789, 'charlie@example.com', 'pass654');

-- -- -- =========================
-- -- -- 5. Staff
-- -- -- =========================
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

-- -- =========================
-- -- 7. Chargeable Services
-- -- =========================
-- INSERT INTO chargeable_services (service_id, branch_id, service_name, unit_price, unit_type) VALUES
-- (1, 1, 'Room Service', 10.00, 'Per item'),
-- (2, 1, 'Laundry', 5.00, 'Per item'),
-- (3, 1, 'Spa', 30.00, 'Per session'),
-- (4, 2, 'Mini-bar', 15.00, 'Per item'),
-- (5, 2, 'Laundry', 6.00, 'Per item'),
-- (6, 3, 'Room Service', 12.00, 'Per item');

-- =========================
INSERT INTO booking (booking_id, user_id, guest_id, room_id, booking_status, date_time, check_in, check_out) VALUES
(1, 1, 1, 1, 'Booked', NOW(), '2025-10-01 14:00', '2025-10-05 12:00'),
(2, 2, 2, 2, 'Checked-In', NOW(), '2025-09-28 15:00', '2025-10-02 11:00'),
(3, 1, 3, 3, 'Cancelled', NOW(), '2025-09-30 16:00', '2025-10-03 12:00');

-- -- Insert into service_usage (depends on service, booking)
-- -- Testing: FKs, trigger calc_total_price (quantity * unit_price)
-- -- Coverage: Multiple per booking, quantity boundary 1/10, total calculated
-- -- Scenarios: Various dates, for different booking statuses
-- INSERT INTO public.service_usage (service_id, booking_id, date_time, quantity) VALUES
-- (1, 1, '2024-09-12 00:00:00', 2.00),  -- Triggers total=20.00
-- (2, 2, '2025-10-23 00:00:00', 1.00),  -- 25.00
-- (3, 3, '2025-11-02 00:00:00', 3.00),  -- 45.00, future
-- (4, 4, '2025-11-06 00:00:00', 1.00),  -- 50.00, cancelled
-- (5, 5, '2024-08-06 00:00:00', 4.00),  -- 20.00
-- (6, 6, '2025-10-24 00:00:00', 2.00),  -- 60.00
-- (7, 7, '2026-01-11 00:00:00', 1.00),  -- 20.00
-- (8, 8, '2024-07-02 00:00:00', 5.00),  -- 200.00
-- (9, 9, '2024-10-11 00:00:00', 3.00),  -- 45.00
-- (10, 10, '2025-10-24 00:00:00', 2.00);  -- 200.00

-- -- Additional (total 15 >10), high quantity
-- INSERT INTO public.service_usage (service_id, booking_id, date_time, quantity) VALUES
-- (11, 11, '2025-10-24 00:00:00', 1.00),  -- 25.00
-- (12, 12, '2024-07-02 00:00:00', 4.00),  -- 200.00
-- (13, 13, '2025-12-11 00:00:00', 2.00),  -- 20.00
-- (14, 14, '2026-02-06 00:00:00', 10.00),  -- High qty
-- (15, 15, '2025-11-07 00:00:00', 1.00);  -- 200.00

-- -- Insert into final_bill (depends on user, booking)
-- -- Testing: FKs, defaults 0, check >=0, triggers for charges, discount, total, outstanding
-- -- Coverage: Calculations via functions: room_charges (days*rate), services sum, discount conditions, late (if past check_out)
-- -- Scenarios: Past bookings (late charge >0), future (0), loyalty (old guest), seasonal (if month match), min nights, early (days_before >30)
-- -- Note: Insert minimal, triggers fill rest; assume insert on 2025-10-23, so past have late, current/future 0
-- -- For booking 1 (past, old guest): expect discount loyalty if applicable, late hours many
-- INSERT INTO public.final_bill (user_id, booking_id, total_tax, paid_amount) VALUES
-- (1, 1, 10.00, 0.00),  -- Triggers calcs: room_charges=5*100=500 (assuming type1 rate100, but wait, adjust to schema), etc.
-- (2, 2, 15.00, 100.00),  -- Partial paid, outstanding calc
-- (3, 3, 20.00, 0.00),
-- (4, 4, 5.00, 0.00),  -- Cancelled, but bill exists
-- (5, 5, 25.00, 0.00),
-- (6, 6, 30.00, 200.00),
-- (7, 7, 10.00, 0.00),
-- (8, 8, 15.00, 0.00),
-- (9, 9, 20.00, 0.00),
-- (10, 10, 25.00, 0.00);

-- -- Additional (total 15 >10), test different discounts: e.g. booking3 future, if early days>30
-- INSERT INTO public.final_bill (user_id, booking_id, total_tax, paid_amount) VALUES
-- (1, 11, 30.00, 0.00),
-- (2, 12, 10.00, 0.00),
-- (3, 13, 15.00, 0.00),
-- (4, 14, 20.00, 0.00),
-- (5, 15, 25.00, 0.00);

-- -- Insert into payment (depends on final_bill)
-- -- Testing: FK to bill, paid_amount >0, notes, default date_time
-- -- Coverage: Multiple per bill, various methods, full/partial
-- -- Scenarios: Cash, card, transfer; notes for refunds on cancelled
-- INSERT INTO public.payment (bill_id, paid_method, paid_amount, notes) VALUES
-- (1, 'Credit Card', 500.00, 'Full payment for past booking'),
-- (2, 'Cash', 200.00, 'Partial payment'),
-- (2, 'Debit Card', 100.00, 'Additional partial'),
-- (3, 'Bank Transfer', 300.00, 'Full'),
-- (4, 'Credit Card', 0.00, 'Refund for cancelled'),
-- (5, 'Cash', 400.00, 'Full'),
-- (6, 'Debit Card', 500.00, 'Overpayment?'),
-- (7, 'Bank Transfer', 200.00, 'Partial'),
-- (8, 'Credit Card', 600.00, 'Full'),
-- (9, 'Cash', 150.00, 'Partial'),
-- (10, 'Debit Card', 250.00, 'Full');

-- -- Additional (total 15 >10), more multiples
-- INSERT INTO public.payment (bill_id, paid_method, paid_amount, notes) VALUES
-- (11, 'Bank Transfer', 350.00, 'Full'),
-- (12, 'Credit Card', 100.00, 'Partial'),
-- (13, 'Cash', 450.00, 'Full'),
-- (14, 'Debit Card', 300.00, 'Partial'),
-- (15, 'Bank Transfer', 200.00, 'Additional');

-- -- Insert into log (depends on user)
-- -- Testing: FK to user, default date_time, action_rec_id optional
-- -- Coverage: Various actions, timestamps past/present
-- -- Scenarios: Logs for creates, updates, deletes (simulated), related to bookings etc.
-- INSERT INTO public.log (user_id, action, date_time, action_rec_id) VALUES
-- (1, 'Created booking', '2024-09-01 00:00:00', 1),
-- (2, 'Updated guest info', '2025-10-23 00:00:00', 2),
-- (3, 'Processed payment', '2025-11-01 00:00:00', 3),
-- (4, 'Cancelled booking', '2025-11-05 00:00:00', 4),
-- (5, 'Added service usage', '2024-08-06 00:00:00', 5),
-- (6, 'Generated bill', '2025-10-24 00:00:00', 6),
-- (7, 'Updated room status', '2026-01-11 00:00:00', 7),
-- (8, 'Applied discount', '2024-07-02 00:00:00', 8),
-- (9, 'Logged revenue', '2024-10-11 00:00:00', 9),
-- (10, 'Staff update', '2025-10-24 00:00:00', 10);

-- -- Additional (total 15 >10)
-- INSERT INTO public.log (user_id, action, date_time, action_rec_id) VALUES
-- (11, 'Guest registration', '2025-10-24 00:00:00', 11),
-- (12, 'Service request', '2024-07-02 00:00:00', 12),
-- (13, 'Bill payment', '2025-12-11 00:00:00', 13),
-- (14, 'Check-in processed', '2026-02-06 00:00:00', 14),
-- (15, 'Check-out completed', '2025-11-07 00:00:00', 15);

-- -- Insert into revenue (depends on branch)
-- -- Testing: FK to branch, check amount >=0, month 1-12, default calculated_data_time
-- -- Coverage: Multiple per branch, various months past/present/future? But month int, probably current year assumed
-- -- Scenarios: 0 amount (low month), high, for different branches
-- INSERT INTO public.revenue (branch_id, month, amount) VALUES
-- (1, 1, 10000.00),
-- (1, 10, 15000.00),  -- Current month
-- (2, 2, 20000.00),
-- (2, 11, 0.00),  -- Min
-- (3, 3, 25000.00),
-- (4, 4, 30000.00),
-- (5, 5, 35000.00),
-- (6, 6, 40000.00),
-- (7, 7, 45000.00),
-- (8, 8, 50000.00);

-- -- Additional (total 15 >10), more months
-- INSERT INTO public.revenue (branch_id, month, amount) VALUES
-- (9, 9, 55000.00),
-- (10, 12, 60000.00),
-- (1, 12, 120000.00),  -- High
-- (2, 1, 5000.00),
-- (3, 10, 18000.00);