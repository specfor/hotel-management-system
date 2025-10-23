-- Migration: create_views
-- Created: 2025-10-05T12:40:48.811Z
-- Description: Add description here

-- =====================================================
-- UP MIGRATION
-- =====================================================

create view guest_main_view as
select g.guest_id, g.nic, g.name, g.age,  g.contact_no, g.email, b.room_id, b.booking_status
from guest g
left join booking b
on g.guest_id = b.guest_id
order by b.date_time desc;


-- =====================================================
-- MONTHLY REVENUE PER BRANCH VIEW
-- =====================================================
-- View for tracking monthly revenue from rooms and services per branch
CREATE OR REPLACE VIEW monthly_revenue_per_branch_view AS
SELECT
    DATE_TRUNC('month', b.check_out)::date AS month_start,
    (DATE_TRUNC('month', b.check_out) + INTERVAL '1 month' - INTERVAL '1 day')::date AS month_end,
    TO_CHAR(DATE_TRUNC('month', b.check_out), 'YYYY-MM') AS month_year,
    br.branch_id,
    br.branch_name,
    br.city,
    COUNT(DISTINCT b.booking_id) AS total_bookings,
    COUNT(DISTINCT b.guest_id) AS unique_guests,
    COALESCE(SUM(fb.room_charges), 0) AS total_room_charges,
    COALESCE(SUM(fb.total_service_charges), 0) AS total_service_charges,
    COALESCE(SUM(fb.total_tax), 0) AS total_tax,
    COALESCE(SUM(fb.total_discount), 0) AS total_discounts,
    COALESCE(SUM(fb.late_checkout_charge), 0) AS late_checkout_charges,
    COALESCE(SUM(fb.total_amount), 0) AS gross_revenue,
    COALESCE(SUM(fb.paid_amount), 0) AS total_paid,
    COALESCE(SUM(fb.outstanding_amount), 0) AS outstanding_revenue,
    ROUND(
        (COALESCE(SUM(fb.paid_amount), 0) / NULLIF(SUM(fb.total_amount), 0) * 100)::numeric, 
        2
    ) AS payment_collection_rate,
    COUNT(DISTINCT CASE WHEN r.room_status = 'Occupied' THEN r.room_id END) AS occupied_rooms_count,
    (SELECT COUNT(*) FROM room WHERE branch_id = br.branch_id) AS total_rooms_in_branch
FROM booking b
JOIN room r ON b.room_id = r.room_id
JOIN branch br ON r.branch_id = br.branch_id
LEFT JOIN final_bill fb ON b.booking_id = fb.booking_id
WHERE b.booking_status IN ('Checked-Out', 'Checked-In')
GROUP BY 
    DATE_TRUNC('month', b.check_out),
    br.branch_id, br.branch_name, br.city
ORDER BY month_start DESC, br.branch_name;


-- =====================================================
-- ROOM OCCUPANCY REPORT VIEW
-- =====================================================
-- View for analyzing room occupancy for a selected date or period
CREATE OR REPLACE VIEW room_occupancy_report_view AS
SELECT
    r.room_id,
    r.room_id AS room_number,
    rt.type_name AS room_type,
    rt.daily_rate,
    rt.capacity,
    br.branch_id,
    br.branch_name,
    br.city,
    b.booking_id,
    g.guest_id,
    g.name AS guest_name,
    g.contact_no AS guest_contact,
    b.check_in AS check_in_date,
    b.check_out AS check_out_date,
    b.booking_status,
    r.room_status,
    CASE 
        WHEN b.booking_status = 'Checked-In' THEN 'Occupied'
        WHEN b.booking_status = 'Checked-Out' THEN 'Available'
        WHEN b.booking_status = 'Cancelled' THEN 'Available'
        WHEN b.booking_status = 'Booked' AND b.check_in::date = CURRENT_DATE THEN 'Pending Check-in'
        WHEN b.booking_status = 'Booked' AND b.check_in::date > CURRENT_DATE THEN 'Reserved'
        WHEN r.room_status = 'Maintenance' THEN 'Maintenance'
        WHEN r.room_status = 'Cleaning' THEN 'Cleaning'
        ELSE 'Available'
    END AS occupancy_status,
    CASE 
        WHEN b.check_in IS NOT NULL AND b.check_out IS NOT NULL 
        THEN (b.check_out::date - b.check_in::date)
        ELSE NULL
    END AS nights_booked,
    CASE 
        WHEN b.booking_status IN ('Checked-In', 'Checked-Out') 
            AND b.check_in IS NOT NULL AND b.check_out IS NOT NULL
        THEN (b.check_out::date - b.check_in::date) * rt.daily_rate 
        ELSE 0 
    END AS room_revenue,
    b.date_time AS booking_created_at
FROM room r
LEFT JOIN room_type rt ON r.type_id = rt.type_id
LEFT JOIN branch br ON r.branch_id = br.branch_id
LEFT JOIN booking b ON r.room_id = b.room_id 
    AND b.booking_status IN ('Checked-In', 'Checked-Out', 'Booked')
LEFT JOIN guest g ON b.guest_id = g.guest_id
ORDER BY br.branch_name, r.room_id, b.check_in;


