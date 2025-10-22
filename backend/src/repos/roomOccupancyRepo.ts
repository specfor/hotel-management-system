// backend/src/repos/roomOccupancyRepo.ts

import type {
  RoomOccupancyFilters,
  RoomOccupancyPublic,
} from "@src/types/roomOccupancyTypes";
import db from "@src/common/util/db";

// --- Helper Functions ---

interface RoomOccupancyRow {
  roomId: number;
  roomNumber: string;
  roomType: string;
  dailyRate: number;
  capacity: number;
  branchId: number;
  branchName: string;
  city: string;
  bookingId: number | null;
  guestId: number | null;
  guestName: string | null;
  guestContact: string | null;
  checkInDate: Date | null;
  checkOutDate: Date | null;
  bookingStatus: string | null;
  roomStatus: string;
  occupancyStatus: string;
  nightsBooked: number | null;
  roomRevenue: string;
  bookingCreatedAt: Date | null;
}

function mapRowToPublic(row: RoomOccupancyRow): RoomOccupancyPublic {
  return {
    roomId: row.roomId,
    roomNumber: row.roomNumber,
    roomType: row.roomType,
    dailyRate: parseFloat(row.dailyRate.toString()),
    capacity: row.capacity,
    branchId: row.branchId,
    branchName: row.branchName,
    city: row.city,
    bookingId: row.bookingId,
    guestId: row.guestId,
    guestName: row.guestName,
    guestContact: row.guestContact,
    checkInDate: row.checkInDate,
    checkOutDate: row.checkOutDate,
    bookingStatus: row.bookingStatus,
    roomStatus: row.roomStatus,
    occupancyStatus: row.occupancyStatus,
    nightsBooked: row.nightsBooked,
    roomRevenue: parseFloat(row.roomRevenue),
    bookingCreatedAt: row.bookingCreatedAt,
  };
}

/**
 * Repository for room occupancy report operations
 */
class RoomOccupancyRepository {
  /**
   * Get room occupancy data with optional filters
   * @param filters - Optional filters for the query
   * @returns Array of room occupancy records
   */
  public async getRoomOccupancy(
    filters?: RoomOccupancyFilters,
  ): Promise<RoomOccupancyPublic[]> {
    let query = `
      SELECT 
        room_id as "roomId",
        room_number as "roomNumber",
        room_type as "roomType",
        daily_rate as "dailyRate",
        capacity,
        branch_id as "branchId",
        branch_name as "branchName",
        city,
        booking_id as "bookingId",
        guest_id as "guestId",
        guest_name as "guestName",
        guest_contact as "guestContact",
        check_in_date as "checkInDate",
        check_out_date as "checkOutDate",
        booking_status as "bookingStatus",
        room_status as "roomStatus",
        occupancy_status as "occupancyStatus",
        nights_booked as "nightsBooked",
        room_revenue as "roomRevenue",
        booking_created_at as "bookingCreatedAt"
      FROM room_occupancy_report_view
      WHERE 1=1
    `;

    const values: (string | number)[] = [];
    let paramCount = 1;

    // Apply filters
    if (filters?.branchId) {
      query += ` AND branch_id = $${paramCount}`;
      values.push(filters.branchId);
      paramCount++;
    }

    if (filters?.roomType) {
      query += ` AND LOWER(room_type) = LOWER($${paramCount})`;
      values.push(filters.roomType);
      paramCount++;
    }

    if (filters?.occupancyStatus) {
      query += ` AND occupancy_status = $${paramCount}`;
      values.push(filters.occupancyStatus);
      paramCount++;
    }

    if (filters?.bookingStatus) {
      query += ` AND booking_status = $${paramCount}`;
      values.push(filters.bookingStatus);
      paramCount++;
    }

    if (filters?.roomStatus) {
      query += ` AND room_status = $${paramCount}`;
      values.push(filters.roomStatus);
      paramCount++;
    }

    if (filters?.city) {
      query += ` AND LOWER(city) = LOWER($${paramCount})`;
      values.push(filters.city);
      paramCount++;
    }

    if (filters?.guestName) {
      query += ` AND LOWER(guest_name) LIKE LOWER($${paramCount})`;
      values.push(`%${filters.guestName}%`);
      paramCount++;
    }

    // Date range filters for check-in/check-out
    if (filters?.checkInDate) {
      query += ` AND check_in_date >= $${paramCount}::date`;
      values.push(filters.checkInDate);
      paramCount++;
    }

    if (filters?.checkOutDate) {
      query += ` AND check_out_date <= $${paramCount}::date`;
      values.push(filters.checkOutDate);
      paramCount++;
    }

    // Date range filters for overlapping bookings
    if (filters?.startDate && filters?.endDate) {
      query += ` AND (
        (check_in_date <= $${paramCount}::date 
         AND check_out_date >= $${paramCount + 1}::date)
        OR (check_in_date BETWEEN $${paramCount}::date 
            AND $${paramCount + 1}::date)
        OR (check_out_date BETWEEN $${paramCount}::date 
            AND $${paramCount + 1}::date)
      )`;
      values.push(filters.startDate, filters.endDate);
      paramCount += 2;
    } else if (filters?.startDate) {
      query += ` AND check_in_date >= $${paramCount}::date`;
      values.push(filters.startDate);
      paramCount++;
    } else if (filters?.endDate) {
      query += ` AND check_out_date <= $${paramCount}::date`;
      values.push(filters.endDate);
      paramCount++;
    }

    query += " ORDER BY branch_name, room_number";

    const result = await db.query(query, values);
    return result.rows.map((row) => mapRowToPublic(row as RoomOccupancyRow));
  }

