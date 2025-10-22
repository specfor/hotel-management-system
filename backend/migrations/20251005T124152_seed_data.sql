-- Insert queries for branch table
-- Testing: Primary key auto-increment, NOT NULL on branch_id, realistic branch names and addresses
-- Includes at least 20 branches across different cities for coverage
INSERT INTO public.branch (branch_name, city, address) VALUES ('Luxury Inn Downtown', 'New York', '123 Main St');
INSERT INTO public.branch (branch_name, city, address) VALUES ('Seaside Resort', 'Miami', '456 Ocean Blvd');
INSERT INTO public.branch (branch_name, city, address) VALUES ('Mountain Lodge', 'Denver', '789 Peak Rd');
INSERT INTO public.branch (branch_name, city, address) VALUES ('City Center Hotel', 'Chicago', '101 Windy Ave');
INSERT INTO public.branch (branch_name, city, address) VALUES ('Beachfront Paradise', 'Los Angeles', '202 Sunset Dr');
INSERT INTO public.branch (branch_name, city, address) VALUES ('Historic Manor', 'Boston', '303 Freedom Trail');
INSERT INTO public.branch (branch_name, city, address) VALUES ('Desert Oasis', 'Las Vegas', '404 Strip Ln');
INSERT INTO public.branch (branch_name, city, address) VALUES ('Riverfront Suites', 'Portland', '505 Bridge St');
INSERT INTO public.branch (branch_name, city, address) VALUES ('Lakeview Retreat', 'Seattle', '606 Rainier Way');
INSERT INTO public.branch (branch_name, city, address) VALUES ('Urban Escape', 'San Francisco', '707 Golden Gate');
INSERT INTO public.branch (branch_name, city, address) VALUES ('Coastal Haven', 'San Diego', '808 Pacific Hwy');
INSERT INTO public.branch (branch_name, city, address) VALUES ('Alpine Chalet', 'Aspen', '909 Snowy Path');
INSERT INTO public.branch (branch_name, city, address) VALUES ('Bay Area Inn', 'Oakland', '1010 Harbor Blvd');
INSERT INTO public.branch (branch_name, city, address) VALUES ('Prairie Hotel', 'Dallas', '1111 Ranch Rd');
INSERT INTO public.branch (branch_name, city, address) VALUES ('Gulf Coast Resort', 'Houston', '1212 Bayou St');
INSERT INTO public.branch (branch_name, city, address) VALUES ('Evergreen Lodge', 'Vancouver', '1313 Forest Dr');
INSERT INTO public.branch (branch_name, city, address) VALUES ('Sunshine Motel', 'Phoenix', '1414 Desert Ave');
INSERT INTO public.branch (branch_name, city, address) VALUES ('Harbor View', 'Baltimore', '1515 Chesapeake Ln');
INSERT INTO public.branch (branch_name, city, address) VALUES ('Capital Suites', 'Washington DC', '1616 Potomac Way');
INSERT INTO public.branch (branch_name, city, address) VALUES ('Island Paradise', 'Honolulu', '1717 Aloha Blvd');
INSERT INTO public.branch (branch_name, city, address) VALUES ('Northern Lights Hotel', 'Anchorage', '1818 Tundra Rd');

-- Insert queries for room_type table
-- Testing: Foreign key to branch, check constraints on rates (>0), capacity >0, various types and amenities
-- Edge cases: Min/max rates, capacities; at least 20 types across branches
INSERT INTO public.room_type (branch_id, type_name, daily_rate, late_checkout_rate, capacity, amenities) VALUES (1, 'Single', 100.00, 20.00, 1, 'WiFi, TV');
INSERT INTO public.room_type (branch_id, type_name, daily_rate, late_checkout_rate, capacity, amenities) VALUES (1, 'Double', 150.00, 30.00, 2, 'WiFi, TV, Mini-bar');
INSERT INTO public.room_type (branch_id, type_name, daily_rate, late_checkout_rate, capacity, amenities) VALUES (1, 'Suite', 300.00, 50.00, 4, 'WiFi, TV, Kitchen');
INSERT INTO public.room_type (branch_id, type_name, daily_rate, late_checkout_rate, capacity, amenities) VALUES (2, 'Single', 120.00, 25.00, 1, 'WiFi, Ocean View');
INSERT INTO public.room_type (branch_id, type_name, daily_rate, late_checkout_rate, capacity, amenities) VALUES (2, 'Double', 180.00, 35.00, 2, 'WiFi, Balcony');
INSERT INTO public.room_type (branch_id, type_name, daily_rate, late_checkout_rate, capacity, amenities) VALUES (3, 'Cabin', 200.00, 40.00, 3, 'Fireplace, Hiking Access');
INSERT INTO public.room_type (branch_id, type_name, daily_rate, late_checkout_rate, capacity, amenities) VALUES (4, 'Standard', 110.00, 22.00, 2, 'WiFi, City View');
INSERT INTO public.room_type (branch_id, type_name, daily_rate, late_checkout_rate, capacity, amenities) VALUES (5, 'Beachfront', 250.00, 45.00, 4, 'Private Beach Access');
INSERT INTO public.room_type (branch_id, type_name, daily_rate, late_checkout_rate, capacity, amenities) VALUES (6, 'Historic Room', 160.00, 32.00, 2, 'Antique Furniture');
INSERT INTO public.room_type (branch_id, type_name, daily_rate, late_checkout_rate, capacity, amenities) VALUES (7, 'Luxury Suite', 500.00, 100.00, 6, 'Pool, Casino Access');
INSERT INTO public.room_type (branch_id, type_name, daily_rate, late_checkout_rate, capacity, amenities) VALUES (8, 'Riverside', 140.00, 28.00, 2, 'River View, Kayak Rental');
INSERT INTO public.room_type (branch_id, type_name, daily_rate, late_checkout_rate, capacity, amenities) VALUES (9, 'Lakeview', 170.00, 34.00, 3, 'Boating Access');
INSERT INTO public.room_type (branch_id, type_name, daily_rate, late_checkout_rate, capacity, amenities) VALUES (10, 'Penthouse', 400.00, 80.00, 5, 'Rooftop Terrace');
INSERT INTO public.room_type (branch_id, type_name, daily_rate, late_checkout_rate, capacity, amenities) VALUES (11, 'Oceanfront', 220.00, 44.00, 4, 'Surfboard Rental');
INSERT INTO public.room_type (branch_id, type_name, daily_rate, late_checkout_rate, capacity, amenities) VALUES (12, 'Ski-in/Ski-out', 280.00, 56.00, 4, 'Ski Storage');
INSERT INTO public.room_type (branch_id, type_name, daily_rate, late_checkout_rate, capacity, amenities) VALUES (13, 'Harbor View', 130.00, 26.00, 2, 'Ferry Access');
INSERT INTO public.room_type (branch_id, type_name, daily_rate, late_checkout_rate, capacity, amenities) VALUES (14, 'Ranch Style', 190.00, 38.00, 3, 'Horse Riding');
INSERT INTO public.room_type (branch_id, type_name, daily_rate, late_checkout_rate, capacity, amenities) VALUES (15, 'Bayou Bungalow', 210.00, 42.00, 4, 'Fishing Gear');
INSERT INTO public.room_type (branch_id, type_name, daily_rate, late_checkout_rate, capacity, amenities) VALUES (16, 'Forest Cabin', 150.00, 30.00, 2, 'Hiking Trails');
INSERT INTO public.room_type (branch_id, type_name, daily_rate, late_checkout_rate, capacity, amenities) VALUES (17, 'Desert Tent', 180.00, 36.00, 2, 'Camel Rides');

