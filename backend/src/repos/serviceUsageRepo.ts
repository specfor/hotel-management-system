/* eslint-disable max-len */
// backend/src/repos/serviceUsageRepo.ts

import { ServiceUsagePublic, ServiceUsageCreate, ServiceUsageUpdate } from "@src/types/serviceUsageTypes";
import db from "@src/common/util/db";
import logger from "jet-logger";

// --- Helper Functions ---
interface ServiceUsageRow {
  record_id: number;
  service_id: number;
  booking_id: number;
  date_time: Date;
  quantity: string;
  total_price: string;
}

interface ServiceUsageWithDetailsRow {
  record_id: number;
  service_id: number;
  booking_id: number;
  date_time: Date;
  quantity: string;
  total_price: string;
  service_name: string;
  unit_price: string;
  unit_type: string;
  branch_id: number;
}

export interface ServiceUsageWithDetails {
  recordId: number;
  serviceId: number;
  bookingId: number;
  dateTime: Date;
  quantity: number;
  totalPrice: number;
  serviceName: string;
  unitPrice: number;
  unitType: string;
  branchId: number;
}

const mapToPublic = (row: ServiceUsageRow): ServiceUsagePublic => ({
  recordId: row.record_id,
  serviceId: row.service_id,
  bookingId: row.booking_id,
  dateTime: row.date_time,
  quantity: parseFloat(row.quantity),
  totalPrice: parseFloat(row.total_price),
});

const mapToPublicWithDetails = (row: ServiceUsageWithDetailsRow): ServiceUsageWithDetails => ({
  recordId: row.record_id,
  serviceId: row.service_id,
  bookingId: row.booking_id,
  dateTime: row.date_time,
  quantity: parseFloat(row.quantity),
  totalPrice: parseFloat(row.total_price),
  serviceName: row.service_name,
  unitPrice: parseFloat(row.unit_price),
  unitType: row.unit_type,
  branchId: row.branch_id,
});

// --- CRUD Operations ---

/**
 * Get all service usage records. (READ All)
 */
export async function getAllServiceUsageDB(): Promise<ServiceUsagePublic[] | null> {
  try {
    const sql = `
            SELECT 
                record_id, service_id, booking_id, date_time, quantity, total_price
            FROM 
                service_usage;
        `;
    const result = await db.query(sql);
    return (result.rows as ServiceUsageRow[]).map(mapToPublic);
  } catch (err) {
    logger.err(err);
    return null;
  }
}

/**
 * Get a single service usage record by ID. (READ One)
 */
export async function getServiceUsageByIDDB(recordId: number): Promise<ServiceUsagePublic | null> {
  try {
    const sql = `
            SELECT 
                record_id, service_id, booking_id, date_time, quantity, total_price
            FROM 
                service_usage
            WHERE
                record_id = $1;
        `;
    const result = await db.query(sql, [recordId]);

    if (result.rows.length === 0) {
      return null;
    }

    return mapToPublic(result.rows[0] as ServiceUsageRow);
  } catch (err) {
    logger.err(err);
    return null;
  }
}

/**
 * Get all service usage records for a specific booking with service details. (READ by Booking)
 */
export async function getServicesByBookingIDDB(bookingId: number): Promise<ServiceUsageWithDetails[] | null> {
  try {
    const sql = `
      SELECT 
        su.record_id,
        su.service_id,
        su.booking_id,
        su.date_time,
        su.quantity,
        su.total_price,
        cs.service_name,
        cs.unit_price,
        cs.unit_type,
        cs.branch_id
      FROM 
        service_usage su
      INNER JOIN 
        chargeable_services cs ON su.service_id = cs.service_id
      WHERE
        su.booking_id = $1
      ORDER BY su.date_time DESC;
    `;
    const result = await db.query(sql, [bookingId]);

    if (result.rows.length === 0) {
      return [];
    }

    return (result.rows as ServiceUsageWithDetailsRow[]).map(mapToPublicWithDetails);
  } catch (err) {
    logger.err(err);
    return null;
  }
}

/**
 * Create a new service usage record. (CREATE)
 */
export async function createServiceUsageDB(usageData: ServiceUsageCreate): Promise<ServiceUsagePublic | null> {
  try {
    const sql = `
            INSERT INTO service_usage (service_id, booking_id, quantity, date_time)
            VALUES ($1, $2, $3, NOW())
            RETURNING *;
        `;
    const values = [
      usageData.serviceId,
      usageData.bookingId,
      usageData.quantity,
    ];

    const createdUsage = await db.query(sql, values);
    return mapToPublic(createdUsage.rows[0] as ServiceUsageRow);

  } catch (err) {
    logger.err(err);
    return null;
  }
}

/**
 * Update an existing service usage record. (UPDATE)
 */
export async function updateServiceUsageDB(usageData: ServiceUsageUpdate): Promise<ServiceUsagePublic | null> {
  try {
    const updates: string[] = [];
    const values: (string | number | Date)[] = [];
    let paramIndex = 1;

    if (usageData.serviceId !== undefined) {
      updates.push("service_id = $" + paramIndex);
      values.push(usageData.serviceId);
      paramIndex++;
    }

    if (usageData.bookingId !== undefined) {
      updates.push("booking_id = $" + paramIndex);
      values.push(usageData.bookingId);
      paramIndex++;
    }

    if (usageData.quantity !== undefined) {
      updates.push("quantity = $" + paramIndex);
      values.push(usageData.quantity);
      paramIndex++;
    }
        
    if (updates.length === 0) {
      return null; 
    }

    const sql = `
          UPDATE service_usage
          SET ${updates.join(", ")}
          WHERE record_id = $${paramIndex}
          RETURNING *;
        `;
    values.push(usageData.recordId); 

    const result = await db.query(sql, values);

    if (result.rows.length === 0) {
      return null;
    }

    return mapToPublic(result.rows[0] as ServiceUsageRow);

  } catch (err) {
    logger.err(err);
    return null;
  }
}

/**
 * Delete a service usage record by ID. (DELETE)
 * Returns true if deleted, false if not found.
 */
export async function deleteServiceUsageDB(recordId: number): Promise<boolean> {
  try {
    const sql = `
          DELETE FROM service_usage
          WHERE record_id = $1
          RETURNING record_id;
        `;

    const result = await db.query(sql, [recordId]);

    return result.rowCount !== null && result.rowCount > 0;
  } catch (err) {
    logger.err(err);
    return false;
  }
}