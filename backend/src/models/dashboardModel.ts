// src/models/dashboardModel.ts

import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";
import { RouteError } from "@src/common/util/route-errors";
import { DashboardStats, RoomStatusBreakdown } from "@src/types/dashboardTypes";
import {
  getRoomStatusCountsDB,
  getMonthlyRevenueDB,
  getServiceUsageStatsDB,
  getActiveBookingsByBranchDB,
} from "@src/repos/dashboardRepo";

/**
 * Calculates the percentage of a count relative to the total.
 */
function calculatePercentage(count: number, total: number): number {
  return total > 0 ? parseFloat(((count / total) * 100).toFixed(1)) : 0;
}

/**
 * Calculates the percentage change between the last two data points in an array.
 * Assumes the array is sorted chronologically.
 */
function calculateRevenueChange(revenueData: { revenue: number }[]): number {
  if (revenueData.length < 2) return 0;

  const lastMonthRevenue = revenueData[revenueData.length - 1].revenue;
  const previousMonthRevenue = revenueData[revenueData.length - 2].revenue;

  if (previousMonthRevenue === 0) {
    return lastMonthRevenue > 0 ? 100 : 0; // Infinite growth or zero change
  }

  const change = (lastMonthRevenue - previousMonthRevenue) / previousMonthRevenue;
  return parseFloat((change * 100).toFixed(1));
}

/**
 * Aggregates all necessary data for the main dashboard statistics view.
 */
export async function getDashboardStatsModel(): Promise<DashboardStats> {
  try {
    // Fetch all data concurrently
    const [
      roomStatusCounts,
      monthlyRevenue,
      serviceUsageStats,
      bookingsByBranch,
    ] = await Promise.all([
      getRoomStatusCountsDB(),
      getMonthlyRevenueDB(12), // Get 12 months for a full year's view
      getServiceUsageStatsDB(5), // Top 5 services
      getActiveBookingsByBranchDB(),
    ]);

    const { totalRooms, breakdown } = roomStatusCounts;
    
    // --- Calculations & Transformations ---

    const occupiedCount = breakdown.find(b => b.status === "Occupied")?.count ?? 0;
    const availableCount = breakdown.find(b => b.status === "Available")?.count ?? 0;
    
    // Enrich room availability with percentages
    const roomAvailability: RoomStatusBreakdown[] = breakdown.map(b => ({
      ...b,
      percentage: calculatePercentage(b.count, totalRooms),
    }));

    const monthlyRevenueTotal = monthlyRevenue.length > 0 
      ? monthlyRevenue[monthlyRevenue.length - 1].revenue 
      : 0;

    const revenueChangePercentage = calculateRevenueChange(monthlyRevenue);
    
    // --- Final Data Structure ---

    return {
      totalRooms,
      occupiedRooms: occupiedCount,
      availableRooms: availableCount,
      monthlyRevenue: monthlyRevenueTotal,
      
      monthlyRevenueTrend: monthlyRevenue, 
      serviceUsageStats, 
      bookingsByBranch,
      
      roomAvailability,
      occupancyPercentage: calculatePercentage(occupiedCount, totalRooms),
      revenueChangePercentage,
    };

  } catch {
    // Log the error for debugging (Controller will also log and return a generic 500)
    throw new RouteError(HttpStatusCodes.INTERNAL_SERVER_ERROR,
      "Failed to retrieve dashboard data.");
  }
}