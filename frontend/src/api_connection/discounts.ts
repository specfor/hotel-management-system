import { BaseApiService } from "./base";
import type { ApiResponse } from "./base";
import type { Discount as FrontendDiscount, DiscountConditionType } from "../types/service";

// API Response types matching backend controller
export interface DiscountApiResponse {
  discount_id?: number;
  discountId?: number;
  branch_id?: number;
  branchId?: number;
  discount_name?: string;
  discountName?: string;
  discount_type?: string;
  discountType?: string;
  discount_value?: number;
  discountValue?: number;
  min_bill_amount?: number;
  minBillAmount?: number;
  discount_condition?: string;
  discountCondition?: string;
  valid_from?: string;
  validFrom?: string;
  valid_to?: string;
  validTo?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DiscountListApiResponse {
  message: string;
  details: DiscountApiResponse[];
}

export interface DiscountSingleApiResponse {
  message: string;
  details: DiscountApiResponse;
}

export interface DiscountCreateRequest {
  branchId: number;
  discountName: string;
  discountType: "fixed" | "percentage";
  discountValue: number;
  minBillAmount?: number;
  discountCondition: string;
  validFrom: string;
  validTo: string;
}

export interface DiscountUpdateRequest {
  branchId?: number;
  discountName?: string;
  discountType?: "fixed" | "percentage";
  discountValue?: number;
  minBillAmount?: number;
  discountCondition?: string;
  validFrom?: string;
  validTo?: string;
}

class DiscountApiService extends BaseApiService {
  constructor() {
    super("/discount");
  }

  // Transform API response to frontend format
  private transformDiscountData(apiDiscount: DiscountApiResponse): FrontendDiscount {
    return {
      discount_id: apiDiscount.discount_id || apiDiscount.discountId || 0,
      discount_name: apiDiscount.discount_name || apiDiscount.discountName || "",
      branch_id: apiDiscount.branch_id || apiDiscount.branchId || 0,
      discount_rate: apiDiscount.discount_value || apiDiscount.discountValue || 0,
      condition_type: (apiDiscount.discount_condition ||
        apiDiscount.discountCondition ||
        "seasonal") as DiscountConditionType,
      condition_value: apiDiscount.min_bill_amount || apiDiscount.minBillAmount,
      valid_from: apiDiscount.valid_from || apiDiscount.validFrom || "",
      valid_to: apiDiscount.valid_to || apiDiscount.validTo || "",
      is_active: true, // Assuming active since backend doesn't specify
      created_at: apiDiscount.created_at || new Date().toISOString(),
      updated_at: apiDiscount.updated_at || new Date().toISOString(),
    };
  }

  // Get all discounts
  async getDiscounts(): Promise<ApiResponse<FrontendDiscount[]>> {
    try {
      const response = await this.get<DiscountListApiResponse>(this.endpoint);

      if (response.success && response.data?.details) {
        const transformedDiscounts = response.data.details.map((discount) => this.transformDiscountData(discount));
        return {
          success: true,
          data: transformedDiscounts,
          message: response.data.message,
        };
      }

      return {
        success: false,
        data: [],
        message: response.message || "Failed to fetch discounts",
      };
    } catch (error) {
      console.error("Error fetching discounts:", error);
      return {
        success: false,
        data: [],
        message: "Failed to fetch discounts",
      };
    }
  }

  // Get discount by ID
  async getDiscountById(id: number): Promise<ApiResponse<FrontendDiscount>> {
    try {
      const response = await this.get<DiscountSingleApiResponse>(`${this.endpoint}/${id}`);

      if (response.success && response.data?.details) {
        return {
          success: true,
          data: this.transformDiscountData(response.data.details),
          message: response.data.message,
        };
      }

      return {
        success: false,
        data: {} as FrontendDiscount,
        message: response.message || "Failed to fetch discount",
      };
    } catch (error) {
      console.error("Error fetching discount:", error);
      return {
        success: false,
        data: {} as FrontendDiscount,
        message: "Failed to fetch discount",
      };
    }
  }

  // Get discounts by branch
  async getDiscountsByBranch(branchId: number): Promise<ApiResponse<FrontendDiscount[]>> {
    try {
      const response = await this.get<DiscountListApiResponse>(`${this.endpoint}/branch/${branchId}`);

      if (response.success && response.data?.details) {
        const transformedDiscounts = response.data.details.map((discount) => this.transformDiscountData(discount));
        return {
          success: true,
          data: transformedDiscounts,
          message: response.data.message,
        };
      }

      return {
        success: false,
        data: [],
        message: response.message || "Failed to fetch discounts",
      };
    } catch (error) {
      console.error("Error fetching discounts:", error);
      return {
        success: false,
        data: [],
        message: "Failed to fetch discounts",
      };
    }
  }

  // Create discount
  async createDiscount(data: DiscountCreateRequest): Promise<ApiResponse<FrontendDiscount>> {
    try {
      const response = await this.post<DiscountSingleApiResponse>(this.endpoint, data);

      if (response.success && response.data?.details) {
        return {
          success: true,
          data: this.transformDiscountData(response.data.details),
          message: response.data.message,
        };
      }

      return {
        success: false,
        data: {} as FrontendDiscount,
        message: response.message || "Failed to create discount",
      };
    } catch (error) {
      console.error("Error creating discount:", error);
      return {
        success: false,
        data: {} as FrontendDiscount,
        message: "Failed to create discount",
      };
    }
  }

  // Update discount
  async updateDiscount(id: number, data: DiscountUpdateRequest): Promise<ApiResponse<FrontendDiscount>> {
    try {
      const response = await this.put<DiscountSingleApiResponse>(`${this.endpoint}/${id}`, data);

      if (response.success && response.data?.details) {
        return {
          success: true,
          data: this.transformDiscountData(response.data.details),
          message: response.data.message,
        };
      }

      return {
        success: false,
        data: {} as FrontendDiscount,
        message: response.message || "Failed to update discount",
      };
    } catch (error) {
      console.error("Error updating discount:", error);
      return {
        success: false,
        data: {} as FrontendDiscount,
        message: "Failed to update discount",
      };
    }
  }

  // Delete discount
  async deleteDiscount(id: number): Promise<ApiResponse<void>> {
    try {
      const response = await this.deleteById(id);
      return response;
    } catch (error) {
      console.error("Error deleting discount:", error);
      return {
        success: false,
        data: undefined,
        message: "Failed to delete discount",
      };
    }
  }
}

// Create and export discount API instance
export const discountApi = new DiscountApiService();

// Export convenience functions
export const getDiscounts = () => discountApi.getDiscounts();
export const getDiscountById = (id: number) => discountApi.getDiscountById(id);
export const getDiscountsByBranch = (branchId: number) => discountApi.getDiscountsByBranch(branchId);
export const createDiscount = (data: DiscountCreateRequest) => discountApi.createDiscount(data);
export const updateDiscount = (id: number, data: DiscountUpdateRequest) => discountApi.updateDiscount(id, data);
export const deleteDiscount = (id: number) => discountApi.deleteDiscount(id);
