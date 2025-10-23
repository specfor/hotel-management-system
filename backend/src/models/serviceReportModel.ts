// backend/src/models/serviceReportModel.ts

import type {
  ServiceUsageBreakdownPublic,
  ServiceUsageBreakdownFilters,
  TopServicesTrendsPublic,
  TopServicesTrendsFilters,
  ServiceUsageSummary,
} from "@src/types/serviceReportTypes";
import serviceReportRepo from "@src/repos/serviceReportRepo";

/**
 * Model for service usage reports business logic
 */
class ServiceReportModel {
  /**
   * Get service usage breakdown with optional filters
   */
  public async getServiceUsageBreakdown(
    filters?: ServiceUsageBreakdownFilters,
  ): Promise<ServiceUsageBreakdownPublic[]> {
    return await serviceReportRepo.getServiceUsageBreakdown(filters);
  }

  /**
   * Get top services and customer trends
   */
  public async getTopServicesTrends(
    filters?: TopServicesTrendsFilters,
  ): Promise<TopServicesTrendsPublic[]> {
    return await serviceReportRepo.getTopServicesTrends(filters);
  }

  /**
   * Get service usage summary statistics
   */
  public async getServiceUsageSummary(): Promise<ServiceUsageSummary> {
    const summary = await serviceReportRepo.getServiceUsageSummary();
    
    return {
      totalServices: Number(summary.total_services) || 0,
      totalUsageRecords: Number(summary.total_usage_records) || 0,
      totalRevenue: Number(summary.total_revenue) || 0,
      totalQuantity: Number(summary.total_quantity) || 0,
      uniqueGuests: Number(summary.unique_guests) || 0,
      averageRevenuePerService: Number(summary.avg_revenue_per_service) || 0,
      mostUsedService: summary.most_used_service as string | null,
      highestRevenueService: summary.highest_revenue_service as string | null,
    };
  }
}

export default new ServiceReportModel();