-- Additional room_types to reach 20
INSERT INTO public.room_type (branch_id, type_name, daily_rate, late_checkout_rate, capacity, amenities) VALUES (18, 'Harbor Suite', 240.00, 48.00, 4, 'Yacht View');
INSERT INTO public.room_type (branch_id, type_name, daily_rate, late_checkout_rate, capacity, amenities) VALUES (19, 'Monument Room', 160.00, 32.00, 2, 'Historical Tours');
INSERT INTO public.room_type (branch_id, type_name, daily_rate, late_checkout_rate, capacity, amenities) VALUES (20, 'Tropical Bungalow', 300.00, 60.00, 4, 'Private Pool');
INSERT INTO public.room_type (branch_id, type_name, daily_rate, late_checkout_rate, capacity, amenities) VALUES (21, 'Arctic Igloo', 350.00, 70.00, 3, 'Aurora Viewing');

-- Insert queries for room table
-- Testing: Foreign keys to branch and room_type, default 'Available', enum for room_status
-- Edge cases: Multiple rooms per type, some Occupied for testing
-- At least 20 rooms
INSERT INTO public.room (branch_id, type_id, room_status) VALUES (1, 1, 'Available');
INSERT INTO public.room (branch_id, type_id, room_status) VALUES (1, 2, 'Available');
INSERT INTO public.room (branch_id, type_id, room_status) VALUES (1, 3, 'Occupied');
INSERT INTO public.room (branch_id, type_id, room_status) VALUES (2, 4, 'Available');
INSERT INTO public.room (branch_id, type_id, room_status) VALUES (2, 5, 'Available');
INSERT INTO public.room (branch_id, type_id, room_status) VALUES (3, 6, 'Occupied');
INSERT INTO public.room (branch_id, type_id, room_status) VALUES (4, 7, 'Available');
INSERT INTO public.room (branch_id, type_id, room_status) VALUES (5, 8, 'Available');
INSERT INTO public.room (branch_id, type_id, room_status) VALUES (6, 9, 'Available');
INSERT INTO public.room (branch_id, type_id, room_status) VALUES (7, 10, 'Occupied');
INSERT INTO public.room (branch_id, type_id, room_status) VALUES (8, 11, 'Available');
INSERT INTO public.room (branch_id, type_id, room_status) VALUES (9, 12, 'Available');
INSERT INTO public.room (branch_id, type_id, room_status) VALUES (10, 13, 'Available');
INSERT INTO public.room (branch_id, type_id, room_status) VALUES (11, 14, 'Occupied');
INSERT INTO public.room (branch_id, type_id, room_status) VALUES (12, 15, 'Available');
INSERT INTO public.room (branch_id, type_id, room_status) VALUES (13, 16, 'Available');
INSERT INTO public.room (branch_id, type_id, room_status) VALUES (14, 17, 'Available');
INSERT INTO public.room (branch_id, type_id, room_status) VALUES (15, 18, 'Occupied');
INSERT INTO public.room (branch_id, type_id, room_status) VALUES (16, 19, 'Available');
INSERT INTO public.room (branch_id, type_id, room_status) VALUES (17, 20, 'Available');
INSERT INTO public.room (branch_id, type_id, room_status) VALUES (18, 21, 'Available');
INSERT INTO public.room (branch_id, type_id, room_status) VALUES (19, 1, 'Occupied');
INSERT INTO public.room (branch_id, type_id, room_status) VALUES (20, 2, 'Available');
INSERT INTO public.room (branch_id, type_id, room_status) VALUES (21, 3, 'Available');
INSERT INTO public.room (branch_id, type_id, room_status) VALUES (1, 4, 'Available');
INSERT INTO public.room (branch_id, type_id, room_status) VALUES (2, 5, 'Occupied');

-- Insert queries for chargeable_services table
-- Testing: Foreign key to branch, positive unit_price, various services
-- Edge cases: Min price 0.01, max 1000, different units
-- At least 20 services
INSERT INTO public.chargeable_services (branch_id, service_name, unit_price, unit_type) VALUES (1, 'Laundry', 10.00, 'per load');
INSERT INTO public.chargeable_services (branch_id, service_name, unit_price, unit_type) VALUES (1, 'Room Service Meal', 25.00, 'per meal');
INSERT INTO public.chargeable_services (branch_id, service_name, unit_price, unit_type) VALUES (1, 'Mini-bar Restock', 15.00, 'per item');
INSERT INTO public.chargeable_services (branch_id, service_name, unit_price, unit_type) VALUES (2, 'Spa Treatment', 50.00, 'per session');
INSERT INTO public.chargeable_services (branch_id, service_name, unit_price, unit_type) VALUES (2, 'Beach Towel Rental', 5.00, 'per day');
INSERT INTO public.chargeable_services (branch_id, service_name, unit_price, unit_type) VALUES (3, 'Guided Hike', 30.00, 'per person');
INSERT INTO public.chargeable_services (branch_id, service_name, unit_price, unit_type) VALUES (4, 'Airport Shuttle', 20.00, 'per trip');
INSERT INTO public.chargeable_services (branch_id, service_name, unit_price, unit_type) VALUES (5, 'Surf Lesson', 40.00, 'per hour');
INSERT INTO public.chargeable_services (branch_id, service_name, unit_price, unit_type) VALUES (6, 'Historical Tour', 15.00, 'per person');
INSERT INTO public.chargeable_services (branch_id, service_name, unit_price, unit_type) VALUES (7, 'Casino Chips', 100.00, 'per set');
INSERT INTO public.chargeable_services (branch_id, service_name, unit_price, unit_type) VALUES (8, 'Kayak Rental', 25.00, 'per hour');
INSERT INTO public.chargeable_services (branch_id, service_name, unit_price, unit_type) VALUES (9, 'Boat Rental', 50.00, 'per hour');
INSERT INTO public.chargeable_services (branch_id, service_name, unit_price, unit_type) VALUES (10, 'Bike Rental', 10.00, 'per day');
INSERT INTO public.chargeable_services (branch_id, service_name, unit_price, unit_type) VALUES (11, 'Surfboard Rental', 20.00, 'per day');
INSERT INTO public.chargeable_services (branch_id, service_name, unit_price, unit_type) VALUES (12, 'Ski Rental', 35.00, 'per day');
INSERT INTO public.chargeable_services (branch_id, service_name, unit_price, unit_type) VALUES (13, 'Ferry Ticket', 15.00, 'per trip');
INSERT INTO public.chargeable_services (branch_id, service_name, unit_price, unit_type) VALUES (14, 'Horse Riding', 40.00, 'per hour');
INSERT INTO public.chargeable_services (branch_id, service_name, unit_price, unit_type) VALUES (15, 'Fishing Trip', 60.00, 'per person');
INSERT INTO public.chargeable_services (branch_id, service_name, unit_price, unit_type) VALUES (16, 'Trail Guide', 25.00, 'per group');
INSERT INTO public.chargeable_services (branch_id, service_name, unit_price, unit_type) VALUES (17, 'Camel Ride', 30.00, 'per person');
INSERT INTO public.chargeable_services (branch_id, service_name, unit_price, unit_type) VALUES (18, 'Yacht Tour', 200.00, 'per hour');
INSERT INTO public.chargeable_services (branch_id, service_name, unit_price, unit_type) VALUES (19, 'Museum Pass', 10.00, 'per person');
INSERT INTO public.chargeable_services (branch_id, service_name, unit_price, unit_type) VALUES (20, 'Luau Dinner', 50.00, 'per person');
INSERT INTO public.chargeable_services (branch_id, service_name, unit_price, unit_type) VALUES (21, 'Snowmobile Rental', 80.00, 'per hour');

