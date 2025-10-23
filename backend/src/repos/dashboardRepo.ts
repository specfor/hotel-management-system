// src/repos/dashboardRepo.ts

import db from "@src/common/util/db";
import { 
  MonthlyRevenueData, 
  ServiceUsageData, 
  RoomStatusBreakdown, 
  BookingByBranchData,
} from "@src/types/dashboardTypes";
import { BookingStatus } from "@src/types/bookingTypes"; // To filter active bookings

/**
 * Fetches the total number of rooms and the count for each status.
 */
// eslint-disable-next-line
export async function getRoomStatusCountsDB(): Promise<{ totalRooms: number, breakdown: RoomStatusBreakdown[] }> {
  // Assuming a separate 'room' table with a 'room_status' column
  const sql = `
        SELECT 
            room_status as status,
            COUNT(*)::integer as count 
        FROM room
        GROUP BY room_status;
    `;
  
  const result = await db.query(sql);
  
  const totalSql = "SELECT COUNT(*)::integer FROM room;";
  const totalResult = await db.query(totalSql);
  const totalRooms = Number(totalResult.rows?.[0]?.count ?? 0);

  return {
    totalRooms,
    breakdown: result.rows as RoomStatusBreakdown[],
  };
}

/**
 * Fetches aggregated monthly revenue for a given period (e.g., last 10 months).
 * NOTE: The logic here is highly dependent on
 *  a Bill/Invoice/Payment schema which is partially available in paymentRepo.ts.
 * We'll use a simplified version based on `payment` table.
 */
export async function getMonthlyRevenueDB(months = 10): Promise<MonthlyRevenueData[]> {
  // This query groups payments by month/year and sums the paid_amount.
  const sql = `
        SELECT
            TO_CHAR(date_time, 'YYYY-MM') AS "monthYear",
            SUM(paid_amount)::numeric AS revenue
        FROM payment
        WHERE date_time >= NOW() - INTERVAL '${months} months'
        GROUP BY 1
        ORDER BY 1 ASC;
    `;

  const result = await db.query(sql);
  
  // Mapping to ensure 'revenue' is a proper number type
  // eslint-disable-next-line  
  return (result.rows as { monthYear: string, revenue: string | number, }[]).map((row) => ({
    monthYear: row.monthYear,
    revenue: typeof row.revenue === "number" ? row.revenue : parseFloat(row.revenue),
  })) as MonthlyRevenueData[];
}

/**
 * Fetches the total quantity of each chargeable service used.
 */
export async function getServiceUsageStatsDB(limit = 5): Promise<ServiceUsageData[]> {
// This joins service_usage with chargeableservices to get the name and sums the quantity.
  const sql = `
        SELECT
            cs.service_name AS "serviceName",
            SUM(su.quantity)::integer AS "usageCount"
        FROM service_usage su
        JOIN chargeable_services cs ON su.service_id = cs.service_id
        GROUP BY cs.service_name
        ORDER BY "usageCount" DESC
        LIMIT $1;
    `;

  const result = await db.query(sql, [limit]);
  return result.rows as ServiceUsageData[];
}


/**
 * Fetches the count of active bookings (Booked or Checked-In) per branch.
 */
export async function getActiveBookingsByBranchDB(): Promise<BookingByBranchData[]> {
  const activeStatuses: BookingStatus[] = ["Booked", "Checked-In"];
  const statusPlaceholders = activeStatuses.map((_, i) => `$${i + 1}`).join(",");
    
  const sql = `
        SELECT
            b.branch_name AS "branchName",
            COUNT(*)::integer AS "activeBookings"
        FROM booking bk
        JOIN room r ON bk.room_id = r.room_id
        JOIN branch b ON r.branch_id = b.branch_id
        WHERE bk.booking_status IN (${statusPlaceholders})
        GROUP BY b.branch_name
        ORDER BY "activeBookings" DESC;
    `;

  const result = await db.query(sql, activeStatuses);
  return result.rows as BookingByBranchData[];
}