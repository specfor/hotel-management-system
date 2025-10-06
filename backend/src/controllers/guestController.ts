import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";
import { jsonResponse } from "@src/common/util/response";
import { Request, Response } from "express";
import { getAllGuests } from "@src/repos/guestRepo";

export async function getGuests(req: Request, res: Response): Promise<void> {
  const guests = await getAllGuests();
  jsonResponse(res, true, HttpStatusCodes.OK, { guests });
}


