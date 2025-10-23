import { BaseApiService } from "./base";
import type { ApiResponse } from "./base";
import type { ServiceUsage } from "../types";

export interface ServiceUsageCreateRequest {
  booking_id: number;
  service_id: number;
  usage_date: string;
  usage_time: string;
  quantity: number;
  notes?: string;
}

export interface ServiceUsageUpdateRequest {
  service_id?: number;
  usage_date?: string;
  usage_time?: string;
  quantity?: number;
  notes?: string;
}

class ServiceUsageApiService extends BaseApiService {
  constructor() {
    super("/service-usage");
  }

  // Get all service usage records
  async getAllServiceUsage(): Promise<ApiResponse<{ usageRecords: ServiceUsage[] }>> {
    return this.get<{ usageRecords: ServiceUsage[] }>(this.endpoint);
  }

  // Get service usage by booking ID (filtering client-side for now)
  async getServiceUsageByBookingId(bookingId: number): Promise<ApiResponse<{ usageRecords: ServiceUsage[] }>> {
    const response = await this.getAllServiceUsage();
    if (response.success && response.data.usageRecords) {
      const filteredRecords = response.data.usageRecords.filter((usage) => usage.booking_id === bookingId);
      return {
        ...response,
        data: { usageRecords: filteredRecords },
      };
    }
    return response;
  }

  // Get single service usage record by ID
  async getServiceUsageById(recordId: number): Promise<ApiResponse<{ usageRecord: ServiceUsage }>> {
    return this.get<{ usageRecord: ServiceUsage }>(`${this.endpoint}/${recordId}`);
  }

  // Create new service usage record
  async createServiceUsage(
    usageData: ServiceUsageCreateRequest
  ): Promise<ApiResponse<{ createdRecord: ServiceUsage }>> {
    // Transform frontend data to backend format
    const backendData = {
      bookingId: usageData.booking_id,
      serviceId: usageData.service_id,
      quantity: usageData.quantity,
      notes: usageData.notes,
    };

    return this.post<{ createdRecord: ServiceUsage }>(this.endpoint, backendData);
  }

  // Update service usage record
  async updateServiceUsage(
    recordId: number,
    usageData: ServiceUsageUpdateRequest
  ): Promise<ApiResponse<{ updatedRecord: ServiceUsage }>> {
    // Transform frontend data to backend format
    const backendData: Record<string, unknown> = {};

    if (usageData.service_id !== undefined) backendData.serviceId = usageData.service_id;
    if (usageData.usage_date !== undefined) backendData.usageDate = usageData.usage_date;
    if (usageData.usage_time !== undefined) backendData.usageTime = usageData.usage_time;
    if (usageData.quantity !== undefined) backendData.quantity = usageData.quantity;
    if (usageData.notes !== undefined) backendData.notes = usageData.notes;

    return this.put<{ updatedRecord: ServiceUsage }>(`${this.endpoint}/${recordId}`, backendData);
  }

  // Delete service usage record
  async deleteServiceUsage(recordId: number): Promise<ApiResponse<void>> {
    return this.delete<void>(`${this.endpoint}/${recordId}`);
  }
}

export const serviceUsageApi = new ServiceUsageApiService();
export default serviceUsageApi;
