// backend/src/controllers/monthlyRevenueController.ts

import { Request, Response } from "express";
import { jsonResponse } from "@src/common/util/response";
import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";
import logger from "jet-logger";
import { getMonthlyRevenueModel } from "@src/models/monthlyRevenueModel";
import { MonthlyRevenueFilters } from "@src/types/monthlyRevenueTypes";

/**
 * Get monthly revenue per branch with optional filters
 * 
 * Query Parameters:
 * - branchId: Filter by specific branch ID
 * - monthYear: Filter by specific month (format: YYYY-MM)
 * - startDate: Filter by start date (format: YYYY-MM-DD)
 * - endDate: Filter by end date (format: YYYY-MM-DD)
 * - city: Filter by city name
 * 
 * @route GET /api/monthly-revenue
 */
export async function getMonthlyRevenue(req: Request, res: Response) {
  try {
    const { branchId, monthYear, startDate, endDate, city } = req.query;

    // Build filters object
    const filters: MonthlyRevenueFilters = {};

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

    if (monthYear && typeof monthYear === "string") {
      filters.monthYear = monthYear;
    }

    if (startDate && typeof startDate === "string") {
      filters.startDate = startDate;
    }

    if (endDate && typeof endDate === "string") {
      filters.endDate = endDate;
    }

    if (city && typeof city === "string") {
      filters.city = city;
    }

    // Fetch data
    const revenueData = await getMonthlyRevenueModel(filters);

    return jsonResponse(res, true, HttpStatusCodes.OK, { 
      revenueData,
      count: revenueData.length,
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
      { message: "Server error retrieving monthly revenue data" },
    );
  }
}
