import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";
import { jsonResponse } from "@src/common/util/response";
import { Request, Response } from "express";
import Joi from "joi";
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
  try{
    // Extract query params
    const name = typeof req.query.name === "string" ? req.query.name : undefined;
    const nic = typeof req.query.nic === "string" ? req.query.nic : undefined;
    const minAge = typeof req.query.minAge === "string" ? Number(req.query.minAge) : undefined;
    const maxAge = typeof req.query.maxAge === "string" ? Number(req.query.maxAge) : undefined;
    const page = typeof req.query.page === "string" ? Number(req.query.page) : 1;
    const limit = typeof req.query.limit === "string" ? Number(req.query.limit) : 5;

    const guests = await getAllGuests_repo(name, nic, minAge, maxAge, page, limit);
    if (!guests) {
      jsonResponse(res, false, HttpStatusCodes.NOT_FOUND, { error: "No guests found" });
      return;
    }
    jsonResponse(res, true, HttpStatusCodes.OK, { guests });
  } catch (error) {
    jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, { error: "Failed to retrieve guests" });
  }
}

export async function getGuestByID(req: Request, res: Response): Promise<void> {
  try {
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
  } catch (error) {
    jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, { error: "Failed to retrieve guest" });
  }
}

export async function addNewGuest(req: Request, res: Response): Promise<void> {
  // Joi schema for guest creation
  const guestSchema = Joi.object({
    nic: Joi.string().required(),
    name: Joi.string().required(),
    age: Joi.number().integer().min(0).required(),
    contact_no: Joi.string().required(),
    email: Joi.string().email().required(),
  });

  const { error } = guestSchema.validate(req.body);
  if (error) {
    jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, { error: error.details[0].message });
    return;
  }

  try {
    const guest = await addNewGuest_repo(req.body as GuestRepo);
    jsonResponse(res, true, HttpStatusCodes.CREATED, { guest });
  } catch (error) {
    jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, { error: "Failed to add new guest" });
  }
}

export async function updateGuestInfo(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, { error: "Invalid guest ID" });
    return;
  }

  // Joi schema for guest update (fields optional)
  const guestUpdateSchema = Joi.object({
    nic: Joi.string().optional(),
    name: Joi.string().optional(),
    age: Joi.number().integer().min(0).optional(),
    contact_no: Joi.string().optional(),
    email: Joi.string().email().optional(),
  });

  const { error } = guestUpdateSchema.validate(req.body);
  if (error) {
    jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, { error: error.details[0].message });
    return;
  }

  try {
    const guest = await updateGuestInfo_repo(req.body as GuestRepo, id);
    jsonResponse(res, true, HttpStatusCodes.OK, { guest });
  } catch (error) {
    jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, { error: "Failed to update guest information" });
  }
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

