import { BaseApiService, apiUtils } from "./base";
import type { ApiResponse } from "./base";
import { ServiceUnitType, ServiceDiscountConditionType } from "../types";
import type { ChargeableService, Discount } from "../types";

// Service-specific interfaces
export interface CreateServiceRequest {
  service_name: string;
  branch_id: number;
  unit_type: ServiceUnitType;
  unit_price: number;
}

export interface UpdateServiceRequest extends Partial<CreateServiceRequest> {
  service_id: number;
}

export interface ServiceListParams {
  page?: number;
  pageSize?: number;
  sortBy?: keyof ChargeableService;
  sortOrder?: "asc" | "desc";
  service_name?: string;
  branch_id?: number;
  unit_type?: ServiceUnitType;
}

// Discount-specific interfaces
export interface CreateDiscountRequest {
  discount_name: string;
  branch_id: number;
  discount_rate: number;
  condition_type: ServiceDiscountConditionType;
  condition_value?: number;
  valid_from: string;
  valid_to: string;
  is_active: boolean;
}

export interface UpdateDiscountRequest extends Partial<CreateDiscountRequest> {
  discount_id: number;
}

export interface DiscountListParams {
  page?: number;
  pageSize?: number;
  sortBy?: keyof Discount;
  sortOrder?: "asc" | "desc";
  discount_name?: string;
  branch_id?: number;
  condition_type?: ServiceDiscountConditionType;
  is_active?: boolean;
}

/**
 * Service API Service
 * Handles all chargeable service-related API operations
 */
export class ServiceApiService extends BaseApiService {
  constructor() {
    super("/services");
  }

  /**
   * Get all services with optional filters and pagination
   */
  async getServices(params?: ServiceListParams): Promise<ApiResponse<ChargeableService[]>> {
    try {
      const queryParams = apiUtils.buildParams({
        page: params?.page || 1,
        pageSize: params?.pageSize || 10,
        sortBy: params?.sortBy,
        sortOrder: params?.sortOrder || "desc",
        service_name: params?.service_name,
        branch_id: params?.branch_id,
        unit_type: params?.unit_type,
      });

      return await this.get<ChargeableService[]>(`?${queryParams}`);
    } catch (error) {
      console.error("Error fetching services:", error);
      throw error;
    }
  }

