// src/types/dashboardTypes.ts

/**
 * Defines the structure for a single month's revenue data point.
 */
export interface MonthlyRevenueData {
    monthYear: string; // e.g., "Jan 2024" or a sortable format like "2024-01"
    revenue: number;
}

/**
 * Defines the structure for a single service usage data point.
 */
export interface ServiceUsageData {
    serviceName: string;
    usageCount: number;
}

/**
 * Defines the structure for the Room Availability breakdown (e.g., in a pie chart).
 */
export interface RoomStatusBreakdown {
    status: "Occupied" | "Available" | "Maintenance" | "Cleaning";
    count: number;
    percentage?: number;
}

/**
 * Defines the structure for the Bookings by Branch chart data.
 */
export interface BookingByBranchData {
    branchName: string;
    activeBookings: number;
}

/**
 * The full data structure for the main dashboard statistics endpoint.
 */
export interface DashboardStats {
    // Top-line Metrics
    totalRooms: number; 
    occupiedRooms: number; 
    availableRooms: number; 
    monthlyRevenue: number; 

    // Charts & Trends
    monthlyRevenueTrend: MonthlyRevenueData[]; // For the line chart
    serviceUsageStats: ServiceUsageData[]; // For the bar chart
    roomAvailability: RoomStatusBreakdown[]; // For the donut chart
    bookingsByBranch: BookingByBranchData[]; // For the bar chart

    // Additional Insights
    occupancyPercentage: number; 
    revenueChangePercentage: number; 
}