// src/controllers/dashboardController.ts

import { Request, Response } from "express";
import { jsonResponse } from "@src/common/util/response";
import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";
import logger from "jet-logger";
import { RouteError } from "@src/common/util/route-errors";
import { getDashboardStatsModel } from "@src/models/dashboardModel"; 


// --- Centralized Error Handler ---
/**
 * Handles errors thrown by the Model layer.
 */
function handleError(res: Response, err: unknown) {
  logger.err(err);

  if (err instanceof RouteError) {
    // Use the status from the Model layer (e.g., 500)
    return jsonResponse(
      res, 
      false, 
      err.status, 
      { message: err.message },
    );
  }

  // Default to a generic 500 server error
  return jsonResponse(
    res, 
    false, 
    HttpStatusCodes.INTERNAL_SERVER_ERROR, 
    { message: "An unexpected server error occurred." },
  );
}

// --- READ Endpoint ---

/**
 * Get all aggregated statistics for the main dashboard view.
 * GET /api/dashboard/stats
 */
export async function getDashboardStats(req: Request, res: Response) {
  try {
    const stats = await getDashboardStatsModel();
    
    // Always return 200 OK on successful aggregation, even if some lists are empty
    return jsonResponse(res, true, HttpStatusCodes.OK, { dashboardStats: stats });
        
  } catch (err) {
    return handleError(res, err);
  }
}