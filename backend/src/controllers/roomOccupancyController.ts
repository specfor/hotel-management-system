// backend/src/controllers/roomOccupancyController.ts

import { Request, Response } from "express";
import roomOccupancyModel from "@src/models/roomOccupancyModel";
import type { RoomOccupancyFilters } from "@src/types/roomOccupancyTypes";
import { jsonResponse } from "@src/common/util/response";
import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";
import logger from "jet-logger";

/**
 * Get room occupancy data with optional filters
 * Query parameters:
 * - branchId: number (optional)
 * - roomType: string (optional)
 * - occupancyStatus: string (optional)
 * - bookingStatus: string (optional)
 * - roomStatus: string (optional)
 * - checkInDate: string YYYY-MM-DD (optional)
 * - checkOutDate: string YYYY-MM-DD (optional)
 * - startDate: string YYYY-MM-DD (optional)
 * - endDate: string YYYY-MM-DD (optional)
 * - city: string (optional)
 * - guestName: string (optional)
 * - includeSummary: boolean (optional) - include summary statistics
 */
export async function getRoomOccupancy(req: Request, res: Response): Promise<void> {
  try {
    const filters: RoomOccupancyFilters = {
      branchId: req.query.branchId
        ? Number(req.query.branchId)
        : undefined,
      roomType: req.query.roomType as string | undefined,
      occupancyStatus: req.query.occupancyStatus as string | undefined,
      bookingStatus: req.query.bookingStatus as string | undefined,
      roomStatus: req.query.roomStatus as string | undefined,
      checkInDate: req.query.checkInDate as string | undefined,
      checkOutDate: req.query.checkOutDate as string | undefined,
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
      city: req.query.city as string | undefined,
      guestName: req.query.guestName as string | undefined,
    };

    const includeSummary = req.query.includeSummary === "true";

    // Get occupancy data
    const result = await roomOccupancyModel.getRoomOccupancy(filters);

    // Optionally get summary statistics
    let summary;
    if (includeSummary) {
      summary = await roomOccupancyModel.getOccupancySummary(filters);
    }

    jsonResponse(
      res,
      true,
      HttpStatusCodes.OK,
      {
        occupancyData: result,
        count: result.length,
        ...(summary && { summary }),
      },
    );
  } catch (err) {
    logger.err(err);
    jsonResponse(
      res,
      false,
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      { error: "Failed to fetch room occupancy data" },
    );
  }
}

/**
 * Get occupancy summary statistics only
 * Query parameters: same as getRoomOccupancy
 */
export async function getOccupancySummary(req: Request, res: Response): Promise<void> {
  try {
    const filters: RoomOccupancyFilters = {
      branchId: req.query.branchId
        ? Number(req.query.branchId)
        : undefined,
      city: req.query.city as string | undefined,
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
    };

    const summary = await roomOccupancyModel.getOccupancySummary(filters);

    jsonResponse(
      res,
      true,
      HttpStatusCodes.OK,
      summary,
    );
  } catch (err) {
    logger.err(err);
    jsonResponse(
      res,
      false,
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      { error: "Failed to fetch occupancy summary" },
    );
  }
}

