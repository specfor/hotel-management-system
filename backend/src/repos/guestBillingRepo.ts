// backend/src/repos/guestBillingRepo.ts

import { 
  GuestBillingPublic, 
  GuestBillingFilters,
} from "@src/types/guestBillingTypes";
import db from "@src/common/util/db";

// --- Helper Functions ---

interface GuestBillingRow {
  guest_id: number;
  guest_name: string;
  guest_nic: string | null;
  guest_contact: string | null;
  guest_email: string | null;
  booking_id: number;
  check_in_date: Date;
  check_out_date: Date;
  booking_status: string;
  nights_stayed: string;
  bill_id: number | null;
  room_charges: string | null;
  total_service_charges: string | null;
  total_tax: string | null;
  late_checkout_charge: string | null;
  total_discount: string | null;
  total_amount: string | null;
  paid_amount: string;
  outstanding_amount: string | null;
  payment_status: string;
  bill_date: Date | null;
  days_overdue: string;
}

const mapToPublic = (row: GuestBillingRow): GuestBillingPublic => ({
  guestId: row.guest_id,
  guestName: row.guest_name,
  guestNic: row.guest_nic,
  guestContact: row.guest_contact,
  guestEmail: row.guest_email,
  bookingId: row.booking_id,
  checkInDate: row.check_in_date,
  checkOutDate: row.check_out_date,
  bookingStatus: row.booking_status,
  nightsStayed: parseInt(row.nights_stayed, 10),
  billId: row.bill_id,
  roomCharges: row.room_charges ? parseFloat(row.room_charges) : null,
  totalServiceCharges: row.total_service_charges 
    ? parseFloat(row.total_service_charges) : null,
  totalTax: row.total_tax ? parseFloat(row.total_tax) : null,
  lateCheckoutCharge: row.late_checkout_charge 
    ? parseFloat(row.late_checkout_charge) : null,
  totalDiscount: row.total_discount ? parseFloat(row.total_discount) : null,
  totalAmount: row.total_amount ? parseFloat(row.total_amount) : null,
  paidAmount: parseFloat(row.paid_amount),
  outstandingAmount: row.outstanding_amount ? parseFloat(row.outstanding_amount) : null,
  paymentStatus: row.payment_status,
  billDate: row.bill_date,
  daysOverdue: parseInt(row.days_overdue, 10),
});

// --- Repository Operations ---

/**
 * Get guest billing data with optional filters
 * @param filters - Optional filters for guest, booking, payment status, or dates
 * @returns Array of guest billing records
 */
export async function getGuestBillingDB(
  filters: GuestBillingFilters = {},
): Promise<GuestBillingPublic[]> {
  let sql = `
    SELECT 
      guest_id,
      guest_name,
      guest_nic,
      guest_contact,
      guest_email,
      booking_id,
      check_in_date,
      check_out_date,
      booking_status,
      nights_stayed,
      bill_id,
      room_charges,
      total_service_charges,
      total_tax,
      late_checkout_charge,
      total_discount,
      total_amount,
      paid_amount,
      outstanding_amount,
      payment_status,
      bill_date,
      days_overdue
    FROM 
      guest_billing_summary_view
  `;

  const conditions: string[] = [];
  const values: (string | number | boolean)[] = [];
  let paramIndex = 1;

  // Filter by guest ID
  if (filters.guestId !== undefined) {
    conditions.push(`guest_id = $${paramIndex++}`);
    values.push(filters.guestId);
  }

  // Filter by booking ID
  if (filters.bookingId !== undefined) {
    conditions.push(`booking_id = $${paramIndex++}`);
    values.push(filters.bookingId);
  }

  // Filter by payment status
  if (filters.paymentStatus) {
    conditions.push(`payment_status = $${paramIndex++}`);
    values.push(filters.paymentStatus);
  }

  // Filter by outstanding balance
  if (filters.hasOutstanding === true) {
    conditions.push("outstanding_amount > 0");
  }

  // Filter by minimum outstanding amount
  if (filters.minOutstanding !== undefined) {
    conditions.push(`outstanding_amount >= $${paramIndex++}`);
    values.push(filters.minOutstanding);
  }

  // Filter by bill date range
  if (filters.startDate) {
    conditions.push(`bill_date >= $${paramIndex++}`);
    values.push(filters.startDate);
  }

  if (filters.endDate) {
    conditions.push(`bill_date <= $${paramIndex++}`);
    values.push(filters.endDate);
  }

  // Add WHERE clause if there are conditions
  if (conditions.length > 0) {
    sql += ` WHERE ${conditions.join(" AND ")}`;
  }

  // Order by guest ID and bill date
  sql += " ORDER BY guest_id ASC, bill_date DESC";

  const result = await db.query(sql, values);
  return result.rows.map((row) => mapToPublic(row as GuestBillingRow));
}
