import { BaseApiService } from "./base";
import type { ApiResponse } from "./base";
import type { Room, RoomType } from "../types/room";

// API request/response interfaces
export interface CreateRoomRequest {
  branchId: number;
  roomType: string;
}

export interface UpdateRoomRequest {
  roomStatus?: string;
  roomTypeName?: string;
}

export interface CreateRoomTypeRequest {
  branchId: number;
  roomTypeName: string;
  dailyRate: number;
  lateCheckoutRate?: number;
  capacity?: number;
  amenities?: string;
}

export interface UpdateRoomTypeRequest {
  dailyRate?: number;
  lateCheckoutRate?: number;
  capacity?: number;
  amenities?: string;
}

export interface RoomFilters {
  type?: string;
  status?: string;
}

// Room API Service
class RoomApiService extends BaseApiService {
  constructor() {
    super("/room");
  }

  // Room operations
  async getAllRooms(): Promise<ApiResponse<Room[]>> {
    const response = await this.get<{ roomArr: Room[] }>("/room");

    if (response.success && response.data?.roomArr) {
      return {
        success: true,
        data: response.data.roomArr,
        message: response.message || "Rooms fetched successfully",
      };
    }

    return {
      success: false,
      data: [],
      message: response.message || "Failed to fetch rooms",
    };
  }

  async getRoomsByBranch(branchId: number, filters?: RoomFilters): Promise<ApiResponse<Room[]>> {
    let queryParams = "";
    if (filters) {
      const params = new URLSearchParams();
      if (filters.type) params.append("type", filters.type);
      if (filters.status) params.append("status", filters.status);
      queryParams = params.toString() ? `?${params.toString()}` : "";
    }

    const response = await this.get<{ details: Room[] }>(`/branch/${branchId}/room${queryParams}`);

    if (response.success && response.data?.details) {
      return {
        success: true,
        data: response.data.details,
        message: response.message || "Rooms fetched successfully",
      };
    }

    return {
      success: false,
      data: [],
      message: response.message || "Failed to fetch rooms",
    };
  }

  async createRoom(request: CreateRoomRequest): Promise<ApiResponse<Room>> {
    const response = await this.post<{ details: Room }>(
      `/branch/${request.branchId}/room?roomType=${request.roomType}`
    );

    if (response.success && response.data?.details) {
      return {
        success: true,
        data: response.data.details,
        message: response.message || "Room created successfully",
      };
    }

    return {
      success: false,
      data: {} as Room,
      message: response.message || "Failed to create room",
    };
  }

  async updateRoom(roomId: number, request: UpdateRoomRequest): Promise<ApiResponse<Room>> {
    const response = await this.put<{ details: Room }>(`/room/${roomId}`, request);

    if (response.success && response.data?.details) {
      return {
        success: true,
        data: response.data.details,
        message: response.message || "Room updated successfully",
      };
    }

    return {
      success: false,
      data: {} as Room,
      message: response.message || "Failed to update room",
    };
  }

  async deleteRoom(roomId: number): Promise<ApiResponse<void>> {
    return this.delete(`/room/${roomId}`);
  }

  // Room Type operations
  async getAllRoomTypes(): Promise<ApiResponse<RoomType[]>> {
    const response = await this.get<RoomType[]>("/room-type");

    if (response.success && response.data) {
      return {
        success: true,
        data: Array.isArray(response.data) ? response.data : [],
        message: response.message || "Room types fetched successfully",
      };
    }

    return {
      success: false,
      data: [],
      message: response.message || "Failed to fetch room types",
    };
  }

  async getRoomTypesByBranch(branchId: number): Promise<ApiResponse<RoomType[]>> {
    const response = await this.get<{ roomTypeArr: RoomType[] }>(`/room-type/${branchId}`);

    if (response.success && response.data?.roomTypeArr) {
      return {
        success: true,
        data: response.data.roomTypeArr,
        message: response.message || "Room types fetched successfully",
      };
    }

    return {
      success: false,
      data: [],
      message: response.message || "Failed to fetch room types",
    };
  }

  async createRoomType(request: CreateRoomTypeRequest): Promise<ApiResponse<RoomType>> {
    const response = await this.post<{ roomType: RoomType }>("/room-type", request);

    if (response.success && response.data?.roomType) {
      return {
        success: true,
        data: response.data.roomType,
        message: response.message || "Room type created successfully",
      };
    }

    return {
      success: false,
      data: {} as RoomType,
      message: response.message || "Failed to create room type",
    };
  }

  async updateRoomType(
    branchId: number,
    roomTypeName: string,
    request: UpdateRoomTypeRequest
  ): Promise<ApiResponse<void>> {
    return this.put(`/room-type/${branchId}/${roomTypeName}`, request);
  }

  async deleteRoomType(branchId: number, roomTypeName: string): Promise<ApiResponse<void>> {
    return this.delete(`/room-type/${branchId}/${roomTypeName}`);
  }
}

// Create and export room API instance
export const roomApi = new RoomApiService();

// Export convenience functions for easier usage
export const getAllRooms = () => roomApi.getAllRooms();
export const getRoomsByBranch = (branchId: number, filters?: RoomFilters) =>
  roomApi.getRoomsByBranch(branchId, filters);
export const createRoom = (request: CreateRoomRequest) => roomApi.createRoom(request);
export const updateRoom = (roomId: number, request: UpdateRoomRequest) => roomApi.updateRoom(roomId, request);
export const deleteRoom = (roomId: number) => roomApi.deleteRoom(roomId);

export const getAllRoomTypes = () => roomApi.getAllRoomTypes();
export const getRoomTypesByBranch = (branchId: number) => roomApi.getRoomTypesByBranch(branchId);
export const createRoomType = (request: CreateRoomTypeRequest) => roomApi.createRoomType(request);
export const updateRoomType = (branchId: number, roomTypeName: string, request: UpdateRoomTypeRequest) =>
  roomApi.updateRoomType(branchId, roomTypeName, request);
export const deleteRoomType = (branchId: number, roomTypeName: string) =>
  roomApi.deleteRoomType(branchId, roomTypeName);