-- Insert queries for discount table
-- Testing: Foreign key to branch, check on discount_type, positive values, valid dates past/present/future
-- Edge cases: Min value 0.01, expired discounts, min_bill_amount
-- At least 20 discounts
INSERT INTO public.discount (branch_id, discount_name, discount_type, discount_value, min_bill_amount, discount_condition, valid_from, valid_to) VALUES (1, 'Weekend Special', 'percentage', 10.00, 100.00, 'Weekends only', '2025-01-01', '2025-12-31');
INSERT INTO public.discount (branch_id, discount_name, discount_type, discount_value, min_bill_amount, discount_condition, valid_from, valid_to) VALUES (1, 'Loyalty Discount', 'fixed', 20.00, 150.00, 'Repeat guests', '2024-01-01', '2024-12-31'); -- Past
INSERT INTO public.discount (branch_id, discount_name, discount_type, discount_value, min_bill_amount, discount_condition, valid_from, valid_to) VALUES (2, 'Summer Sale', 'percentage', 15.00, 200.00, 'Summer months', '2026-06-01', '2026-08-31'); -- Future
INSERT INTO public.discount (branch_id, discount_name, discount_type, discount_value, min_bill_amount, discount_condition, valid_from, valid_to) VALUES (2, 'Early Bird', 'fixed', 30.00, 0.00, 'Book 30 days ahead', '2025-10-01', '2025-10-31');
INSERT INTO public.discount (branch_id, discount_name, discount_type, discount_value, min_bill_amount, discount_condition, valid_from, valid_to) VALUES (3, 'Winter Special', 'percentage', 20.00, 250.00, 'Winter bookings', '2025-12-01', '2026-02-28');
INSERT INTO public.discount (branch_id, discount_name, discount_type, discount_value, min_bill_amount, discount_condition, valid_from, valid_to) VALUES (4, 'Group Discount', 'fixed', 50.00, 500.00, 'Groups of 5+', '2025-01-01', '2025-12-31');
INSERT INTO public.discount (branch_id, discount_name, discount_type, discount_value, min_bill_amount, discount_condition, valid_from, valid_to) VALUES (5, 'Beach Package', 'percentage', 5.00, 100.00, 'With services', '2024-07-01', '2024-09-30'); -- Past
INSERT INTO public.discount (branch_id, discount_name, discount_type, discount_value, min_bill_amount, discount_condition, valid_from, valid_to) VALUES (6, 'History Buff', 'fixed', 10.00, 0.00, 'Tour included', '2025-10-22', '2025-11-22');
INSERT INTO public.discount (branch_id, discount_name, discount_type, discount_value, min_bill_amount, discount_condition, valid_from, valid_to) VALUES (7, 'VIP Deal', 'percentage', 25.00, 1000.00, 'Suites only', '2026-01-01', '2026-12-31'); -- Future
INSERT INTO public.discount (branch_id, discount_name, discount_type, discount_value, min_bill_amount, discount_condition, valid_from, valid_to) VALUES (8, 'River Adventure', 'fixed', 15.00, 150.00, 'With kayak', '2025-05-01', '2025-08-31');
INSERT INTO public.discount (branch_id, discount_name, discount_type, discount_value, min_bill_amount, discount_condition, valid_from, valid_to) VALUES (9, 'Lake Escape', 'percentage', 10.00, 200.00, 'Boating included', '2024-01-01', '2024-12-31'); -- Past
INSERT INTO public.discount (branch_id, discount_name, discount_type, discount_value, min_bill_amount, discount_condition, valid_from, valid_to) VALUES (10, 'City Explorer', 'fixed', 25.00, 300.00, 'Long stays', '2025-10-22', '2025-12-31');
INSERT INTO public.discount (branch_id, discount_name, discount_type, discount_value, min_bill_amount, discount_condition, valid_from, valid_to) VALUES (11, 'Surf Special', 'percentage', 15.00, 250.00, 'Lessons included', '2026-07-01', '2026-09-30'); -- Future
INSERT INTO public.discount (branch_id, discount_name, discount_type, discount_value, min_bill_amount, discount_condition, valid_from, valid_to) VALUES (12, 'Ski Package', 'fixed', 40.00, 400.00, 'Rentals included', '2025-12-01', '2026-03-31');
INSERT INTO public.discount (branch_id, discount_name, discount_type, discount_value, min_bill_amount, discount_condition, valid_from, valid_to) VALUES (13, 'Harbor Hop', 'percentage', 5.00, 100.00, 'Ferry ticket', '2024-04-01', '2024-06-30'); -- Past
INSERT INTO public.discount (branch_id, discount_name, discount_type, discount_value, min_bill_amount, discount_condition, valid_from, valid_to) VALUES (14, 'Ranch Retreat', 'fixed', 30.00, 200.00, 'Riding included', '2025-10-22', '2025-11-22');
INSERT INTO public.discount (branch_id, discount_name, discount_type, discount_value, min_bill_amount, discount_condition, valid_from, valid_to) VALUES (15, 'Bayou Bundle', 'percentage', 20.00, 300.00, 'Fishing trip', '2026-05-01', '2026-07-31'); -- Future
INSERT INTO public.discount (branch_id, discount_name, discount_type, discount_value, min_bill_amount, discount_condition, valid_from, valid_to) VALUES (16, 'Forest Foray', 'fixed', 20.00, 150.00, 'Guide included', '2025-09-01', '2025-11-30');
INSERT INTO public.discount (branch_id, discount_name, discount_type, discount_value, min_bill_amount, discount_condition, valid_from, valid_to) VALUES (17, 'Desert Deal', 'percentage', 10.00, 200.00, 'Camel ride', '2024-10-01', '2024-12-31'); -- Past
INSERT INTO public.discount (branch_id, discount_name, discount_type, discount_value, min_bill_amount, discount_condition, valid_from, valid_to) VALUES (18, 'Yacht Yacht', 'fixed', 50.00, 500.00, 'Tour included', '2025-10-22', '2025-12-31');

