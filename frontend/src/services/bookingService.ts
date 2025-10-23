import { BaseApiService, type ApiResponse } from "../api_connection/base";
import type {
  Booking,
  ServiceUsage,
  Payment,
  FinalBill,
  CreateBookingRequest,
  UpdateBookingRequest,
  CreateServiceUsageRequest,
  CreatePaymentRequest,
  BookingFilters,
  BookingStatus,
} from "../types";
import { BookingStatusEnum } from "../types";

class BookingApiService extends BaseApiService {
  constructor() {
    super("/bookings");
  }

  // Booking CRUD operations
  async getAllBookings(filters?: BookingFilters): Promise<ApiResponse<Booking[]>> {
    return this.getAll<Booking>(filters as Record<string, unknown>);
  }

  async getBookingById(id: number): Promise<ApiResponse<Booking>> {
    return this.getById<Booking>(id);
  }

  async createBooking(data: CreateBookingRequest): Promise<ApiResponse<Booking>> {
    return this.create<Booking>(data);
  }

  async updateBooking(id: number, data: UpdateBookingRequest): Promise<ApiResponse<Booking>> {
    return this.update<Booking>(id, data);
  }

  async deleteBooking(id: number): Promise<ApiResponse<void>> {
    return this.deleteById(id);
  }

  // Booking status operations
  async updateBookingStatus(id: number, status: BookingStatus): Promise<ApiResponse<Booking>> {
    return this.patchUpdate<Booking>(id, { bookingStatus: status });
  }

  async checkInBooking(id: number): Promise<ApiResponse<Booking>> {
    return this.post<Booking>(`${this.endpoint}/${id}/checkin`, {});
  }

  async checkOutBooking(id: number): Promise<ApiResponse<Booking>> {
    return this.post<Booking>(`${this.endpoint}/${id}/checkout`, {});
  }

  // Booking search and filter operations
  async searchBookings(params: {
    guest_name?: string;
    guest_nic?: string;
    room_number?: string;
    staff_name?: string;
    booking_status?: string;
    check_in_date_from?: string;
    check_in_date_to?: string;
  }): Promise<ApiResponse<Booking[]>> {
    return this.getAll<Booking>(params);
  }

  async getBookingsByGuest(guestId: number): Promise<ApiResponse<Booking[]>> {
    return this.get<Booking[]>(`${this.endpoint}/guest/${guestId}`);
  }

  async getBookingsByRoom(roomId: number): Promise<ApiResponse<Booking[]>> {
    return this.get<Booking[]>(`${this.endpoint}/room/${roomId}`);
  }

  async getBookingsByDateRange(startDate: string, endDate: string): Promise<ApiResponse<Booking[]>> {
    return this.getAll<Booking>({
      check_in_date_from: startDate,
      check_in_date_to: endDate,
    });
  }
}

class ServiceUsageApiService extends BaseApiService {
  constructor() {
    super("/service-usage");
  }

  // Service usage CRUD operations
  async getAllServiceUsage(): Promise<ApiResponse<ServiceUsage[]>> {
    return this.getAll<ServiceUsage>();
  }

  async getServiceUsageById(id: number): Promise<ApiResponse<ServiceUsage>> {
    return this.getById<ServiceUsage>(id);
  }

  async getServiceUsageByBooking(bookingId: number): Promise<ApiResponse<ServiceUsage[]>> {
    return this.get<ServiceUsage[]>(`${this.endpoint}/booking/${bookingId}`);
  }

  async createServiceUsage(data: CreateServiceUsageRequest): Promise<ApiResponse<ServiceUsage>> {
    return this.create<ServiceUsage>(data);
  }

  async updateServiceUsage(id: number, data: Partial<CreateServiceUsageRequest>): Promise<ApiResponse<ServiceUsage>> {
    return this.update<ServiceUsage>(id, data);
  }

  async deleteServiceUsage(id: number): Promise<ApiResponse<void>> {
    return this.deleteById(id);
  }

  // Service usage analytics
  async getServiceUsageByDateRange(
    bookingId: number,
    startDate: string,
    endDate: string
  ): Promise<ApiResponse<ServiceUsage[]>> {
    return this.getAll<ServiceUsage>({
      booking_id: bookingId,
      usage_date_from: startDate,
      usage_date_to: endDate,
    });
  }

  async getTotalServiceCharges(bookingId: number): Promise<ApiResponse<{ total: number }>> {
    return this.get<{ total: number }>(`${this.endpoint}/booking/${bookingId}/total`);
  }
}

class PaymentApiService extends BaseApiService {
  constructor() {
    super("/payments");
  }

  // Payment CRUD operations
  async getAllPayments(): Promise<ApiResponse<Payment[]>> {
    return this.getAll<Payment>();
  }

  async getPaymentById(id: number): Promise<ApiResponse<Payment>> {
    return this.getById<Payment>(id);
  }

  async getPaymentsByBooking(bookingId: number): Promise<ApiResponse<Payment[]>> {
    return this.get<Payment[]>(`${this.endpoint}/booking/${bookingId}`);
  }

  async createPayment(data: CreatePaymentRequest): Promise<ApiResponse<Payment>> {
    return this.create<Payment>(data);
  }

  async updatePayment(id: number, data: Partial<CreatePaymentRequest>): Promise<ApiResponse<Payment>> {
    return this.update<Payment>(id, data);
  }

  async deletePayment(id: number): Promise<ApiResponse<void>> {
    return this.deleteById(id);
  }

