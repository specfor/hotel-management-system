import React, { useState, useEffect, useCallback } from "react";
import { Card } from "../components/primary";
import { PieChart } from "@mui/x-charts/PieChart";
import { BarChart } from "@mui/x-charts/BarChart";
import { LineChart } from "@mui/x-charts/LineChart";
import { getDashboardStats, type DashboardStats } from "../api_connection/dashboard";
import { useAlert } from "../hooks/useAlert";

const Dashboard: React.FC = () => {
  const { showError } = useAlert();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getDashboardStats();
      if (response.success) {
        setDashboardStats(response.data.dashboardStats);
      } else {
        showError("Failed to load dashboard data");
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      showError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Fallback to mock data if real data is not available or loading
  const fallbackData = {
    roomAvailability: [
      {
        id: 0,
        value: 124,
        label: "Occupied",
        color: "#dc2626",
        formattedValue: "124 rooms",
      },
      {
        id: 1,
        value: 32,
        label: "Available",
        color: "#059669",
        formattedValue: "32 rooms",
      },
      {
        id: 2,
        value: 8,
        label: "Maintenance",
        color: "#d97706",
        formattedValue: "8 rooms",
      },
      {
        id: 3,
        value: 4,
        label: "Cleaning",
        color: "#2563eb",
        formattedValue: "4 rooms",
      },
    ],
    bookingsByBranch: {
      labels: ["Main Branch", "Downtown", "Airport", "Beachside", "Mountain View"],
      data: [45, 32, 28, 38, 25],
      colors: ["#3b82f6", "#06b6d4", "#10b981", "#f59e0b", "#8b5cf6"],
    },
    revenueData: {
      xAxis: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"],
      data: [42000, 48000, 35000, 52000, 48000, 55000, 61000, 58000, 64000, 67000],
      gradient: true,
    },
    serviceUsage: {
      labels: ["Room\nService", "Spa &\nWellness", "Restaurant", "Laundry", "Wi-Fi &\nInternet", "Valet\nParking"],
      data: [85, 45, 120, 32, 156, 78],
      colors: ["#ec4899", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"],
    },
  };

  // Transform real data for charts or use fallback
  const getChartData = () => {
    if (!dashboardStats) return fallbackData;

    // Transform room availability data
    const roomAvailabilityMap: { [key: string]: { color: string; id: number } } = {
      Available: { color: "#059669", id: 1 },
      Occupied: { color: "#dc2626", id: 0 },
      Maintenance: { color: "#d97706", id: 2 },
      Cleaning: { color: "#2563eb", id: 3 },
      "Out of Order": { color: "#6b7280", id: 4 },
    };

    const roomAvailability = dashboardStats.roomAvailability.map((item, index) => ({
      id: roomAvailabilityMap[item.status]?.id ?? index,
      value: item.count,
      label: item.status,
      color: roomAvailabilityMap[item.status]?.color ?? "#6b7280",
      formattedValue: `${item.count} rooms`,
    }));

    // Transform bookings by branch data
    const bookingsByBranch = {
      labels: dashboardStats.bookingsByBranch.map((branch) => branch.branchName),
      data: dashboardStats.bookingsByBranch.map((branch) => branch.activeBookings),
      colors: ["#3b82f6", "#06b6d4", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#f97316"],
    };

    // Transform revenue data or use fallback if empty
    const revenueData =
      dashboardStats.monthlyRevenueTrend.length > 0
        ? {
            xAxis: dashboardStats.monthlyRevenueTrend.map((item) => item.month),
            data: dashboardStats.monthlyRevenueTrend.map((item) => item.revenue),
            gradient: true,
          }
        : fallbackData.revenueData;

    // Transform service usage data or use fallback if empty
    const serviceUsage =
      dashboardStats.serviceUsageStats.length > 0
        ? {
            labels: dashboardStats.serviceUsageStats.map((service) => service.serviceName),
            data: dashboardStats.serviceUsageStats.map((service) => service.usageCount),
            colors: ["#ec4899", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"],
          }
        : fallbackData.serviceUsage;

    return {
      roomAvailability,
      bookingsByBranch,
      revenueData,
      serviceUsage,
    };
  };

  const chartData = getChartData();
  const totalRooms =
    dashboardStats?.totalRooms ?? chartData.roomAvailability.reduce((sum, item) => sum + item.value, 0);
  const occupiedRooms =
    dashboardStats?.occupiedRooms ?? chartData.roomAvailability.find((item) => item.label === "Occupied")?.value ?? 0;
  const availableRooms =
    dashboardStats?.availableRooms ?? chartData.roomAvailability.find((item) => item.label === "Available")?.value ?? 0;
  const currentRevenue =
    dashboardStats?.monthlyRevenue ?? chartData.revenueData.data[chartData.revenueData.data.length - 1];
  const occupancyPercentage = dashboardStats?.occupancyPercentage ?? (occupiedRooms / totalRooms) * 100;
  const revenueChangePercentage = dashboardStats?.revenueChangePercentage ?? 12;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to the Hotel Management System</p>
        {loading && <p className="text-sm text-blue-600 mt-2">Loading dashboard data...</p>}
        {!loading && !dashboardStats && (
          <p className="text-sm text-yellow-600 mt-2">Using sample data - API data unavailable</p>
        )}
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Rooms</p>
              <p className="text-3xl font-bold mt-1">{totalRooms}</p>
              <p className="text-blue-200 text-xs mt-2">Across all branches</p>
            </div>
            <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
              <div className="w-8 h-8 bg-white/80 rounded-lg"></div>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Occupied</p>
              <p className="text-3xl font-bold mt-1">{occupiedRooms}</p>
              <p className="text-red-200 text-xs mt-2">{occupancyPercentage.toFixed(1)}% occupancy</p>
            </div>
            <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
              <div className="w-8 h-8 bg-white/80 rounded-lg"></div>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Available</p>
              <p className="text-3xl font-bold mt-1">{availableRooms}</p>
              <p className="text-green-200 text-xs mt-2">Ready for check-in</p>
            </div>
            <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
              <div className="w-8 h-8 bg-white/80 rounded-lg"></div>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Monthly Revenue</p>
              <p className="text-3xl font-bold mt-1">${(currentRevenue / 1000).toFixed(1)}K</p>
              <p className="text-purple-200 text-xs mt-2">
                {revenueChangePercentage > 0 ? "+" : ""}
                {revenueChangePercentage}% from last month
              </p>
            </div>
            <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
              <div className="w-8 h-8 bg-white/80 rounded-lg"></div>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Room Availability Pie Chart */}
        <Card className="p-6 shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Room Availability</h2>
          <p className="text-sm text-gray-600 mb-6">Current status of all hotel rooms</p>
          <div className="flex justify-center">
            <PieChart
              series={[
                {
                  data: chartData.roomAvailability,
                  highlightScope: { fade: "global", highlight: "item" },
                  innerRadius: 60,
                  outerRadius: 120,
                  paddingAngle: 2,
                  cornerRadius: 8,
                  startAngle: -90,
                  endAngle: 270,
                  cx: 200,
                  cy: 150,
                },
              ]}
              width={400}
              height={300}
              margin={{ top: 10, bottom: 10, left: 10, right: 10 }}
            />
          </div>
          <div className="mt-4 text-center">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              Total: {totalRooms} rooms
            </div>
          </div>
        </Card>

        {/* Bookings by Branch Bar Chart */}
        <Card className="p-6 shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Bookings by Branch</h2>
          <p className="text-sm text-gray-600 mb-6">Active bookings across all hotel locations</p>
          <BarChart
            xAxis={[
              {
                scaleType: "band",
                data: chartData.bookingsByBranch.labels,
                categoryGapRatio: 0.3,
                barGapRatio: 0.1,
              },
            ]}
            series={[
              {
                data: chartData.bookingsByBranch.data,
                color: "#3b82f6",
                label: "Active Bookings",
              },
            ]}
            colors={chartData.bookingsByBranch.colors}
            width={400}
            height={300}
            grid={{ horizontal: true }}
            borderRadius={8}
            margin={{ top: 20, bottom: 60, left: 60, right: 20 }}
            slotProps={{
              bar: {
                rx: 4,
                ry: 4,
              },
            }}
          />
        </Card>
      </div>

      {/* Revenue and Service Usage Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Line Chart */}
        <Card className="p-6 shadow-lg border-0 bg-gradient-to-br from-green-50 to-emerald-50">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Monthly Revenue Trend</h2>
          <p className="text-sm text-gray-600 mb-6">Revenue performance over the past months</p>
          <LineChart
            xAxis={[
              {
                scaleType: "point",
                data: chartData.revenueData.xAxis,
                tickLabelStyle: {
                  fontSize: 12,
                  fontWeight: 500,
                },
              },
            ]}
            yAxis={[
              {
                valueFormatter: (value: number) => `$${(value / 1000).toFixed(0)}K`,
                tickLabelStyle: {
                  fontSize: 12,
                  fontWeight: 500,
                },
              },
            ]}
            series={[
              {
                data: chartData.revenueData.data,
                color: "#059669",
                curve: "catmullRom",
                area: true,
                label: "Monthly Revenue",
                showMark: true,
              },
            ]}
            width={400}
            height={300}
            grid={{ horizontal: true, vertical: true }}
            margin={{ top: 20, bottom: 60, left: 80, right: 20 }}
            sx={{
              ".MuiLineElement-root": {
                strokeWidth: 3,
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
              },
              ".MuiAreaElement-root": {
                fill: "url(#revenue-gradient)",
                fillOpacity: 0.3,
              },
            }}
          />
          <div className="mt-4 flex justify-between text-sm">
            <div className="text-gray-600">
              <span className="font-medium text-green-600">↗ 12%</span> vs last period
            </div>
            <div className="text-gray-600">
              Average:{" "}
              <span className="font-medium">
                $
                {(
                  chartData.revenueData.data.reduce((a: number, b: number) => a + b, 0) /
                  chartData.revenueData.data.length /
                  1000
                ).toFixed(1)}
                K
              </span>
            </div>
          </div>
        </Card>

        {/* Service Usage Bar Chart */}
        <Card className="p-6 shadow-lg border-0 bg-gradient-to-br from-purple-50 to-violet-50">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Service Usage Statistics</h2>
          <p className="text-sm text-gray-600 mb-6">Most popular hotel services this month</p>
          <BarChart
            xAxis={[
              {
                scaleType: "band",
                data: chartData.serviceUsage.labels,
                tickLabelStyle: {
                  angle: -30,
                  textAnchor: "end",
                  fontSize: 10,
                  fontWeight: 500,
                },
                categoryGapRatio: 0.2,
                barGapRatio: 0.1,
              },
            ]}
            yAxis={[
              {
                tickLabelStyle: {
                  fontSize: 12,
                  fontWeight: 500,
                },
              },
            ]}
            series={[
              {
                data: chartData.serviceUsage.data,
                color: "#8b5cf6",
                label: "Usage Count",
              },
            ]}
            colors={chartData.serviceUsage.colors}
            width={400}
            height={300}
            margin={{ bottom: 100, left: 60, right: 20, top: 20 }}
            grid={{ horizontal: true }}
            borderRadius={6}
            slotProps={{
              bar: {
                rx: 3,
                ry: 3,
              },
            }}
            sx={{
              ".MuiBarElement-root": {
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
              },
            }}
          />
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div className="text-gray-600">
              <span className="font-medium text-purple-600">Most Popular:</span> Wi-Fi & Internet
            </div>
            <div className="text-gray-600">
              <span className="font-medium text-purple-600">Total Uses:</span>{" "}
              {chartData.serviceUsage.data.reduce((a: number, b: number) => a + b, 0)}
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6 shadow-lg border-0 bg-gradient-to-br from-gray-50 to-slate-50">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Recent Activity</h2>
        <p className="text-sm text-gray-600 mb-6">Latest updates from across the hotel</p>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border-l-4 border-green-500 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700 font-medium">New booking from John Doe - Room 305</span>
            </div>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">2 min ago</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border-l-4 border-blue-500 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-700 font-medium">Room 205 checked out - Revenue $450</span>
            </div>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">15 min ago</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border-l-4 border-purple-500 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-sm text-gray-700 font-medium">Payment received for booking #BK001 - $750</span>
            </div>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">1 hour ago</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border-l-4 border-pink-500 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
              <span className="text-sm text-gray-700 font-medium">Spa service booked - Guest ID: 1245</span>
            </div>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">2 hours ago</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border-l-4 border-yellow-500 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-gray-700 font-medium">Room 412 marked for maintenance</span>
            </div>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">3 hours ago</span>
          </div>
        </div>
        <div className="mt-6 text-center">
          <button className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
            View All Activities
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
