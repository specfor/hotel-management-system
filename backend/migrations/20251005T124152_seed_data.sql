-- Insert into branch table first (no dependencies)
-- Testing: Primary key auto-increment, NOT NULL implied, realistic branch names and locations
-- Coverage: 10 branches to provide base for foreign keys in other tables
-- Scenarios: Various cities, addresses for diversity
INSERT INTO public.branch (branch_name, city, address) VALUES
('Grand Central Hotel', 'New York', '350 5th Ave'),
('Ocean Breeze Resort', 'Miami', '100 Ocean Dr'),
('Rocky Mountain Lodge', 'Denver', '500 Peak Blvd'),
('Windy City Inn', 'Chicago', '200 Michigan Ave'),
('Sunset Beach Hotel', 'Los Angeles', '300 Hollywood Blvd'),
('Freedom Trail Manor', 'Boston', '400 Beacon St'),
('Desert Mirage Resort', 'Las Vegas', '600 Strip Ave'),
('River Bend Suites', 'Portland', '700 Waterfront Dr'),
('Emerald Lake Retreat', 'Seattle', '800 Rainier Ln'),
('Golden Gate Haven', 'San Francisco', '900 Bridge Way');

-- Additional 5 for volume (total 15 >10)
INSERT INTO public.branch (branch_name, city, address) VALUES
('Pacific Coast Inn', 'San Diego', '1000 Harbor Blvd'),
('Snow Peak Chalet', 'Aspen', '1100 Slope Rd'),
('Bay Area Lodge', 'Oakland', '1200 Port St'),
('Lone Star Hotel', 'Dallas', '1300 Ranch Dr'),
('Bayou Breeze Resort', 'Houston', '1400 Gulf Way');

-- Insert into room_type (depends on branch)
-- Testing: FK to branch, primary key, check on rates >0 implicitly, capacity >0
-- Coverage: Multiple types per branch, varying rates, amenities
-- Scenarios: Low/high capacity, different amenities, boundary rates (min 50, max 1000)
-- Note: Insert order respects FK, using branch_ids 1-10
-- Testing defaults: No defaults here
INSERT INTO public.room_type (branch_id, type_name, daily_rate, late_checkout_rate, capacity, amenities) VALUES
(1, 'Standard Single', 100.00, 20.00, 1, 'WiFi, TV'),
(1, 'Deluxe Double', 150.00, 30.00, 2, 'WiFi, TV, Mini-bar'),
(1, 'Executive Suite', 300.00, 50.00, 4, 'WiFi, TV, Kitchenette'),
(2, 'Beachfront Single', 120.00, 25.00, 1, 'WiFi, Ocean View'),
(2, 'Ocean View Double', 180.00, 35.00, 2, 'WiFi, Balcony'),
(3, 'Mountain Cabin', 200.00, 40.00, 3, 'Fireplace, Hiking Access'),
(4, 'City Standard', 110.00, 22.00, 2, 'WiFi, City View'),
(5, 'Luxury Beachfront', 250.00, 45.00, 4, 'Private Beach Access'),
(6, 'Historic Room', 160.00, 32.00, 2, 'Antique Furniture'),
(7, 'Vegas Suite', 500.00, 100.00, 6, 'Pool, Casino Access');

-- Additional for volume and variety (total 20 >10), including boundary capacity 1/10, rates min/max
INSERT INTO public.room_type (branch_id, type_name, daily_rate, late_checkout_rate, capacity, amenities) VALUES
(8, 'Riverside Double', 140.00, 28.00, 2, 'River View, Kayak Rental'),
(9, 'Lakeview Triple', 170.00, 34.00, 3, 'Boating Access'),
(10, 'City Penthouse', 400.00, 80.00, 5, 'Rooftop Terrace'),
(1, 'Budget Single', 50.00, 10.00, 1, 'WiFi'),
(2, 'Premium Suite', 1000.00, 200.00, 10, 'All Amenities'),
(3, 'Cozy Cabin', 80.00, 15.00, 2, 'Basic'),
(4, 'Family Room', 220.00, 44.00, 4, 'Kids Area'),
(5, 'VIP Bungalow', 350.00, 70.00, 6, 'Private Pool'),
(6, 'Economy Double', 90.00, 18.00, 2, 'TV'),
(7, 'High Roller Suite', 800.00, 160.00, 8, 'Jacuzzi, Bar');

