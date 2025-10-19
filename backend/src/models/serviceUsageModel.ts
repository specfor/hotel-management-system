/* eslint-disable max-len */
// backend/src/models/serviceUsageModel.ts

import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";
import { RouteError } from "@src/common/util/route-errors";
import { 
  ServiceUsagePublic, 
  ServiceUsageCreate, 
  ServiceUsageUpdate, 
} from "@src/types/serviceUsageTypes";
import {
  ServiceUsageCreateSchema,
  ServiceUsageUpdateSchema,
} from "@src/models/schemas/serviceUsageSchema";
import { 
  getAllServiceUsageDB,
  getServiceUsageByIDDB,
  createServiceUsageDB,
  updateServiceUsageDB,
  deleteServiceUsageDB,
} from "@src/repos/serviceUsageRepo";
import { getChargeableServiceByIdDB } from "@src/repos/chargeableServiceRepo"; // Dependency for Service existence check
import { getBookingByIDDB } from "@src/repos/bookingRepo"; // Dependency for Booking existence check

// --- Type Interfaces ---
// Structure reflecting the raw incoming data for updates (recordId from param + body)
export interface IncomingServiceUsageUpdateData {
    recordId: number; 
    serviceId?: number;
    bookingId?: number;
    quantity?: number;
    dateTime?: string | Date; // Can come in as a string from HTTP
}

// --- Read Operations ---

/**
 * Retrieves all service usage records.
 */
export async function getAllServiceUsageModel(): Promise<ServiceUsagePublic[]> {
  const usageRecords = await getAllServiceUsageDB();
    
  // The Repository returns null on a DB error, or an array (possibly empty) on success.
  // We standardize the list response to always return an empty array for 200 OK.
  if (!usageRecords) {
    return []; 
  }
  return usageRecords;
}

/**
 * Retrieves a single service usage record by ID.
 * Throws 404 if not found.
 */
export async function getServiceUsageByIDModel(recordId: number): Promise<ServiceUsagePublic> {
  const usageRecord = await getServiceUsageByIDDB(recordId);
    
  if (!usageRecord) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, `Service Usage Record with ID ${recordId} not found.`);
  }
    
  return usageRecord;
}


// --- Create Operation ---

/**
 * Creates a new service usage record.
 * Handles validation and foreign key existence checks (Service & Booking).
 */
export async function createServiceUsageModel(data: ServiceUsageCreate): Promise<ServiceUsagePublic> {
  // 1. Joi Validation (Schema handles required fields and format)
  const { error } = ServiceUsageCreateSchema.validate(data);
  if (error) { 
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, error.details[0].message); 
  }
    
  // 2. Business Logic: Check if foreign keys exist
    
  // Check if the Chargeable Service exists
  const service = await getChargeableServiceByIdDB(data.serviceId);
  if (!service) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, `Chargeable Service ID ${data.serviceId} is invalid or does not exist.`);
  }

  // Check if the Booking exists (a usage record must be linked to a valid booking)
  const booking = await getBookingByIDDB(data.bookingId);
  if (!booking) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, `Booking ID ${data.bookingId} is invalid or does not exist.`);
  }

  // 3. Repository Call
  const createdRecord = await createServiceUsageDB(data);
    
  if (!createdRecord) {
    // Catches unexpected DB failures (e.g., connection lost, unique constraint violation not caught by logic)
    throw new RouteError(HttpStatusCodes.INTERNAL_SERVER_ERROR, "Failed to create service usage record due to an internal server issue.");
  }
    
  return createdRecord;
}

// --- Update Operation ---

/**
 * Updates an existing service usage record.
 * Handles validation and calls the repository.
 */
export async function updateServiceUsageModel(data: IncomingServiceUsageUpdateData): Promise<ServiceUsagePublic> {
    
  // 1. Joi Validation (Requires recordId in the input data)
  const { error } = ServiceUsageUpdateSchema.validate(data);
  if (error) { 
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, error.details[0].message); 
  }

  // 2. Business Logic: Check foreign key existence if they are being updated
    
  if (data.serviceId !== undefined) {
    const service = await getChargeableServiceByIdDB(data.serviceId);
    if (!service) {
      throw new RouteError(HttpStatusCodes.BAD_REQUEST, `Chargeable Service ID ${data.serviceId} is invalid or does not exist.`);
    }
  }
    
  if (data.bookingId !== undefined) {
    const booking = await getBookingByIDDB(data.bookingId);
    if (!booking) {
      throw new RouteError(HttpStatusCodes.BAD_REQUEST, `Booking ID ${data.bookingId} is invalid or does not exist.`);
    }
  }
    
  // 3. Type preparation for Repository (Handle date conversion if present)
  const updateData: ServiceUsageUpdate = {
    recordId: data.recordId,
    serviceId: data.serviceId,
    bookingId: data.bookingId,
    quantity: data.quantity,
  };
    
  // Convert date string to Date object if provided for update
  if (data.dateTime && typeof data.dateTime === "string") {
    updateData.dateTime = new Date(data.dateTime);
  } else if (data.dateTime instanceof Date) {
    updateData.dateTime = data.dateTime;
  }

  // 4. Repository Call
  const updatedRecord = await updateServiceUsageDB(updateData);
    
  if (!updatedRecord) {
    // If null, the ID was likely not found in the database or no fields were provided.
    throw new RouteError(HttpStatusCodes.NOT_FOUND, `Service Usage Record with ID ${data.recordId} not found or no changes made.`);
  }
    
  return updatedRecord;
}

// --- Delete Operation ---

/**
 * Deletes a service usage record by ID.
 * Throws 404 if the record does not exist.
 */
export async function deleteServiceUsageModel(recordId: number): Promise<boolean> {
    
  // 1. Proactive Existence Check (Throw 404 if it doesn't exist)
  const record = await getServiceUsageByIDDB(recordId);
  if (!record) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, `Service Usage Record with ID ${recordId} not found.`);
  }

  // 2. Repository Call
  const deleted = await deleteServiceUsageDB(recordId);
    
  // Safety check for unexpected DB failure
  if (!deleted) {
    throw new RouteError(HttpStatusCodes.INTERNAL_SERVER_ERROR, "Deletion failed due to an unknown database issue.");
  }
    
  return deleted;
}
