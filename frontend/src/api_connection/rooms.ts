import { BaseApiService } from "./base";
import type { ApiResponse } from "./base";
import type { Room, RoomType, RoomStatus, RoomFilters, RoomTypeFilters } from "../types/room";

// Room-specific types for API operations
export interface RoomCreateRequest {
  room_number: string;
  branch_id: number;
  room_type_id: number;
  status: RoomStatus;
}

export type RoomUpdateRequest = Partial<RoomCreateRequest>;

export interface RoomTypeCreateRequest {
  branch_id: number;
  room_type_name: string;
  daily_rate: number;
  late_checkout_rate: number;
  capacity: number;
  amenities: string[];
}

export type RoomTypeUpdateRequest = Partial<RoomTypeCreateRequest>;

export interface RoomAvailabilityQuery extends Record<string, unknown> {
  branch_id?: number;
  check_in: string;
  check_out: string;
  capacity?: number;
}

export interface AvailableRoom extends Room {
  room_type_details: RoomType;
}

// Room API service class
class RoomApiService extends BaseApiService {
  constructor() {
    super("/rooms");
  }

  // Room CRUD operations
  async getRooms(filters?: RoomFilters & Record<string, unknown>): Promise<ApiResponse<Room[]>> {
    const params = this.buildQueryParams(filters);
    return this.getAll<Room>(params);
  }

  async getRoomById(id: number): Promise<ApiResponse<Room>> {
    return this.getById<Room>(id);
  }

  async createRoom(data: RoomCreateRequest): Promise<ApiResponse<Room>> {
    return this.create<Room>(data);
  }

  async updateRoom(id: number, data: RoomUpdateRequest): Promise<ApiResponse<Room>> {
    return this.update<Room>(id, data);
  }

  async deleteRoom(id: number): Promise<ApiResponse<void>> {
    return this.deleteById(id);
  }

  // Room status operations
  async updateRoomStatus(id: number, status: RoomStatus): Promise<ApiResponse<Room>> {
    return this.patch<Room>(`${this.endpoint}/${id}/status`, { status });
  }

  async getRoomsByStatus(status: RoomStatus): Promise<ApiResponse<Room[]>> {
    const params = { status };
    return this.get<Room[]>(`${this.endpoint}/by-status`, { params });
  }

  async getRoomsByBranch(branchId: number): Promise<ApiResponse<Room[]>> {
    const params = { branch_id: branchId };
    return this.get<Room[]>(`${this.endpoint}/by-branch`, { params });
  }

  // Room availability
  async getAvailableRooms(query: RoomAvailabilityQuery): Promise<ApiResponse<AvailableRoom[]>> {
    const params = this.buildQueryParams(query);
    return this.get<AvailableRoom[]>(`${this.endpoint}/available`, { params });
  }

  async checkRoomAvailability(
    roomId: number,
    checkIn: string,
    checkOut: string
  ): Promise<ApiResponse<{ available: boolean }>> {
    const params = this.buildQueryParams({ check_in: checkIn, check_out: checkOut });
    return this.get<{ available: boolean }>(`${this.endpoint}/${roomId}/availability`, { params });
  }

  // Bulk operations
  async bulkUpdateRoomStatus(roomIds: number[], status: RoomStatus): Promise<ApiResponse<Room[]>> {
    return this.post<Room[]>(`${this.endpoint}/bulk-status-update`, { room_ids: roomIds, status });
  }
}

// Room Type API service class
class RoomTypeApiService extends BaseApiService {
  constructor() {
    super("/room-types");
  }

  // Room Type CRUD operations
  async getRoomTypes(filters?: RoomTypeFilters & Record<string, unknown>): Promise<ApiResponse<RoomType[]>> {
    const params = this.buildQueryParams(filters);
    return this.getAll<RoomType>(params);
  }

  async getRoomTypeById(id: number): Promise<ApiResponse<RoomType>> {
    return this.getById<RoomType>(id);
  }

  async createRoomType(data: RoomTypeCreateRequest): Promise<ApiResponse<RoomType>> {
    return this.create<RoomType>(data);
  }

  async updateRoomType(id: number, data: RoomTypeUpdateRequest): Promise<ApiResponse<RoomType>> {
    return this.update<RoomType>(id, data);
  }

  async deleteRoomType(id: number): Promise<ApiResponse<void>> {
    return this.deleteById(id);
  }

  async getRoomTypesByBranch(branchId: number): Promise<ApiResponse<RoomType[]>> {
    const params = { branch_id: branchId };
    return this.get<RoomType[]>(`${this.endpoint}/by-branch`, { params });
  }

  async searchRoomTypes(query: string): Promise<ApiResponse<RoomType[]>> {
    const params = { search: query };
    return this.get<RoomType[]>(`${this.endpoint}/search`, { params });
  }
}

// Create and export API instances
export const roomApi = new RoomApiService();
export const roomTypeApi = new RoomTypeApiService();

// Export convenience functions for rooms
export const getRooms = (filters?: RoomFilters & Record<string, unknown>) => roomApi.getRooms(filters);
export const getRoomById = (id: number) => roomApi.getRoomById(id);
export const createRoom = (data: RoomCreateRequest) => roomApi.createRoom(data);
export const updateRoom = (id: number, data: RoomUpdateRequest) => roomApi.updateRoom(id, data);
export const deleteRoom = (id: number) => roomApi.deleteRoom(id);
export const updateRoomStatus = (id: number, status: RoomStatus) => roomApi.updateRoomStatus(id, status);
export const getRoomsByStatus = (status: RoomStatus) => roomApi.getRoomsByStatus(status);
export const getRoomsByBranch = (branchId: number) => roomApi.getRoomsByBranch(branchId);
export const getAvailableRooms = (query: RoomAvailabilityQuery) => roomApi.getAvailableRooms(query);
export const checkRoomAvailability = (roomId: number, checkIn: string, checkOut: string) =>
  roomApi.checkRoomAvailability(roomId, checkIn, checkOut);
export const bulkUpdateRoomStatus = (roomIds: number[], status: RoomStatus) =>
  roomApi.bulkUpdateRoomStatus(roomIds, status);

// Export convenience functions for room types
export const getRoomTypes = (filters?: RoomTypeFilters & Record<string, unknown>) => roomTypeApi.getRoomTypes(filters);
export const getRoomTypeById = (id: number) => roomTypeApi.getRoomTypeById(id);
export const createRoomType = (data: RoomTypeCreateRequest) => roomTypeApi.createRoomType(data);
export const updateRoomType = (id: number, data: RoomTypeUpdateRequest) => roomTypeApi.updateRoomType(id, data);
export const deleteRoomType = (id: number) => roomTypeApi.deleteRoomType(id);
export const getRoomTypesByBranch = (branchId: number) => roomTypeApi.getRoomTypesByBranch(branchId);
export const searchRoomTypes = (query: string) => roomTypeApi.searchRoomTypes(query);