-- Insert into discount (depends on branch)
-- Testing: FK to branch, check on discount_type (percentage/fixed), valid dates past/present/future
-- Coverage: Various conditions, min_bill_amount boundary 0/max, values >0
-- Scenarios: Seasonal (test months), loyalty, early bookings, etc. Spanning dates before/after 2025-10-23
-- Note: For loyalty test, will use old guest created_at later
INSERT INTO public.discount (branch_id, discount_name, discount_type, discount_value, min_bill_amount, discount_condition, valid_from, valid_to) VALUES
(1, 'New Year Special', 'percentage', 10.00, 100.00, 'Seasonal Discount', '2025-01-01', '2025-01-31'),
(1, 'Loyalty Reward', 'fixed', 50.00, NULL, 'Loyalty Member', '2020-01-01', '2030-12-31'),
(2, 'Summer Deal', 'percentage', 15.00, 200.00, 'Seasonal Discount', '2025-06-01', '2025-08-31'),
(2, 'Early Bird', 'fixed', 30.00, 30, 'Early Bookings', '2025-10-01', '2025-12-31'),
(3, 'Winter Promo', 'percentage', 20.00, 5, 'Minimum Nights', '2025-12-01', '2026-02-28'),
(4, 'Group Discount', 'fixed', 100.00, 500.00, 'Amount Greater Than', '2025-01-01', '2025-12-31'),
(5, 'Beach Package', 'percentage', 5.00, 100.00, 'Amount Less Than', '2024-07-01', '2024-09-30'),  -- Past validity
(6, 'History Buff', 'fixed', 20.00, NULL, 'Loyalty Member', '2025-10-01', '2025-11-30'),
(7, 'VIP Offer', 'percentage', 25.00, 1000.00, 'Amount Greater Than', '2026-01-01', '2026-12-31'),  -- Future
(8, 'River Adventure', 'fixed', 15.00, 150.00, 'Amount Greater Than', '2025-05-01', '2025-08-31');

-- Additional (total 15 >10), including edge min_bill 0, high value, different conditions
INSERT INTO public.discount (branch_id, discount_name, discount_type, discount_value, min_bill_amount, discount_condition, valid_from, valid_to) VALUES
(9, 'Lake Escape', 'percentage', 10.00, 200.00, 'Amount Greater Than', '2025-01-01', '2025-12-31'),
(10, 'City Explorer', 'fixed', 25.00, 0.00, 'Minimum Nights', '2025-10-23', '2025-12-31'),  -- Current date start
(1, 'Flash Sale', 'percentage', 50.00, 5000.00, 'Amount Greater Than', '2025-10-20', '2025-10-25'),  -- Short period around current
(2, 'Last Minute', 'fixed', 10.00, NULL, 'Early Bookings', '2024-01-01', '2024-12-31'),  -- Past
(3, 'Long Stay', 'percentage', 30.00, 10, 'Minimum Nights', '2026-01-01', '2026-12-31');  -- Future

-- Insert into chargeable_services (depends on branch)
-- Testing: FK to branch, unit_price >0, various unit_types
-- Coverage: Multiple services per branch, prices min 5 max 200
-- Scenarios: Realistic services, quantities in usage later
INSERT INTO public.chargeable_services (branch_id, service_name, unit_price, unit_type) VALUES
(1, 'Laundry Service', 10.00, 'per load'),
(1, 'Room Service Breakfast', 25.00, 'per meal'),
(1, 'Mini-Bar Restock', 15.00, 'per item'),
(2, 'Spa Massage', 50.00, 'per session'),
(2, 'Beach Towel Rental', 5.00, 'per day'),
(3, 'Guided Mountain Hike', 30.00, 'per person'),
(4, 'Airport Shuttle', 20.00, 'per trip'),
(5, 'Surfing Lesson', 40.00, 'per hour'),
(6, 'Historical City Tour', 15.00, 'per person'),
(7, 'Casino Entry', 100.00, 'per entry');

