import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";
import { jsonResponse } from "@src/common/util/response";
import { Request, Response } from "express";
import { getAllUsers } from "@src/repos/userRepo";

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
