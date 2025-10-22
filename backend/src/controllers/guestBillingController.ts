// backend/src/controllers/guestBillingController.ts

import { Request, Response } from "express";
import guestBillingModel from "@src/models/guestBillingModel";
import type { GuestBillingFilters } from "@src/types/guestBillingTypes";
import { jsonResponse } from "@src/common/util/response";
import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";
import logger from "jet-logger";

/**
 * Get guest billing data with optional filters
 * Query parameters:
 * - guestId: number (optional)
 * - guestName: string (optional)
 * - paymentStatus: string (optional) - 'Paid', 'Unpaid', 'Pending'
 * - branchId: number (optional)
 * - bookingStatus: string (optional)
 * - startDate: string YYYY-MM-DD (optional)
 * - endDate: string YYYY-MM-DD (optional)
 * - minOutstanding: number (optional)
 * - maxOutstanding: number (optional)
 * - hasOverdue: boolean (optional)
 * - includeSummary: boolean (optional)
 */
export async function getGuestBilling(req: Request, res: Response): Promise<void> {
  try {
    const filters: GuestBillingFilters = {
      guestId: req.query.guestId
        ? Number(req.query.guestId)
        : undefined,
      guestName: req.query.guestName as string | undefined,
      paymentStatus: req.query.paymentStatus as string | undefined,
      branchId: req.query.branchId
        ? Number(req.query.branchId)
        : undefined,
      bookingStatus: req.query.bookingStatus as string | undefined,
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
      minOutstanding: req.query.minOutstanding
        ? Number(req.query.minOutstanding)
        : undefined,
      maxOutstanding: req.query.maxOutstanding
        ? Number(req.query.maxOutstanding)
        : undefined,
      hasOverdue: req.query.hasOverdue === "true" ? true :
        req.query.hasOverdue === "false" ? false : undefined,
    };

    const includeSummary = req.query.includeSummary === "true";

    // Get billing data
    const result = await guestBillingModel.getGuestBilling(filters);

    // Optionally get summary statistics
    let summary;
    if (includeSummary) {
      summary = await guestBillingModel.getBillingSummary(filters);
    }

    jsonResponse(
      res,
      true,
      HttpStatusCodes.OK,
      {
        billingData: result,
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
      { error: "Failed to fetch guest billing data" },
    );
  }
}

/**
 * Get billing summary statistics only
 * Query parameters: same as getGuestBilling
 */
export async function getBillingSummary(req: Request, res: Response): Promise<void> {
  try {
    const filters: GuestBillingFilters = {
      guestId: req.query.guestId
        ? Number(req.query.guestId)
        : undefined,
      paymentStatus: req.query.paymentStatus as string | undefined,
      branchId: req.query.branchId
        ? Number(req.query.branchId)
        : undefined,
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
      hasOverdue: req.query.hasOverdue === "true" ? true :
        req.query.hasOverdue === "false" ? false : undefined,
    };

    const summary = await guestBillingModel.getBillingSummary(filters);

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
      { error: "Failed to fetch billing summary" },
    );
  }
}