-- Additional (total 15 >10), boundary prices
INSERT INTO public.chargeable_services (branch_id, service_name, unit_price, unit_type) VALUES
(8, 'Kayak Rental', 25.00, 'per hour'),
(9, 'Boat Tour', 50.00, 'per hour'),
(10, 'Bike Rental', 10.00, 'per day'),
(1, 'Premium WiFi', 5.00, 'per day'),  -- Min price
(2, 'Luxury Yacht', 200.00, 'per hour');  -- Max price

-- Insert into guest (independent)
-- Testing: Unique nic, email; age boundary 18-100; created_at past/present for loyalty (some <2020-10-23 for 5y)
-- Coverage: NOT NULL on name, contact, etc.; default created_at, but override for test
-- Scenarios: Various ages, real names/emails/phones; historical for loyalty discount test
INSERT INTO public.guest (nic, name, age, contact_no, email, password, created_at, updated_at) VALUES
('123456789V', 'Johnathan Doe', 35, '212-555-1234', 'john.doe@example.com', 'hashedpass1', '2018-01-01 00:00:00', '2025-10-23 00:00:00'),  -- Old for loyalty
('234567890V', 'Jane Smith', 28, '305-555-5678', 'jane.smith@example.com', 'hashedpass2', '2025-10-23 00:00:00', '2025-10-23 00:00:00'),
('345678901V', 'Alice Wonderland', 45, '303-555-9012', 'alice@example.com', 'hashedpass3', '2019-05-15 00:00:00', '2025-10-23 00:00:00'),  -- Old
('456789012V', 'Bob Builder', 60, '312-555-3456', 'bob@example.com', 'hashedpass4', '2025-10-20 00:00:00', '2025-10-23 00:00:00'),
('567890123V', 'Charlie Brown', 18, '213-555-7890', 'charlie@example.com', 'hashedpass5', '2025-10-23 00:00:00', '2025-10-23 00:00:00'),  -- Min age
('678901234V', 'David Evans', 100, '617-555-2345', 'david@example.com', 'hashedpass6', '2015-03-10 00:00:00', '2025-10-23 00:00:00'),  -- Max age, old
('789012345V', 'Eva Green', 32, '702-555-6789', 'eva@example.com', 'hashedpass7', '2024-01-01 00:00:00', '2025-10-23 00:00:00'),
('890123456V', 'Frank Harris', 50, '503-555-0123', 'frank@example.com', 'hashedpass8', '2025-10-23 00:00:00', '2025-10-23 00:00:00'),
('901234567V', 'Grace Irving', 25, '206-555-4567', 'grace@example.com', 'hashedpass9', '2017-07-20 00:00:00', '2025-10-23 00:00:00'),  -- Old
('012345678V', 'Henry Jackson', 40, '415-555-8901', 'henry@example.com', 'hashedpass10', '2025-10-23 00:00:00', '2025-10-23 00:00:00');

-- Additional (total 15 >10), more variety
INSERT INTO public.guest (nic, name, age, contact_no, email, password, created_at, updated_at) VALUES
('123456780V', 'Ivy King', 55, '619-555-2345', 'ivy@example.com', 'hashedpass11', '2016-02-05 00:00:00', '2025-10-23 00:00:00'),  -- Old
('234567891V', 'Jack Lee', 22, '970-555-6789', 'jack@example.com', 'hashedpass12', '2025-10-23 00:00:00', '2025-10-23 00:00:00'),
('345678902V', 'Kara Martin', 47, '510-555-0123', 'kara@example.com', 'hashedpass13', '2023-11-15 00:00:00', '2025-10-23 00:00:00'),
('456789013V', 'Leo Nelson', 29, '214-555-4567', 'leo@example.com', 'hashedpass14', '2014-09-01 00:00:00', '2025-10-23 00:00:00'),  -- Old
('567890124V', 'Mia Oliver', 65, '713-555-8901', 'mia@example.com', 'hashedpass15', '2025-10-23 00:00:00', '2025-10-23 00:00:00');

