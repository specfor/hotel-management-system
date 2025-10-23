// backend/src/models/serviceUsageBreakdownModel.ts

import { 
  ServiceUsageBreakdownPublic, 
  ServiceUsageBreakdownFilters,
} from "@src/types/serviceUsageBreakdownTypes";
import { getServiceUsageBreakdownDB } from "@src/repos/serviceUsageBreakdownRepo";

/**
 * Business logic layer for service usage breakdown data
 * Retrieves service consumption details per room and service type
 * 
 * @param filters - Optional filters for booking, room, branch, service, or dates
 * @returns Promise resolving to array of service usage breakdown records
 */
export async function getServiceUsageBreakdownModel(
  filters: ServiceUsageBreakdownFilters = {},
): Promise<ServiceUsageBreakdownPublic[]> {
  // Validate date formats if provided
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;

  if (filters.startDate && !datePattern.test(filters.startDate)) {
    throw new Error("Invalid startDate format. Expected format: YYYY-MM-DD");
  }

  if (filters.endDate && !datePattern.test(filters.endDate)) {
    throw new Error("Invalid endDate format. Expected format: YYYY-MM-DD");
  }

  // Validate that startDate is before endDate if both are provided
  if (filters.startDate && filters.endDate) {
    const start = new Date(filters.startDate);
    const end = new Date(filters.endDate);
    if (start > end) {
      throw new Error("startDate must be before or equal to endDate");
    }
  }

  // Fetch data from repository
  const usageData = await getServiceUsageBreakdownDB(filters);
  return usageData;
}