  // Payment analytics
  async getTotalPayments(bookingId: number): Promise<ApiResponse<{ total: number }>> {
    return this.get<{ total: number }>(`${this.endpoint}/booking/${bookingId}/total`);
  }

  async getPaymentsByDateRange(bookingId: number, startDate: string, endDate: string): Promise<ApiResponse<Payment[]>> {
    return this.getAll<Payment>({
      booking_id: bookingId,
      payment_date_from: startDate,
      payment_date_to: endDate,
    });
  }

  async getPaymentsByMethod(bookingId: number, paymentMethod: string): Promise<ApiResponse<Payment[]>> {
    return this.getAll<Payment>({
      booking_id: bookingId,
      payment_method: paymentMethod,
    });
  }
}

class FinalBillApiService extends BaseApiService {
  constructor() {
    super("/final-bills");
  }

  // Final bill operations
  async getFinalBillByBooking(bookingId: number): Promise<ApiResponse<FinalBill>> {
    return this.get<FinalBill>(`${this.endpoint}/booking/${bookingId}`);
  }

  async generateFinalBill(bookingId: number): Promise<ApiResponse<FinalBill>> {
    return this.post<FinalBill>(`${this.endpoint}/generate`, { booking_id: bookingId });
  }

  async updateFinalBill(bookingId: number, data: Partial<FinalBill>): Promise<ApiResponse<FinalBill>> {
    return this.put<FinalBill>(`${this.endpoint}/booking/${bookingId}`, data);
  }

  async deleteFinalBill(bookingId: number): Promise<ApiResponse<void>> {
    return this.delete<void>(`${this.endpoint}/booking/${bookingId}`);
  }

  // Final bill calculations
  async recalculateBill(bookingId: number): Promise<ApiResponse<FinalBill>> {
    return this.post<FinalBill>(`${this.endpoint}/booking/${bookingId}/recalculate`, {});
  }

  async applyDiscount(bookingId: number, discountAmount: number): Promise<ApiResponse<FinalBill>> {
    return this.post<FinalBill>(`${this.endpoint}/booking/${bookingId}/discount`, {
      discount_amount: discountAmount,
    });
  }

  async addLateCheckoutCharges(bookingId: number, amount: number): Promise<ApiResponse<FinalBill>> {
    return this.post<FinalBill>(`${this.endpoint}/booking/${bookingId}/late-checkout`, {
      late_checkout_charges: amount,
    });
  }
}

// Create and export service instances
export const bookingApi = new BookingApiService();
export const serviceUsageApi = new ServiceUsageApiService();
export const paymentApi = new PaymentApiService();
export const finalBillApi = new FinalBillApiService();

// Export individual classes for advanced usage
export { BookingApiService, ServiceUsageApiService, PaymentApiService, FinalBillApiService };

// Convenience functions for common operations
export const bookingService = {
  // Get complete booking details with all related data
  async getBookingWithDetails(bookingId: number) {
    const [booking, serviceUsages, payments, finalBill] = await Promise.allSettled([
      bookingApi.getBookingById(bookingId),
      serviceUsageApi.getServiceUsageByBooking(bookingId),
      paymentApi.getPaymentsByBooking(bookingId),
      finalBillApi.getFinalBillByBooking(bookingId).catch(() => null), // Final bill may not exist
    ]);

    return {
      booking: booking.status === "fulfilled" ? booking.value : null,
      serviceUsages: serviceUsages.status === "fulfilled" ? serviceUsages.value : { data: [] },
      payments: payments.status === "fulfilled" ? payments.value : { data: [] },
      finalBill: finalBill.status === "fulfilled" ? finalBill.value : null,
    };
  },

  // Create booking with initial payment
  async createBookingWithPayment(bookingData: CreateBookingRequest, paymentData?: CreatePaymentRequest) {
    const booking = await bookingApi.createBooking(bookingData);

    if (paymentData && booking.data) {
      const payment = await paymentApi.createPayment({
        ...paymentData,
        booking_id: booking.data.bookingId,
      });

      return {
        booking: booking.data,
        payment: payment.data,
      };
    }

    return {
      booking: booking.data,
      payment: null,
    };
  },

  // Complete checkout process
  async completeCheckout(bookingId: number) {
    // 1. Check out the booking
    const checkoutResult = await bookingApi.checkOutBooking(bookingId);

    // 2. Generate final bill
    const finalBill = await finalBillApi.generateFinalBill(bookingId);

    return {
      booking: checkoutResult.data,
      finalBill: finalBill.data,
    };
  },

  // Get booking dashboard data
  async getDashboardData() {
    const [allBookings] = await Promise.allSettled([bookingApi.getAllBookings()]);

    const bookings = allBookings.status === "fulfilled" ? allBookings.value.data : [];

    // Calculate dashboard statistics
    const stats = {
      totalBookings: bookings.length,
      pendingBookings: bookings.filter((b) => b.bookingStatus === BookingStatusEnum.PENDING).length,
      checkedInBookings: bookings.filter((b) => b.bookingStatus === BookingStatusEnum.CHECKED_IN).length,
      checkedOutBookings: bookings.filter((b) => b.bookingStatus === BookingStatusEnum.CHECKED_OUT).length,
      cancelledBookings: bookings.filter((b) => b.bookingStatus === BookingStatusEnum.CANCELLED).length,
      totalRevenue: bookings
        .filter((b) => b.bookingStatus === BookingStatusEnum.CHECKED_OUT)
        .reduce((sum, b) => sum + (b.total_amount || 0), 0),
    };

    return {
      bookings,
      stats,
    };
  },
};

export default bookingService;
