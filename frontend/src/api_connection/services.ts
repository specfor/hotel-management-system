import { BaseApiService } from "./base";
import type { ApiResponse } from "./base";
import { ServiceUnitType } from "../types";
import type { ChargeableService } from "../types";

// API Response types matching backend controller
export interface ServiceApiResponse {
  serviceId?: number;
  service_id?: number;
  branchId?: number;
  branch_id?: number;
  serviceName?: string;
  service_name?: string;
  unitPrice?: number;
  unit_price?: number;
  unitType?: string;
  unit_type?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ServiceListApiResponse {
  message: string;
  services: ServiceApiResponse[];
}

export interface ServiceSingleApiResponse {
  message: string;
  service?: ServiceApiResponse;
  createdService?: ServiceApiResponse;
  updatedService?: ServiceApiResponse;
}

export interface ServiceCreateRequest {
  branchId: number;
  serviceName: string;
  unitPrice: number;
  unitType: string;
}

export interface ServiceUpdateRequest {
  branchId?: number;
  serviceName?: string;
  unitPrice?: number;
  unitType?: string;
}

class ChargeableServiceApiService extends BaseApiService {
  constructor() {
    super("/service");
  }

  // Transform API response to frontend format
  private transformServiceData(apiService: ServiceApiResponse): ChargeableService {
    return {
      service_id: apiService.serviceId || apiService.service_id || 0,
      service_name: apiService.serviceName || apiService.service_name || "",
      branch_id: apiService.branchId || apiService.branch_id || 0,
      unit_type: (apiService.unitType || apiService.unit_type || ServiceUnitType.PER_ITEM) as ServiceUnitType,
      unit_price: apiService.unitPrice || apiService.unit_price || 0,
      created_at: apiService.created_at || new Date().toISOString(),
      updated_at: apiService.updated_at || new Date().toISOString(),
    };
  }

  // Get all services
  async getServices(): Promise<ApiResponse<ChargeableService[]>> {
    try {
      const response = await this.get<ServiceListApiResponse>(this.endpoint);

      if (response.success && response.data?.services) {
        const transformedServices = response.data.services.map((service) => this.transformServiceData(service));
        return {
          success: true,
          data: transformedServices,
          message: response.data.message,
        };
      }

      return {
        success: false,
        data: [],
        message: response.message || "Failed to fetch services",
      };
    } catch (error) {
      console.error("Error fetching services:", error);
      return {
        success: false,
        data: [],
        message: "Failed to fetch services",
      };
    }
  }

  // Get service by ID
  async getServiceById(id: number): Promise<ApiResponse<ChargeableService>> {
    try {
      const response = await this.get<ServiceSingleApiResponse>(`${this.endpoint}/${id}`);

      if (response.success && response.data?.service) {
        return {
          success: true,
          data: this.transformServiceData(response.data.service),
          message: response.data.message,
        };
      }

      return {
        success: false,
        data: {} as ChargeableService,
        message: response.message || "Failed to fetch service",
      };
    } catch (error) {
      console.error("Error fetching service:", error);
      return {
        success: false,
        data: {} as ChargeableService,
        message: "Failed to fetch service",
      };
    }
  }

  // Create service
  async createService(data: ServiceCreateRequest): Promise<ApiResponse<ChargeableService>> {
    try {
      const response = await this.post<ServiceSingleApiResponse>(this.endpoint, data);

      if (response.success && (response.data?.createdService || response.data?.service)) {
        const serviceData = response.data.createdService || response.data.service!;
        return {
          success: true,
          data: this.transformServiceData(serviceData),
          message: response.data.message,
        };
      }

      return {
        success: false,
        data: {} as ChargeableService,
        message: response.message || "Failed to create service",
      };
    } catch (error) {
      console.error("Error creating service:", error);
      return {
        success: false,
        data: {} as ChargeableService,
        message: "Failed to create service",
      };
    }
  }

  // Update service
  async updateService(id: number, data: ServiceUpdateRequest): Promise<ApiResponse<ChargeableService>> {
    try {
      const response = await this.put<ServiceSingleApiResponse>(`${this.endpoint}/${id}`, data);

      if (response.success && (response.data?.updatedService || response.data?.service)) {
        const serviceData = response.data.updatedService || response.data.service!;
        return {
          success: true,
          data: this.transformServiceData(serviceData),
          message: response.data.message,
        };
      }

      return {
        success: false,
        data: {} as ChargeableService,
        message: response.message || "Failed to update service",
      };
    } catch (error) {
      console.error("Error updating service:", error);
      return {
        success: false,
        data: {} as ChargeableService,
        message: "Failed to update service",
      };
    }
  }

  // Delete service
  async deleteService(id: number): Promise<ApiResponse<void>> {
    try {
      const response = await this.delete(`${this.endpoint}/${id}`);
      return response;
    } catch (error) {
      console.error("Error deleting service:", error);
      return {
        success: false,
        data: undefined,
        message: "Failed to delete service",
      };
    }
  }
}

// Create and export service API instance
export const chargeableServiceApi = new ChargeableServiceApiService();

// Export convenience functions
export const getServices = () => chargeableServiceApi.getServices();
export const getServiceById = (id: number) => chargeableServiceApi.getServiceById(id);
export const createService = (data: ServiceCreateRequest) => chargeableServiceApi.createService(data);
export const updateService = (id: number, data: ServiceUpdateRequest) => chargeableServiceApi.updateService(id, data);
export const deleteService = (id: number) => chargeableServiceApi.deleteService(id);
