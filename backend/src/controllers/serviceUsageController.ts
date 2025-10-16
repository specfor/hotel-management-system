// backend/src/controllers/serviceUsageController.ts

import { Request, Response } from "express";
import { jsonResponse } from "@src/common/util/response";
import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";
import logger from "jet-logger";
import { 
    getAllServiceUsageDB, 
    createServiceUsageDB,
    getServiceUsageByIDDB,
    updateServiceUsageDB,
    deleteServiceUsageDB,
} from "@src/repos/serviceUsageRepo";

/**
 * Get all service usage records. (READ All)
 */
export async function getAllServiceUsage(req: Request, res: Response) {
    try {
        const usageRecords = await getAllServiceUsageDB();
        
        if (!usageRecords || usageRecords.length === 0) {
            return jsonResponse(res, false, HttpStatusCodes.NOT_FOUND, { message: "No service usage records found" });
        }
        
        return jsonResponse(res, true, HttpStatusCodes.OK, { usageRecords });
    } catch (err) {
        logger.err(err);
        return jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, { message: "Server error" });
    }
}

/**
 * Get a single service usage record by ID. (READ One)
 */
export async function getServiceUsageByID(req: Request, res: Response) {
    try {
        const recordIDStr: string = req.params.recordID;
        const recordIDInt: number = parseInt(recordIDStr, 10);

        if (isNaN(recordIDInt)) {
            return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, { message: "Record ID must be a valid number" });
        }

        const usageRecord = await getServiceUsageByIDDB(recordIDInt);

        if (usageRecord == null) {
            return jsonResponse(res, false, HttpStatusCodes.NOT_FOUND, { message: "No usage record found with that ID" });
        } else {
            return jsonResponse(res, true, HttpStatusCodes.OK, { usageRecord });
        }
    } catch (err) {
        logger.err(err);
        return jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, { message: "Server error" });
    }
}

/**
 * Create a new service usage record. (CREATE)
 */
export async function createServiceUsage(req: Request, res: Response) {
    try {
        const { serviceId, bookingId, quantity } = req.body;

        if (!serviceId || !bookingId || !quantity) {
            return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, { message: "Missing required fields: serviceId, bookingId, quantity" });
        }
        
        if (typeof quantity !== 'number' || quantity <= 0) {
            return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, { message: "Quantity must be a positive number" });
        }

        const createdRecord = await createServiceUsageDB(req.body);

        if (createdRecord == null) {
            return jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, { message: "Service usage record was not created" });
        } else {
            return jsonResponse(res, true, HttpStatusCodes.CREATED, { message: "Record created successfully", createdRecord });
        }
    } catch (err) {
        logger.err(err);
        return jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, { message: "Server error during creation" });
    }
}

/**
 * Update an existing service usage record. (UPDATE)
 */
export async function updateServiceUsage(req: Request, res: Response) {
    try {
        const recordIDStr: string = req.params.recordID;
        const recordIDInt: number = parseInt(recordIDStr, 10);

        if (isNaN(recordIDInt)) {
            return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, { message: "Record ID must be a valid number" });
        }
        
        const updateData = { recordId: recordIDInt, ...req.body };

        if (Object.keys(req.body).length === 0) {
            return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, { message: "At least one field must be provided for update" });
        }

        const updatedRecord = await updateServiceUsageDB(updateData);

        if (updatedRecord == null) {
            return jsonResponse(res, false, HttpStatusCodes.NOT_FOUND, { message: "Usage record with ID " + recordIDInt + " not found or no changes made" });
        } else {
            return jsonResponse(res, true, HttpStatusCodes.OK, { message: "Usage record updated successfully", updatedRecord });
        }

    } catch (err) {
        logger.err(err);
        return jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, { message: "Server error" });
    }
}

/**
 * Delete a service usage record by ID. (DELETE)
 */
export async function deleteServiceUsage(req: Request, res: Response) {
    try {
        const recordIDStr: string = req.params.recordID;
        const recordIDInt: number = parseInt(recordIDStr, 10);

        if (isNaN(recordIDInt)) {
            return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, { message: "Record ID must be a valid number" });
        }

        const deleted = await deleteServiceUsageDB(recordIDInt);

        if (!deleted) {
            return jsonResponse(res, false, HttpStatusCodes.NOT_FOUND, { message: "No usage record found with ID " + recordIDInt });
        } else {
            return jsonResponse(res, true, HttpStatusCodes.OK, { message: "Usage record deleted successfully" });
        }
    } catch (err) {
        logger.err(err);
        return jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, { message: "Server error" });
    }
}