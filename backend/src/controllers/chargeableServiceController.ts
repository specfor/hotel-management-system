/* eslint-disable max-len */
// backend/src/controllers/chargeableServiceController.ts

import { Request, Response } from "express";
import { jsonResponse } from "@src/common/util/response";
import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";
import logger from "jet-logger";
import { RouteError } from "@src/common/util/route-errors"; // Necessary to catch Model errors
import { 
  getAllChargeableServicesModel,
  getChargeableServiceByIDModel,
  createChargeableServiceModel,
  updateChargeableServiceModel,
  deleteChargeableServiceModel,
  IncomingChargeableServiceUpdateData,  // Interface from Model for input clarity
} from "@src/models/chargeableServiceModel";
import { ChargeableServiceCreate } from "@src/types/chargeableServiceTypes";


// --- Centralized Error Handler ---
/**
 * Handles errors thrown by the Model layer, translating RouteErrors into specific HTTP responses.
 */
function handleError(res: Response, err: unknown) {
  logger.err(err);

  if (err instanceof RouteError) {
    // If it's a known business logic error (400, 404), use its status
    return jsonResponse(
      res, 
      false, 
      err.status, 
      { message: err.message },
    );
  }

  // Default to a generic 500 server error
  return jsonResponse(
    res, 
    false, 
    HttpStatusCodes.INTERNAL_SERVER_ERROR, 
    { message: "An unexpected server error occurred." },
  );
}


// --- READ Endpoints ---

/**
 * Get all chargeable services. (READ All)
 */
export async function getAllChargeableServices(req: Request, res: Response) {
  try {
    // Model returns an empty array on success if none are found, so we return 200 OK.
    const services = await getAllChargeableServicesModel();
    return jsonResponse(res, true, HttpStatusCodes.OK, { services });
        
  } catch (err) {
    return handleError(res, err);
  }
}

/**
 * Get a single chargeable service by ID. (READ One)
 */
export async function getChargeableServiceByID(req: Request, res: Response) {
  try {
    const serviceIDInt: number = parseInt(req.params.serviceID, 10);

    // Controller's Job: Basic parameter check
    if (isNaN(serviceIDInt)) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, { message: "Service ID must be a valid number" });
    }

    // Call the Model. Model throws 404 if not found.
    const service = await getChargeableServiceByIDModel(serviceIDInt);

    return jsonResponse(res, true, HttpStatusCodes.OK, { service });

  } catch (err) {
    // Catches 404 (Not Found) or 500 thrown by the Model
    return handleError(res, err);
  }
}

/**
 * Create a new chargeable service. (CREATE)
 */
export async function createChargeableService(req: Request, res: Response) {
  try {
    // Pass the raw request body to the Model. 
    const createdService = await createChargeableServiceModel(req.body as ChargeableServiceCreate);

    // If no error was thrown, creation succeeded.
    return jsonResponse(res, true, HttpStatusCodes.CREATED, { message: "Service created successfully", createdService });
        
  } catch (err) {
    // Catches validation (400) and internal server errors (500) from the Model.
    return handleError(res, err);
  }
}

/**
 * Update an existing chargeable service. (UPDATE)
 */
export async function updateChargeableService(req: Request, res: Response) {
  try {
    const serviceIDInt: number = parseInt(req.params.serviceID, 10);

    if (isNaN(serviceIDInt)) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, { message: "Service ID must be a valid number" });
    }

    if (Object.keys(req.body as Record<string, unknown>).length === 0) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, { message: "At least one field must be provided for update" });
    }

    const updateInput: IncomingChargeableServiceUpdateData = { 
      serviceId: serviceIDInt,
      ...(req.body as Omit<IncomingChargeableServiceUpdateData, "serviceId">),
    };
        
    const updatedService = await updateChargeableServiceModel(updateInput);

    return jsonResponse(res, true, HttpStatusCodes.OK, { message: "Service updated successfully", updatedService });

  } catch (err) {
    // Catches validation (400) and Not Found (404) errors from the Model.
    return handleError(res, err);
  }
}

/**
 * Delete a chargeable service by ID. (DELETE)
 */
export async function deleteChargeableService(req: Request, res: Response) {
  try {
    const serviceIDInt: number = parseInt(req.params.serviceID, 10);

    if (isNaN(serviceIDInt)) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, { message: "Service ID must be a valid number" });
    }

    // Call the Model. Model handles the existence check and throws 404 if not found.
    await deleteChargeableServiceModel(serviceIDInt);

    // If no error was thrown, deletion succeeded.
    return jsonResponse(res, true, HttpStatusCodes.OK, { message: "Service deleted successfully" });
        
  } catch (err) {
    // Catches Not Found (404) errors from the Model.
    return handleError(res, err);
  }
}
