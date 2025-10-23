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
    // Use the new simplified format that matches the backend
    const backendData = {
      guestId: bookingData.guestId,
      roomId: bookingData.roomId,
      checkIn: bookingData.checkIn,
      checkOut: bookingData.checkOut,
    };

    return this.post<{ booking: Booking }>(this.endpoint, backendData);
  }

  // Update booking
  async updateBooking(
    bookingId: number,
    bookingData: UpdateBookingRequest
  ): Promise<ApiResponse<{ booking: Booking }>> {
    // Use the new simplified format that matches the backend
    const backendData: Record<string, unknown> = {};

    if (bookingData.guestId !== undefined) backendData.guestId = bookingData.guestId;
    if (bookingData.roomId !== undefined) backendData.roomId = bookingData.roomId;
    if (bookingData.checkIn !== undefined) backendData.checkIn = bookingData.checkIn;
    if (bookingData.checkOut !== undefined) backendData.checkOut = bookingData.checkOut;

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