-- Insert queries for staff table
-- Testing: Foreign key to branch, positive salary, realistic names/emails
-- Edge cases: Min salary, various job titles
-- At least 20 staff
INSERT INTO public.staff (branch_id, name, contact_no, email, job_title, salary) VALUES (1, 'John Doe', 1234567890, 'john@example.com', 'Manager', 60000.00);
INSERT INTO public.staff (branch_id, name, contact_no, email, job_title, salary) VALUES (1, 'Jane Smith', 2345678901, 'jane@example.com', 'Receptionist', 40000.00);
INSERT INTO public.staff (branch_id, name, contact_no, email, job_title, salary) VALUES (2, 'Alice Johnson', 3456789012, 'alice@example.com', 'Concierge', 45000.00);
INSERT INTO public.staff (branch_id, name, contact_no, email, job_title, salary) VALUES (2, 'Bob Brown', 4567890123, 'bob@example.com', 'Housekeeper', 35000.00);
INSERT INTO public.staff (branch_id, name, contact_no, email, job_title, salary) VALUES (3, 'Charlie Davis', 5678901234, 'charlie@example.com', 'Guide', 42000.00);
INSERT INTO public.staff (branch_id, name, contact_no, email, job_title, salary) VALUES (4, 'David Evans', 6789012345, 'david@example.com', 'Driver', 38000.00);
INSERT INTO public.staff (branch_id, name, contact_no, email, job_title, salary) VALUES (5, 'Eva Frank', 7890123456, 'eva@example.com', 'Instructor', 46000.00);
INSERT INTO public.staff (branch_id, name, contact_no, email, job_title, salary) VALUES (6, 'Frank Green', 8901234567, 'frank@example.com', 'Tour Guide', 41000.00);
INSERT INTO public.staff (branch_id, name, contact_no, email, job_title, salary) VALUES (7, 'Grace Harris', 9012345678, 'grace@example.com', 'Dealer', 50000.00);
INSERT INTO public.staff (branch_id, name, contact_no, email, job_title, salary) VALUES (8, 'Henry Irving', 0123456789, 'henry@example.com', 'Rental Staff', 37000.00);
INSERT INTO public.staff (branch_id, name, contact_no, email, job_title, salary) VALUES (9, 'Ivy Jackson', 1234567891, 'ivy@example.com', 'Boating Captain', 48000.00);
INSERT INTO public.staff (branch_id, name, contact_no, email, job_title, salary) VALUES (10, 'Jack King', 2345678902, 'jack@example.com', 'Bike Mechanic', 39000.00);
INSERT INTO public.staff (branch_id, name, contact_no, email, job_title, salary) VALUES (11, 'Kara Lee', 3456789013, 'kara@example.com', 'Surf Instructor', 44000.00);
INSERT INTO public.staff (branch_id, name, contact_no, email, job_title, salary) VALUES (12, 'Leo Martin', 4567890124, 'leo@example.com', 'Ski Patrol', 47000.00);
INSERT INTO public.staff (branch_id, name, contact_no, email, job_title, salary) VALUES (13, 'Mia Nelson', 5678901235, 'mia@example.com', 'Ferry Operator', 43000.00);
INSERT INTO public.staff (branch_id, name, contact_no, email, job_title, salary) VALUES (14, 'Noah Oliver', 6789012346, 'noah@example.com', 'Ranch Hand', 36000.00);
INSERT INTO public.staff (branch_id, name, contact_no, email, job_title, salary) VALUES (15, 'Olivia Perez', 7890123457, 'olivia@example.com', 'Fisher Guide', 45000.00);
INSERT INTO public.staff (branch_id, name, contact_no, email, job_title, salary) VALUES (16, 'Paul Quinn', 8901234568, 'paul@example.com', 'Trail Leader', 41000.00);
INSERT INTO public.staff (branch_id, name, contact_no, email, job_title, salary) VALUES (17, 'Quinn Rose', 9012345679, 'quinn@example.com', 'Camel Handler', 38000.00);
INSERT INTO public.staff (branch_id, name, contact_no, email, job_title, salary) VALUES (18, 'Rose Smith', 0123456790, 'rose@example.com', 'Yacht Captain', 55000.00);
INSERT INTO public.staff (branch_id, name, contact_no, email, job_title, salary) VALUES (19, 'Sam Taylor', 1234567892, 'sam@example.com', 'Museum Curator', 46000.00);
INSERT INTO public.staff (branch_id, name, contact_no, email, job_title, salary) VALUES (20, 'Tina Upton', 2345678903, 'tina@example.com', 'Event Coordinator', 49000.00);
INSERT INTO public.staff (branch_id, name, contact_no, email, job_title, salary) VALUES (21, 'Uma Vance', 3456789014, 'uma@example.com', 'Tour Guide', 42000.00);

