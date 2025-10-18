/* eslint-disable max-len */
// backend/src/controllers/serviceUsageController.ts

import { Request, Response } from "express";
import { jsonResponse } from "@src/common/util/response";
import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";
import logger from "jet-logger";
import { RouteError } from "@src/common/util/route-errors"; // Necessary to catch Model errors
import { ServiceUsageCreate } from "@src/types/serviceUsageTypes";
import { 
  getAllServiceUsageModel,
  getServiceUsageByIDModel,
  createServiceUsageModel,
  updateServiceUsageModel,
  deleteServiceUsageModel,
  IncomingServiceUsageUpdateData, // Interface from Model for input clarity
} from "@src/models/serviceUsageModel";

// --- Centralized Error Handler ---
/**
 * Handles errors thrown by the Model layer, translating RouteErrors into specific HTTP responses.
 */
function handleError(res: Response, err: unknown) {
  logger.err(err);

  if (err instanceof RouteError) {
    // If it's a known business logic error (400, 404, etc.), use its status
    return jsonResponse(
      res, 
      false, 
      err.status, 
      { message: err.message },
    );
  }

  // Default to a generic 500 internal server error
  return jsonResponse(
    res, 
    false, 
    HttpStatusCodes.INTERNAL_SERVER_ERROR, 
    { message: "An unexpected server error occurred." },
  );
}

// --- READ Endpoints ---

/**
 * Get all service usage records. (READ All)
 */
export async function getAllServiceUsage(req: Request, res: Response) {
  try {
    // Model handles fetching and returns an empty array if none are found (200 OK)
    const usageRecords = await getAllServiceUsageModel();
        
    // Note: The Model guarantees an array is returned, so we just return 200 OK.
    return jsonResponse(res, true, HttpStatusCodes.OK, { usageRecords });
  } catch (err) {
    return handleError(res, err);
  }
}

/**
 * Get a single service usage record by ID. (READ One)
 */
export async function getServiceUsageByID(req: Request, res: Response) {
  try {
    const recordIDInt: number = parseInt(req.params.recordID, 10);

    // Controller's Job: Basic parameter check
    if (isNaN(recordIDInt)) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, { message: "Record ID must be a valid number" });
    }

    // Call the Model. Model throws 404 if not found.
    const usageRecord = await getServiceUsageByIDModel(recordIDInt);

    return jsonResponse(res, true, HttpStatusCodes.OK, { usageRecord });

  } catch (err) {
    // Catches 404 (Not Found) or 500 thrown by the Model
    return handleError(res, err);
  }
}


// --- MUTATION Endpoints ---

/**
 * Create a new service usage record. (CREATE)
 */
export async function createServiceUsage(req: Request, res: Response) {
  try {
    // Pass the raw request body to the Model. 
    // Model handles Joi validation (400) and FK checks (400).
    const createdRecord = await createServiceUsageModel(req.body as ServiceUsageCreate);

    // If no error was thrown, creation succeeded.
    return jsonResponse(res, true, HttpStatusCodes.CREATED, { message: "Record created successfully", createdRecord });
        
  } catch (err) {
    // Catches validation (400) and FK errors (400) from the Model.
    return handleError(res, err);
  }
}

/**
 * Update an existing service usage record. (UPDATE)
 */
export async function updateServiceUsage(req: Request, res: Response) {
  try {
    const recordIDInt: number = parseInt(req.params.recordID, 10);

    // Controller's Job: Basic parameter checks
    if (isNaN(recordIDInt)) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, { message: "Record ID must be a valid number" });
    }
    
    if (Object.keys(req.body as object).length === 0) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, { message: "At least one field must be provided for update" });
    }

    // Construct the input object for the Model: ID from param + fields from body
    const updateInput: IncomingServiceUsageUpdateData = { 
      recordId: recordIDInt,
      ...(req.body as Omit<IncomingServiceUsageUpdateData, "recordId">),
    };
        
    // Call the Model. Model handles Joi validation (400), FK checks (400), 
    // and Not Found check (404).
    const updatedRecord = await updateServiceUsageModel(updateInput);

    // If the Model succeeds, we return 200 OK.
    return jsonResponse(res, true, HttpStatusCodes.OK, { message: "Usage record updated successfully", updatedRecord });

  } catch (err) {
    // Catches validation (400), FK errors (400), and Not Found (404) errors from the Model.
    return handleError(res, err);
  }
}

/**
 * Delete a service usage record by ID. (DELETE)
 */
export async function deleteServiceUsage(req: Request, res: Response) {
  try {
    const recordIDInt: number = parseInt(req.params.recordID, 10);

    if (isNaN(recordIDInt)) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, { message: "Record ID must be a valid number" });
    }

    // Call the Model. Model handles the existence check and throws 404 if not found.
    await deleteServiceUsageModel(recordIDInt);

    // If no error was thrown, deletion succeeded.
    return jsonResponse(res, true, HttpStatusCodes.OK, { message: "Usage record deleted successfully" });
        
  } catch (err) {
    // Catches Not Found (404) errors from the Model.
    return handleError(res, err);
  }
}
