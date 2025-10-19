import { BaseApiService, apiUtils } from "./base";
import type { ApiResponse } from "./base";
import type { Guest, GuestFilters } from "../types/guest";

// Guest-specific interfaces
export interface CreateGuestRequest {
  nic: string;
  name: string;
  age: number;
  contact_number: string;
  email: string;
}

export interface UpdateGuestRequest extends Partial<CreateGuestRequest> {
  guest_id: number;
}

export interface GuestListParams extends GuestFilters {
  page?: number;
  pageSize?: number;
  sortBy?: keyof Guest;
  sortOrder?: "asc" | "desc";
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
    super("/guests");
  }

  /**
   * Get all guests with optional filters and pagination
   */
  async getGuests(params?: GuestListParams): Promise<ApiResponse<Guest[]>> {
    try {
      const queryParams = apiUtils.buildParams({
        page: params?.page || 1,
        pageSize: params?.pageSize || 10,
        sortBy: params?.sortBy,
        sortOrder: params?.sortOrder || "desc",
        name: params?.name,
        nic: params?.nic,
        email: params?.email,
        contact_number: params?.contact_number,
        age_min: params?.age_min,
        age_max: params?.age_max,
      });

      const response = await this.getAll<Guest>(queryParams);
      return response;
    } catch (error) {
      throw apiUtils.handleError(error);
    }
  }

  /**
   * Get a single guest by ID
   */
  async getGuest(guestId: number): Promise<ApiResponse<Guest>> {
    try {
      const response = await this.getById<Guest>(guestId);
      return response;
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

      // Normalize data
      const normalizedData = {
        ...guestData,
        nic: guestData.nic.toUpperCase(),
        name: guestData.name.trim(),
        email: guestData.email.toLowerCase().trim(),
        contact_number: guestData.contact_number.trim(),
      };

      const response = await this.create<Guest>(normalizedData);
      return response;
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
        ...guestData,
        ...(guestData.nic && { nic: guestData.nic.toUpperCase() }),
        ...(guestData.name && { name: guestData.name.trim() }),
        ...(guestData.email && { email: guestData.email.toLowerCase().trim() }),
        ...(guestData.contact_number && { contact_number: guestData.contact_number.trim() }),
      };

      const { guest_id, ...updateData } = normalizedData;
      const response = await this.update<Guest>(guest_id, updateData);
      return response;
    } catch (error) {
      throw apiUtils.handleError(error);
    }
  }

  /**
   * Delete a guest
   */
  async deleteGuest(guestId: number): Promise<ApiResponse<void>> {
    try {
      const response = await this.deleteById(guestId);
      return response;
    } catch (error) {
      throw apiUtils.handleError(error);
    }
  }

  /**
   * Send password reset email to guest
   */
  async sendPasswordReset(request: SendPasswordResetRequest): Promise<ApiResponse<{ message: string }>> {
    try {
      if (!request.guest_id || !request.email) {
        throw new Error("Guest ID and email are required");
      }

      const response = await this.post<{ message: string }>(
        `${this.endpoint}/${request.guest_id}/send-password-reset`,
        { email: request.email }
      );

      return response;
    } catch (error) {
      throw apiUtils.handleError(error);
    }
  }

  /**
   * Get guest booking history
   */
  async getGuestBookings(
    guestId: number,
    params?: { page?: number; pageSize?: number }
  ): Promise<ApiResponse<unknown[]>> {
    try {
      const queryParams = apiUtils.buildParams({
        page: params?.page || 1,
        pageSize: params?.pageSize || 10,
      });

      const response = await this.get<unknown[]>(`${this.endpoint}/${guestId}/bookings`, { params: queryParams });

      return response;
    } catch (error) {
      throw apiUtils.handleError(error);
    }
  }

  /**
   * Search guests by various criteria
   */
  async searchGuests(query: string, filters?: Partial<GuestFilters>): Promise<ApiResponse<Guest[]>> {
    try {
      const queryParams = apiUtils.buildParams({
        q: query,
        ...filters,
      });

      const response = await this.get<Guest[]>(`${this.endpoint}/search`, { params: queryParams });

      return response;
    } catch (error) {
      throw apiUtils.handleError(error);
    }
  }

  /**
   * Check if NIC exists in the system
   */
  async checkNicExists(nic: string, excludeGuestId?: number): Promise<ApiResponse<{ exists: boolean }>> {
    try {
      const queryParams = apiUtils.buildParams({
        nic: nic.toUpperCase(),
        exclude: excludeGuestId,
      });

      const response = await this.get<{ exists: boolean }>(`${this.endpoint}/check-nic`, { params: queryParams });

      return response;
    } catch (error) {
      throw apiUtils.handleError(error);
    }
  }

  /**
   * Get guest statistics
   */
  async getGuestStats(): Promise<
    ApiResponse<{
      totalGuests: number;
      newGuestsThisMonth: number;
      activeBookings: number;
      averageAge: number;
    }>
  > {
    try {
      const response = await this.get<{
        totalGuests: number;
        newGuestsThisMonth: number;
        activeBookings: number;
        averageAge: number;
      }>(`${this.endpoint}/stats`);

      return response;
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
export const getGuestBookings = (guestId: number, params?: { page?: number; pageSize?: number }) =>
  guestService.getGuestBookings(guestId, params);
export const searchGuests = (query: string, filters?: Partial<GuestFilters>) =>
  guestService.searchGuests(query, filters);
export const checkNicExists = (nic: string, excludeGuestId?: number) =>
  guestService.checkNicExists(nic, excludeGuestId);
export const getGuestStats = () => guestService.getGuestStats();