  /**
   * Get a single service by ID
   */
  async getService(serviceId: number): Promise<ApiResponse<ChargeableService>> {
    try {
      return await this.get<ChargeableService>(`/${serviceId}`);
    } catch (error) {
      console.error(`Error fetching service ${serviceId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new service
   */
  async createService(serviceData: CreateServiceRequest): Promise<ApiResponse<ChargeableService>> {
    try {
      const validatedData = this.validateServiceData(serviceData);
      return await this.post<ChargeableService>("", validatedData);
    } catch (error) {
      console.error("Error creating service:", error);
      throw error;
    }
  }

  /**
   * Update an existing service
   */
  async updateService(serviceData: UpdateServiceRequest): Promise<ApiResponse<ChargeableService>> {
    try {
      const { service_id, ...updateData } = serviceData;
      if (!service_id) {
        throw new Error("Service ID is required for update");
      }

      const validatedData = this.validateServiceData(updateData);
      return await this.put<ChargeableService>(`/${service_id}`, validatedData);
    } catch (error) {
      console.error(`Error updating service ${serviceData.service_id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a service
   */
  async deleteService(serviceId: number): Promise<ApiResponse<void>> {
    try {
      return await this.delete<void>(`/${serviceId}`);
    } catch (error) {
      console.error(`Error deleting service ${serviceId}:`, error);
      throw error;
    }
  }

  /**
   * Validate service data
   */
  private validateServiceData(data: Partial<CreateServiceRequest>): Partial<CreateServiceRequest> {
    if (data.service_name !== undefined && !data.service_name.trim()) {
      throw new Error("Service name is required");
    }

    if (data.branch_id !== undefined && (!Number.isInteger(data.branch_id) || data.branch_id <= 0)) {
      throw new Error("Valid branch ID is required");
    }

    if (data.unit_price !== undefined && (typeof data.unit_price !== "number" || data.unit_price <= 0)) {
      throw new Error("Unit price must be a positive number");
    }

    if (data.unit_type !== undefined && !Object.values(ServiceUnitType).includes(data.unit_type)) {
      throw new Error("Valid unit type is required");
    }

    return data;
  }
}

/**
 * Discount API Service
 * Handles all discount-related API operations
 */
export class DiscountApiService extends BaseApiService {
  constructor() {
    super("/discounts");
  }

  /**
   * Get all discounts with optional filters and pagination
   */
  async getDiscounts(params?: DiscountListParams): Promise<ApiResponse<Discount[]>> {
    try {
      const queryParams = apiUtils.buildParams({
        page: params?.page || 1,
        pageSize: params?.pageSize || 10,
        sortBy: params?.sortBy,
        sortOrder: params?.sortOrder || "desc",
        discount_name: params?.discount_name,
        branch_id: params?.branch_id,
        condition_type: params?.condition_type,
        is_active: params?.is_active,
      });

      return await this.get<Discount[]>(`?${queryParams}`);
    } catch (error) {
      console.error("Error fetching discounts:", error);
      throw error;
    }
  }

  /**
   * Get a single discount by ID
   */
  async getDiscount(discountId: number): Promise<ApiResponse<Discount>> {
    try {
      return await this.get<Discount>(`/${discountId}`);
    } catch (error) {
      console.error(`Error fetching discount ${discountId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new discount
   */
  async createDiscount(discountData: CreateDiscountRequest): Promise<ApiResponse<Discount>> {
    try {
      const validatedData = this.validateDiscountData(discountData);
      return await this.post<Discount>("", validatedData);
    } catch (error) {
      console.error("Error creating discount:", error);
      throw error;
    }
  }

  /**
   * Update an existing discount
   */
  async updateDiscount(discountData: UpdateDiscountRequest): Promise<ApiResponse<Discount>> {
    try {
      const { discount_id, ...updateData } = discountData;
      if (!discount_id) {
        throw new Error("Discount ID is required for update");
      }

      const validatedData = this.validateDiscountData(updateData);
      return await this.put<Discount>(`/${discount_id}`, validatedData);
    } catch (error) {
      console.error(`Error updating discount ${discountData.discount_id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a discount
   */
  async deleteDiscount(discountId: number): Promise<ApiResponse<void>> {
    try {
      return await this.delete<void>(`/${discountId}`);
    } catch (error) {
      console.error(`Error deleting discount ${discountId}:`, error);
      throw error;
    }
  }

  /**
   * Toggle discount active status
   */
  async toggleDiscountStatus(discountId: number, isActive: boolean): Promise<ApiResponse<Discount>> {
    try {
      return await this.put<Discount>(`/${discountId}/status`, { is_active: isActive });
    } catch (error) {
      console.error(`Error toggling discount ${discountId} status:`, error);
      throw error;
    }
  }

  /**
   * Validate discount data
   */
  private validateDiscountData(data: Partial<CreateDiscountRequest>): Partial<CreateDiscountRequest> {
    if (data.discount_name !== undefined && !data.discount_name.trim()) {
      throw new Error("Discount name is required");
    }

    if (data.branch_id !== undefined && (!Number.isInteger(data.branch_id) || data.branch_id <= 0)) {
      throw new Error("Valid branch ID is required");
    }

    if (
      data.discount_rate !== undefined &&
      (typeof data.discount_rate !== "number" || data.discount_rate <= 0 || data.discount_rate > 100)
    ) {
      throw new Error("Discount rate must be between 0 and 100");
    }

    if (
      data.condition_type !== undefined &&
      !Object.values(ServiceDiscountConditionType).includes(data.condition_type)
    ) {
      throw new Error("Valid condition type is required");
    }

    if (
      data.condition_value !== undefined &&
      data.condition_value !== null &&
      (typeof data.condition_value !== "number" || data.condition_value < 0)
    ) {
      throw new Error("Condition value must be a non-negative number");
    }

    if (data.valid_from !== undefined && data.valid_to !== undefined) {
      const fromDate = new Date(data.valid_from);
      const toDate = new Date(data.valid_to);
      if (fromDate >= toDate) {
        throw new Error("Valid from date must be before valid to date");
      }
    }

    return data;
  }
}

// Export singleton instances
export const serviceApiService = new ServiceApiService();
export const discountApiService = new DiscountApiService();
