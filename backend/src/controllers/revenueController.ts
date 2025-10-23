import { Request, Response } from "express";
import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";
import { jsonResponse } from "@src/common/util/response";
import {
  getAllRevenue,
  findRevenueById,
  getRevenueByBranch,
  getRevenueByMonth,
  createRevenue,
  updateRevenue,
  deleteRevenue,
} from "@src/repos/revenueRepo";
import {
  RevenueCreate,
  RevenueUpdate,
  RevenueQueryParams,
} from "@src/types/revenueTypes";

//Get all revenue records with pagination and filters
//GET /api/revenue?page=1&limit=30&branch_id=1&month=9&year=2025
//GET /api/revenue?min_amount=1000&max_amount=5000
export async function getRevenueRecords(
  req: Request,
  res: Response,
): Promise<unknown> {
  try {
    // Parse query parameters
    const queryParams: RevenueQueryParams = {
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 30,
      branch_id: req.query.branch_id
        ? parseInt(req.query.branch_id as string)
        : undefined,
      month: req.query.month ? parseInt(req.query.month as string) : undefined,
      year: req.query.year ? parseInt(req.query.year as string) : undefined,
      min_amount: req.query.min_amount
        ? parseFloat(req.query.min_amount as string)
        : undefined,
      max_amount: req.query.max_amount
        ? parseFloat(req.query.max_amount as string)
        : undefined,
    };

    // Validate page and limit
    if (queryParams.page && queryParams.page < 1) {
      queryParams.page = 1;
    }
    if (queryParams.limit && (queryParams.limit < 1 || queryParams.limit > 100)) {
      queryParams.limit = 30; // Max 100 records per page
    }

    // Validate month (1-12)
    if (queryParams.month && (queryParams.month < 1 || queryParams.month > 12)) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        error: "Month must be between 1 and 12",
      });
    }

    const { revenue, totalCount } = await getAllRevenue(queryParams);

    const totalPages = Math.ceil(totalCount / (queryParams.limit ?? 30));
    const currentPage = queryParams.page ?? 1;

    jsonResponse(res, true, HttpStatusCodes.OK, {
      revenue,
      pagination: {
        currentPage,
        totalPages,
        totalRecords: totalCount,
        recordsPerPage: queryParams.limit ?? 30,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
      },
    });
  } catch (error) {
    jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      error: "Failed to fetch revenue records",
      details: String(error),
    });
  }
}

//Get revenue by ID
//GET /api/revenue/:recordId
export async function getRevenueById(
  req: Request,
  res: Response,
): Promise<unknown> {
  try {
    const recordId = parseInt(req.params.recordId);

    if (isNaN(recordId)) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        error: "Invalid record ID",
      });
    }

    const revenue = await findRevenueById(recordId);

    if (!revenue) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        error: "Revenue record not found",
      });
    }

    jsonResponse(res, true, HttpStatusCodes.OK, { revenue });
  } catch (error) {
    jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      error: "Failed to fetch revenue record",
      details: String(error),
    });
  }
}

//Get revenue by branch
//GET /api/revenue/branch/:branchId
export async function getRevenueByBranchId(
  req: Request,
  res: Response,
): Promise<unknown> {
  try {
    const branchId = parseInt(req.params.branchId);

    if (isNaN(branchId)) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        error: "Invalid branch ID",
      });
    }

    const revenue = await getRevenueByBranch(branchId);
    jsonResponse(res, true, HttpStatusCodes.OK, { revenue });
  } catch (error) {
    jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      error: "Failed to fetch revenue by branch",
      details: String(error),
    });
  }
}

//Get revenue by month
//GET /api/revenue/month/:month
export async function getRevenueByMonthNumber(
  req: Request,
  res: Response,
): Promise<unknown> {
  try {
    const month = parseInt(req.params.month);

    if (isNaN(month) || month < 1 || month > 12) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        error: "Invalid month. Must be between 1 and 12",
      });
    }

    const revenue = await getRevenueByMonth(month);
    jsonResponse(res, true, HttpStatusCodes.OK, { revenue });
  } catch (error) {
    jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      error: "Failed to fetch revenue by month",
      details: String(error),
    });
  }
}

//Create new revenue record
//POST /api/revenue
export async function createRevenueRecord(
  req: Request,
  res: Response,
): Promise<unknown> {
  try {
    const revenueData = req.body as RevenueCreate;

    // Validate required fields
    if (
      !revenueData.branch_id ||
      !revenueData.month ||
      !revenueData.calculated_data_time ||
      revenueData.amount === undefined
    ) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        error:
          "Missing required fields: branch_id, month, " +
          "calculated_data_time, amount",
      });
    }

    // Validate month (1-12)
    if (revenueData.month < 1 || revenueData.month > 12) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        error: "Month must be between 1 and 12",
      });
    }

    // Validate amount (must be >= 0 due to CHECK constraint)
    if (revenueData.amount < 0) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        error: "Amount must be greater than or equal to 0",
      });
    }

    const newRevenue = await createRevenue(revenueData);
    jsonResponse(res, true, HttpStatusCodes.OK, {
      message: "Revenue record created successfully",
      revenue: newRevenue,
    });
  } catch (error) {
    jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      error: "Failed to create revenue record",
      details: String(error),
    });
  }
}

//Update revenue record
//PUT /api/revenue/:recordId
export async function updateRevenueRecord(
  req: Request,
  res: Response,
): Promise<unknown> {
  try {
    const recordId = parseInt(req.params.recordId);

    if (isNaN(recordId)) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        error: "Invalid record ID",
      });
    }

    // Check if revenue record exists
    const existingRevenue = await findRevenueById(recordId);
    if (!existingRevenue) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        error: "Revenue record not found",
      });
    }

    const updates = req.body as RevenueUpdate;

    // Validate month if provided
    if (updates.month && (updates.month < 1 || updates.month > 12)) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        error: "Month must be between 1 and 12",
      });
    }

    // Validate amount if provided
    if (updates.amount !== undefined && updates.amount < 0) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        error: "Amount must be greater than or equal to 0",
      });
    }

    const updatedRevenue = await updateRevenue(recordId, updates);

    if (!updatedRevenue) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        error: "No fields to update",
      });
    }

    jsonResponse(res, true, HttpStatusCodes.OK, {
      message: "Revenue record updated successfully",
      revenue: updatedRevenue,
    });
  } catch (error) {
    jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      error: "Failed to update revenue record",
      details: String(error),
    });
  }
}

//Delete revenue record
//DELETE /api/revenue/:recordId
export async function deleteRevenueRecord(
  req: Request,
  res: Response,
): Promise<unknown> {
  try {
    const recordId = parseInt(req.params.recordId);

    if (isNaN(recordId)) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        error: "Invalid record ID",
      });
    }

    // Check if revenue record exists
    const existingRevenue = await findRevenueById(recordId);
    if (!existingRevenue) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        error: "Revenue record not found",
      });
    }

    await deleteRevenue(recordId);

    jsonResponse(res, true, HttpStatusCodes.OK, {
      message: "Revenue record deleted successfully",
    });
  } catch (error) {
    jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      error: "Failed to delete revenue record",
      details: String(error),
    });
  }
}
