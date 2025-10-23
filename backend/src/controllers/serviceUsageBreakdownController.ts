// backend/src/controllers/serviceUsageBreakdownController.ts

import { Request, Response } from "express";
import { jsonResponse } from "@src/common/util/response";
import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";
import logger from "jet-logger";
import { getServiceUsageBreakdownModel } from "@src/models/serviceUsageBreakdownModel";
import { ServiceUsageBreakdownFilters } from "@src/types/serviceUsageBreakdownTypes";

/**
 * Get service usage breakdown with optional filters
 * 
 * Query Parameters:
 * - bookingId: Filter by specific booking ID
 * - roomId: Filter by specific room ID
 * - branchId: Filter by specific branch ID
 * - serviceId: Filter by specific service ID
 * - guestId: Filter by specific guest ID
 * - serviceName: Filter by service name (partial match)
 * - startDate: Filter by usage date range start (format: YYYY-MM-DD)
 * - endDate: Filter by usage date range end (format: YYYY-MM-DD)
 * 
 * @route GET /api/reports/service-usage-breakdown
 */
export async function getServiceUsageBreakdown(req: Request, res: Response) {
  try {
    const {
      bookingId,
      roomId,
      branchId,
      serviceId,
      guestId,
      serviceName,
      startDate,
      endDate,
    } = req.query;

    // Build filters object
    const filters: ServiceUsageBreakdownFilters = {};

    if (bookingId) {
      const bookingIdNum = Number(bookingId);
      if (isNaN(bookingIdNum)) {
        return jsonResponse(
          res,
          false,
          HttpStatusCodes.BAD_REQUEST,
          { message: "Invalid bookingId. Must be a number." },
        );
      }
      filters.bookingId = bookingIdNum;
    }

    if (roomId) {
      const roomIdNum = Number(roomId);
      if (isNaN(roomIdNum)) {
        return jsonResponse(
          res,
          false,
          HttpStatusCodes.BAD_REQUEST,
          { message: "Invalid roomId. Must be a number." },
        );
      }
      filters.roomId = roomIdNum;
    }

    if (branchId) {
      const branchIdNum = Number(branchId);
      if (isNaN(branchIdNum)) {
        return jsonResponse(
          res,
          false,
          HttpStatusCodes.BAD_REQUEST,
          { message: "Invalid branchId. Must be a number." },
        );
      }
      filters.branchId = branchIdNum;
    }

    if (serviceId) {
      const serviceIdNum = Number(serviceId);
      if (isNaN(serviceIdNum)) {
        return jsonResponse(
          res,
          false,
          HttpStatusCodes.BAD_REQUEST,
          { message: "Invalid serviceId. Must be a number." },
        );
      }
      filters.serviceId = serviceIdNum;
    }

    if (guestId) {
      const guestIdNum = Number(guestId);
      if (isNaN(guestIdNum)) {
        return jsonResponse(
          res,
          false,
          HttpStatusCodes.BAD_REQUEST,
          { message: "Invalid guestId. Must be a number." },
        );
      }
      filters.guestId = guestIdNum;
    }

    if (serviceName && typeof serviceName === "string") {
      filters.serviceName = serviceName;
    }

    if (startDate && typeof startDate === "string") {
      filters.startDate = startDate;
    }

    if (endDate && typeof endDate === "string") {
      filters.endDate = endDate;
    }

    // Fetch data
    const usageData = await getServiceUsageBreakdownModel(filters);

    return jsonResponse(res, true, HttpStatusCodes.OK, {
      usageData,
      count: usageData.length,
    });
  } catch (err) {
    logger.err(err);

    // Handle validation errors
    if (err instanceof Error && err.message.includes("Invalid")) {
      return jsonResponse(
        res,
        false,
        HttpStatusCodes.BAD_REQUEST,
        { message: err.message },
      );
    }

    return jsonResponse(
      res,
      false,
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      { message: "Server error retrieving service usage data" },
    );
  }
}
