import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";
import { jsonResponse } from "@src/common/util/response";
import { Request, Response } from "express";

export function getUsers(req: Request, res: Response): void {
  // Logic to get users from database or service
  let users = getUsersDb();
  jsonResponse({ res, success: true, status: HttpStatusCodes.OK, data: { users } });
}