-- Insert into staff (depends on branch)
-- Testing: FK to branch, salary >0, real names/emails/phones
-- Coverage: Multiple per branch, various job_titles
-- Scenarios: Boundary salaries min 30000 max 100000
INSERT INTO public.staff (branch_id, name, contact_no, email, job_title, salary) VALUES
(1, 'Manager Mike', 2125550001, 'mike@hotel.com', 'Manager', 80000.00),
(1, 'Receptionist Rita', 2125550002, 'rita@hotel.com', 'Receptionist', 40000.00),
(2, 'Concierge Carl', 3055550001, 'carl@resort.com', 'Concierge', 45000.00),
(2, 'Housekeeper Helen', 3055550002, 'helen@resort.com', 'Housekeeper', 35000.00),
(3, 'Guide Gary', 3035550001, 'gary@lodge.com', 'Guide', 42000.00),
(4, 'Driver Dana', 3125550001, 'dana@inn.com', 'Driver', 38000.00),
(5, 'Instructor Ian', 2135550001, 'ian@beach.com', 'Instructor', 46000.00),
(6, 'Tour Guide Tina', 6175550001, 'tina@manor.com', 'Tour Guide', 41000.00),
(7, 'Dealer Dave', 7025550001, 'dave@mirage.com', 'Dealer', 50000.00),
(8, 'Rental Staff Ryan', 5035550001, 'ryan@suites.com', 'Rental Staff', 37000.00);

-- Additional (total 15 >10), boundary salaries
INSERT INTO public.staff (branch_id, name, contact_no, email, job_title, salary) VALUES
(9, 'Captain Chris', 2065550001, 'chris@retreat.com', 'Captain', 48000.00),
(10, 'Mechanic Matt', 4155550001, 'matt@haven.com', 'Mechanic', 39000.00),
(1, 'Janitor Joe', 2125550003, 'joe@hotel.com', 'Janitor', 30000.00),  -- Min salary
(2, 'Executive Eve', 3055550003, 'eve@resort.com', 'Executive', 100000.00),  -- Max
(3, 'Assistant Amy', 3035550002, 'amy@lodge.com', 'Assistant', 35000.00);

-- Insert into user (depends on staff)
-- Testing: FK to staff (1:1), unique? No, but usernames unique implicitly for test
-- Coverage: Password hash, most staff have users
-- Scenarios: Various usernames
INSERT INTO public."user" (staff_id, username, password_hash) VALUES
(1, 'manager_mike', 'hash_80000'),
(2, 'recep_rita', 'hash_40000'),
(3, 'conci_carl', 'hash_45000'),
(4, 'house_helen', 'hash_35000'),
(5, 'guide_gary', 'hash_42000'),
(6, 'driver_dana', 'hash_38000'),
(7, 'instr_ian', 'hash_46000'),
(8, 'tour_tina', 'hash_41000'),
(9, 'dealer_dave', 'hash_50000'),
(10, 'rental_ryan', 'hash_37000');

-- Additional (total 15 >10)
INSERT INTO public."user" (staff_id, username, password_hash) VALUES
(11, 'capt_chris', 'hash_48000'),
(12, 'mech_matt', 'hash_39000'),
(13, 'jan_joe', 'hash_30000'),
(14, 'exec_eve', 'hash_100000'),
(15, 'asst_amy', 'hash_35000');

