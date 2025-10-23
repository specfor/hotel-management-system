// backend/src/types/serviceUsageTypes.ts

// Structure of the service usage record returned by the API
export interface ServiceUsagePublic {
    recordId: number;
    serviceId: number;
    bookingId: number;
    dateTime: Date;
    quantity: number;
    totalPrice: number;
}

// Structure for creating a new service usage record
// recordId, dateTime (set by NOW()), and totalPrice (set by trigger) are excluded
export interface ServiceUsageCreate {
    serviceId: number;
    bookingId: number;
    quantity: number;
}

// Structure for updating an existing service usage record
export interface ServiceUsageUpdate {
    recordId: number; // Required to identify WHICH record to update
    serviceId?: number;
    bookingId?: number;
    dateTime?: Date;
    quantity?: number;
}

/**
 * Service Usage Breakdown - Report Type
 * Represents service usage details per room and service type for reports
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
  quantity: number;
  usageDate: Date;
  usageTime: string;
  totalPrice: number;
  createdAt: Date;
  serviceUsageCountForBooking: number;
  totalServicesForBooking: number;
  roomServiceTotal: number;
  stayDuration: number;
}

/**
 * Filters for querying service usage breakdown data
 */
export interface ServiceUsageBreakdownFilters {
  branchId?: number;
  roomId?: number;
  bookingId?: number;
  serviceId?: number;
  serviceName?: string;
  startDate?: string; // Format: 'YYYY-MM-DD'
  endDate?: string; // Format: 'YYYY-MM-DD'
  guestId?: number;
}