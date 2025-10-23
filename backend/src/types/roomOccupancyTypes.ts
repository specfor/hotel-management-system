// backend/src/types/roomOccupancyTypes.ts

/**
 * Room Occupancy Report - Public Type
 * Represents the occupancy status and details of rooms across branches
 */
export interface RoomOccupancyPublic {
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
  roomRevenue: number;
  bookingCreatedAt: Date | null;
}

/**
 * Filters for querying room occupancy data
 */
export interface RoomOccupancyFilters {
  branchId?: number;
  roomType?: string;
  // 'Occupied', 'Available', 'Reserved', 'Pending Check-in', etc.
  occupancyStatus?: string;
  // 'Booked', 'Checked-In', 'Checked-Out', 'Cancelled'
  bookingStatus?: string;
  // 'Available', 'Occupied', 'Maintenance', 'Cleaning'
  roomStatus?: string;
  checkInDate?: string; // Format: 'YYYY-MM-DD'
  checkOutDate?: string; // Format: 'YYYY-MM-DD'
  // Filter bookings that overlap with this date
  startDate?: string; // Format: 'YYYY-MM-DD'
  endDate?: string; // Format: 'YYYY-MM-DD'
  city?: string;
  guestName?: string;
}

/**
 * Summary statistics for room occupancy
 */
export interface RoomOccupancySummary {
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  reservedRooms: number;
  maintenanceRooms: number;
  occupancyRate: number; // Percentage
  totalRevenue: number;
}
