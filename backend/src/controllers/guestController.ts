import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";
import { jsonResponse } from "@src/common/util/response";
import { Request, Response } from "express";
import {
  getAllGuests_repo,
  getGuestByID_repo,
  addNewGuest_repo,
  updateGuestInfo_repo,
  changeGuestPassword_repo,
  deleteGuest_repo,
} from "@src/repos/guestRepo";
import { GuestRepo, GuestPublic, GuestPassword } from "@src/types/guestTypes";

/**
 * Handles the HTTP request to retrieve all guests.
 * 
 * @param req - The Express request object.
 * @param res - The Express response object.
 * @returns A promise that resolves when the response is sent.
 * 
 * Responds with a JSON object containing the list of all guests.
 */
export async function getAllGuests(req: Request, res: Response): Promise<void> {
  const guests = await getAllGuests_repo();
  jsonResponse(res, true, HttpStatusCodes.OK, { guests });
}

export async function getGuestByID(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, { error: "Invalid guest ID" });
    return;
  }
  const guest = await getGuestByID_repo(id);
  
  if (!guest) {
    jsonResponse(res, false, HttpStatusCodes.NOT_FOUND, { error: "Guest not found" });
    return;
  }
  jsonResponse(res, true, HttpStatusCodes.OK, { guest });
}

export async function addNewGuest(req: Request, res: Response): Promise<void> {
  
  const guest = await addNewGuest_repo(req.body as GuestRepo);
  
  jsonResponse(res, true, HttpStatusCodes.OK, { guest });
}

export async function updateGuestInfo(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, { error: "Invalid guest ID" });
    return;
  }
  const guest = await updateGuestInfo_repo(req.body as GuestPublic);
  
  jsonResponse(res, true, HttpStatusCodes.OK, { guest });
}

export async function changeGuestPassword(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, { error: "Invalid guest ID" });
    return;
  }
  await changeGuestPassword_repo(req.body as GuestPassword);
  
  jsonResponse(res, true, HttpStatusCodes.OK, {});
}

export async function deleteGuest(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, { error: "Invalid guest ID" });
    return;
  }
  await deleteGuest_repo(id);
  
  jsonResponse(res, true, HttpStatusCodes.OK, {});
}

