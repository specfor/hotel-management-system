// backend/src/controllers/serviceReportController.ts

import type { Request, Response } from "express";
import serviceReportModel from "@src/models/serviceReportModel";
import logger from "jet-logger";
import { jsonResponse } from "@src/common/util/response";
import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";
import type {
  ServiceUsageBreakdownFilters,
  TopServicesTrendsFilters,
} from "@src/types/serviceReportTypes";

/**
 * Get service usage breakdown
 */
export async function getServiceUsageBreakdown(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const filters: ServiceUsageBreakdownFilters = {
      bookingId: req.query.bookingId
        ? Number(req.query.bookingId)
        : undefined,
      roomId: req.query.roomId ? Number(req.query.roomId) : undefined,
      guestId: req.query.guestId ? Number(req.query.guestId) : undefined,
      serviceId: req.query.serviceId ? Number(req.query.serviceId) : undefined,
      serviceName: req.query.serviceName as string | undefined,
      branchId: req.query.branchId ? Number(req.query.branchId) : undefined,
      city: req.query.city as string | undefined,
      roomType: req.query.roomType as string | undefined,
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
      bookingStatus: req.query.bookingStatus as
        | "Booked"
        | "Checked-In"
        | "Checked-Out"
        | "Cancelled"
        | undefined,
    };

    const data = await serviceReportModel.getServiceUsageBreakdown(filters);

    jsonResponse(res, true, HttpStatusCodes.OK, {
      serviceUsageBreakdown: data,
      totalRecords: data.length,
    });
  } catch (error) {
    logger.err(error);
    jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: "Error retrieving service usage breakdown",
    });
  }
}

/**
 * Get top services and customer preference trends
 */
export async function getTopServicesTrends(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const filters: TopServicesTrendsFilters = {
      serviceId: req.query.serviceId ? Number(req.query.serviceId) : undefined,
      serviceName: req.query.serviceName as string | undefined,
      branchId: req.query.branchId ? Number(req.query.branchId) : undefined,
      city: req.query.city as string | undefined,
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
      minBookings: req.query.minBookings
        ? Number(req.query.minBookings)
        : undefined,
      minRevenue: req.query.minRevenue
        ? Number(req.query.minRevenue)
        : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    };

    const data = await serviceReportModel.getTopServicesTrends(filters);

    jsonResponse(res, true, HttpStatusCodes.OK, {
      topServices: data,
      totalServices: data.length,
    });
  } catch (error) {
    logger.err(error);
    jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: "Error retrieving top services trends",
    });
  }
}

/**
 * Get service usage summary statistics
 */
export async function getServiceUsageSummary(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const data = await serviceReportModel.getServiceUsageSummary();

    jsonResponse(res, true, HttpStatusCodes.OK, {
      summary: data,
    });
  } catch (error) {
    logger.err(error);
    jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: "Error retrieving service usage summary",
    });
  }
}
