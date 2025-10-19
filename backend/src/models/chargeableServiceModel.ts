/* eslint-disable max-len */
// backend/src/models/chargeableServiceModel.ts

import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";
import { RouteError } from "@src/common/util/route-errors";
import { 
  ChargeableServicePublic, 
  ChargeableServiceCreate, 
  ChargeableServiceUpdate, 
} from "@src/types/chargeableServiceTypes";
import {
  ChargeableServiceCreateSchema,
  ChargeableServiceUpdateSchema,
} from "@src/models/schemas/chargeableServiceSchema";
import { 
  getAllChargeableServicesDB,
  getChargeableServiceByIdDB,
  createChargeableServiceDB,
  updateChargeableServiceDB,
  deleteChargeableServiceDB,
} from "@src/repos/chargeableServiceRepo";
import { getBranchByIdDB } from "@src/repos/branchRepo"; // Dependency for existence check

// --- Type Interfaces ---
// Structure reflecting the raw incoming data for updates (ServiceId from param + body)
export interface IncomingChargeableServiceUpdateData {
    serviceId: number; 
    branchId?: number;
    serviceName?: string;
    unitPrice?: number;
    unitType?: string;
}

// --- Read Operations ---

/**
 * Retrieves all chargeable services.
 */
export async function getAllChargeableServicesModel(): Promise<ChargeableServicePublic[]> {
  const services = await getAllChargeableServicesDB();
    
  if (!services) {
    return []; 
  }
  return services;
}

/**
 * Retrieves a single chargeable service by ID.
 * Throws 404 if not found.
 */
export async function getChargeableServiceByIDModel(serviceId: number): Promise<ChargeableServicePublic> {
  const service = await getChargeableServiceByIdDB(serviceId);
    
  if (!service) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, `Chargeable Service with ID ${serviceId} not found.`);
  }
    
  return service;
}

// --- Create Operation ---

/**
 * Creates a new chargeable service.
 * Handles validation and foreign key existence check (Branch).
 */

export async function createChargeableServiceModel(data: ChargeableServiceCreate): Promise<ChargeableServicePublic> {
  // 1. Joi Validation (Schema handles required fields and format)
  const { error } = ChargeableServiceCreateSchema.validate(data);
  if (error) { 
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, error.details[0].message); 
  }
    
  // 2. Business Logic: Check if the referenced Branch exists
  const branch = await getBranchByIdDB(data.branchId);
  if (!branch) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, `Branch ID ${data.branchId} is invalid or does not exist.`);
  }

  // 3. Repository Call
  const createdService = await createChargeableServiceDB(data);
    
  if (!createdService) {
    // This catches unexpected DB failures (e.g., connection lost)
    throw new RouteError(HttpStatusCodes.INTERNAL_SERVER_ERROR, "Failed to create chargeable service due to an internal server issue.");
  }
    
  return createdService;
}

// --- Update Operation ---

/**
 * Updates an existing chargeable service.
 * Handles validation and calls the repository.
 */
export async function updateChargeableServiceModel(data: IncomingChargeableServiceUpdateData): Promise<ChargeableServicePublic> {
  // 1. Joi Validation (Requires serviceId in the input data)
  const { error } = ChargeableServiceUpdateSchema.validate(data);
  if (error) { 
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, error.details[0].message); 
  }

  // 2. Business Logic: If branchId is being updated, check existence
  if (data.branchId !== undefined) {
    const branch = await getBranchByIdDB(data.branchId);
    if (!branch) {
      throw new RouteError(HttpStatusCodes.BAD_REQUEST, `Branch ID ${data.branchId} is invalid or does not exist.`);
    }
  }
    
  // 3. Type preparation for Repository (Ensure it matches ChargeableServiceUpdate structure)
  // We only need the actual update fields (excluding serviceId which is used in the WHERE clause)
  const updateData: ChargeableServiceUpdate = {
    serviceId: data.serviceId,
    branchId: data.branchId,
    serviceName: data.serviceName,
    unitPrice: data.unitPrice,
    unitType: data.unitType,
  };

  // 4. Repository Call
  const updatedService = await updateChargeableServiceDB(updateData);
    
  if (!updatedService) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, `Chargeable Service with ID ${data.serviceId} not found or no changes made.`);
  }
    
  return updatedService;
}

// --- Delete Operation ---

/**
 * Deletes a chargeable service by ID.
 * Throws 404 if the service does not exist.
 */
export async function deleteChargeableServiceModel(serviceId: number): Promise<boolean> {
    
  // 1. Proactive Existence Check (The DB function might return false, but throwing 404 is cleaner here)
  const service = await getChargeableServiceByIdDB(serviceId);
  if (!service) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, `Chargeable Service with ID ${serviceId} not found.`);
  }

  // 2. Repository Call
  const deleted = await deleteChargeableServiceDB(serviceId);
    
  // Safety check, although the existence check above covers most cases.
  if (!deleted) {
    throw new RouteError(HttpStatusCodes.INTERNAL_SERVER_ERROR, "Deletion failed due to an unknown database issue.");
  }
    
  return deleted;
}
