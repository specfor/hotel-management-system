import { BaseApiService } from "./base";
import type { ApiResponse } from "./base";

// Updated Branch interface to match API response
export interface Branch {
  branchid: number;
  branchname: string;
  city: string;
  address: string;
}

// API response wrapper for branches
export interface BranchesApiResponse {
  branchArr: Branch[];
}

// Branch-specific types for API operations
export interface BranchCreateRequest {
  branchName: string;
  city: string;
  address: string;
}

export type BranchUpdateRequest = Partial<BranchCreateRequest>;

export interface BranchFilters extends Record<string, unknown> {
  city?: string;
  search?: string;
  manager_name?: string;
}

export interface BranchStats {
  total_rooms: number;
  occupied_rooms: number;
  available_rooms: number;
  total_staff: number;
  monthly_revenue: number;
}

export interface BranchWithStats extends Branch {
  stats?: BranchStats;
}

// Room type for branch rooms endpoint
export interface Room {
  room_id: number;
  room_number: string;
  room_type: string;
  status: string;
  branch_id: number;
}

// Staff type for branch staff endpoint
export interface Staff {
  staff_id: number;
  name: string;
  email: string;
  job_title: string;
  branch_id: number;
}

// Revenue type for branch revenue endpoint
export interface RevenueReport {
  total_revenue: number;
  period_start: string;
  period_end: string;
  breakdown: {
    rooms: number;
    services: number;
    other: number;
  };
}
class BranchApiService extends BaseApiService {
  constructor() {
    super("/branch");
  }

  // Get all branches with optional filtering
  async getBranches(filters?: BranchFilters): Promise<ApiResponse<Branch[]>> {
    const params = this.buildQueryParams(filters);
    const response = await this.get<BranchesApiResponse>(this.endpoint, { params });

    // Extract branchArr from the nested response
    return {
      success: response.success,
      data: response.data.branchArr,
      message: response.message,
      errors: response.errors,
    };
  }

  // Get branch by ID
  async getBranchById(id: number): Promise<ApiResponse<Branch>> {
    return this.getById<Branch>(id);
  }

  // Get branch with statistics
  async getBranchWithStats(id: number): Promise<ApiResponse<BranchWithStats>> {
    return this.get<BranchWithStats>(`${this.endpoint}/${id}/stats`);
  }

  // Create new branch
  async createBranch(data: BranchCreateRequest): Promise<ApiResponse<Branch>> {
    return this.create<Branch>(data);
  }

  // Update existing branch
  async updateBranch(id: number, data: BranchUpdateRequest): Promise<ApiResponse<Branch>> {
    return this.update<Branch>(id, data);
  }

  // Delete branch
  async deleteBranch(id: number): Promise<ApiResponse<void>> {
    return this.deleteById(id);
  }

  // Get branch rooms
  async getBranchRooms(id: number): Promise<ApiResponse<Room[]>> {
    return this.get<Room[]>(`${this.endpoint}/${id}/rooms`);
  }

  // Get branch staff
  async getBranchStaff(id: number): Promise<ApiResponse<Staff[]>> {
    return this.get<Staff[]>(`${this.endpoint}/${id}/staff`);
  }

  // Get branch revenue report
  async getBranchRevenue(id: number, startDate?: string, endDate?: string): Promise<ApiResponse<RevenueReport>> {
    const params = this.buildQueryParams({ startDate, endDate });
    return this.get<RevenueReport>(`${this.endpoint}/${id}/revenue`, { params });
  }

  // Activate/Deactivate branch
  async toggleBranchStatus(id: number, active: boolean): Promise<ApiResponse<Branch>> {
    return this.patch<Branch>(`${this.endpoint}/${id}/status`, { active });
  }

  // Search branches by name or city
  async searchBranches(query: string): Promise<ApiResponse<Branch[]>> {
    const params = { search: query };
    const response = await this.get<BranchesApiResponse>(`${this.endpoint}/search`, { params });

    // Extract branchArr from the nested response
    return {
      success: response.success,
      data: response.data.branchArr,
      message: response.message,
      errors: response.errors,
    };
  }
}

// Create and export branch API instance
export const branchApi = new BranchApiService();

// Export convenience functions for easier usage
export const getBranches = (filters?: BranchFilters) => branchApi.getBranches(filters);
export const getBranchById = (id: number) => branchApi.getBranchById(id);
export const getBranchWithStats = (id: number) => branchApi.getBranchWithStats(id);
export const createBranch = (data: BranchCreateRequest) => branchApi.createBranch(data);
export const updateBranch = (id: number, data: BranchUpdateRequest) => branchApi.updateBranch(id, data);
export const deleteBranch = (id: number) => branchApi.deleteBranch(id);
export const getBranchRooms = (id: number) => branchApi.getBranchRooms(id);
export const getBranchStaff = (id: number) => branchApi.getBranchStaff(id);
export const getBranchRevenue = (id: number, startDate?: string, endDate?: string) =>
  branchApi.getBranchRevenue(id, startDate, endDate);
export const toggleBranchStatus = (id: number, active: boolean) => branchApi.toggleBranchStatus(id, active);
export const searchBranches = (query: string) => branchApi.searchBranches(query);
