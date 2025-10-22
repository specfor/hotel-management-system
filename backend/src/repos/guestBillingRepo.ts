// backend/src/repos/guestBillingRepo.ts

import type {
  GuestBillingFilters,
  GuestBillingPublic,
} from "@src/types/guestBillingTypes";
import db from "@src/common/util/db";

// --- Helper Functions ---

interface GuestBillingRow {
  guestId: number;
  guestName: string;
  guestNic: string | null;
  guestContact: string | null;
  guestEmail: string | null;
  billId: number | null;
  bookingId: number | null;
  checkInDate: Date | null;
  checkOutDate: Date | null;
  bookingStatus: string | null;
  nightsStayed: number | null;
  roomCharges: string | null;
  totalServiceCharges: string | null;
  totalTax: string | null;
  lateCheckoutCharge: string | null;
  totalDiscount: string | null;
  totalAmount: string | null;
  paidAmount: string | null;
  outstandingAmount: string | null;
  paymentStatus: string;
  billDate: Date | null;
  daysOverdue: number;
  lastPaymentDate: Date | null;
  roomId: number | null;
  roomType: string | null;
  branchId: number | null;
  branchName: string | null;
}

function mapRowToPublic(row: GuestBillingRow): GuestBillingPublic {
  return {
    guestId: row.guestId,
    guestName: row.guestName,
    guestNic: row.guestNic,
    guestContact: row.guestContact,
    guestEmail: row.guestEmail,
    billId: row.billId,
    bookingId: row.bookingId,
    checkInDate: row.checkInDate,
    checkOutDate: row.checkOutDate,
    bookingStatus: row.bookingStatus,
    nightsStayed: row.nightsStayed,
    roomCharges: row.roomCharges ? parseFloat(row.roomCharges) : null,
    totalServiceCharges: row.totalServiceCharges ? 
      parseFloat(row.totalServiceCharges) : null,
    totalTax: row.totalTax ? parseFloat(row.totalTax) : null,
    lateCheckoutCharge: row.lateCheckoutCharge ? 
      parseFloat(row.lateCheckoutCharge) : null,
    totalDiscount: row.totalDiscount ? parseFloat(row.totalDiscount) : null,
    totalAmount: row.totalAmount ? parseFloat(row.totalAmount) : null,
    paidAmount: row.paidAmount ? parseFloat(row.paidAmount) : null,
    outstandingAmount: row.outstandingAmount ? 
      parseFloat(row.outstandingAmount) : null,
    paymentStatus: row.paymentStatus,
    billDate: row.billDate,
    daysOverdue: row.daysOverdue,
    lastPaymentDate: row.lastPaymentDate,
    roomId: row.roomId,
    roomType: row.roomType,
    branchId: row.branchId,
    branchName: row.branchName,
  };
}

/**
 * Repository for guest billing operations
 */