-- Insert into room (depends on branch, room_type)
-- Testing: FKs, default room_status 'Available', enum
-- Coverage: Multiple rooms per type/branch, set some 'Occupied' explicitly
-- Scenarios: Various statuses for test
INSERT INTO public.room (branch_id, type_id, room_status) VALUES
(1, 1, 'Available'),  -- Standard Single
(1, 2, 'Occupied'),
(1, 3, 'Available'),
(2, 4, 'Available'),
(2, 5, 'Occupied'),
(3, 6, 'Available'),
(4, 7, 'Available'),
(5, 8, 'Occupied'),
(6, 9, 'Available'),
(7, 10, 'Available');

-- Additional (total 20 >10), more per branch
INSERT INTO public.room (branch_id, type_id, room_status) VALUES
(8, 11, 'Occupied'),
(9, 12, 'Available'),
(10, 13, 'Available'),
(1, 14, 'Available'),  -- Budget
(2, 15, 'Occupied'),  -- Premium
(3, 16, 'Available'),
(4, 17, 'Available'),
(5, 18, 'Occupied'),
(6, 19, 'Available'),
(7, 20, 'Available');

-- Insert into booking (depends on user, guest, room)
-- Testing: FKs, enum status, default date_time, trigger prevent_double_booking, update_room_status
-- Coverage: Referential integrity, no overlaps for same room active statuses
-- Scenarios: Past checked-out, current checked-in (occupied), future booked, cancelled; multiple per room non-overlap; boundary dates (min 1 day, long stay); multiple guests per booking? No, one guest_id but can imply
-- Note: Use user_id 1-10, guest 1-10, room 1-10; dates around 2025-10-23
-- For room 1: past, current, future, cancelled
INSERT INTO public.booking (user_id, guest_id, room_id, booking_status, date_time, check_in, check_out) VALUES
(1, 1, 1, 'Checked-Out', '2024-09-01 00:00:00', '2024-09-10 00:00:00', '2024-09-15 00:00:00'),  -- Past
(1, 2, 1, 'Checked-In', '2025-10-20 00:00:00', '2025-10-22 00:00:00', '2025-10-25 00:00:00'),  -- Current, triggers room to Occupied
(1, 3, 1, 'Booked', '2025-10-23 00:00:00', '2025-11-01 00:00:00', '2025-11-05 00:00:00'),  -- Future
(1, 4, 1, 'Cancelled', '2025-10-23 00:00:00', '2025-12-01 00:00:00', '2025-12-10 00:00:00'),  -- Cancelled, no overlap issue
(2, 5, 2, 'Checked-Out', '2024-08-01 00:00:00', '2024-08-05 00:00:00', '2024-08-10 00:00:00'),
(2, 6, 2, 'Checked-In', '2025-10-21 00:00:00', '2025-10-23 00:00:00', '2025-10-26 00:00:00'),
(3, 7, 3, 'Booked', '2026-01-01 00:00:00', '2026-01-10 00:00:00', '2026-01-15 00:00:00'),
(4, 8, 4, 'Cancelled', '2025-11-01 00:00:00', '2025-11-05 00:00:00', '2025-11-10 00:00:00'),
(5, 9, 5, 'Checked-Out', '2024-10-01 00:00:00', '2024-10-10 00:00:00', '2024-10-15 00:00:00'),
(6, 10, 6, 'Checked-In', '2025-10-15 00:00:00', '2025-10-23 00:00:00', '2025-10-28 00:00:00');

-- Additional (total 15 >10), more scenarios: min 1 day stay, max 30 days, same guest multiple bookings
-- Note: For overlap test, comment example: -- INSERT ... (1,11,1,'Booked','2025-10-23','2025-10-24','2025-10-26'); -- Would violate trigger
INSERT INTO public.booking (user_id, guest_id, room_id, booking_status, date_time, check_in, check_out) VALUES
(7, 1, 7, 'Booked', '2025-10-23 00:00:00', '2025-10-24 00:00:00', '2025-10-25 00:00:00'),  -- Min 1 day, same guest as first
(8, 11, 8, 'Checked-Out', '2024-07-01 00:00:00', '2024-07-01 00:00:00', '2024-08-01 00:00:00'),  -- Long 30 days
(9, 12, 9, 'Cancelled', '2025-12-01 00:00:00', '2025-12-10 00:00:00', '2025-12-20 00:00:00'),
(10, 13, 10, 'Booked', '2026-02-01 00:00:00', '2026-02-05 00:00:00', '2026-02-10 00:00:00'),
(1, 14, 1, 'Checked-In', '2025-11-06 00:00:00', '2025-11-06 00:00:00', '2025-11-10 00:00:00');  -- After previous future booked

