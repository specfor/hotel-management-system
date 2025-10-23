// backend/src/types/monthlyRevenueTypes.ts

/**
 * Monthly Revenue Per Branch - Public Type
 * Represents the aggregated revenue data per branch per month
 */
export interface MonthlyRevenuePublic {
  monthStart: Date;
  monthEnd: Date;
  monthYear: string;
  branchId: number;
  branchName: string;
  city: string;
  totalBookings: number;
  uniqueGuests: number;
  totalRoomCharges: number;
  totalServiceCharges: number;
  totalTax: number;
  totalDiscounts: number;
  lateCheckoutCharges: number;
  grossRevenue: number;
  totalPaid: number;
  outstandingRevenue: number;
  paymentCollectionRate: number;
  occupiedRoomsCount: number;
  totalRoomsInBranch: number;
}

/**
 * Filters for querying monthly revenue data
 */
export interface MonthlyRevenueFilters {
  branchId?: number;
  monthYear?: string; // Format: 'YYYY-MM'
  startDate?: string; // Format: 'YYYY-MM-DD'
  endDate?: string; // Format: 'YYYY-MM-DD'
  city?: string;
}