-- Insert queries for user table
-- Testing: Foreign key to staff, unique usernames
-- Edge cases: Various passwords (hashed, but for test plain)
-- At least 20 users (one per staff, but extended)
INSERT INTO public."user" (staff_id, username, password_hash) VALUES (1, 'john_doe', 'hash1');
INSERT INTO public."user" (staff_id, username, password_hash) VALUES (2, 'jane_smith', 'hash2');
INSERT INTO public."user" (staff_id, username, password_hash) VALUES (3, 'alice_johnson', 'hash3');
INSERT INTO public."user" (staff_id, username, password_hash) VALUES (4, 'bob_brown', 'hash4');
INSERT INTO public."user" (staff_id, username, password_hash) VALUES (5, 'charlie_davis', 'hash5');
INSERT INTO public."user" (staff_id, username, password_hash) VALUES (6, 'david_evans', 'hash6');
INSERT INTO public."user" (staff_id, username, password_hash) VALUES (7, 'eva_frank', 'hash7');
INSERT INTO public."user" (staff_id, username, password_hash) VALUES (8, 'frank_green', 'hash8');
INSERT INTO public."user" (staff_id, username, password_hash) VALUES (9, 'grace_harris', 'hash9');
INSERT INTO public."user" (staff_id, username, password_hash) VALUES (10, 'henry_irving', 'hash10');
INSERT INTO public."user" (staff_id, username, password_hash) VALUES (11, 'ivy_jackson', 'hash11');
INSERT INTO public."user" (staff_id, username, password_hash) VALUES (12, 'jack_king', 'hash12');
INSERT INTO public."user" (staff_id, username, password_hash) VALUES (13, 'kara_lee', 'hash13');
INSERT INTO public."user" (staff_id, username, password_hash) VALUES (14, 'leo_martin', 'hash14');
INSERT INTO public."user" (staff_id, username, password_hash) VALUES (15, 'mia_nelson', 'hash15');
INSERT INTO public."user" (staff_id, username, password_hash) VALUES (16, 'noah_oliver', 'hash16');
INSERT INTO public."user" (staff_id, username, password_hash) VALUES (17, 'olivia_perez', 'hash17');
INSERT INTO public."user" (staff_id, username, password_hash) VALUES (18, 'paul_quinn', 'hash18');
INSERT INTO public."user" (staff_id, username, password_hash) VALUES (19, 'quinn_rose', 'hash19');
INSERT INTO public."user" (staff_id, username, password_hash) VALUES (20, 'rose_smith', 'hash20');
INSERT INTO public."user" (staff_id, username, password_hash) VALUES (21, 'sam_taylor', 'hash21');
INSERT INTO public."user" (staff_id, username, password_hash) VALUES (22, 'tina_upton', 'hash22');
INSERT INTO public."user" (staff_id, username, password_hash) VALUES (23, 'uma_vance', 'hash23');

-- Insert queries for guest table
-- Testing: Unique NIC and email, NOT NULL on guest_id, trigger for updated_at
-- Edge cases: Min/max age (18-100), realistic contacts/emails, update to test trigger
-- At least 20 guests
INSERT INTO public.guest (nic, name, age, contact_no, email, password) VALUES ('123456789V', 'Guest One', 30, '1112223334', 'guest1@example.com', 'pass1');
INSERT INTO public.guest (nic, name, age, contact_no, email, password) VALUES ('234567890V', 'Guest Two', 45, '2223334445', 'guest2@example.com', 'pass2');
INSERT INTO public.guest (nic, name, age, contact_no, email, password) VALUES ('345678901V', 'Guest Three', 25, '3334445556', 'guest3@example.com', 'pass3');
INSERT INTO public.guest (nic, name, age, contact_no, email, password) VALUES ('456789012V', 'Guest Four', 60, '4445556667', 'guest4@example.com', 'pass4');
INSERT INTO public.guest (nic, name, age, contact_no, email, password) VALUES ('567890123V', 'Guest Five', 18, '5556667778', 'guest5@example.com', 'pass5'); -- Min age
INSERT INTO public.guest (nic, name, age, contact_no, email, password) VALUES ('678901234V', 'Guest Six', 100, '6667778889', 'guest6@example.com', 'pass6'); -- Max age
INSERT INTO public.guest (nic, name, age, contact_no, email, password) VALUES ('789012345V', 'Guest Seven', 35, '7778889990', 'guest7@example.com', 'pass7');
INSERT INTO public.guest (nic, name, age, contact_no, email, password) VALUES ('890123456V', 'Guest Eight', 50, '8889990001', 'guest8@example.com', 'pass8');
INSERT INTO public.guest (nic, name, age, contact_no, email, password) VALUES ('901234567V', 'Guest Nine', 28, '9990001112', 'guest9@example.com', 'pass9');
INSERT INTO public.guest (nic, name, age, contact_no, email, password) VALUES ('012345678V', 'Guest Ten', 40, '0001112223', 'guest10@example.com', 'pass10');
INSERT INTO public.guest (nic, name, age, contact_no, email, password) VALUES ('123456780V', 'Guest Eleven', 55, '1112223335', 'guest11@example.com', 'pass11');
INSERT INTO public.guest (nic, name, age, contact_no, email, password) VALUES ('234567891V', 'Guest Twelve', 32, '2223334446', 'guest12@example.com', 'pass12');
INSERT INTO public.guest (nic, name, age, contact_no, email, password) VALUES ('345678902V', 'Guest Thirteen', 47, '3334445557', 'guest13@example.com', 'pass13');
INSERT INTO public.guest (nic, name, age, contact_no, email, password) VALUES ('456789013V', 'Guest Fourteen', 22, '4445556668', 'guest14@example.com', 'pass14');
INSERT INTO public.guest (nic, name, age, contact_no, email, password) VALUES ('567890124V', 'Guest Fifteen', 65, '5556667779', 'guest15@example.com', 'pass15');
INSERT INTO public.guest (nic, name, age, contact_no, email, password) VALUES ('678901235V', 'Guest Sixteen', 29, '6667778890', 'guest16@example.com', 'pass16');
INSERT INTO public.guest (nic, name, age, contact_no, email, password) VALUES ('789012346V', 'Guest Seventeen', 38, '7778889991', 'guest17@example.com', 'pass17');
INSERT INTO public.guest (nic, name, age, contact_no, email, password) VALUES ('890123457V', 'Guest Eighteen', 52, '8889990002', 'guest18@example.com', 'pass18');
INSERT INTO public.guest (nic, name, age, contact_no, email, password) VALUES ('901234568V', 'Guest Nineteen', 26, '9990001113', 'guest19@example.com', 'pass19');
INSERT INTO public.guest (nic, name, age, contact_no, email, password) VALUES ('012345679V', 'Guest Twenty', 42, '0001112224', 'guest20@example.com', 'pass20');
INSERT INTO public.guest (nic, name, age, contact_no, email, password) VALUES ('123456781V', 'Guest TwentyOne', 57, '1112223336', 'guest21@example.com', 'pass21');
INSERT INTO public.guest (nic, name, age, contact_no, email, password) VALUES ('234567892V', 'Guest TwentyTwo', 33, '2223334447', 'guest22@example.com', 'pass22');
INSERT INTO public.guest (nic, name, age, contact_no, email, password) VALUES ('345678903V', 'Guest TwentyThree', 48, '3334445558', 'guest23@example.com', 'pass23');

-- To test update trigger: UPDATE public.guest SET age = 31 WHERE guest_id = 1;

