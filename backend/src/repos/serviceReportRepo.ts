// backend/src/repos/serviceReportRepo.ts

import type {
  ServiceUsageBreakdownPublic,
  ServiceUsageBreakdownFilters,
  TopServicesTrendsPublic,
  TopServicesTrendsFilters,
} from "@src/types/serviceReportTypes";
import db from "@src/common/util/db";

// --- Helper Functions ---

interface ServiceUsageBreakdownRow {
  recordId: number;
  bookingId: number;
  roomId: number;
  guestId: number;
  guestName: string;
  guestContact: string | null;
  checkIn: Date;
  checkOut: Date;
  bookingStatus: string;
  stayDuration: number | null;
  serviceId: number;
  serviceName: string;
  unitType: string;
  unitPrice: string;
  quantity: string;
  totalPrice: string;
  usageDate: Date;
  branchId: number;
  branchName: string;
  city: string;
  roomType: string;
}

interface TopServicesTrendsRow {
  serviceId: number;
  serviceName: string;
  unitType: string;
  unitPrice: string;
  branchId: number;
  branchName: string;
  city: string;
  bookingsUsingService: string;
  uniqueCustomers: string;
  totalQuantityUsed: string;
  totalRevenueFromService: string;
  avgQuantityPerUsage: string;
  avgPricePerUsage: string;
  firstUsageDate: Date | null;
  lastUsageDate: Date | null;
}

function mapBreakdownRowToPublic(
  row: ServiceUsageBreakdownRow,
): ServiceUsageBreakdownPublic {
  return {
    recordId: row.recordId,
    bookingId: row.bookingId,
    roomId: row.roomId,
    guestId: row.guestId,
    guestName: row.guestName,
    guestContact: row.guestContact,
    checkIn: row.checkIn,
    checkOut: row.checkOut,
    bookingStatus: row.bookingStatus,
    stayDuration: row.stayDuration,
    serviceId: row.serviceId,
    serviceName: row.serviceName,
    unitType: row.unitType,
    unitPrice: parseFloat(row.unitPrice),
    quantity: parseFloat(row.quantity),
    totalPrice: parseFloat(row.totalPrice),
    usageDate: row.usageDate,
    branchId: row.branchId,
    branchName: row.branchName,
    city: row.city,
    roomType: row.roomType,
  };
}

function mapTrendsRowToPublic(
  row: TopServicesTrendsRow,
): TopServicesTrendsPublic {
  return {
    serviceId: row.serviceId,
    serviceName: row.serviceName,
    unitType: row.unitType,
    unitPrice: parseFloat(row.unitPrice),
    branchId: row.branchId,
    branchName: row.branchName,
    city: row.city,
    bookingsUsingService: parseInt(row.bookingsUsingService) || 0,
    uniqueCustomers: parseInt(row.uniqueCustomers) || 0,
    totalQuantityUsed: parseFloat(row.totalQuantityUsed) || 0,
    totalRevenueFromService: parseFloat(row.totalRevenueFromService) || 0,
    avgQuantityPerUsage: parseFloat(row.avgQuantityPerUsage) || 0,
    avgPricePerUsage: parseFloat(row.avgPricePerUsage) || 0,
    firstUsageDate: row.firstUsageDate,
    lastUsageDate: row.lastUsageDate,
  };
}

/**
 * Repository for service usage reports
 */
class ServiceReportRepository {
  /**
   * Get service usage breakdown with optional filters
   */
  public async getServiceUsageBreakdown(
    filters?: ServiceUsageBreakdownFilters,
  ): Promise<ServiceUsageBreakdownPublic[]> {
    let query = `
      SELECT 
        record_id as "recordId",
        booking_id as "bookingId",
        room_id as "roomId",
        guest_id as "guestId",
        guest_name as "guestName",
        guest_contact as "guestContact",
        check_in as "checkIn",
        check_out as "checkOut",
        booking_status as "bookingStatus",
        stay_duration as "stayDuration",
        service_id as "serviceId",
        service_name as "serviceName",
        unit_type as "unitType",
        unit_price as "unitPrice",
        quantity,
        total_price as "totalPrice",
        usage_date as "usageDate",
        branch_id as "branchId",
        branch_name as "branchName",
        city,
        room_type as "roomType"
      FROM service_usage_breakdown_view
      WHERE 1=1
    `;

    const values: (string | number)[] = [];
    let paramCount = 1;

    if (filters?.bookingId) {
      query += ` AND booking_id = $${paramCount}`;
      values.push(filters.bookingId);
      paramCount++;
    }

    if (filters?.roomId) {
      query += ` AND room_id = $${paramCount}`;
      values.push(filters.roomId);
      paramCount++;
    }

    if (filters?.guestId) {
      query += ` AND guest_id = $${paramCount}`;
      values.push(filters.guestId);
      paramCount++;
    }

    if (filters?.serviceId) {
      query += ` AND service_id = $${paramCount}`;
      values.push(filters.serviceId);
      paramCount++;
    }

    if (filters?.serviceName) {
      query += ` AND LOWER(service_name) LIKE LOWER($${paramCount})`;
      values.push(`%${filters.serviceName}%`);
      paramCount++;
    }

    if (filters?.branchId) {
      query += ` AND branch_id = $${paramCount}`;
      values.push(filters.branchId);
      paramCount++;
    }

    if (filters?.city) {
      query += ` AND LOWER(city) = LOWER($${paramCount})`;
      values.push(filters.city);
      paramCount++;
    }

    if (filters?.roomType) {
      query += ` AND LOWER(room_type) = LOWER($${paramCount})`;
      values.push(filters.roomType);
      paramCount++;
    }

    if (filters?.startDate) {
      query += ` AND usage_date >= $${paramCount}::date`;
      values.push(filters.startDate);
      paramCount++;
    }

    if (filters?.endDate) {
      query += ` AND usage_date <= $${paramCount}::date`;
      values.push(filters.endDate);
      paramCount++;
    }

    if (filters?.bookingStatus) {
      query += ` AND booking_status = $${paramCount}`;
      values.push(filters.bookingStatus);
      paramCount++;
    }

    query += " ORDER BY usage_date DESC, record_id";

    const result = await db.query(query, values);
    return result.rows.map((row) => 
      mapBreakdownRowToPublic(row as ServiceUsageBreakdownRow),
    );
  }

