// backend/src/types/topServicesTypes.ts

/**
 * Top Services and Customer Trends - Public Type
 * Represents service popularity and usage trends
 */
export interface TopServicesPublic {
  serviceId: number;
  serviceName: string;
  unitType: string;
  unitPrice: number;
  branchId: number;
  branchName: string;
  monthStart: Date;
  monthYear: string;
  bookingsUsingService: number;
  uniqueCustomers: number;
  totalQuantityUsed: number;
  totalRevenueFromService: number;
  avgQuantityPerUsage: number;
  avgPricePerUsage: number;
  serviceRankByRevenue: number;
  serviceRankByPopularity: number;
}

/**
 * Filters for querying top services data
 */
export interface TopServicesFilters {
  branchId?: number;
  serviceId?: number;
  monthYear?: string; // Format: 'YYYY-MM'
  startDate?: string; // Month range start (format: 'YYYY-MM-DD')
  endDate?: string; // Month range end (format: 'YYYY-MM-DD')
  topN?: number; // Get top N services by revenue or popularity
}