-- Insert queries for booking table
-- Testing: Foreign keys, enum booking_status, trigger prevent_double_booking, update_room_status
-- Edge cases: Overlapping dates for different rooms, same room non-overlap, past/present/future, multiple guests per room type capacity
-- Note: Inserts designed to not violate double booking; comment out invalid for test
-- At least 20 bookings
INSERT INTO public.booking (user_id, guest_id, room_id, booking_status, date_time, check_in, check_out) VALUES (1, 1, 1, 'Booked', '2025-10-20', '2025-10-23', '2025-10-25'); -- Future
INSERT INTO public.booking (user_id, guest_id, room_id, booking_status, date_time, check_in, check_out) VALUES (2, 2, 2, 'Checked-In', '2025-10-21', '2025-10-22', '2025-10-24'); -- Present
INSERT INTO public.booking (user_id, guest_id, room_id, booking_status, date_time, check_in, check_out) VALUES (3, 3, 3, 'Checked-Out', '2024-10-01', '2024-10-10', '2024-10-12'); -- Past
INSERT INTO public.booking (user_id, guest_id, room_id, booking_status, date_time, check_in, check_out) VALUES (4, 4, 4, 'Cancelled', '2025-11-01', '2025-11-05', '2025-11-07');
INSERT INTO public.booking (user_id, guest_id, room_id, booking_status, date_time, check_in, check_out) VALUES (5, 5, 5, 'Booked', '2025-12-01', '2025-12-10', '2025-12-15');
INSERT INTO public.booking (user_id, guest_id, room_id, booking_status, date_time, check_in, check_out) VALUES (6, 6, 6, 'Checked-In', '2025-10-15', '2025-10-20', '2025-10-25');
INSERT INTO public.booking (user_id, guest_id, room_id, booking_status, date_time, check_in, check_out) VALUES (7, 7, 7, 'Checked-Out', '2024-09-01', '2024-09-05', '2024-09-10');
INSERT INTO public.booking (user_id, guest_id, room_id, booking_status, date_time, check_in, check_out) VALUES (8, 8, 8, 'Cancelled', '2026-01-01', '2026-01-10', '2026-01-15'); -- Future
INSERT INTO public.booking (user_id, guest_id, room_id, booking_status, date_time, check_in, check_out) VALUES (9, 9, 9, 'Booked', '2025-10-22', '2025-10-25', '2025-10-30');
INSERT INTO public.booking (user_id, guest_id, room_id, booking_status, date_time, check_in, check_out) VALUES (10, 10, 10, 'Checked-In', '2025-10-18', '2025-10-22', '2025-10-27');
INSERT INTO public.booking (user_id, guest_id, room_id, booking_status, date_time, check_in, check_out) VALUES (11, 11, 11, 'Checked-Out', '2024-08-01', '2024-08-15', '2024-08-20');
INSERT INTO public.booking (user_id, guest_id, room_id, booking_status, date_time, check_in, check_out) VALUES (12, 12, 12, 'Cancelled', '2025-11-15', '2025-11-20', '2025-11-25');
INSERT INTO public.booking (user_id, guest_id, room_id, booking_status, date_time, check_in, check_out) VALUES (13, 13, 13, 'Booked', '2026-02-01', '2026-02-05', '2026-02-10');
INSERT INTO public.booking (user_id, guest_id, room_id, booking_status, date_time, check_in, check_out) VALUES (14, 14, 14, 'Checked-In', '2025-10-10', '2025-10-22', '2025-10-28');
INSERT INTO public.booking (user_id, guest_id, room_id, booking_status, date_time, check_in, check_out) VALUES (15, 15, 15, 'Checked-Out', '2024-07-01', '2024-07-10', '2024-07-15');
INSERT INTO public.booking (user_id, guest_id, room_id, booking_status, date_time, check_in, check_out) VALUES (16, 16, 16, 'Cancelled', '2025-12-20', '2025-12-25', '2025-12-30');
INSERT INTO public.booking (user_id, guest_id, room_id, booking_status, date_time, check_in, check_out) VALUES (17, 17, 17, 'Booked', '2025-09-01', '2025-09-05', '2025-09-10'); -- Past relative to current but valid
INSERT INTO public.booking (user_id, guest_id, room_id, booking_status, date_time, check_in, check_out) VALUES (18, 18, 18, 'Checked-In', '2025-10-20', '2025-10-22', '2025-10-26');
INSERT INTO public.booking (user_id, guest_id, room_id, booking_status, date_time, check_in, check_out) VALUES (19, 19, 19, 'Checked-Out', '2024-06-01', '2024-06-15', '2024-06-20');
INSERT INTO public.booking (user_id, guest_id, room_id, booking_status, date_time, check_in, check_out) VALUES (20, 20, 20, 'Cancelled', '2026-03-01', '2026-03-10', '2026-03-15');
-- Additional to reach 20+
INSERT INTO public.booking (user_id, guest_id, room_id, booking_status, date_time, check_in, check_out) VALUES (1, 21, 21, 'Booked', '2025-10-25', '2025-10-28', '2025-10-30');
INSERT INTO public.booking (user_id, guest_id, room_id, booking_status, date_time, check_in, check_out) VALUES (2, 22, 22, 'Checked-In', '2025-10-19', '2025-10-22', '2025-10-25');
INSERT INTO public.booking (user_id, guest_id, room_id, booking_status, date_time, check_in, check_out) VALUES (3, 23, 23, 'Checked-Out', '2024-05-01', '2024-05-10', '2024-05-15');
INSERT INTO public.booking (user_id, guest_id, room_id, booking_status, date_time, check_in, check_out) VALUES (4, 1, 24, 'Cancelled', '2025-11-10', '2025-11-15', '2025-11-20');
INSERT INTO public.booking (user_id, guest_id, room_id, booking_status, date_time, check_in, check_out) VALUES (5, 2, 25, 'Booked', '2026-04-01', '2026-04-05', '2026-04-10');

-- -- Example invalid for testing trigger: INSERT INTO public.booking (user_id, guest_id, room_id, booking_status, date_time, check_in, check_out) VALUES (1, 1, 1, 'Booked', '2025-10-20', '2025-10-24', '2025-10-26'); -- Overlaps first, should fail