  /**
   * Get top services and customer trends
   */
  public async getTopServicesTrends(
    filters?: TopServicesTrendsFilters,
  ): Promise<TopServicesTrendsPublic[]> {
    let query = `
      SELECT 
        service_id as "serviceId",
        service_name as "serviceName",
        unit_type as "unitType",
        unit_price as "unitPrice",
        branch_id as "branchId",
        branch_name as "branchName",
        city,
        bookings_using_service as "bookingsUsingService",
        unique_customers as "uniqueCustomers",
        total_quantity_used as "totalQuantityUsed",
        total_revenue_from_service as "totalRevenueFromService",
        avg_quantity_per_usage as "avgQuantityPerUsage",
        avg_price_per_usage as "avgPricePerUsage",
        first_usage_date as "firstUsageDate",
        last_usage_date as "lastUsageDate"
      FROM top_services_trends_view
      WHERE 1=1
    `;

    const values: (string | number)[] = [];
    let paramCount = 1;

    if (filters?.serviceId) {
      query += ` AND service_id = $${paramCount}`;
      values.push(filters.serviceId);
      paramCount++;
    }

    if (filters?.serviceName) {
      query += ` AND LOWER(service_name) LIKE LOWER($${paramCount})`;
      values.push(`%${filters.serviceName}%`);
      paramCount++;
    }

    if (filters?.branchId) {
      query += ` AND branch_id = $${paramCount}`;
      values.push(filters.branchId);
      paramCount++;
    }

    if (filters?.city) {
      query += ` AND LOWER(city) = LOWER($${paramCount})`;
      values.push(filters.city);
      paramCount++;
    }

    if (filters?.minBookings) {
      query += ` AND bookings_using_service >= $${paramCount}`;
      values.push(filters.minBookings);
      paramCount++;
    }

    if (filters?.minRevenue) {
      query += ` AND total_revenue_from_service >= $${paramCount}`;
      values.push(filters.minRevenue);
      paramCount++;
    }

    query += " ORDER BY total_revenue_from_service DESC NULLS LAST";

    if (filters?.limit) {
      query += ` LIMIT $${paramCount}`;
      values.push(filters.limit);
    }

    const result = await db.query(query, values);
    return result.rows.map((row) => 
      mapTrendsRowToPublic(row as TopServicesTrendsRow),
    );
  }

  /**
   * Get service usage summary statistics
   */
  public async getServiceUsageSummary() {
    const query = `
      SELECT 
        COUNT(DISTINCT service_id) as total_services,
        COUNT(*) as total_usage_records,
        COALESCE(SUM(total_revenue_from_service), 0) as total_revenue,
        COALESCE(SUM(total_quantity_used), 0) as total_quantity,
        COUNT(DISTINCT unique_customers) as unique_guests,
        ROUND(AVG(total_revenue_from_service)::numeric, 2) as avg_revenue_per_service,
        (SELECT service_name 
         FROM top_services_trends_view 
         ORDER BY bookings_using_service DESC NULLS LAST
         LIMIT 1) as most_used_service,
        (SELECT service_name 
         FROM top_services_trends_view 
         ORDER BY total_revenue_from_service DESC NULLS LAST
         LIMIT 1) as highest_revenue_service
      FROM top_services_trends_view
    `;

    const result = await db.query(query);
    return result.rows[0];
  }
}

export default new ServiceReportRepository();
