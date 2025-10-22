// backend/src/types/serviceUsageBreakdownTypes.ts

/**
 * Service Usage Breakdown - Public Type
 * Represents service consumption per room and service type for reporting
 */
export interface ServiceUsageBreakdownPublic {
  bookingId: number;
  roomId: number;
  roomNumber: string;
  roomType: string;
  branchId: number;
  branchName: string;
  guestId: number;
  guestName: string;
  checkIn: Date;
  checkOut: Date;
  serviceId: number;
  serviceName: string;
  unitType: string;
  unitPrice: number;
  recordId: number;
  quantity: number;
  usageDate: Date;
  totalPrice: number;
  stayDuration: number;
  totalServicesForBooking: number;
  roomServiceTotal: number;
}

/**
 * Filters for querying service usage breakdown data
 */
export interface ServiceUsageBreakdownFilters {
  bookingId?: number;
  roomId?: number;
  branchId?: number;
  serviceId?: number;
  guestId?: number;
  serviceName?: string;
  startDate?: string; // Usage date range start (format: 'YYYY-MM-DD')
  endDate?: string; // Usage date range end (format: 'YYYY-MM-DD')
}
