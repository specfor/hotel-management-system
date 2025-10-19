import { BaseApiService } from "./base";
import type { ApiResponse } from "./base";
import type { Staff, StaffFilters } from "../types/staff";
import { JobTitle } from "../types/staff"; // Regular import for enum usage

// Staff-specific types for API operations
export interface StaffCreateRequest {
  name: string;
  branch_id: number;
  contact_no: string;
  email: string;
  job_title: JobTitle;
  salary: number;
}

export type StaffUpdateRequest = Partial<StaffCreateRequest>;

// API Response types (what comes from backend)
export interface StaffApiResponse {
  staff_id: number;
  branch_id: number;
  name: string;
  contact_no: string;
  email: string;
  job_title: string; // API returns string, not enum
  salary: string; // API returns string, not number
  branch_name?: string;
}

export interface StaffUpdateApiResponse {
  message: string;
  staff: StaffApiResponse;
}

export interface StaffListApiResponse {
  staff: StaffApiResponse[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    recordsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface StaffPasswordResetRequest {
  staff_id: number;
  email: string;
}

export interface StaffPasswordResetResponse {
  message: string;
  email_sent: boolean;
}

// Staff API service class
class StaffApiService extends BaseApiService {
  constructor() {
    super("/staff");
  }

  // Transform API response to frontend format
  private transformStaffData(apiStaff: StaffApiResponse): Staff {
    return {
      staff_id: apiStaff.staff_id,
      branch_id: apiStaff.branch_id,
      name: apiStaff.name,
      contact_number: apiStaff.contact_no, // Transform field name
      email: apiStaff.email,
      job_title: this.normalizeJobTitle(apiStaff.job_title), // Transform to enum
      salary: parseFloat(apiStaff.salary), // Transform to number
      branch_name: apiStaff.branch_name,
    };
  }

  // Normalize job title from API string to frontend enum
  private normalizeJobTitle(jobTitle: string): JobTitle {
    const normalized = jobTitle.toLowerCase().trim();
    switch (normalized) {
      case "manager":
        return JobTitle.MANAGER;
      case "receptionist":
        return JobTitle.RECEPTIONIST;
      case "housekeeping":
        return JobTitle.HOUSEKEEPING;
      case "maintenance":
        return JobTitle.MAINTENANCE;
      case "security":
        return JobTitle.SECURITY;
      case "chef":
        return JobTitle.CHEF;
      case "waiter":
        return JobTitle.WAITER;
      case "accountant":
        return JobTitle.ACCOUNTANT;
      case "hr":
        return JobTitle.HR;
      case "it_support":
      case "it support":
        return JobTitle.IT_SUPPORT;
      default:
        console.warn(`Unknown job title: "${jobTitle}", defaulting to RECEPTIONIST`);
        return JobTitle.RECEPTIONIST;
    }
  }

  // Get all staff with optional filtering
  async getStaff(filters?: StaffFilters & Record<string, unknown>): Promise<ApiResponse<Staff[]>> {
    try {
      const params = this.buildQueryParams(filters);
      const response = await this.get<StaffListApiResponse>(this.endpoint, { params });

      if (response.success && response.data?.staff) {
        // Transform the staff data from API format to frontend format
        const transformedStaff = response.data.staff.map((staff) => this.transformStaffData(staff));
        return {
          success: true,
          data: transformedStaff,
          message: response.message,
        };
      }

      return {
        success: false,
        data: [],
        message: response.message || "Failed to fetch staff data",
      };
    } catch (error) {
      console.error("Error fetching staff:", error);
      return {
        success: false,
        data: [],
        message: "Failed to fetch staff data",
      };
    }
  }

  // Get staff by ID
  async getStaffById(id: number): Promise<ApiResponse<Staff>> {
    try {
      const response = await this.getById<StaffApiResponse>(id);
      if (response.success && response.data) {
        return {
          success: true,
          data: this.transformStaffData(response.data),
          message: response.message,
        };
      }
      return {
        success: false,
        data: {} as Staff,
        message: response.message || "Failed to fetch staff data",
      };
    } catch (error) {
      console.error("Error fetching staff by ID:", error);
      return {
        success: false,
        data: {} as Staff,
        message: "Failed to fetch staff data",
      };
    }
  }

  // Create new staff member
  async createStaff(data: StaffCreateRequest): Promise<ApiResponse<Staff>> {
    try {
      // Transform frontend data to API format
      const apiData = {
        ...data,
        salary: data.salary.toString(), // Convert number to string for API
      };
      const response = await this.create(apiData);

      if (response.success && response.data) {
        // Handle both possible response formats
        let staffData: StaffApiResponse;
        const responseData = response.data as unknown;

        if (responseData && typeof responseData === "object" && "staff" in responseData) {
          // Response format: { message: string, staff: StaffApiResponse }
          staffData = (responseData as StaffUpdateApiResponse).staff;
        } else {
          // Response format: StaffApiResponse directly
          staffData = responseData as StaffApiResponse;
        }

        return {
          success: true,
          data: this.transformStaffData(staffData),
          message: response.message,
        };
      }
      return {
        success: false,
        data: {} as Staff,
        message: response.message || "Failed to create staff member",
      };
    } catch (error) {
      console.error("Error creating staff:", error);
      return {
        success: false,
        data: {} as Staff,
        message: "Failed to create staff member",
      };
    }
  }

  // Update existing staff member
  async updateStaff(id: number, data: StaffUpdateRequest): Promise<ApiResponse<Staff>> {
    try {
      // Transform frontend data to API format
      const apiData: Partial<StaffApiResponse> = {};

      if (data.name !== undefined) apiData.name = data.name;
      if (data.branch_id !== undefined) apiData.branch_id = data.branch_id;
      if (data.contact_no !== undefined) apiData.contact_no = data.contact_no;
      if (data.email !== undefined) apiData.email = data.email;
      if (data.job_title !== undefined) apiData.job_title = data.job_title;
      if (data.salary !== undefined) apiData.salary = data.salary.toString();

      const response = await this.update(id, apiData);

      if (response.success && response.data) {
        // Handle both possible response formats
        let staffData: StaffApiResponse;
        const responseData = response.data as unknown;

        if (responseData && typeof responseData === "object" && "staff" in responseData) {
          // Response format: { message: string, staff: StaffApiResponse }
          staffData = (responseData as StaffUpdateApiResponse).staff;
        } else {
          // Response format: StaffApiResponse directly
          staffData = responseData as StaffApiResponse;
        }

        return {
          success: true,
          data: this.transformStaffData(staffData),
          message: response.message,
        };
      }
      return {
        success: false,
        data: {} as Staff,
        message: response.message || "Failed to update staff member",
      };
    } catch (error) {
      console.error("Error updating staff:", error);
      return {
        success: false,
        data: {} as Staff,
        message: "Failed to update staff member",
      };
    }
  }

  // Delete staff member
  async deleteStaff(id: number): Promise<ApiResponse<void>> {
    return this.deleteById(id);
  }

  // Send password reset email
  async sendPasswordReset(staffId: number): Promise<ApiResponse<StaffPasswordResetResponse>> {
    return this.post<StaffPasswordResetResponse>(`${this.endpoint}/${staffId}/password-reset`);
  }

  // Get staff by branch
  async getStaffByBranch(branchId: number): Promise<ApiResponse<Staff[]>> {
    const params = { branch_id: branchId };
    return this.get<Staff[]>(`${this.endpoint}/by-branch`, { params });
  }

  // Get staff by job title
  async getStaffByJobTitle(jobTitle: JobTitle): Promise<ApiResponse<Staff[]>> {
    const params = { job_title: jobTitle };
    return this.get<Staff[]>(`${this.endpoint}/by-job-title`, { params });
  }

  // Search staff by name or email
  async searchStaff(query: string): Promise<ApiResponse<Staff[]>> {
    const params = { search: query };
    return this.get<Staff[]>(`${this.endpoint}/search`, { params });
  }

  // Update staff status (active/inactive)
  async updateStaffStatus(id: number, active: boolean): Promise<ApiResponse<Staff>> {
    return this.patch<Staff>(`${this.endpoint}/${id}/status`, { active });
  }

  // Bulk operations
  async bulkUpdateStaff(updates: Array<{ id: number; data: StaffUpdateRequest }>): Promise<ApiResponse<Staff[]>> {
    return this.post<Staff[]>(`${this.endpoint}/bulk-update`, { updates });
  }

  async bulkDeleteStaff(ids: number[]): Promise<ApiResponse<void>> {
    return this.post<void>(`${this.endpoint}/bulk-delete`, { ids });
  }
}

// Create and export staff API instance
export const staffApi = new StaffApiService();

// Export convenience functions for easier usage
export const getStaff = (filters?: StaffFilters & Record<string, unknown>) => staffApi.getStaff(filters);
export const getStaffById = (id: number) => staffApi.getStaffById(id);
export const createStaff = (data: StaffCreateRequest) => staffApi.createStaff(data);
export const updateStaff = (id: number, data: StaffUpdateRequest) => staffApi.updateStaff(id, data);
export const deleteStaff = (id: number) => staffApi.deleteStaff(id);
export const sendPasswordReset = (staffId: number) => staffApi.sendPasswordReset(staffId);
export const getStaffByBranch = (branchId: number) => staffApi.getStaffByBranch(branchId);
export const getStaffByJobTitle = (jobTitle: JobTitle) => staffApi.getStaffByJobTitle(jobTitle);
export const searchStaff = (query: string) => staffApi.searchStaff(query);
export const updateStaffStatus = (id: number, active: boolean) => staffApi.updateStaffStatus(id, active);
export const bulkUpdateStaff = (updates: Array<{ id: number; data: StaffUpdateRequest }>) =>
  staffApi.bulkUpdateStaff(updates);
export const bulkDeleteStaff = (ids: number[]) => staffApi.bulkDeleteStaff(ids);