-- Insert into service_usage (depends on service, booking)
-- Testing: FKs, trigger calc_total_price (quantity * unit_price)
-- Coverage: Multiple per booking, quantity boundary 1/10, total calculated
-- Scenarios: Various dates, for different booking statuses
INSERT INTO public.service_usage (service_id, booking_id, date_time, quantity) VALUES
(1, 1, '2024-09-12 00:00:00', 2.00),  -- Triggers total=20.00
(2, 2, '2025-10-23 00:00:00', 1.00),  -- 25.00
(3, 3, '2025-11-02 00:00:00', 3.00),  -- 45.00, future
(4, 4, '2025-11-06 00:00:00', 1.00),  -- 50.00, cancelled
(5, 5, '2024-08-06 00:00:00', 4.00),  -- 20.00
(6, 6, '2025-10-24 00:00:00', 2.00),  -- 60.00
(7, 7, '2026-01-11 00:00:00', 1.00),  -- 20.00
(8, 8, '2024-07-02 00:00:00', 5.00),  -- 200.00
(9, 9, '2024-10-11 00:00:00', 3.00),  -- 45.00
(10, 10, '2025-10-24 00:00:00', 2.00);  -- 200.00

-- Additional (total 15 >10), high quantity
INSERT INTO public.service_usage (service_id, booking_id, date_time, quantity) VALUES
(11, 11, '2025-10-24 00:00:00', 1.00),  -- 25.00
(12, 12, '2024-07-02 00:00:00', 4.00),  -- 200.00
(13, 13, '2025-12-11 00:00:00', 2.00),  -- 20.00
(14, 14, '2026-02-06 00:00:00', 10.00),  -- High qty
(15, 15, '2025-11-07 00:00:00', 1.00);  -- 200.00

-- Insert into final_bill (depends on user, booking)
-- Testing: FKs, defaults 0, check >=0, triggers for charges, discount, total, outstanding
-- Coverage: Calculations via functions: room_charges (days*rate), services sum, discount conditions, late (if past check_out)
-- Scenarios: Past bookings (late charge >0), future (0), loyalty (old guest), seasonal (if month match), min nights, early (days_before >30)
-- Note: Insert minimal, triggers fill rest; assume insert on 2025-10-23, so past have late, current/future 0
-- For booking 1 (past, old guest): expect discount loyalty if applicable, late hours many
INSERT INTO public.final_bill (user_id, booking_id, total_tax, paid_amount) VALUES
(1, 1, 10.00, 0.00),  -- Triggers calcs: room_charges=5*100=500 (assuming type1 rate100, but wait, adjust to schema), etc.
(2, 2, 15.00, 100.00),  -- Partial paid, outstanding calc
(3, 3, 20.00, 0.00),
(4, 4, 5.00, 0.00),  -- Cancelled, but bill exists
(5, 5, 25.00, 0.00),
(6, 6, 30.00, 200.00),
(7, 7, 10.00, 0.00),
(8, 8, 15.00, 0.00),
(9, 9, 20.00, 0.00),
(10, 10, 25.00, 0.00);

-- Additional (total 15 >10), test different discounts: e.g. booking3 future, if early days>30
INSERT INTO public.final_bill (user_id, booking_id, total_tax, paid_amount) VALUES
(1, 11, 30.00, 0.00),
(2, 12, 10.00, 0.00),
(3, 13, 15.00, 0.00),
(4, 14, 20.00, 0.00),
(5, 15, 25.00, 0.00);

