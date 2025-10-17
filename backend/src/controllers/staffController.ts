import { Request, Response } from "express";
import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";
import { jsonResponse } from "@src/common/util/response";
import {
  getAllStaff,
  findStaffById,
  findStaffByEmail,
  getStaffByBranch,
  createStaff,
  updateStaff,
  deleteStaff,
} from "@src/repos/staffRepo";
import { StaffCreate, StaffUpdate, StaffQueryParams } from "@src/types/staffTypes";

//Get all staff members with pagination and filters
//GET /api/staff?page=1&limit=30&branch_id=1&job_title=Manager&name=Alice
export async function getStaffMembers(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    // Parse query parameters
    const queryParams: StaffQueryParams = {
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 30,
      branch_id: req.query.branch_id
        ? parseInt(req.query.branch_id as string)
        : undefined,
      job_title: req.query.job_title as string,
      name: req.query.name as string,
    };

    // Validate page and limit
    if (queryParams.page && queryParams.page < 1) {
      queryParams.page = 1;
    }
    if (queryParams.limit && (queryParams.limit < 1 || queryParams.limit > 100)) {
      queryParams.limit = 30; // Max 100 records per page
    }

    const { staff, totalCount } = await getAllStaff(queryParams);

    const totalPages = Math.ceil(totalCount / (queryParams.limit ?? 30));
    const currentPage = queryParams.page ?? 1;

    jsonResponse(res, true, HttpStatusCodes.OK, {
      staff,
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
      error: "Failed to fetch staff members",
      details: String(error),
    });
  }
}

//Get staff member by ID
//GET /api/staff/:staffId
export async function getStaffById(
  req: Request,
  res: Response,
): Promise<unknown> {
  try {
    const staffId = parseInt(req.params.staffId);

    if (isNaN(staffId)) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        error: "Invalid staff ID",
      });
    }

    const staff = await findStaffById(staffId);

    if (!staff) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        error: "Staff member not found",
      });
    }

    jsonResponse(res, true, HttpStatusCodes.OK, { staff });
  } catch (error) {
    jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      error: "Failed to fetch staff member",
      details: String(error),
    });
  }
}

//Get staff members by branch
//GET /api/staff/branch/:branchId
export async function getStaffByBranchId(
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

    const staff = await getStaffByBranch(branchId);
    jsonResponse(res, true, HttpStatusCodes.OK, { staff });
  } catch (error) {
    jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      error: "Failed to fetch staff members by branch",
      details: String(error),
    });
  }
}

//Create new staff member
//POST /api/staff
export async function createStaffMember(
  req: Request,
  res: Response,
): Promise<unknown> {
  try {
    const staffData = req.body as StaffCreate;

    // Validate required fields
    if (
      !staffData.branch_id ||
      !staffData.name ||
      !staffData.contact_no ||
      !staffData.email ||
      !staffData.job_title ||
      staffData.salary === undefined
    ) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        error:
          "Missing required fields: branch_id, name, contact_no, " +
          "email, job_title, salary",
      });
    }

    // Check if email already exists
    const existingStaff = await findStaffByEmail(staffData.email);
    if (existingStaff) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        error: "Staff member with this email already exists",
      });
    }

    const newStaff = await createStaff(staffData);
    jsonResponse(res, true, HttpStatusCodes.OK, {
      message: "Staff member created successfully",
      staff: newStaff,
    });
  } catch (error) {
    jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      error: "Failed to create staff member",
      details: String(error),
    });
  }
}

//Update staff member
//PUT /api/staff/:staffId
export async function updateStaffMember(
  req: Request,
  res: Response,
): Promise<unknown> {
  try {
    const staffId = parseInt(req.params.staffId);

    if (isNaN(staffId)) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        error: "Invalid staff ID",
      });
    }

    // Check if staff exists
    const existingStaff = await findStaffById(staffId);
    if (!existingStaff) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        error: "Staff member not found",
      });
    }

    const updates = req.body as StaffUpdate;

    // If updating email, check it's not taken by another staff member
    if (updates.email && updates.email !== existingStaff.email) {
      const emailExists = await findStaffByEmail(updates.email);
      if (emailExists) {
        return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
          error: "Email already in use by another staff member",
        });
      }
    }

    const updatedStaff = await updateStaff(staffId, updates);

    if (!updatedStaff) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        error: "No fields to update",
      });
    }

    jsonResponse(res, true, HttpStatusCodes.OK, {
      message: "Staff member updated successfully",
      staff: updatedStaff,
    });
  } catch (error) {
    jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      error: "Failed to update staff member",
      details: String(error),
    });
  }
}

//Delete staff member
//DELETE /api/staff/:staffId
export async function deleteStaffMember(
  req: Request,
  res: Response,
): Promise<unknown> {
  try {
    const staffId = parseInt(req.params.staffId);

    if (isNaN(staffId)) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        error: "Invalid staff ID",
      });
    }

    // Check if staff exists
    const existingStaff = await findStaffById(staffId);
    if (!existingStaff) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        error: "Staff member not found",
      });
    }

    await deleteStaff(staffId);

    jsonResponse(res, true, HttpStatusCodes.OK, {
      message: "Staff member deleted successfully",
    });
  } catch (error) {
    jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      error: "Failed to delete staff member",
      details: String(error),
    });
  }
}
