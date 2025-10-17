import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";
import { jsonResponse } from "@src/common/util/response";
import { Request, Response } from "express";

export function getUsers(req: Request, res: Response): void {
  try {
    // TODO: Implement actual database call when userRepo is ready
    const users: unknown[] = []; // Placeholder until getUsersDb is implemented
    jsonResponse(res, true, HttpStatusCodes.OK, { users });
  } catch {
    jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: "Server error",
    });
  }
}
