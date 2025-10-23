// backend/src/models/roomOccupancyModel.ts

import type {
  RoomOccupancyFilters,
  RoomOccupancyPublic,
  RoomOccupancySummary,
} from "@src/types/roomOccupancyTypes";
import roomOccupancyRepo from "@src/repos/roomOccupancyRepo";

/**
 * Model for room occupancy report business logic
 */
class RoomOccupancyModel {
  /**
   * Get room occupancy data with optional filters
   * @param filters - Optional filters for the query
   * @returns Array of room occupancy records
   */
  public async getRoomOccupancy(
    filters?: RoomOccupancyFilters,
  ): Promise<RoomOccupancyPublic[]> {
    return await roomOccupancyRepo.getRoomOccupancy(filters);
  }

  /**
   * Get occupancy summary statistics
   * @param filters - Optional filters for the query
   * @returns Summary statistics object
   */
  public async getOccupancySummary(
    filters?: RoomOccupancyFilters,
  ): Promise<RoomOccupancySummary> {
    const summary = await roomOccupancyRepo.getOccupancySummary(filters);
    
    return {
      totalRooms: Number(summary.total_rooms) || 0,
      occupiedRooms: Number(summary.occupied_rooms) || 0,
      availableRooms: Number(summary.available_rooms) || 0,
      reservedRooms: Number(summary.reserved_rooms) || 0,
      maintenanceRooms: Number(summary.maintenance_rooms) || 0,
      occupancyRate: Number(summary.occupancy_rate) || 0,
      totalRevenue: Number(summary.total_revenue) || 0,
    };
  }
}

export default new RoomOccupancyModel();
