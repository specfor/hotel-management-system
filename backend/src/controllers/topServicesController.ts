// backend/src/controllers/topServicesController.ts

import { Request, Response } from "express";
import { jsonResponse } from "@src/common/util/response";
import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";
import logger from "jet-logger";
import { getTopServicesModel } from "@src/models/topServicesModel";
import { TopServicesFilters } from "@src/types/topServicesTypes";

/**
 * Get top services and customer preference trends with optional filters
 * 
 * Query Parameters:
 * - branchId: Filter by specific branch ID
 * - serviceId: Filter by specific service ID
 * - monthYear: Filter by specific month (format: YYYY-MM)
 * - startDate: Filter by month range start (format: YYYY-MM-DD)
 * - endDate: Filter by month range end (format: YYYY-MM-DD)
 * - topN: Get top N services (by revenue rank)
 * 
 * @route GET /api/reports/top-services
 */
export async function getTopServices(req: Request, res: Response) {
  try {
    const { branchId, serviceId, monthYear, startDate, endDate, topN } =
      req.query;

    // Build filters object
    const filters: TopServicesFilters = {};

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

    if (monthYear && typeof monthYear === "string") {
      filters.monthYear = monthYear;
    }

    if (startDate && typeof startDate === "string") {
      filters.startDate = startDate;
    }

    if (endDate && typeof endDate === "string") {
      filters.endDate = endDate;
    }

    if (topN) {
      const topNNum = Number(topN);
      if (isNaN(topNNum)) {
        return jsonResponse(
          res,
          false,
          HttpStatusCodes.BAD_REQUEST,
          { message: "Invalid topN. Must be a number." },
        );
      }
      filters.topN = topNNum;
    }

    // Fetch data
    const servicesData = await getTopServicesModel(filters);

    return jsonResponse(res, true, HttpStatusCodes.OK, {
      servicesData,
      count: servicesData.length,
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
      { message: "Server error retrieving top services data" },
    );
  }
}
