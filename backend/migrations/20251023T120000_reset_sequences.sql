-- Migration: reset_sequences
-- Created: 2025-10-23T12:00:00Z
-- Description: Reset SERIAL sequences for all seeded tables

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
