/* eslint-disable max-len */
// backend/src/repos/chargeableServiceRepo.ts

import { ChargeableServicePublic, ChargeableServiceCreate, ChargeableServiceUpdate } from "@src/types/chargeableServiceTypes";
import db from "@src/common/util/db";
import logger from "jet-logger"; // Using logger for console output, following project standard

// --- Helper Functions ---
const mapToPublic = (row: any): ChargeableServicePublic => ({
  serviceId: row.service_id,
  branchId: row.branch_id,
  serviceName: row.service_name,
  unitPrice: parseFloat(row.unit_price), // Convert Decimal to number
  unitType: row.unit_type,
});

// --- CRUD Operations ---

/**
 * Get all chargeable services.
 */
export async function getAllChargeableServicesDB(): Promise<ChargeableServicePublic[] | null> {
  try {
    const sql = `
            SELECT
                service_id,
                branch_id,
                service_name,
                unit_price,
                unit_type
            FROM
                chargeable_services;
        `;
    const result = await db.query(sql);
    return result.rows.map(mapToPublic);
  } catch (err) {
    logger.err(err);
    return null;
  }
}

/**
 * Create a new chargeable service.
 */
export async function createChargeableServiceDB(serviceData: ChargeableServiceCreate): Promise<ChargeableServicePublic | null> {
  try {
    const sql = `
            INSERT INTO chargeable_services (branch_id, service_name, unit_price, unit_type)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
    const values = [
      serviceData.branchId,
      serviceData.serviceName,
      serviceData.unitPrice,
      serviceData.unitType,
    ];

    const createdService = await db.query(sql, values);
    return mapToPublic(createdService.rows[0]);

  } catch (err) {
    logger.err(err);
    return null;
  }
}

// You would add getByID, update, and delete functions similarly
// ...
export async function getChargeableServiceByIdDB(serviceId: number): Promise<ChargeableServicePublic | null> {
  try {
    const sql = `
            SELECT
                service_id,
                branch_id, 
                service_name, 
                unit_price,
                unit_type
            FROM 
                chargeable_services
            WHERE
                service_id = $1;
        `;
    const result = await db.query(sql, [serviceId]);

        if (result.rows.length === 0) {
            return null;
        }

        return mapToPublic(result.rows[0]);
      }catch (err) {
        logger.err(err)
        return null;
        }

}

/**
 * Update an existing chargeable service.
 */
export async function updateChargeableServiceDB(serviceData: ChargeableServiceUpdate): Promise<ChargeableServicePublic | null> {
    try {
        const updates: string[] = [];
        const values: (string | number)[] = [];
        let paramIndex = 1;

        if (serviceData.branchId !== undefined) {
            updates.push("branch_id = $" + paramIndex);
            values.push(serviceData.branchId);
            paramIndex++;
        }

        if (serviceData.serviceName) {
            updates.push("service_name = $" + paramIndex);
            values.push(serviceData.serviceName);
            paramIndex++;
        }

        if (serviceData.unitPrice !== undefined) {
            updates.push("unit_price = $" + paramIndex);
            values.push(serviceData.unitPrice);
            paramIndex++;
        }

        if (serviceData.unitType) {
            updates.push("unit_type = $" + paramIndex);
            values.push(serviceData.unitType);
            paramIndex++;
        }
        
        // If no fields were provided, return null
        if (updates.length === 0) {
             return null; 
        }

        const sql = `
          UPDATE chargeable_services
          SET ${updates.join(", ")}
          WHERE service_id = $${paramIndex}
          RETURNING *;
        `;
        values.push(serviceData.serviceId); // The ID is the last parameter

        const result = await db.query(sql, values);

        if (result.rows.length === 0) {
            return null;
        }

        return mapToPublic(result.rows[0]);

    } catch (err) {
        logger.err(err);
        return null;
    }
}

/**
 * Delete a chargeable service by ID.
 * Returns true if deleted, false if service was not found.
 */
export async function deleteChargeableServiceDB(serviceId: number): Promise<boolean> {
    try {
        const sql = `
          DELETE FROM chargeable_services
          WHERE service_id = $1
          RETURNING service_id;
        `;

        const result = await db.query(sql, [serviceId]);

        // If rowCount is greater than 0, a service was successfully deleted
        return result.rowCount !== null && result.rowCount > 0;
    } catch (err) {
        logger.err("Database error:", err);
        return false;
    }
}
