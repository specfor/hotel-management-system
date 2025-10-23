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

  // Filters
  const [filters] = useState<Record<string, string>>({});

  const loadReport = React.useCallback(async (reportType: ReportType) => {
    if (!reportType) return;

    setLoading(true);
    setError(null);

    try {
      switch (reportType) {
        case "monthly-revenue": {
          const revenueData = await reportsAPI.getMonthlyRevenue(filters);
          setMonthlyRevenue(revenueData.data.monthlyRevenue || []);
          break;
        }

        case "room-occupancy": {
          const [occupancyData, summaryData] = await Promise.all([
            reportsAPI.getRoomOccupancy(filters),
            reportsAPI.getRoomOccupancySummary(),
          ]);
          setRoomOccupancy(occupancyData.data.occupancyData || []);
          setOccupancySummary(summaryData.data.summary || null);
          break;
        }

        case "guest-billing": {
          const [billingData, billingSummaryData] = await Promise.all([
            reportsAPI.getGuestBilling(filters),
            reportsAPI.getGuestBillingSummary(),
          ]);
          setGuestBilling(billingData.data.guestBilling || []);
          setBillingSummary(billingSummaryData.data.summary || null);
          break;
        }

        case "service-usage": {
          const [usageData, usageSummaryData] = await Promise.all([
            reportsAPI.getServiceUsageBreakdown(filters),
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
  }, [filters]);

  useEffect(() => {
    if (selectedReport) {
      loadReport(selectedReport);
    }
  }, [selectedReport, loadReport]);

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
                          {roomOccupancy.slice(0, 50).map((room, idx) => (
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
                          {guestBilling.slice(0, 50).map((bill, idx) => (
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
                          {serviceUsageBreakdown.slice(0, 50).map((usage, idx) => (
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
                  </Card>
                </div>
              )}

              {/* Top Services Trends Report */}
              {selectedReport === "service-trends" && (
                <div>
                  <Card className="p-6">
                    <h2 className="text-xl font-bold mb-4">Top Services & Trends</h2>
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
