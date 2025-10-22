// backend/src/models/monthlyRevenueModel.ts

import { 
  MonthlyRevenuePublic, 
  MonthlyRevenueFilters,
} from "@src/types/monthlyRevenueTypes";
import { getMonthlyRevenueDB } from "@src/repos/monthlyRevenueRepo";

/**
 * Business logic layer for monthly revenue data
 * Retrieves aggregated revenue data per branch per month with optional filters
 * 
 * @param filters - Optional filters for branch, month, date range, or city
 * @returns Promise resolving to array of monthly revenue records
 */
export async function getMonthlyRevenueModel(
  filters: MonthlyRevenueFilters = {},
): Promise<MonthlyRevenuePublic[]> {
  // Validate month_year format if provided
  if (filters.monthYear) {
    const monthYearPattern = /^\d{4}-(0[1-9]|1[0-2])$/;
    if (!monthYearPattern.test(filters.monthYear)) {
      throw new Error("Invalid monthYear format. Expected format: YYYY-MM");
    }
  }

  // Validate date formats if provided
  if (filters.startDate) {
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!datePattern.test(filters.startDate)) {
      throw new Error("Invalid startDate format. Expected format: YYYY-MM-DD");
    }
  }

  if (filters.endDate) {
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!datePattern.test(filters.endDate)) {
      throw new Error("Invalid endDate format. Expected format: YYYY-MM-DD");
    }
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
  const revenueData = await getMonthlyRevenueDB(filters);
  return revenueData;
}
