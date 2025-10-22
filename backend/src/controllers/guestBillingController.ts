// backend/src/controllers/guestBillingController.ts

import { Request, Response } from "express";
import { jsonResponse } from "@src/common/util/response";
import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";
import logger from "jet-logger";
import { getGuestBillingModel } from "@src/models/guestBillingModel";
import { GuestBillingFilters } from "@src/types/guestBillingTypes";

/**
 * Get guest billing summary with optional filters
 * 
 * Query Parameters:
 * - guestId: Filter by specific guest ID
 * - bookingId: Filter by specific booking ID
 * - paymentStatus: Filter by payment status (Paid, Unpaid, Pending)
 * - hasOutstanding: Filter for bills with outstanding balance (true/false)
 * - minOutstanding: Filter by minimum outstanding amount
 * - startDate: Filter by bill date range start (format: YYYY-MM-DD)
 * - endDate: Filter by bill date range end (format: YYYY-MM-DD)
 * 
 * @route GET /api/reports/guest-billing
 */
export async function getGuestBilling(req: Request, res: Response) {
  try {
    const {
      guestId,
      bookingId,
      paymentStatus,
      hasOutstanding,
      minOutstanding,
      startDate,
      endDate,
    } = req.query;

    // Build filters object
    const filters: GuestBillingFilters = {};

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

    if (paymentStatus && typeof paymentStatus === "string") {
      filters.paymentStatus = paymentStatus;
    }

    if (hasOutstanding === "true") {
      filters.hasOutstanding = true;
    }

    if (minOutstanding) {
      const minOutstandingNum = Number(minOutstanding);
      if (isNaN(minOutstandingNum)) {
        return jsonResponse(
          res,
          false,
          HttpStatusCodes.BAD_REQUEST,
          { message: "Invalid minOutstanding. Must be a number." },
        );
      }
      filters.minOutstanding = minOutstandingNum;
    }

    if (startDate && typeof startDate === "string") {
      filters.startDate = startDate;
    }

    if (endDate && typeof endDate === "string") {
      filters.endDate = endDate;
    }

    // Fetch data
    const billingData = await getGuestBillingModel(filters);

    return jsonResponse(res, true, HttpStatusCodes.OK, {
      billingData,
      count: billingData.length,
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
      { message: "Server error retrieving guest billing data" },
    );
  }
}
