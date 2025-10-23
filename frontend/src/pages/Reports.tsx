import React, { useState, useEffect } from "react";
import { Card, Button } from "../components/primary";
import { reportsAPI, type MonthlyRevenueData, type RoomOccupancySummary, type GuestBillingSummary, type ServiceUsageSummary, type TopServicesTrendsData, type ServiceUsageBreakdownData, type GuestBillingData, type RoomOccupancyData } from "../api_connection/reports";

type ReportType = "monthly-revenue" | "room-occupancy" | "guest-billing" | "service-usage" | "service-trends" | null;

const Reports: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<ReportType>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Monthly Revenue State
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenueData[]>([]);
  
  // Room Occupancy State
  const [roomOccupancy, setRoomOccupancy] = useState<RoomOccupancyData[]>([]);
  const [occupancySummary, setOccupancySummary] = useState<RoomOccupancySummary | null>(null);
  
  // Guest Billing State
  const [guestBilling, setGuestBilling] = useState<GuestBillingData[]>([]);
  const [billingSummary, setBillingSummary] = useState<GuestBillingSummary | null>(null);
  
  // Service Reports State
  const [serviceUsageBreakdown, setServiceUsageBreakdown] = useState<ServiceUsageBreakdownData[]>([]);
  const [topServicesTrends, setTopServicesTrends] = useState<TopServicesTrendsData[]>([]);
  const [serviceUsageSummary, setServiceUsageSummary] = useState<ServiceUsageSummary | null>(null);

  // Filters and Pagination
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50);

  const loadReport = React.useCallback(async (reportType: ReportType) => {
    if (!reportType) return;

    setLoading(true);
    setError(null);

    try {
      // Add pagination to filters
      const paginatedFilters = { ...filters, limit: pageSize.toString(), offset: ((currentPage - 1) * pageSize).toString() };

      switch (reportType) {
        case "monthly-revenue": {
          const revenueData = await reportsAPI.getMonthlyRevenue(filters);
          setMonthlyRevenue(revenueData.data.monthlyRevenue || []);
          break;
        }

        case "room-occupancy": {
          const [occupancyData, summaryData] = await Promise.all([
            reportsAPI.getRoomOccupancy(paginatedFilters),
            reportsAPI.getRoomOccupancySummary(),
          ]);
          setRoomOccupancy(occupancyData.data.occupancyData || []);
          setOccupancySummary(summaryData.data.summary || null);
          break;
        }

        case "guest-billing": {
          const [billingData, billingSummaryData] = await Promise.all([
            reportsAPI.getGuestBilling(paginatedFilters),
            reportsAPI.getGuestBillingSummary(),
          ]);
          setGuestBilling(billingData.data.guestBilling || []);
          setBillingSummary(billingSummaryData.data.summary || null);
          break;
        }

        case "service-usage": {
          const [usageData, usageSummaryData] = await Promise.all([
            reportsAPI.getServiceUsageBreakdown(paginatedFilters),
            reportsAPI.getServiceUsageSummary(),
          ]);
          setServiceUsageBreakdown(usageData.data.serviceUsageBreakdown || []);
          setServiceUsageSummary(usageSummaryData.data.summary || null);
          break;
        }

        case "service-trends": {
          const trendsData = await reportsAPI.getTopServicesTrends({ ...filters, limit: 10 });
          setTopServicesTrends(trendsData.data.topServices || []);
          break;
        }
      }
    } catch (err: unknown) {
      console.error("Error loading report:", err);
      setError(err instanceof Error ? err.message : "Failed to load report");
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage, pageSize]);

  useEffect(() => {
    if (selectedReport) {
      loadReport(selectedReport);
    }
  }, [selectedReport, loadReport]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => {
      if (value === "") {
        const newFilters = { ...prev };
        delete newFilters[key];
        return newFilters;
      }
      return { ...prev, [key]: value };
    });
    setCurrentPage(1); // Reset to first page when filters change
  };

  const applyFilters = () => {
    if (selectedReport) {
      loadReport(selectedReport);
    }
  };

  const clearFilters = () => {
    setFilters({});
    setCurrentPage(1);
    if (selectedReport) {
      loadReport(selectedReport);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Comprehensive business insights and reports</p>
        </div>
        {selectedReport && (
          <Button variant="outline" onClick={() => setSelectedReport(null)}>
            ← Back to Reports
          </Button>
        )}
      </div>

      {!selectedReport ? (
        <>
          {/* Report Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedReport("monthly-revenue")}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Monthly Revenue</h3>
                  <span className="text-3xl">📊</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Track revenue by branch, room charges, and services
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  View Report →
                </Button>
              </Card>
            </div>

            <div 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedReport("room-occupancy")}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Room Occupancy</h3>
                  <span className="text-3xl">🏨</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Monitor room status, occupancy rates, and availability
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  View Report →
                </Button>
              </Card>
            </div>

            <div 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedReport("guest-billing")}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Guest Billing</h3>
                  <span className="text-3xl">💳</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  View billing details, payments, and outstanding balances
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  View Report →
                </Button>
              </Card>
            </div>

            <div 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedReport("service-usage")}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Service Usage</h3>
                  <span className="text-3xl">🛎️</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Detailed breakdown of service usage per booking
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  View Report →
                </Button>
              </Card>
            </div>

            <div 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedReport("service-trends")}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Top Services</h3>
                  <span className="text-3xl">⭐</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Analyze popular services and customer preferences
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  View Report →
                </Button>
              </Card>
            </div>
          </div>
        </>
      ) : (
        <div>
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          {error && (
            <Card className="p-6 bg-red-50 border-red-200">
              <p className="text-red-600">Error: {error}</p>
            </Card>
          )}

          {!loading && !error && (
            <>
              {/* Filters Section */}
              <Card className="p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Filters</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  
                  {/* Common Filters */}
                  {(selectedReport === "monthly-revenue" || selectedReport === "room-occupancy" || selectedReport === "guest-billing" || selectedReport === "service-usage" || selectedReport === "service-trends") && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                          type="date"
                          value={filters.startDate || ""}
                          onChange={(e) => handleFilterChange("startDate", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input
                          type="date"
                          value={filters.endDate || ""}
                          onChange={(e) => handleFilterChange("endDate", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <input
                          type="text"
                          value={filters.city || ""}
                          onChange={(e) => handleFilterChange("city", e.target.value)}
                          placeholder="Enter city name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Branch ID</label>
                        <input
                          type="number"
                          value={filters.branchId || ""}
                          onChange={(e) => handleFilterChange("branchId", e.target.value)}
                          placeholder="Enter branch ID"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </>
                  )}

                  {/* Monthly Revenue Specific Filters */}
                  {selectedReport === "monthly-revenue" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Month (YYYY-MM)</label>
                      <input
                        type="month"
                        value={filters.monthYear || ""}
                        onChange={(e) => handleFilterChange("monthYear", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}

                  {/* Room Occupancy Specific Filters */}
                  {selectedReport === "room-occupancy" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
                        <input
                          type="text"
                          value={filters.roomType || ""}
                          onChange={(e) => handleFilterChange("roomType", e.target.value)}
                          placeholder="Single, Double, Suite, etc."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Occupancy Status</label>
                        <select
                          value={filters.occupancyStatus || ""}
                          onChange={(e) => handleFilterChange("occupancyStatus", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">All</option>
                          <option value="Occupied">Occupied</option>
                          <option value="Available">Available</option>
                          <option value="Maintenance">Maintenance</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Booking Status</label>
                        <select
                          value={filters.bookingStatus || ""}
                          onChange={(e) => handleFilterChange("bookingStatus", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">All</option>
                          <option value="Booked">Booked</option>
                          <option value="Checked-In">Checked-In</option>
                          <option value="Checked-Out">Checked-Out</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Guest Name</label>
                        <input
                          type="text"
                          value={filters.guestName || ""}
                          onChange={(e) => handleFilterChange("guestName", e.target.value)}
                          placeholder="Search by guest name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </>
                  )}

                  {/* Guest Billing Specific Filters */}
                  {selectedReport === "guest-billing" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                        <select
                          value={filters.paymentStatus || ""}
                          onChange={(e) => handleFilterChange("paymentStatus", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">All</option>
                          <option value="Paid">Paid</option>
                          <option value="Unpaid">Unpaid</option>
                          <option value="Partially Paid">Partially Paid</option>
                          <option value="Pending">Pending</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Guest Name</label>
                        <input
                          type="text"
                          value={filters.guestName || ""}
                          onChange={(e) => handleFilterChange("guestName", e.target.value)}
                          placeholder="Search by guest name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Min Outstanding</label>
                        <input
                          type="number"
                          value={filters.minOutstanding || ""}
                          onChange={(e) => handleFilterChange("minOutstanding", e.target.value)}
                          placeholder="Min amount"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Outstanding</label>
                        <input
                          type="number"
                          value={filters.maxOutstanding || ""}
                          onChange={(e) => handleFilterChange("maxOutstanding", e.target.value)}
                          placeholder="Max amount"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </>
                  )}

                  {/* Service Usage Specific Filters */}
                  {selectedReport === "service-usage" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
                        <input
                          type="text"
                          value={filters.serviceName || ""}
                          onChange={(e) => handleFilterChange("serviceName", e.target.value)}
                          placeholder="Search by service name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
                        <input
                          type="text"
                          value={filters.roomType || ""}
                          onChange={(e) => handleFilterChange("roomType", e.target.value)}
                          placeholder="Single, Double, Suite, etc."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Booking Status</label>
                        <select
                          value={filters.bookingStatus || ""}
                          onChange={(e) => handleFilterChange("bookingStatus", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">All</option>
                          <option value="Booked">Booked</option>
                          <option value="Checked-In">Checked-In</option>
                          <option value="Checked-Out">Checked-Out</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </>
                  )}

                  {/* Service Trends Specific Filters */}
                  {selectedReport === "service-trends" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
                        <input
                          type="text"
                          value={filters.serviceName || ""}
                          onChange={(e) => handleFilterChange("serviceName", e.target.value)}
                          placeholder="Search by service name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Min Bookings</label>
                        <input
                          type="number"
                          value={filters.minBookings || ""}
                          onChange={(e) => handleFilterChange("minBookings", e.target.value)}
                          placeholder="Minimum bookings"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Min Revenue</label>
                        <input
                          type="number"
                          value={filters.minRevenue || ""}
                          onChange={(e) => handleFilterChange("minRevenue", e.target.value)}
                          placeholder="Minimum revenue"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="flex gap-3 mt-4">
                  <Button onClick={applyFilters} variant="primary">
                    Apply Filters
                  </Button>
                  <Button onClick={clearFilters} variant="outline">
                    Clear Filters
                  </Button>
                </div>
              </Card>

              {/* Reports Content */}
              {/* Monthly Revenue Report */}
              {selectedReport === "monthly-revenue" && (
                <div>
                  <Card className="p-6 mb-6">
                    <h2 className="text-xl font-bold mb-4">Monthly Revenue Report</h2>
                    
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Total Revenue</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {formatCurrency(monthlyRevenue.reduce((sum, r) => sum + r.totalRevenue, 0))}
                        </p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Room Charges</p>
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(monthlyRevenue.reduce((sum, r) => sum + r.totalRoomCharges, 0))}
                        </p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Service Charges</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {formatCurrency(monthlyRevenue.reduce((sum, r) => sum + r.totalServiceCharges, 0))}
                        </p>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Total Bookings</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {monthlyRevenue.reduce((sum, r) => sum + r.numberOfBookings, 0)}
                        </p>
                      </div>
                    </div>

                    {/* Data Table */}
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">City</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Room Charges</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Service Charges</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Revenue</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Bookings</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {monthlyRevenue.map((row, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.branchName}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.city}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.monthYear}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">{formatCurrency(row.totalRoomCharges)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">{formatCurrency(row.totalServiceCharges)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-blue-600">{formatCurrency(row.totalRevenue)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">{row.numberOfBookings}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {monthlyRevenue.length === 0 && (
                      <p className="text-center text-gray-500 py-8">No data available for the selected filters.</p>
                    )}
                  </Card>
                </div>
              )}

              {/* Room Occupancy Report */}
              {selectedReport === "room-occupancy" && (
                <div>
                  {occupancySummary && (
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                      <Card className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                        <p className="text-sm opacity-90">Total Rooms</p>
                        <p className="text-3xl font-bold">{occupancySummary.totalRooms}</p>
                      </Card>
                      <Card className="p-4 bg-gradient-to-br from-green-500 to-green-600 text-white">
                        <p className="text-sm opacity-90">Occupied</p>
                        <p className="text-3xl font-bold">{occupancySummary.occupiedRooms}</p>
                      </Card>
                      <Card className="p-4 bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
                        <p className="text-sm opacity-90">Available</p>
                        <p className="text-3xl font-bold">{occupancySummary.availableRooms}</p>
                      </Card>
                      <Card className="p-4 bg-gradient-to-br from-red-500 to-red-600 text-white">
                        <p className="text-sm opacity-90">Maintenance</p>
                        <p className="text-3xl font-bold">{occupancySummary.maintenanceRooms}</p>
                      </Card>
                      <Card className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                        <p className="text-sm opacity-90">Occupancy Rate</p>
                        <p className="text-3xl font-bold">{occupancySummary.occupancyRate.toFixed(1)}%</p>
                      </Card>
                    </div>
                  )}

                  <Card className="p-6">
                    <h2 className="text-xl font-bold mb-4">Room Details</h2>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guest</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-In</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-Out</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {roomOccupancy.slice(0, pageSize).map((room, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{room.roomNumber}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{room.roomType}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{room.branchName}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  room.occupancyStatus === "Occupied" ? "bg-green-100 text-green-800" :
                                  room.occupancyStatus === "Available" ? "bg-blue-100 text-blue-800" :
                                  "bg-yellow-100 text-yellow-800"
                                }`}>
                                  {room.occupancyStatus}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{room.guestName || "-"}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{room.checkInDate ? formatDate(room.checkInDate) : "-"}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{room.checkOutDate ? formatDate(room.checkOutDate) : "-"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {roomOccupancy.length === 0 && (
                      <p className="text-center text-gray-500 py-8">No rooms found for the selected filters.</p>
                    )}

                    {/* Pagination */}
                    {roomOccupancy.length > 0 && (
                      <div className="flex items-center justify-between mt-4 pt-4 border-t">
                        <p className="text-sm text-gray-600">
                          Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, roomOccupancy.length)} of {roomOccupancy.length} results
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                          >
                            Previous
                          </Button>
                          <span className="px-3 py-2 text-sm">Page {currentPage}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => p + 1)}
                            disabled={currentPage * pageSize >= roomOccupancy.length}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                </div>
              )}

              {/* Guest Billing Report */}
              {selectedReport === "guest-billing" && (
                <div>
                  {billingSummary && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <Card className="p-4 bg-blue-50">
                        <p className="text-sm text-gray-600">Total Revenue</p>
                        <p className="text-2xl font-bold text-blue-600">{formatCurrency(billingSummary.totalRevenue)}</p>
                      </Card>
                      <Card className="p-4 bg-green-50">
                        <p className="text-sm text-gray-600">Total Paid</p>
                        <p className="text-2xl font-bold text-green-600">{formatCurrency(billingSummary.totalPaid)}</p>
                      </Card>
                      <Card className="p-4 bg-red-50">
                        <p className="text-sm text-gray-600">Outstanding</p>
                        <p className="text-2xl font-bold text-red-600">{formatCurrency(billingSummary.totalOutstanding)}</p>
                      </Card>
                      <Card className="p-4 bg-purple-50">
                        <p className="text-sm text-gray-600">Avg Bill</p>
                        <p className="text-2xl font-bold text-purple-600">{formatCurrency(billingSummary.averageBillAmount)}</p>
                      </Card>
                    </div>
                  )}

                  <Card className="p-6">
                    <h2 className="text-xl font-bold mb-4">Billing Details</h2>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guest</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Paid</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Outstanding</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {guestBilling.slice(0, pageSize).map((bill, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{bill.guestName}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bill.roomNumber} ({bill.roomType})</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bill.branchName}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900">{formatCurrency(bill.totalAmount)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600">{formatCurrency(bill.paidAmount)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600">{formatCurrency(bill.outstandingAmount)}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  bill.paymentStatus === "Paid" ? "bg-green-100 text-green-800" :
                                  bill.paymentStatus === "Partially Paid" ? "bg-yellow-100 text-yellow-800" :
                                  "bg-red-100 text-red-800"
                                }`}>
                                  {bill.paymentStatus}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {guestBilling.length === 0 && (
                      <p className="text-center text-gray-500 py-8">No billing records found for the selected filters.</p>
                    )}

                    {/* Pagination */}
                    {guestBilling.length > 0 && (
                      <div className="flex items-center justify-between mt-4 pt-4 border-t">
                        <p className="text-sm text-gray-600">
                          Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, guestBilling.length)} of {guestBilling.length} results
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                          >
                            Previous
                          </Button>
                          <span className="px-3 py-2 text-sm">Page {currentPage}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => p + 1)}
                            disabled={currentPage * pageSize >= guestBilling.length}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                </div>
              )}

              {/* Service Usage Breakdown Report */}
              {selectedReport === "service-usage" && (
                <div>
                  {serviceUsageSummary && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <Card className="p-4 bg-blue-50">
                        <p className="text-sm text-gray-600">Total Revenue</p>
                        <p className="text-2xl font-bold text-blue-600">{formatCurrency(serviceUsageSummary.totalRevenue)}</p>
                      </Card>
                      <Card className="p-4 bg-green-50">
                        <p className="text-sm text-gray-600">Usage Records</p>
                        <p className="text-2xl font-bold text-green-600">{serviceUsageSummary.totalUsageRecords}</p>
                      </Card>
                      <Card className="p-4 bg-purple-50">
                        <p className="text-sm text-gray-600">Most Used</p>
                        <p className="text-lg font-bold text-purple-600">{serviceUsageSummary.mostUsedService || "N/A"}</p>
                      </Card>
                      <Card className="p-4 bg-orange-50">
                        <p className="text-sm text-gray-600">Highest Revenue</p>
                        <p className="text-lg font-bold text-orange-600">{serviceUsageSummary.highestRevenueService || "N/A"}</p>
                      </Card>
                    </div>
                  )}

                  <Card className="p-6">
                    <h2 className="text-xl font-bold mb-4">Service Usage Details</h2>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guest</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {serviceUsageBreakdown.slice(0, pageSize).map((usage, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{usage.serviceName}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{usage.guestName}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{usage.roomNumber}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{usage.branchName}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">{usage.quantity}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-blue-600">{formatCurrency(usage.totalPrice)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(usage.usageDateTime)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {serviceUsageBreakdown.length === 0 && (
                      <p className="text-center text-gray-500 py-8">No service usage records found for the selected filters.</p>
                    )}

                    {/* Pagination */}
                    {serviceUsageBreakdown.length > 0 && (
                      <div className="flex items-center justify-between mt-4 pt-4 border-t">
                        <p className="text-sm text-gray-600">
                          Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, serviceUsageBreakdown.length)} of {serviceUsageBreakdown.length} results
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                          >
                            Previous
                          </Button>
                          <span className="px-3 py-2 text-sm">Page {currentPage}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => p + 1)}
                            disabled={currentPage * pageSize >= serviceUsageBreakdown.length}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                </div>
              )}

              {/* Top Services Trends Report */}
              {selectedReport === "service-trends" && (
                <div>
                  <Card className="p-6">
                    <h2 className="text-xl font-bold mb-4">Top Services & Trends</h2>
                    
                    {topServicesTrends.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">No trending services found for the selected filters.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {topServicesTrends.map((service, idx) => (
                          <Card key={idx} className="p-4 border-2 hover:border-blue-300 transition-colors">
                            <div className="flex items-start justify-between mb-3">
                              <h3 className="font-semibold text-gray-900">{service.serviceName}</h3>
                              <span className="text-2xl">#{idx + 1}</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{service.branchName} - {service.city}</p>
                            
                            <div className="grid grid-cols-2 gap-2 mt-4">
                              <div className="bg-blue-50 p-2 rounded">
                                <p className="text-xs text-gray-600">Bookings</p>
                                <p className="text-lg font-bold text-blue-600">{service.bookingsUsingService}</p>
                              </div>
                              <div className="bg-green-50 p-2 rounded">
                                <p className="text-xs text-gray-600">Revenue</p>
                                <p className="text-lg font-bold text-green-600">{formatCurrency(service.totalRevenueFromService)}</p>
                              </div>
                              <div className="bg-purple-50 p-2 rounded">
                                <p className="text-xs text-gray-600">Total Uses</p>
                                <p className="text-lg font-bold text-purple-600">{service.totalUsageRecords}</p>
                              </div>
                              <div className="bg-orange-50 p-2 rounded">
                                <p className="text-xs text-gray-600">Unit Price</p>
                                <p className="text-lg font-bold text-orange-600">{formatCurrency(service.unitPrice)}</p>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </Card>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;
