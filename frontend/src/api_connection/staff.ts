import { BaseApiService } from "./base";
import type { ApiResponse } from "./base";
import type { Staff, JobTitle, StaffFilters } from "../types/staff";

// Staff-specific types for API operations
export interface StaffCreateRequest {
  name: string;
  branch_id: number;
  contact_number: string;
  email: string;
  job_title: JobTitle;
  salary: number;
}

export type StaffUpdateRequest = Partial<StaffCreateRequest>;

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

  // Get all staff with optional filtering
  async getStaff(filters?: StaffFilters & Record<string, unknown>): Promise<ApiResponse<Staff[]>> {
    const params = this.buildQueryParams(filters);
    return this.getAll<Staff>(params);
  }

  // Get staff by ID
  async getStaffById(id: number): Promise<ApiResponse<Staff>> {
    return this.getById<Staff>(id);
  }

  // Create new staff member
  async createStaff(data: StaffCreateRequest): Promise<ApiResponse<Staff>> {
    return this.create<Staff>(data);
  }

  // Update existing staff member
  async updateStaff(id: number, data: StaffUpdateRequest): Promise<ApiResponse<Staff>> {
    return this.update<Staff>(id, data);
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