-- Insert queries for service_usage table
-- Testing: Foreign keys, trigger calc_service_total, positive quantity/total
-- Edge cases: Min quantity 1, max 10, various services per booking
-- At least 20 usages
INSERT INTO public.service_usage (service_id, booking_id, quantity) VALUES (1, 1, 2.00); -- Triggers total = 2*10=20
INSERT INTO public.service_usage (service_id, booking_id, quantity) VALUES (2, 2, 1.00);
INSERT INTO public.service_usage (service_id, booking_id, quantity) VALUES (3, 3, 3.00);
INSERT INTO public.service_usage (service_id, booking_id, quantity) VALUES (4, 4, 1.00);
INSERT INTO public.service_usage (service_id, booking_id, quantity) VALUES (5, 5, 4.00);
INSERT INTO public.service_usage (service_id, booking_id, quantity) VALUES (6, 6, 2.00);
INSERT INTO public.service_usage (service_id, booking_id, quantity) VALUES (7, 7, 1.00);
INSERT INTO public.service_usage (service_id, booking_id, quantity) VALUES (8, 8, 5.00);
INSERT INTO public.service_usage (service_id, booking_id, quantity) VALUES (9, 9, 3.00);
INSERT INTO public.service_usage (service_id, booking_id, quantity) VALUES (10, 10, 2.00);
INSERT INTO public.service_usage (service_id, booking_id, quantity) VALUES (11, 11, 1.00);
INSERT INTO public.service_usage (service_id, booking_id, quantity) VALUES (12, 12, 4.00);
INSERT INTO public.service_usage (service_id, booking_id, quantity) VALUES (13, 13, 2.00);
INSERT INTO public.service_usage (service_id, booking_id, quantity) VALUES (14, 14, 3.00);
INSERT INTO public.service_usage (service_id, booking_id, quantity) VALUES (15, 15, 1.00);
INSERT INTO public.service_usage (service_id, booking_id, quantity) VALUES (16, 16, 5.00);
INSERT INTO public.service_usage (service_id, booking_id, quantity) VALUES (17, 17, 2.00);
INSERT INTO public.service_usage (service_id, booking_id, quantity) VALUES (18, 18, 1.00);
INSERT INTO public.service_usage (service_id, booking_id, quantity) VALUES (19, 19, 3.00);
INSERT INTO public.service_usage (service_id, booking_id, quantity) VALUES (20, 20, 4.00);
INSERT INTO public.service_usage (service_id, booking_id, quantity) VALUES (21, 21, 2.00);
INSERT INTO public.service_usage (service_id, booking_id, quantity) VALUES (1, 22, 1.00);
INSERT INTO public.service_usage (service_id, booking_id, quantity) VALUES (2, 23, 3.00);
INSERT INTO public.service_usage (service_id, booking_id, quantity) VALUES (3, 24, 2.00);
INSERT INTO public.service_usage (service_id, booking_id, quantity) VALUES (4, 25, 1.00);

-- Insert queries for final_bill table
-- Testing: Foreign keys, defaults 0, check constraints >=0, triggers for charges, total, outstanding
-- Edge cases: Zero charges, max amounts, late checkout (assume now > check_out for some)
-- At least 20 bills
INSERT INTO public.final_bill (user_id, booking_id, total_tax) VALUES (1, 1, 10.00); -- Triggers calculations
INSERT INTO public.final_bill (user_id, booking_id, total_tax) VALUES (2, 2, 15.00);
INSERT INTO public.final_bill (user_id, booking_id, total_tax) VALUES (3, 3, 20.00);
INSERT INTO public.final_bill (user_id, booking_id, total_tax) VALUES (4, 4, 5.00);
INSERT INTO public.final_bill (user_id, booking_id, total_tax) VALUES (5, 5, 25.00);
INSERT INTO public.final_bill (user_id, booking_id, total_tax) VALUES (6, 6, 30.00);
INSERT INTO public.final_bill (user_id, booking_id, total_tax) VALUES (7, 7, 10.00);
INSERT INTO public.final_bill (user_id, booking_id, total_tax) VALUES (8, 8, 15.00);
INSERT INTO public.final_bill (user_id, booking_id, total_tax) VALUES (9, 9, 20.00);
INSERT INTO public.final_bill (user_id, booking_id, total_tax) VALUES (10, 10, 25.00);
INSERT INTO public.final_bill (user_id, booking_id, total_tax) VALUES (11, 11, 30.00);
INSERT INTO public.final_bill (user_id, booking_id, total_tax) VALUES (12, 12, 10.00);
INSERT INTO public.final_bill (user_id, booking_id, total_tax) VALUES (13, 13, 15.00);
INSERT INTO public.final_bill (user_id, booking_id, total_tax) VALUES (14, 14, 20.00);
INSERT INTO public.final_bill (user_id, booking_id, total_tax) VALUES (15, 15, 25.00);
INSERT INTO public.final_bill (user_id, booking_id, total_tax) VALUES (16, 16, 30.00);
INSERT INTO public.final_bill (user_id, booking_id, total_tax) VALUES (17, 17, 10.00);
INSERT INTO public.final_bill (user_id, booking_id, total_tax) VALUES (18, 18, 15.00);
INSERT INTO public.final_bill (user_id, booking_id, total_tax) VALUES (19, 19, 20.00);
INSERT INTO public.final_bill (user_id, booking_id, total_tax) VALUES (20, 20, 25.00);
INSERT INTO public.final_bill (user_id, booking_id, total_tax) VALUES (1, 21, 30.00);
INSERT INTO public.final_bill (user_id, booking_id, total_tax) VALUES (2, 22, 10.00);
INSERT INTO public.final_bill (user_id, booking_id, total_tax) VALUES (3, 23, 15.00);
INSERT INTO public.final_bill (user_id, booking_id, total_tax) VALUES (4, 24, 20.00);
INSERT INTO public.final_bill (user_id, booking_id, total_tax) VALUES (5, 25, 25.00);

-- Insert queries for payment table
-- Testing: Foreign key to bill, positive paid_amount, various methods
-- Edge cases: Full payment, partial, zero (but check >=0 implied)
-- At least 20 payments
INSERT INTO public.payment (bill_id, paid_method, paid_amount, notes) VALUES (1, 'Credit Card', 100.00, 'Full payment');
INSERT INTO public.payment (bill_id, paid_method, paid_amount, notes) VALUES (2, 'Cash', 50.00, 'Partial');
INSERT INTO public.payment (bill_id, paid_method, paid_amount, notes) VALUES (3, 'Debit Card', 200.00, 'Full');
INSERT INTO public.payment (bill_id, paid_method, paid_amount, notes) VALUES (4, 'Bank Transfer', 0.00, 'Refund case');
INSERT INTO public.payment (bill_id, paid_method, paid_amount, notes) VALUES (5, 'Credit Card', 150.00, 'Full');
INSERT INTO public.payment (bill_id, paid_method, paid_amount, notes) VALUES (6, 'Cash', 75.00, 'Partial');
INSERT INTO public.payment (bill_id, paid_method, paid_amount, notes) VALUES (7, 'Debit Card', 100.00, 'Full');
INSERT INTO public.payment (bill_id, paid_method, paid_amount, notes) VALUES (8, 'Bank Transfer', 300.00, 'Full');
INSERT INTO public.payment (bill_id, paid_method, paid_amount, notes) VALUES (9, 'Credit Card', 80.00, 'Partial');
INSERT INTO public.payment (bill_id, paid_method, paid_amount, notes) VALUES (10, 'Cash', 250.00, 'Full');
INSERT INTO public.payment (bill_id, paid_method, paid_amount, notes) VALUES (11, 'Debit Card', 120.00, 'Full');
INSERT INTO public.payment (bill_id, paid_method, paid_amount, notes) VALUES (12, 'Bank Transfer', 60.00, 'Partial');
INSERT INTO public.payment (bill_id, paid_method, paid_amount, notes) VALUES (13, 'Credit Card', 180.00, 'Full');
INSERT INTO public.payment (bill_id, paid_method, paid_amount, notes) VALUES (14, 'Cash', 90.00, 'Partial');
INSERT INTO public.payment (bill_id, paid_method, paid_amount, notes) VALUES (15, 'Debit Card', 220.00, 'Full');
INSERT INTO public.payment (bill_id, paid_method, paid_amount, notes) VALUES (16, 'Bank Transfer', 110.00, 'Full');
INSERT INTO public.payment (bill_id, paid_method, paid_amount, notes) VALUES (17, 'Credit Card', 70.00, 'Partial');
INSERT INTO public.payment (bill_id, paid_method, paid_amount, notes) VALUES (18, 'Cash', 260.00, 'Full');
INSERT INTO public.payment (bill_id, paid_method, paid_amount, notes) VALUES (19, 'Debit Card', 130.00, 'Full');
INSERT INTO public.payment (bill_id, paid_method, paid_amount, notes) VALUES (20, 'Bank Transfer', 65.00, 'Partial');
INSERT INTO public.payment (bill_id, paid_method, paid_amount, notes) VALUES (21, 'Credit Card', 190.00, 'Full');
INSERT INTO public.payment (bill_id, paid_method, paid_amount, notes) VALUES (22, 'Cash', 95.00, 'Partial');
INSERT INTO public.payment (bill_id, paid_method, paid_amount, notes) VALUES (23, 'Debit Card', 230.00, 'Full');
INSERT INTO public.payment (bill_id, paid_method, paid_amount, notes) VALUES (24, 'Bank Transfer', 115.00, 'Full');
INSERT INTO public.payment (bill_id, paid_method, paid_amount, notes) VALUES (25, 'Credit Card', 75.00, 'Partial');

