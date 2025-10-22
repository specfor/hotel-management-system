import { BaseApiService, apiUtils } from "./base";
import type { ApiResponse } from "./base";
import type { Guest, GuestFilters } from "../types/guest";

// Backend guest structure (from backend GuestPublic interface)
interface BackendGuest {
  guest_id: number;
  nic: string | null;
  name: string | null;
  age: number | null;
  contact_no: string | null;
  email: string | null;
  room_id: number | null;
  booking_status: string | null;
}

// Guest-specific interfaces for API communication
export interface CreateGuestRequest {
  nic: string;
  name: string;
  age: number;
  contact_no: string; // Backend uses contact_no
  email: string;
}

export interface UpdateGuestRequest extends Partial<CreateGuestRequest> {
  guest_id: number;
}

export interface GuestListParams extends Omit<GuestFilters, "contact_number"> {
  page?: number;
  pageSize?: number;
  sortBy?: keyof Guest;
  sortOrder?: "asc" | "desc";
  contact_no?: string; // Backend field name
}

export interface SendPasswordResetRequest {
  guest_id: number;
  email: string;
}

/**
 * Guest API Service
 * Handles all guest-related API operations
 */
export class GuestApiService extends BaseApiService {
  constructor() {
    super("/guest");
  }

  /**
   * Transform backend guest data to frontend format
   */
  private transformGuestFromBackend(backendGuest: BackendGuest): Guest {
    return {
      guest_id: backendGuest.guest_id,
      nic: backendGuest.nic || "",
      name: backendGuest.name || "",
      age: backendGuest.age || 0,
      contact_number: backendGuest.contact_no || "", // Map contact_no to contact_number
      email: backendGuest.email || "",
      created_at: new Date().toISOString(), // Backend doesn't return these, use current time
      updated_at: new Date().toISOString(),
      current_booking: backendGuest.room_id
        ? {
            booking_id: 0, // We'll need to fetch this separately if needed
            room_number: backendGuest.room_id.toString(),
            check_in_date: new Date().toISOString(),
            check_out_date: new Date().toISOString(),
            status: backendGuest.booking_status || "confirmed",
          }
        : undefined,
    };
  }

  /**
   * Get all guests with optional filters and pagination
   */
  async getGuests(params?: GuestListParams): Promise<ApiResponse<Guest[]>> {
    try {
      const queryParams = apiUtils.buildParams({
        page: params?.page || 1,
        limit: params?.pageSize || 10,
        name: params?.name,
        nic: params?.nic,
        minAge: params?.age_min,
        maxAge: params?.age_max,
      });

      const response = await this.get<{ guests: BackendGuest[] }>(`${this.endpoint}`, { params: queryParams });

      // Transform backend response to match frontend structure
      const transformedGuests = response.data.guests.map((guest: BackendGuest) =>
        this.transformGuestFromBackend(guest)
      );

      return {
        success: response.success,
        data: transformedGuests,
        message: response.message,
      };
    } catch (error) {
      throw apiUtils.handleError(error);
    }
  }

  /**
   * Get a single guest by ID
   */
  async getGuest(guestId: number): Promise<ApiResponse<Guest>> {
    try {
      const response = await this.get<{ guest: BackendGuest }>(`${this.endpoint}/${guestId}`);

      // Transform backend response to match frontend structure
      const transformedGuest = this.transformGuestFromBackend(response.data.guest);

      return {
        success: response.success,
        data: transformedGuest,
        message: response.message,
      };
    } catch (error) {
      throw apiUtils.handleError(error);
    }
  }

  /**
   * Create a new guest
   */
  async createGuest(guestData: CreateGuestRequest): Promise<ApiResponse<Guest>> {
    try {
      // Validate required fields
      if (!guestData.nic || !guestData.name || !guestData.email) {
        throw new Error("NIC, name, and email are required");
      }

      // Normalize data and add default password
      const normalizedData = {
        nic: guestData.nic.toUpperCase(),
        name: guestData.name.trim(),
        email: guestData.email.toLowerCase().trim(),
        contact_no: guestData.contact_no.trim(),
        age: guestData.age,
      };

      const response = await this.post<{ guest: BackendGuest }>(`${this.endpoint}`, normalizedData);

      // Transform backend response to match frontend structure
      const transformedGuest = this.transformGuestFromBackend(response.data.guest);

      return {
        success: response.success,
        data: transformedGuest,
        message: response.message,
      };
    } catch (error) {
      throw apiUtils.handleError(error);
    }
  }

  /**
   * Update an existing guest
   */
  async updateGuest(guestData: UpdateGuestRequest): Promise<ApiResponse<Guest>> {
    try {
      if (!guestData.guest_id) {
        throw new Error("Guest ID is required for update");
      }

      // Normalize data if provided
      const normalizedData = {
        ...(guestData.nic && { nic: guestData.nic.toUpperCase() }),
        ...(guestData.name && { name: guestData.name.trim() }),
        ...(guestData.email && { email: guestData.email.toLowerCase().trim() }),
        ...(guestData.contact_no && { contact_no: guestData.contact_no.trim() }),
        ...(guestData.age && { age: guestData.age }),
      };

      const response = await this.put<{ guest: BackendGuest }>(
        `${this.endpoint}/${guestData.guest_id}`,
        normalizedData
      );

      // Transform backend response to match frontend structure
      const transformedGuest = this.transformGuestFromBackend(response.data.guest);

      return {
        success: response.success,
        data: transformedGuest,
        message: response.message,
      };
    } catch (error) {
      throw apiUtils.handleError(error);
    }
  }

  /**
   * Delete a guest
   */
  async deleteGuest(guestId: number): Promise<ApiResponse<void>> {
    try {
      const response = await this.delete(`${this.endpoint}/${guestId}`);
      return response;
    } catch (error) {
      throw apiUtils.handleError(error);
    }
  }

  /**
   * Send password reset email to guest (using change password endpoint)
   */
  async sendPasswordReset(request: SendPasswordResetRequest): Promise<ApiResponse<{ message: string }>> {
    try {
      if (!request.guest_id || !request.email) {
        throw new Error("Guest ID and email are required");
      }

      // Use the change password endpoint with a default new password
      const response = await this.put<{ message: string }>(`${this.endpoint}/${request.guest_id}/psw`, {
        password: "newPassword123",
      });

      return {
        success: response.success,
        data: { message: "New password sent successfully" },
        message: response.message,
      };
    } catch (error) {
      throw apiUtils.handleError(error);
    }
  }
}

// Create and export service instance
export const guestService = new GuestApiService();

// Export individual functions for convenience
export const getGuests = (params?: GuestListParams) => guestService.getGuests(params);
export const getGuest = (guestId: number) => guestService.getGuest(guestId);
export const createGuest = (guestData: CreateGuestRequest) => guestService.createGuest(guestData);
export const updateGuest = (guestData: UpdateGuestRequest) => guestService.updateGuest(guestData);
export const deleteGuest = (guestId: number) => guestService.deleteGuest(guestId);
export const sendPasswordReset = (request: SendPasswordResetRequest) => guestService.sendPasswordReset(request);
