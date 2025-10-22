// backend/src/repos/monthlyRevenueRepo.ts

import { 
  MonthlyRevenuePublic, 
  MonthlyRevenueFilters,
} from "@src/types/monthlyRevenueTypes";
import db from "@src/common/util/db";

// --- Helper Functions ---

interface MonthlyRevenueRow {
  month_start: Date;
  month_end: Date;
  month_year: string;
  branch_id: number;
  branch_name: string;
  city: string;
  total_bookings: string;
  unique_guests: string;
  total_room_charges: string;
  total_service_charges: string;
  total_tax: string;
  total_discounts: string;
  late_checkout_charges: string;
  gross_revenue: string;
  total_paid: string;
  outstanding_revenue: string;
  payment_collection_rate: string;
  occupied_rooms_count: string;
  total_rooms_in_branch: string;
}

const mapToPublic = (row: MonthlyRevenueRow): MonthlyRevenuePublic => ({
  monthStart: row.month_start,
  monthEnd: row.month_end,
  monthYear: row.month_year,
  branchId: row.branch_id,
  branchName: row.branch_name,
  city: row.city,
  totalBookings: parseInt(row.total_bookings, 10),
  uniqueGuests: parseInt(row.unique_guests, 10),
  totalRoomCharges: parseFloat(row.total_room_charges),
  totalServiceCharges: parseFloat(row.total_service_charges),
  totalTax: parseFloat(row.total_tax),
  totalDiscounts: parseFloat(row.total_discounts),
  lateCheckoutCharges: parseFloat(row.late_checkout_charges),
  grossRevenue: parseFloat(row.gross_revenue),
  totalPaid: parseFloat(row.total_paid),
  outstandingRevenue: parseFloat(row.outstanding_revenue),
  paymentCollectionRate: parseFloat(row.payment_collection_rate),
  occupiedRoomsCount: parseInt(row.occupied_rooms_count, 10),
  totalRoomsInBranch: parseInt(row.total_rooms_in_branch, 10),
});

// --- Repository Operations ---

/**
 * Get monthly revenue data with optional filters
 * @param filters - Optional filters for branch, month, date range, or city
 * @returns Array of monthly revenue records
 */
export async function getMonthlyRevenueDB(
  filters: MonthlyRevenueFilters = {},
): Promise<MonthlyRevenuePublic[]> {
  let sql = `
    SELECT 
      month_start,
      month_end,
      month_year,
      branch_id,
      branch_name,
      city,
      total_bookings,
      unique_guests,
      total_room_charges,
      total_service_charges,
      total_tax,
      total_discounts,
      late_checkout_charges,
      gross_revenue,
      total_paid,
      outstanding_revenue,
      payment_collection_rate,
      occupied_rooms_count,
      total_rooms_in_branch
    FROM 
      monthly_revenue_per_branch_view
  `;

  const conditions: string[] = [];
  const values: (string | number)[] = [];
  let paramIndex = 1;

  // Filter by branch ID
  if (filters.branchId !== undefined) {
    conditions.push(`branch_id = $${paramIndex++}`);
    values.push(filters.branchId);
  }

  // Filter by specific month-year
  if (filters.monthYear) {
    conditions.push(`month_year = $${paramIndex++}`);
    values.push(filters.monthYear);
  }

  // Filter by date range
  if (filters.startDate) {
    conditions.push(`month_start >= $${paramIndex++}`);
    values.push(filters.startDate);
  }

  if (filters.endDate) {
    conditions.push(`month_end <= $${paramIndex++}`);
    values.push(filters.endDate);
  }

  // Filter by city
  if (filters.city) {
    conditions.push(`LOWER(city) = LOWER($${paramIndex++})`);
    values.push(filters.city);
  }

  // Add WHERE clause if there are conditions
  if (conditions.length > 0) {
    sql += ` WHERE ${conditions.join(" AND ")}`;
  }

  // Order by month and branch
  sql += " ORDER BY month_start DESC, branch_name ASC";

  const result = await db.query(sql, values);
  return result.rows.map((row) => mapToPublic(row as MonthlyRevenueRow));
}
