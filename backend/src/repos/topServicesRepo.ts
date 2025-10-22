// backend/src/repos/topServicesRepo.ts

import { 
  TopServicesPublic, 
  TopServicesFilters,
} from "@src/types/topServicesTypes";
import db from "@src/common/util/db";

// --- Helper Functions ---

interface TopServicesRow {
  service_id: number;
  service_name: string;
  unit_type: string;
  unit_price: string;
  branch_id: number;
  branch_name: string;
  month_start: Date;
  month_year: string;
  bookings_using_service: string;
  unique_customers: string;
  total_quantity_used: string;
  total_revenue_from_service: string;
  avg_quantity_per_usage: string;
  avg_price_per_usage: string;
  service_rank_by_revenue: string;
  service_rank_by_popularity: string;
}

const mapToPublic = (row: TopServicesRow): TopServicesPublic => ({
  serviceId: row.service_id,
  serviceName: row.service_name,
  unitType: row.unit_type,
  unitPrice: parseFloat(row.unit_price),
  branchId: row.branch_id,
  branchName: row.branch_name,
  monthStart: row.month_start,
  monthYear: row.month_year,
  bookingsUsingService: parseInt(row.bookings_using_service, 10),
  uniqueCustomers: parseInt(row.unique_customers, 10),
  totalQuantityUsed: parseFloat(row.total_quantity_used),
  totalRevenueFromService: parseFloat(row.total_revenue_from_service),
  avgQuantityPerUsage: parseFloat(row.avg_quantity_per_usage),
  avgPricePerUsage: parseFloat(row.avg_price_per_usage),
  serviceRankByRevenue: parseInt(row.service_rank_by_revenue, 10),
  serviceRankByPopularity: parseInt(row.service_rank_by_popularity, 10),
});

// --- Repository Operations ---

/**
 * Get top services data with optional filters
 * @param filters - Optional filters for branch, service, month, or top N
 * @returns Array of top services records
 */
export async function getTopServicesDB(
  filters: TopServicesFilters = {},
): Promise<TopServicesPublic[]> {
  let sql = `
    SELECT 
      service_id,
      service_name,
      unit_type,
      unit_price,
      branch_id,
      branch_name,
      month_start,
      month_year,
      bookings_using_service,
      unique_customers,
      total_quantity_used,
      total_revenue_from_service,
      avg_quantity_per_usage,
      avg_price_per_usage,
      service_rank_by_revenue,
      service_rank_by_popularity
    FROM 
      top_services_trends_view
  `;

  const conditions: string[] = [];
  const values: (string | number)[] = [];
  let paramIndex = 1;

  // Filter by branch ID
  if (filters.branchId !== undefined) {
    conditions.push(`branch_id = $${paramIndex++}`);
    values.push(filters.branchId);
  }

  // Filter by service ID
  if (filters.serviceId !== undefined) {
    conditions.push(`service_id = $${paramIndex++}`);
    values.push(filters.serviceId);
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
    conditions.push(`month_start <= $${paramIndex++}`);
    values.push(filters.endDate);
  }

  // Filter by top N services (by revenue rank)
  if (filters.topN !== undefined) {
    conditions.push(`service_rank_by_revenue <= $${paramIndex++}`);
    values.push(filters.topN);
  }

  // Add WHERE clause if there are conditions
  if (conditions.length > 0) {
    sql += ` WHERE ${conditions.join(" AND ")}`;
  }

  // Order by month and revenue rank
  sql += " ORDER BY month_year DESC, service_rank_by_revenue ASC";

  const result = await db.query(sql, values);
  return result.rows.map((row) => mapToPublic(row as TopServicesRow));
}
