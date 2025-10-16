// backend/src/controllers/chargeableServiceController.ts

import { Request, Response } from "express";
import { jsonResponse } from "@src/common/util/response";
import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";
import logger from "jet-logger";
import { 
    getAllChargeableServicesDB, 
    createChargeableServiceDB,
    updateChargeableServiceDB,
    deleteChargeableServiceDB,
    getChargeableServiceByIdDB,
    // ... import other repo functions here
} from "@src/repos/chargeableServiceRepo";

/**
 * Get all chargeable services. (READ All)
 */
export async function getAllChargeableServices(req: Request, res: Response) {
    try {
        const services = await getAllChargeableServicesDB();
        if (!services) {
            return jsonResponse(res,  true, HttpStatusCodes.OK, { message: "No services" });
        } else {
            return jsonResponse(res, true,  HttpStatusCodes.OK, { services });
        }
        
    } catch (err) {
        logger.err(err);
        return jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, { message: "Server error" });
    }
}

/**
 * Create a new chargeable service. (CREATE)
 */
export async function createChargeableService(req: Request, res: Response) {
    try {
        const { branchId, serviceName, unitPrice, unitType } = req.body;

        if (!branchId || !serviceName || !unitPrice || !unitType) {
            return jsonResponse(res,  false, HttpStatusCodes.BAD_REQUEST, { message: "Missing required fields" });
        }

        // The body should match the interface ChargeableServiceCreate
        const createdService = await createChargeableServiceDB(req.body);

        if (createdService == null) {
            return jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, { message: "Service was not created" });
        } else {
            return jsonResponse(res, true, HttpStatusCodes.ACCEPTED, { message: "Service created successfully", createdService });
        }
    } catch (err) {
        logger.err(err);
        return jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, { message: "Server error" });
    }
}

/**
 * Update an existing chargeable service. (UPDATE)
 */
export async function updateChargeableService(req: Request, res: Response) {
    try {
        const serviceIDStr: string = req.params.serviceID;
        const serviceIDInt: number = parseInt(serviceIDStr, 10);

        if (isNaN(serviceIDInt)) {
            return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, { message: "Service ID must be a valid number" });
        }
        
        // 1. Prepare Update Data
        // Combine the ID from params with the optional fields from the body
        const updateData = { serviceId: serviceIDInt, ...req.body };

        // 2. Check if at least one field is being updated
        if (Object.keys(req.body).length === 0) {
            return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, { message: "At least one field must be provided for update" });
        }

        // 3. Repository Call
        const updatedService = await updateChargeableServiceDB(updateData);

        // 4. Response Handling
        if (updatedService == null) {
            // This usually means the serviceId was not found
            return jsonResponse(res, false, HttpStatusCodes.NOT_FOUND, { message: "Service with ID " + serviceIDInt + " not found" });
        } else {
            return jsonResponse(res, true, HttpStatusCodes.OK, { message: "Service updated successfully", updatedService });
        }

    } catch (err) {
        logger.err(err);
        return jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, { message: "Server error" });
    }
}

/**
 * Delete a chargeable service by ID. (DELETE)
 */
export async function deleteChargeableService(req: Request, res: Response) {
    try {
        const serviceIDStr: string = req.params.serviceID;
        const serviceIDInt: number = parseInt(serviceIDStr, 10);

        if (isNaN(serviceIDInt)) {
            return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, { message: "Service ID must be a valid number" });
        }

        // 1. Repository Call
        const deleted = await deleteChargeableServiceDB(serviceIDInt);

        // 2. Response Handling
        if (!deleted) {
            return jsonResponse(res, false, HttpStatusCodes.NOT_FOUND, { message: "No service found with ID " + serviceIDInt });
        } else {
            return jsonResponse(res, true, HttpStatusCodes.OK, { message: "Service deleted successfully" });
        }
    } catch (err) {
        logger.err(err);
        return jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, { message: "Server error" });
    }
}
/**
 * Get a single chargeable service by ID. (READ One)
 */
export async function getChargeableServiceByID(req: Request, res: Response) {
    try {
        const serviceIDStr: string = req.params.serviceID;
        const serviceIDInt: number = parseInt(serviceIDStr, 10);

        // 1. Validation
        if (isNaN(serviceIDInt)) {
            return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, { message: "Service ID must be a valid number" });
        }

        // 2. Repository Call
        const service = await getChargeableServiceByIdDB(serviceIDInt);

        // 3. Response Handling
        if (service == null) {
            return jsonResponse(res, false, HttpStatusCodes.NOT_FOUND, { message: "No service found with ID " + serviceIDInt });
        } else {
            return jsonResponse(res, true, HttpStatusCodes.OK, { service });
        }
    } catch (err) {
        logger.err(err);
        return jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, { message: "Server error" });
    }
}