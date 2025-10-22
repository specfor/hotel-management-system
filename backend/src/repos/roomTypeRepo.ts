import { RoomTypePublic } from "@src/types/roomTypes";
import db from "@src/common/util/db";

export async function getAllRoomTypesDB(): Promise<RoomTypePublic[]> {
  const sql = `
        SELECT 
            type_id as roomTypeId, 
            branch_id as branchId, 
            type_name as roomTypeName, 
            daily_rate as dailyRate, 
            late_checkout_rate as lateCheckoutRate, 
            capacity as capacity, 
            amenities as amenities
        FROM room_type;
      `;

  const result = await db.query(sql);

  return result.rows as RoomTypePublic[];
}

export async function getRoomTypesByBranchDB(branchId: number): Promise<RoomTypePublic[] | null> {
  const sql = `
        SELECT
            type_id as roomTypeId,
            branch_id as branchId,
            type_name as "roomTypeName",
            daily_rate as dailyRate,
            late_checkout_rate as lateCheckoutRate,
            capacity as capacity,
            amenities as amenities
        FROM room_type
        WHERE branch_id = $1; 
    `;

  const result = await db.query(sql, [branchId]);

  if (result.rows.length == 0) {
    return null;
  }

  return result.rows as RoomTypePublic[];
}

export async function createRoomTypeDB(
  branchIDInt: number,
  roomTypeName: string,
  dailyRateInt: number,
  lateCheckoutRateInt?: number,
  capacityInt?: number,
  amenities?: string
): Promise<RoomTypePublic | null> {
  const sql = `
      INSERT INTO room_type (
        branch_id, type_name, daily_rate, late_checkout_rate,
        capacity, amenities
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
          type_id as "roomTypeId",
          branch_id as "branchId",
          type_name as "roomTypeName",
          daily_rate as "dailyRate",
          late_checkout_rate as "lateCheckoutRate",
          capacity as "capacity",
          amenities as "amenities";
      `;

  const values = [branchIDInt, roomTypeName, dailyRateInt, lateCheckoutRateInt, capacityInt, amenities];
  const result = await db.query(sql, values);

  if (result.rows.length == 0) {
    return null;
  }
  return result.rows[0] as RoomTypePublic;
}

export async function updateRoomTypeDB(
  branchIDInt: number,
  roomTypeName: string,
  dailyRate?: number,
  lateCheckoutRate?: number,
  capacity?: number,
  amenities?: string
): Promise<RoomTypePublic | null> {
  const updates: string[] = [];
  const values: (string | number)[] = [];
  let paramIndex = 1;

  if (dailyRate) {
    updates.push("daily_rate = $" + paramIndex);
    values.push(dailyRate);
    paramIndex++;
  }

  if (lateCheckoutRate) {
    updates.push("late_checkout_rate = $" + paramIndex);
    values.push(lateCheckoutRate);
    paramIndex++;
  }

  if (capacity) {
    updates.push("capacity = $" + paramIndex);
    values.push(capacity);
    paramIndex++;
  }

  if (amenities) {
    updates.push("amenities = $" + paramIndex);
    values.push(amenities);
    paramIndex++;
  }

  if (updates.length === 0) {
    return null;
  }

  const branchParamIndex = paramIndex;
  const typeNameParamIndex = paramIndex + 1;

  values.push(branchIDInt, roomTypeName);

  const sql = `
        UPDATE room_type
        SET ${updates.join(",")}
        WHERE branch_id = $${branchParamIndex} and type_name = $${typeNameParamIndex}
        RETURNING 
            branch_id as branchID, 
            type_id as type_name,
            daily_rate as dailyRate,
            late_checkout_rate as lateCheckoutRate,
            capacity as capacity,
            amenities as amenities
    `;

  const result = await db.query(sql, values);
  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0] as RoomTypePublic;
}

export async function deleteRoomTypeDB(branchIDInt: number, roomTypeName: string): Promise<boolean> {
  const sql = `
      DELETE FROM room_type
      WHERE branch_id = $1 and type_name = $2
      RETURNING type_id;
    `;

  const result = await db.query(sql, [branchIDInt, roomTypeName]);

  return (result.rowCount ?? 0) > 0;
}

export async function getRoomTypeByNameDB(branchID: number, typeName: string): Promise<{ typeID: number } | null> {
  const sql = `
      SELECT type_id AS "typeID"
      FROM room_type
      WHERE branch_id = $1 AND type_name = $2;
    `;
  const result = await db.query(sql, [branchID, typeName]);

  if (result.rows.length == 0) {
    return null;
  }

  return result.rows[0] as { typeID: number };
}