  /**
   * Get occupancy summary statistics
   * @param filters - Optional filters for the query
   * @returns Summary statistics object
   */
  public async getOccupancySummary(filters?: RoomOccupancyFilters) {
    let query = `
      SELECT 
        COUNT(DISTINCT room_id) as total_rooms,
        COUNT(DISTINCT CASE 
          WHEN occupancy_status = 'Occupied' 
          THEN room_id 
        END) as occupied_rooms,
        COUNT(DISTINCT CASE 
          WHEN occupancy_status = 'Available' 
          THEN room_id 
        END) as available_rooms,
        COUNT(DISTINCT CASE 
          WHEN occupancy_status = 'Reserved' 
          THEN room_id 
        END) as reserved_rooms,
        COUNT(DISTINCT CASE 
          WHEN occupancy_status = 'Maintenance' 
          THEN room_id 
        END) as maintenance_rooms,
        ROUND(
          (COUNT(DISTINCT CASE 
            WHEN occupancy_status = 'Occupied' 
            THEN room_id 
           END)::numeric / 
           NULLIF(COUNT(DISTINCT room_id), 0) * 100)::numeric, 
          2
        ) as occupancy_rate,
        COALESCE(SUM(room_revenue), 0) as total_revenue
      FROM room_occupancy_report_view
      WHERE 1=1
    `;

    const values: (string | number)[] = [];
    let paramCount = 1;

    // Apply same filters as main query
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

    if (filters?.startDate && filters?.endDate) {
      query += ` AND (
        (check_in_date <= $${paramCount}::date 
         AND check_out_date >= $${paramCount + 1}::date)
        OR (check_in_date BETWEEN $${paramCount}::date 
            AND $${paramCount + 1}::date)
        OR (check_out_date BETWEEN $${paramCount}::date 
            AND $${paramCount + 1}::date)
      )`;
      values.push(filters.startDate, filters.endDate);
      paramCount += 2;
    } else if (filters?.startDate) {
      query += ` AND check_in_date >= $${paramCount}::date`;
      values.push(filters.startDate);
      paramCount++;
    } else if (filters?.endDate) {
      query += ` AND check_out_date <= $${paramCount}::date`;
      values.push(filters.endDate);
      paramCount++;
    }

    const result = await db.query(query, values);
    return result.rows[0];
  }
}

export default new RoomOccupancyRepository();

