import { BaseApiService } from "./base";
import type { ApiResponse } from "./base";
import type { Booking, CreateBookingRequest, UpdateBookingRequest } from "../types";

export interface BookingApiParams extends Record<string, unknown> {
  guestId?: number;
  roomId?: number;
  branchId?: number;
}

export interface RoomAvailabilityParams extends Record<string, unknown> {
  roomID: number;
  checkIn: string;
  checkOut: string;
}

export interface RoomAvailabilityResponse {
  message: string;
  conflictingBookings?: unknown[];
}

class BookingApiService extends BaseApiService {
  constructor() {
    super("/booking");
  }

  // Get all bookings with optional filters
  async getAllBookings(params?: BookingApiParams): Promise<ApiResponse<{ bookings: Booking[] }>> {
    const queryParams = this.buildQueryParams(params);
    return this.get<{ bookings: Booking[] }>(this.endpoint, { params: queryParams });
  }

  // Get single booking by ID
  async getBookingById(bookingId: number): Promise<ApiResponse<{ booking: Booking }>> {
    return this.get<{ booking: Booking }>(`${this.endpoint}/${bookingId}`);
  }

  // Create new booking
  async createBooking(bookingData: CreateBookingRequest): Promise<ApiResponse<{ booking: Booking }>> {
    // Transform frontend data to backend format
    const backendData = {
      guestId: bookingData.guest_id,
      roomId: bookingData.room_id,
      checkIn: `${bookingData.check_in_date}T${bookingData.check_in_time}`,
      checkOut: `${bookingData.check_out_date}T${bookingData.check_out_time}`,
    };

    return this.post<{ booking: Booking }>(this.endpoint, backendData);
  }

  // Update booking
  async updateBooking(
    bookingId: number,
    bookingData: UpdateBookingRequest
  ): Promise<ApiResponse<{ booking: Booking }>> {
    // Transform frontend data to backend format
    const backendData: Record<string, unknown> = {};

    if (bookingData.guest_id !== undefined) backendData.guestId = bookingData.guest_id;
    if (bookingData.room_id !== undefined) backendData.roomId = bookingData.room_id;
    if (bookingData.booking_status !== undefined) backendData.bookingStatus = bookingData.booking_status;
    if (bookingData.check_in_date && bookingData.check_in_time) {
      backendData.checkIn = `${bookingData.check_in_date}T${bookingData.check_in_time}`;
    }
    if (bookingData.check_out_date && bookingData.check_out_time) {
      backendData.checkOut = `${bookingData.check_out_date}T${bookingData.check_out_time}`;
    }

    return this.put<{ booking: Booking }>(`${this.endpoint}/${bookingId}`, backendData);
  }

  // Delete booking
  async deleteBooking(bookingId: number): Promise<ApiResponse<void>> {
    return this.delete<void>(`${this.endpoint}/${bookingId}`);
  }

  // Check room availability
  async checkRoomAvailability(params: RoomAvailabilityParams): Promise<ApiResponse<RoomAvailabilityResponse>> {
    const queryParams = this.buildQueryParams(params);
    return this.get<RoomAvailabilityResponse>(`${this.endpoint}/availability`, { params: queryParams });
  }
}

export const bookingApi = new BookingApiService();
export default bookingApi;
