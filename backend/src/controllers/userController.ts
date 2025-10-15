import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";
import { jsonResponse } from "@src/common/util/response";
import { Request, Response } from "express";
import {
  getAllUsers,
  findUserByStaffId,
  findUserByUsername,
  deleteUser,
} from "@src/repos/userRepo";

//Get all users
//GET /api/users
export async function getUsers(req: Request, res: Response): Promise<void> {
  try {
    const users = await getAllUsers();
    jsonResponse(res, true, HttpStatusCodes.OK, { users });
  } catch (error) {
    jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      error: "Failed to fetch users",
      details: String(error),
    });
  }
}

//Get user by staff ID
//GET /api/users/staff/:staffId
export async function getUserByStaffId(
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

    const user = await findUserByStaffId(staffId);

    if (!user) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        error: "User not found",
      });
    }

    // Return user without password_hash
    jsonResponse(res, true, HttpStatusCodes.OK, {
      user: {
        staff_id: user.staff_id,
        username: user.username,
      },
    });
  } catch (error) {
    jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      error: "Failed to fetch user",
      details: String(error),
    });
  }
}

//Get user by username
//GET /api/users/username/:username
export async function getUserByUsername(
  req: Request,
  res: Response,
): Promise<unknown> {
  try {
    const { username } = req.params;

    if (!username) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        error: "Username is required",
      });
    }

    const user = await findUserByUsername(username);

    if (!user) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        error: "User not found",
      });
    }

    // Return user without password_hash
    jsonResponse(res, true, HttpStatusCodes.OK, {
      user: {
        staff_id: user.staff_id,
        username: user.username,
      },
    });
  } catch (error) {
    jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      error: "Failed to fetch user",
      details: String(error),
    });
  }
}

//Delete user by staff ID
//DELETE /api/users/:staffId
export async function deleteUserByStaffId(
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

    // Check if user exists
    const user = await findUserByStaffId(staffId);
    if (!user) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        error: "User not found",
      });
    }

    await deleteUser(staffId);

    jsonResponse(res, true, HttpStatusCodes.OK, {
      message: "User deleted successfully",
    });
  } catch (error) {
    jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      error: "Failed to delete user",
      details: String(error),
    });
  }
}
