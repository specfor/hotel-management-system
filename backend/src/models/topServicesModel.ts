// backend/src/models/topServicesModel.ts

import { 
  TopServicesPublic, 
  TopServicesFilters,
} from "@src/types/topServicesTypes";
import { getTopServicesDB } from "@src/repos/topServicesRepo";

/**
 * Business logic layer for top services and customer trends data
 * Retrieves service popularity and usage trend analysis
 * 
 * @param filters - Optional filters for branch, service, month, or top N
 * @returns Promise resolving to array of top services records
 */
export async function getTopServicesModel(
  filters: TopServicesFilters = {},
): Promise<TopServicesPublic[]> {
  // Validate month_year format if provided
  if (filters.monthYear) {
    const monthYearPattern = /^\d{4}-(0[1-9]|1[0-2])$/;
    if (!monthYearPattern.test(filters.monthYear)) {
      throw new Error("Invalid monthYear format. Expected format: YYYY-MM");
    }
  }

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

  // Validate topN if provided
  if (filters.topN !== undefined) {
    if (!Number.isInteger(filters.topN) || filters.topN < 1) {
      throw new Error("topN must be a positive integer");
    }
  }

  // Fetch data from repository
  const servicesData = await getTopServicesDB(filters);
  return servicesData;
}
