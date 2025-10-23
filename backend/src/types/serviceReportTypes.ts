// backend/src/types/serviceReportTypes.ts

/**
 * Service Usage Breakdown - Public Type
 * Represents detailed service usage per room and booking
 */
export interface ServiceUsageBreakdownPublic {
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
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  usageDate: Date;
  branchId: number;
  branchName: string;
  city: string;
  roomType: string;
}

/**
 * Top Services and Trends - Public Type
 * Represents aggregated service usage statistics
 */
export interface TopServicesTrendsPublic {
  serviceId: number;
  serviceName: string;
  unitType: string;
  unitPrice: number;
  branchId: number;
  branchName: string;
  city: string;
  bookingsUsingService: number;
  uniqueCustomers: number;
  totalQuantityUsed: number;
  totalRevenueFromService: number;
  avgQuantityPerUsage: number;
  avgPricePerUsage: number;
  firstUsageDate: Date | null;
  lastUsageDate: Date | null;
}

/**
 * Filters for service usage breakdown queries
 */
export interface ServiceUsageBreakdownFilters {
  bookingId?: number;
  roomId?: number;
  guestId?: number;
  serviceId?: number;
  serviceName?: string;
  branchId?: number;
  city?: string;
  roomType?: string;
  startDate?: string; // Format: 'YYYY-MM-DD'
  endDate?: string; // Format: 'YYYY-MM-DD'
  bookingStatus?: string;
}

/**
 * Filters for top services trends queries
 */
export interface TopServicesTrendsFilters {
  serviceId?: number;
  serviceName?: string;
  branchId?: number;
  city?: string;
  startDate?: string; // Format: 'YYYY-MM-DD'
  endDate?: string; // Format: 'YYYY-MM-DD'
  minBookings?: number;
  minRevenue?: number;
  limit?: number;
}

/**
 * Summary statistics for service usage
 */
export interface ServiceUsageSummary {
  totalServices: number;
  totalUsageRecords: number;
  totalRevenue: number;
  totalQuantity: number;
  uniqueGuests: number;
  averageRevenuePerService: number;
  mostUsedService: string | null;
  highestRevenueService: string | null;
}