-- =====================================================
-- GUEST BILLING SUMMARY VIEW
-- =====================================================
-- View for guest billing information with unpaid balances
CREATE OR REPLACE VIEW guest_billing_summary_view AS
SELECT
    g.guest_id,
    g.name AS guest_name,
    g.NIC AS guest_nic,
    g.contact_no AS guest_contact,
    g.email AS guest_email,
    fb.bill_id,
    b.booking_id,
    b.check_in AS check_in_date,
    b.check_out AS check_out_date,
    b.booking_status,
    CASE 
        WHEN b.check_in IS NOT NULL AND b.check_out IS NOT NULL 
        THEN (b.check_out::date - b.check_in::date)
        ELSE NULL
    END AS nights_stayed,
    fb.room_charges,
    fb.total_service_charges,
    fb.total_tax,
    fb.late_checkout_charge,
    fb.total_discount,
    fb.total_amount,
    fb.paid_amount,
    fb.outstanding_amount,
    CASE 
        WHEN fb.outstanding_amount > 0 THEN 'Unpaid'
        WHEN fb.outstanding_amount = 0 AND fb.paid_amount > 0 THEN 'Paid'
        ELSE 'Pending'
    END AS payment_status,
    fb.created_at AS bill_date,
    CASE 
        WHEN fb.outstanding_amount > 0 AND fb.created_at IS NOT NULL
        THEN (CURRENT_DATE - fb.created_at::date)
        ELSE 0
    END AS days_overdue,
    (SELECT MAX(p.date_time) 
     FROM payment p 
     WHERE p.bill_id = fb.bill_id) AS last_payment_date,
    r.room_id,
    rt.type_name AS room_type,
    br.branch_id,
    br.branch_name
FROM guest g
LEFT JOIN booking b ON g.guest_id = b.guest_id
LEFT JOIN final_bill fb ON b.booking_id = fb.booking_id
LEFT JOIN room r ON b.room_id = r.room_id
LEFT JOIN room_type rt ON r.type_id = rt.type_id
LEFT JOIN branch br ON r.branch_id = br.branch_id
ORDER BY g.guest_id, fb.created_at DESC;


-- =====================================================
-- SERVICE USAGE BREAKDOWN VIEW
-- =====================================================
-- View for analyzing service usage per room and service type
CREATE OR REPLACE VIEW service_usage_breakdown_view AS
SELECT
    su.record_id,
    su.booking_id,
    b.room_id,
    b.guest_id,
    g.name AS guest_name,
    g.contact_no AS guest_contact,
    b.check_in,
    b.check_out,
    b.booking_status,
    CASE 
        WHEN b.check_in IS NOT NULL AND b.check_out IS NOT NULL 
        THEN (b.check_out::date - b.check_in::date)
        ELSE NULL
    END AS stay_duration,
    cs.service_id,
    cs.service_name,
    cs.unit_type,
    cs.unit_price,
    su.quantity,
    su.total_price,
    su.date_time AS usage_date,
    cs.branch_id,
    br.branch_name,
    br.city,
    rt.type_name AS room_type
FROM service_usage su
JOIN chargeable_services cs ON su.service_id = cs.service_id
JOIN booking b ON su.booking_id = b.booking_id
JOIN guest g ON b.guest_id = g.guest_id
JOIN room r ON b.room_id = r.room_id
JOIN room_type rt ON r.type_id = rt.type_id
JOIN branch br ON cs.branch_id = br.branch_id
ORDER BY su.date_time DESC, su.record_id;


-- =====================================================
-- TOP SERVICES AND CUSTOMER TRENDS VIEW
-- =====================================================
-- View for identifying top services and customer preferences
CREATE OR REPLACE VIEW top_services_trends_view AS
SELECT
    cs.service_id,
    cs.service_name,
    cs.unit_type,
    cs.unit_price,
    cs.branch_id,
    br.branch_name,
    br.city,
    COUNT(DISTINCT su.booking_id) AS bookings_using_service,
    COUNT(DISTINCT b.guest_id) AS unique_customers,
    SUM(su.quantity) AS total_quantity_used,
    SUM(su.total_price) AS total_revenue_from_service,
    ROUND(AVG(su.quantity)::numeric, 2) AS avg_quantity_per_usage,
    ROUND(AVG(su.total_price)::numeric, 2) AS avg_price_per_usage,
    MIN(su.date_time) AS first_usage_date,
    MAX(su.date_time) AS last_usage_date
FROM chargeable_services cs
LEFT JOIN service_usage su ON cs.service_id = su.service_id
LEFT JOIN booking b ON su.booking_id = b.booking_id
JOIN branch br ON cs.branch_id = br.branch_id
GROUP BY 
    cs.service_id, cs.service_name, cs.unit_type, cs.unit_price,
    cs.branch_id, br.branch_name, br.city
ORDER BY total_revenue_from_service DESC NULLS LAST, bookings_using_service DESC NULLS LAST;


-- =====================================================
-- DOWN MIGRATION (Rollback)
-- =====================================================
-- To rollback, uncomment the lines below:
/*
DROP VIEW IF EXISTS top_services_trends_view;
DROP VIEW IF EXISTS service_usage_breakdown_view;
DROP VIEW IF EXISTS guest_billing_summary_view;
DROP VIEW IF EXISTS room_occupancy_report_view;
DROP VIEW IF EXISTS monthly_revenue_per_branch_view;
DROP VIEW IF EXISTS guest_main_view;
*/
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