class GuestBillingRepository {
  /**
   * Get guest billing data with optional filters
   * @param filters - Optional filters for the query
   * @returns Array of guest billing records
   */
  public async getGuestBilling(
    filters?: GuestBillingFilters,
  ): Promise<GuestBillingPublic[]> {
    let query = `
      SELECT 
        guest_id as "guestId",
        guest_name as "guestName",
        guest_nic as "guestNic",
        guest_contact as "guestContact",
        guest_email as "guestEmail",
        bill_id as "billId",
        booking_id as "bookingId",
        check_in_date as "checkInDate",
        check_out_date as "checkOutDate",
        booking_status as "bookingStatus",
        nights_stayed as "nightsStayed",
        room_charges as "roomCharges",
        total_service_charges as "totalServiceCharges",
        total_tax as "totalTax",
        late_checkout_charge as "lateCheckoutCharge",
        total_discount as "totalDiscount",
        total_amount as "totalAmount",
        paid_amount as "paidAmount",
        outstanding_amount as "outstandingAmount",
        payment_status as "paymentStatus",
        bill_date as "billDate",
        days_overdue as "daysOverdue",
        last_payment_date as "lastPaymentDate",
        room_id as "roomId",
        room_type as "roomType",
        branch_id as "branchId",
        branch_name as "branchName"
      FROM guest_billing_summary_view
      WHERE 1=1
    `;

    const values: (string | number | boolean)[] = [];
    let paramCount = 1;

    // Apply filters
    if (filters?.guestId) {
      query += ` AND guest_id = $${paramCount}`;
      values.push(filters.guestId);
      paramCount++;
    }

    if (filters?.guestName) {
      query += ` AND LOWER(guest_name) LIKE LOWER($${paramCount})`;
      values.push(`%${filters.guestName}%`);
      paramCount++;
    }

    if (filters?.paymentStatus) {
      query += ` AND payment_status = $${paramCount}`;
      values.push(filters.paymentStatus);
      paramCount++;
    }

    if (filters?.branchId) {
      query += ` AND branch_id = $${paramCount}`;
      values.push(filters.branchId);
      paramCount++;
    }

    if (filters?.bookingStatus) {
      query += ` AND booking_status = $${paramCount}`;
      values.push(filters.bookingStatus);
      paramCount++;
    }

    if (filters?.startDate) {
      query += ` AND check_in_date >= $${paramCount}::date`;
      values.push(filters.startDate);
      paramCount++;
    }

    if (filters?.endDate) {
      query += ` AND check_out_date <= $${paramCount}::date`;
      values.push(filters.endDate);
      paramCount++;
    }

    if (filters?.minOutstanding !== undefined) {
      query += ` AND outstanding_amount >= $${paramCount}`;
      values.push(filters.minOutstanding);
      paramCount++;
    }

    if (filters?.maxOutstanding !== undefined) {
      query += ` AND outstanding_amount <= $${paramCount}`;
      values.push(filters.maxOutstanding);
      paramCount++;
    }

    if (filters?.hasOverdue !== undefined) {
      if (filters.hasOverdue) {
        query += " AND days_overdue > 0";
      } else {
        query += " AND days_overdue = 0";
      }
    }

    query += " ORDER BY guest_id, bill_date DESC";

    const result = await db.query(query, values);
    return result.rows.map((row) => mapRowToPublic(row as GuestBillingRow));
  }

  /**
   * Get billing summary statistics
   * @param filters - Optional filters for the query
   * @returns Summary statistics object
   */
  public async getBillingSummary(filters?: GuestBillingFilters) {
    let query = `
      SELECT 
        COUNT(DISTINCT guest_id) as total_guests,
        COUNT(DISTINCT bill_id) as total_bills,
        COALESCE(SUM(total_amount), 0) as total_billed,
        COALESCE(SUM(paid_amount), 0) as total_paid,
        COALESCE(SUM(outstanding_amount), 0) as total_outstanding,
        COUNT(DISTINCT CASE 
          WHEN payment_status = 'Unpaid' 
          THEN guest_id 
        END) as guests_with_unpaid,
        ROUND(AVG(total_amount)::numeric, 2) as average_bill_amount,
        ROUND(AVG(outstanding_amount)::numeric, 2) as average_outstanding
      FROM guest_billing_summary_view
      WHERE bill_id IS NOT NULL
    `;

    const values: (string | number | boolean)[] = [];
    let paramCount = 1;

    // Apply same filters as main query
    if (filters?.guestId) {
      query += ` AND guest_id = $${paramCount}`;
      values.push(filters.guestId);
      paramCount++;
    }

    if (filters?.paymentStatus) {
      query += ` AND payment_status = $${paramCount}`;
      values.push(filters.paymentStatus);
      paramCount++;
    }

    if (filters?.branchId) {
      query += ` AND branch_id = $${paramCount}`;
      values.push(filters.branchId);
      paramCount++;
    }

    if (filters?.startDate) {
      query += ` AND check_in_date >= $${paramCount}::date`;
      values.push(filters.startDate);
      paramCount++;
    }

    if (filters?.endDate) {
      query += ` AND check_out_date <= $${paramCount}::date`;
      values.push(filters.endDate);
      paramCount++;
    }

    if (filters?.hasOverdue !== undefined) {
      if (filters.hasOverdue) {
        query += " AND days_overdue > 0";
      } else {
        query += " AND days_overdue = 0";
      }
    }

    const result = await db.query(query, values);
    return result.rows[0];
  }
}

export default new GuestBillingRepository();
