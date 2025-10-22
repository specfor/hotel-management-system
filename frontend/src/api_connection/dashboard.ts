import apiClient from "./base";

export interface DashboardStats {
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  monthlyRevenue: number;
  monthlyRevenueTrend: Array<{
    month: string;
    revenue: number;
  }>;
  serviceUsageStats: Array<{
    serviceName: string;
    usageCount: number;
  }>;
  bookingsByBranch: Array<{
    branchName: string;
    activeBookings: number;
  }>;
  roomAvailability: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  occupancyPercentage: number;
  revenueChangePercentage: number;
}

export interface DashboardResponse {
  success: boolean;
  data: {
    dashboardStats: DashboardStats;
  };
}

export const getDashboardStats = async (): Promise<DashboardResponse> => {
  const response = await apiClient.get<DashboardResponse>("/dashboard");
  return response.data;
};