-- Insert queries for revenue table
-- Testing: Foreign key to branch, check amount >=0, months 1-12
-- Edge cases: Zero revenue, high amounts, various months
-- At least 20 records
INSERT INTO public.revenue (branch_id, month, amount) VALUES (1, 1, 10000.00);
INSERT INTO public.revenue (branch_id, month, amount) VALUES (1, 2, 15000.00);
INSERT INTO public.revenue (branch_id, month, amount) VALUES (2, 3, 20000.00);
INSERT INTO public.revenue (branch_id, month, amount) VALUES (2, 4, 0.00); -- Zero
INSERT INTO public.revenue (branch_id, month, amount) VALUES (3, 5, 25000.00);
INSERT INTO public.revenue (branch_id, month, amount) VALUES (3, 6, 30000.00);
INSERT INTO public.revenue (branch_id, month, amount) VALUES (4, 7, 10000.00);
INSERT INTO public.revenue (branch_id, month, amount) VALUES (4, 8, 15000.00);
INSERT INTO public.revenue (branch_id, month, amount) VALUES (5, 9, 20000.00);
INSERT INTO public.revenue (branch_id, month, amount) VALUES (5, 10, 25000.00);
INSERT INTO public.revenue (branch_id, month, amount) VALUES (6, 11, 30000.00);
INSERT INTO public.revenue (branch_id, month, amount) VALUES (6, 12, 10000.00);
INSERT INTO public.revenue (branch_id, month, amount) VALUES (7, 1, 15000.00);
INSERT INTO public.revenue (branch_id, month, amount) VALUES (7, 2, 20000.00);
INSERT INTO public.revenue (branch_id, month, amount) VALUES (8, 3, 25000.00);
INSERT INTO public.revenue (branch_id, month, amount) VALUES (8, 4, 30000.00);
INSERT INTO public.revenue (branch_id, month, amount) VALUES (9, 5, 10000.00);
INSERT INTO public.revenue (branch_id, month, amount) VALUES (9, 6, 0.00);
INSERT INTO public.revenue (branch_id, month, amount) VALUES (10, 7, 20000.00);
INSERT INTO public.revenue (branch_id, month, amount) VALUES (10, 8, 25000.00);
INSERT INTO public.revenue (branch_id, month, amount) VALUES (11, 9, 30000.00);
INSERT INTO public.revenue (branch_id, month, amount) VALUES (11, 10, 10000.00);
INSERT INTO public.revenue (branch_id, month, amount) VALUES (12, 11, 15000.00);
INSERT INTO public.revenue (branch_id, month, amount) VALUES (12, 12, 20000.00);

-- Insert queries for log table
-- Testing: Foreign key to user, various actions
-- Edge cases: Different action_rec_id
-- At least 20 logs
INSERT INTO public.log (user_id, action, action_rec_id) VALUES (1, 'Created booking', 1);
INSERT INTO public.log (user_id, action, action_rec_id) VALUES (2, 'Updated guest', 2);
INSERT INTO public.log (user_id, action, action_rec_id) VALUES (3, 'Processed payment', 3);
INSERT INTO public.log (user_id, action, action_rec_id) VALUES (4, 'Cancelled booking', 4);
INSERT INTO public.log (user_id, action, action_rec_id) VALUES (5, 'Added service', 5);
INSERT INTO public.log (user_id, action, action_rec_id) VALUES (6, 'Generated bill', 6);
INSERT INTO public.log (user_id, action, action_rec_id) VALUES (7, 'Updated room status', 7);
INSERT INTO public.log (user_id, action, action_rec_id) VALUES (8, 'Applied discount', 8);
INSERT INTO public.log (user_id, action, action_rec_id) VALUES (9, 'Logged revenue', 9);
INSERT INTO public.log (user_id, action, action_rec_id) VALUES (10, 'Staff update', 10);
INSERT INTO public.log (user_id, action, action_rec_id) VALUES (11, 'Guest registration', 11);
INSERT INTO public.log (user_id, action, action_rec_id) VALUES (12, 'Service usage', 12);
INSERT INTO public.log (user_id, action, action_rec_id) VALUES (13, 'Bill payment', 13);
INSERT INTO public.log (user_id, action, action_rec_id) VALUES (14, 'Booking check-in', 14);
INSERT INTO public.log (user_id, action, action_rec_id) VALUES (15, 'Booking check-out', 15);
INSERT INTO public.log (user_id, action, action_rec_id) VALUES (16, 'Discount creation', 16);
INSERT INTO public.log (user_id, action, action_rec_id) VALUES (17, 'Room addition', 17);
INSERT INTO public.log (user_id, action, action_rec_id) VALUES (18, 'Branch update', 18);
INSERT INTO public.log (user_id, action, action_rec_id) VALUES (19, 'User login', 19);
INSERT INTO public.log (user_id, action, action_rec_id) VALUES (20, 'System audit', 20);
INSERT INTO public.log (user_id, action, action_rec_id) VALUES (21, 'Error log', 21);
INSERT INTO public.log (user_id, action, action_rec_id) VALUES (22, 'Data export', 22);
INSERT INTO public.log (user_id, action, action_rec_id) VALUES (23, 'Report generation', 23);

-- Note: schema_migrations not populated as it's for migration tracking, not data.