-- Insert into payment (depends on final_bill)
-- Testing: FK to bill, paid_amount >0, notes, default date_time
-- Coverage: Multiple per bill, various methods, full/partial
-- Scenarios: Cash, card, transfer; notes for refunds on cancelled
INSERT INTO public.payment (bill_id, paid_method, paid_amount, notes) VALUES
(1, 'Credit Card', 500.00, 'Full payment for past booking'),
(2, 'Cash', 200.00, 'Partial payment'),
(2, 'Debit Card', 100.00, 'Additional partial'),
(3, 'Bank Transfer', 300.00, 'Full'),
(4, 'Credit Card', 0.00, 'Refund for cancelled'),
(5, 'Cash', 400.00, 'Full'),
(6, 'Debit Card', 500.00, 'Overpayment?'),
(7, 'Bank Transfer', 200.00, 'Partial'),
(8, 'Credit Card', 600.00, 'Full'),
(9, 'Cash', 150.00, 'Partial'),
(10, 'Debit Card', 250.00, 'Full');

-- Additional (total 15 >10), more multiples
INSERT INTO public.payment (bill_id, paid_method, paid_amount, notes) VALUES
(11, 'Bank Transfer', 350.00, 'Full'),
(12, 'Credit Card', 100.00, 'Partial'),
(13, 'Cash', 450.00, 'Full'),
(14, 'Debit Card', 300.00, 'Partial'),
(15, 'Bank Transfer', 200.00, 'Additional');

-- Insert into log (depends on user)
-- Testing: FK to user, default date_time, action_rec_id optional
-- Coverage: Various actions, timestamps past/present
-- Scenarios: Logs for creates, updates, deletes (simulated), related to bookings etc.
INSERT INTO public.log (user_id, action, date_time, action_rec_id) VALUES
(1, 'Created booking', '2024-09-01 00:00:00', 1),
(2, 'Updated guest info', '2025-10-23 00:00:00', 2),
(3, 'Processed payment', '2025-11-01 00:00:00', 3),
(4, 'Cancelled booking', '2025-11-05 00:00:00', 4),
(5, 'Added service usage', '2024-08-06 00:00:00', 5),
(6, 'Generated bill', '2025-10-24 00:00:00', 6),
(7, 'Updated room status', '2026-01-11 00:00:00', 7),
(8, 'Applied discount', '2024-07-02 00:00:00', 8),
(9, 'Logged revenue', '2024-10-11 00:00:00', 9),
(10, 'Staff update', '2025-10-24 00:00:00', 10);

-- Additional (total 15 >10)
INSERT INTO public.log (user_id, action, date_time, action_rec_id) VALUES
(11, 'Guest registration', '2025-10-24 00:00:00', 11),
(12, 'Service request', '2024-07-02 00:00:00', 12),
(13, 'Bill payment', '2025-12-11 00:00:00', 13),
(14, 'Check-in processed', '2026-02-06 00:00:00', 14),
(15, 'Check-out completed', '2025-11-07 00:00:00', 15);

-- Insert into revenue (depends on branch)
-- Testing: FK to branch, check amount >=0, month 1-12, default calculated_data_time
-- Coverage: Multiple per branch, various months past/present/future? But month int, probably current year assumed
-- Scenarios: 0 amount (low month), high, for different branches
INSERT INTO public.revenue (branch_id, month, amount) VALUES
(1, 1, 10000.00),
(1, 10, 15000.00),  -- Current month
(2, 2, 20000.00),
(2, 11, 0.00),  -- Min
(3, 3, 25000.00),
(4, 4, 30000.00),
(5, 5, 35000.00),
(6, 6, 40000.00),
(7, 7, 45000.00),
(8, 8, 50000.00);

-- Additional (total 15 >10), more months
INSERT INTO public.revenue (branch_id, month, amount) VALUES
(9, 9, 55000.00),
(10, 12, 60000.00),
(1, 12, 120000.00),  -- High
(2, 1, 5000.00),
(3, 10, 18000.00);