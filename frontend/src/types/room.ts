// Room related types
export interface Room {
  room_id: number;
  room_number: string;
  branch_id: number;
  room_type_id: number;
  status: RoomStatus;
  created_at: string;
  updated_at: string;
  // Populated fields for display
  branch_name?: string;
  room_type_name?: string;
}

export interface RoomType {
  roomtypeid: number;
  branchid: number;
  roomtypename: string;
  dailyrate: number;
  latecheckoutrate: number;
  capacity: number;
  amenities: string[] | string;
  created_at: string;
  updated_at: string;
  // Populated fields for display
  // branch_name?: string;
}

export const RoomStatus = {
  AVAILABLE: "available",
  OCCUPIED: "occupied",
  MAINTENANCE: "maintenance",
  CLEANING: "cleaning",
  OUT_OF_ORDER: "out_of_order",
} as const;

export type RoomStatus = (typeof RoomStatus)[keyof typeof RoomStatus];

// Filter interfaces
export interface RoomFilters {
  room_number?: string;
  branch_id?: number;
  room_type_id?: number;
  status?: RoomStatus;
}

export interface RoomTypeFilters {
  room_type_name?: string;
  branch_id?: number;
  daily_rate_min?: number;
  daily_rate_max?: number;
}

// Branch interface for dropdowns
export interface Branch {
  branch_id: number;
  branch_name: string;
  city: string;
  address: string;
}
