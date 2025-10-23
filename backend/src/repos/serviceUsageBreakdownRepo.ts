// backend/src/repos/serviceUsageBreakdownRepo.ts

import { 
  ServiceUsageBreakdownPublic, 
  ServiceUsageBreakdownFilters,
} from "@src/types/serviceUsageBreakdownTypes";
import db from "@src/common/util/db";

// --- Helper Functions ---

interface ServiceUsageBreakdownRow {
  booking_id: number;
  room_id: number;
  room_number: string;
  room_type: string;
  branch_id: number;
  branch_name: string;
  guest_id: number;
  guest_name: string;
  check_in: Date;
  check_out: Date;
  service_id: number;
  service_name: string;
  unit_type: string;
  unit_price: string;
  record_id: number;
  quantity: string;
  usage_date: Date;
  total_price: string;
  stay_duration: string;
  total_services_for_booking: string;
  room_service_total: string;
}

const mapToPublic = (
  row: ServiceUsageBreakdownRow,
): ServiceUsageBreakdownPublic => ({
  bookingId: row.booking_id,
  roomId: row.room_id,
  roomNumber: row.room_number,
  roomType: row.room_type,
  branchId: row.branch_id,
  branchName: row.branch_name,
  guestId: row.guest_id,
  guestName: row.guest_name,
  checkIn: row.check_in,
  checkOut: row.check_out,
  serviceId: row.service_id,
  serviceName: row.service_name,
  unitType: row.unit_type,
  unitPrice: parseFloat(row.unit_price),
  recordId: row.record_id,
  quantity: parseFloat(row.quantity),
  usageDate: row.usage_date,
  totalPrice: parseFloat(row.total_price),
  stayDuration: parseInt(row.stay_duration, 10),
  totalServicesForBooking: parseFloat(row.total_services_for_booking),
  roomServiceTotal: parseFloat(row.room_service_total),
});

// --- Repository Operations ---

/**
 * Get service usage breakdown data with optional filters
 * @param filters - Optional filters for booking, room, branch, service, or dates
 * @returns Array of service usage breakdown records
 */
export async function getServiceUsageBreakdownDB(
  filters: ServiceUsageBreakdownFilters = {},
): Promise<ServiceUsageBreakdownPublic[]> {
  let sql = `
    SELECT 
      booking_id,
      room_id,
      room_number,
      room_type,
      branch_id,
      branch_name,
      guest_id,
      guest_name,
      check_in,
      check_out,
      service_id,
      service_name,
      unit_type,
      unit_price,
      record_id,
      quantity,
      usage_date,
      total_price,
      stay_duration,
      total_services_for_booking,
      room_service_total
    FROM 
      service_usage_breakdown_view
  `;

  const conditions: string[] = [];
  const values: (string | number)[] = [];
  let paramIndex = 1;

  // Filter by booking ID
  if (filters.bookingId !== undefined) {
    conditions.push(`booking_id = $${paramIndex++}`);
    values.push(filters.bookingId);
  }

  // Filter by room ID
  if (filters.roomId !== undefined) {
    conditions.push(`room_id = $${paramIndex++}`);
    values.push(filters.roomId);
  }

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

  // Filter by guest ID
  if (filters.guestId !== undefined) {
    conditions.push(`guest_id = $${paramIndex++}`);
    values.push(filters.guestId);
  }

  // Filter by service name (case-insensitive partial match)
  if (filters.serviceName) {
    conditions.push(`LOWER(service_name) LIKE LOWER($${paramIndex++})`);
    values.push(`%${filters.serviceName}%`);
  }

  // Filter by usage date range
  if (filters.startDate) {
    conditions.push(`usage_date >= $${paramIndex++}`);
    values.push(filters.startDate);
  }

  if (filters.endDate) {
    conditions.push(`usage_date <= $${paramIndex++}`);
    values.push(filters.endDate);
  }

  // Add WHERE clause if there are conditions
  if (conditions.length > 0) {
    sql += ` WHERE ${conditions.join(" AND ")}`;
  }

  // Order by booking ID and usage date
  sql += " ORDER BY booking_id ASC, usage_date DESC";

  const result = await db.query(sql, values);
  return result.rows.map((row) => 
    mapToPublic(row as ServiceUsageBreakdownRow),
  );
}
