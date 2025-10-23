// frontend/src/api_connection/reports.ts
import apiClient from "./base";

// Monthly Revenue Types
export interface MonthlyRevenueData {
  branchId: number;
  branchName: string;
  city: string;
  month: number;
  year: number;
  monthYear: string;
  totalRoomCharges: number;
  totalServiceCharges: number;
  totalRevenue: number;
  numberOfBookings: number;
  averageRevenuePerBooking: number;
}

export interface MonthlyRevenueFilters {
  branchId?: number;
  monthYear?: string;
  startDate?: string;
  endDate?: string;
  city?: string;
}

// Room Occupancy Types
export interface RoomOccupancyData {
  roomId: number;
  roomNumber: string;
  roomType: string;
  branchId: number;
  branchName: string;
  city: string;
  currentBookingId: number | null;
  guestId: number | null;
  guestName: string | null;
  checkInDate: string | null;
  checkOutDate: string | null;
  occupancyStatus: string;
  bookingStatus: string | null;
  roomStatus: string;
  stayDuration: number | null;
}

export interface RoomOccupancySummary {
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  maintenanceRooms: number;
  occupancyRate: number;
}

// Guest Billing Types
export interface GuestBillingData {
  billId: number;
  bookingId: number;
  guestId: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomId: number;
  roomNumber: string;
  roomType: string;
  branchName: string;
  city: string;
  checkIn: string;
  checkOut: string;
  stayDuration: number;
  roomCharges: number;
  totalServiceCharges: number;
  totalTax: number;
  totalDiscount: number;
  lateCheckoutCharge: number;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  paymentStatus: string;
}

export interface GuestBillingSummary {
  totalBills: number;
  totalRevenue: number;
  totalOutstanding: number;
  totalPaid: number;
  averageBillAmount: number;
  paidBillsCount: number;
  partiallyPaidBillsCount: number;
  unpaidBillsCount: number;
}

// Service Usage Types
export interface ServiceUsageBreakdownData {
  recordId: number;
  bookingId: number;
  guestId: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomId: number;
  roomNumber: string;
  roomType: string;
  branchId: number;
  branchName: string;
  city: string;
  address: string;
  serviceId: number;
  serviceName: string;
  unitPrice: number;
  unitType: string;
  usageDateTime: string;
  quantity: number;
  totalPrice: number;
  bookingStatus: string;
}

export interface TopServicesTrendsData {
  serviceId: number;
  serviceName: string;
  branchId: number;
  branchName: string;
  city: string;
  unitPrice: number;
  unitType: string;
  bookingsUsingService: number;
  totalUsageRecords: number;
  totalQuantity: number;
  totalRevenueFromService: number;
  avgQuantityPerUsage: number;
  firstUsageDate: string | null;
  lastUsageDate: string | null;
}

export interface ServiceUsageSummary {
  totalServices: number;
  totalUsageRecords: number;
  totalRevenue: number;
  totalQuantity: number;
  uniqueGuests: number;
  averageRevenuePerService: number;
  mostUsedService: string | null;
  highestRevenueService: string | null;
}

// API Functions
export const reportsAPI = {
  // Monthly Revenue
  getMonthlyRevenue: async (filters?: MonthlyRevenueFilters) => {
    const params = new URLSearchParams();
    if (filters?.branchId) params.append("branchId", filters.branchId.toString());
    if (filters?.monthYear) params.append("monthYear", filters.monthYear);
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    if (filters?.city) params.append("city", filters.city);

    const response = await apiClient.get(`/monthly-revenue?${params.toString()}`);
    return response.data;
  },

  // Room Occupancy
  getRoomOccupancy: async (filters?: Record<string, string | number>) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value.toString());
        }
      });
    }

    const response = await apiClient.get(`/room-occupancy?${params.toString()}`);
    return response.data;
  },

  getRoomOccupancySummary: async () => {
    const response = await apiClient.get("/room-occupancy/summary");
    return response.data;
  },

  // Guest Billing
  getGuestBilling: async (filters?: Record<string, string | number>) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value.toString());
        }
      });
    }

    const response = await apiClient.get(`/guest-billing?${params.toString()}`);
    return response.data;
  },

  getGuestBillingSummary: async () => {
    const response = await apiClient.get("/guest-billing/summary");
    return response.data;
  },

  // Service Reports
  getServiceUsageBreakdown: async (filters?: Record<string, string | number>) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value.toString());
        }
      });
    }

    const response = await apiClient.get(`/service-usage-breakdown?${params.toString()}`);
    return response.data;
  },

  getTopServicesTrends: async (filters?: Record<string, string | number>) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value.toString());
        }
      });
    }

    const response = await apiClient.get(`/top-services-trends?${params.toString()}`);
    return response.data;
  },

  getServiceUsageSummary: async () => {
    const response = await apiClient.get("/service-usage-summary");
    return response.data;
  },
};
