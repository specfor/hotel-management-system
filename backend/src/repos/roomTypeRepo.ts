/* eslint-disable max-len */
import * as console from "node:console";
import {RoomTypePublic} from "@src/types/roomTypes";
import db from "@src/common/util/db";
import {updateBranchDB} from "@src/repos/branchRepo";
import {BranchPublic} from "@src/types/branchTypes";

export async function getAllRoomTypesDB():Promise<RoomTypePublic[] | null>{
  try{
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

  }catch(err){
    console.error(err);
    return null;
  }
}

export async function getRoomTypesByBranchDB(roomTypeID: number):Promise<RoomTypePublic[] | null>{
  try{
    const sql = `
        SELECT
            type_id as roomTypeId,
            branch_id as branchId,
            type_name as roomTypeName,
            daily_rate as dailyRate,
            late_checkout_rate as lateCheckoutRate,
            capacity as capacity,
            amenities as amenities
        FROM room_type
        WHERE branch_id = $1; 
    `;

    const result = await db.query(sql, [roomTypeID]);
    return result.rows as RoomTypePublic[];

  }catch(err){
    console.error(err);
    return null;
  }
}

export async function createRoomTypeDB(
  branchIDInt: number, roomTypeName: string,
  dailyRateInt: number, lateCheckoutRateInt: number,
  capacityInt: number, amentities: string): Promise<RoomTypePublic | null>{

  try {
    const sql = `
      INSERT INTO room_type (branch_id, type_name, daily_rate, late_checkout_rate, capacity, amenities)
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

    const values = [branchIDInt, roomTypeName, dailyRateInt, lateCheckoutRateInt, capacityInt, amentities];
    const result = await db.query(sql, values);
    return result.rows[0] as RoomTypePublic;

  }catch (err) {
    console.error(err);
    return null;
  }

}

export async function updateRoomTypeDB(
  branchIDInt: number, roomTypeName: string,
  dailyRate?: number, lateCheckoutRate?: number,
  capacity?: number, amenities?:string): Promise<RoomTypePublic | null>{

  try{
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if(dailyRate){
      updates.push("daily_rate = $" + paramIndex);
      values.push(dailyRate);
      paramIndex++;
    }

    if(lateCheckoutRate){
      updates.push("late_checkout_rate = $" + paramIndex);
      values.push(lateCheckoutRate);
      paramIndex++;
    }

    if(capacity){
      updates.push("capacity = $" + paramIndex);
      values.push(capacity);
      paramIndex++;
    }

    if(amenities){
      updates.push("amenities = $" + paramIndex);
      values.push(amenities);
      paramIndex++;
    }

    if (updates.length === 0){
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
    if(result.rows.length === 0){
      return null;
    }else{
      return result.rows[0] as RoomTypePublic;
    }

  }catch(err){
    console.error(err);
    return null;
  }

}

export async function deleteRoomTypeDB(branchIDInt: number, roomTypeName: string): Promise<void> {
  try{
    const sql = `
      DELETE FROM room_type
      WHERE branch_id = $1 and type_name = $2
      RETURNING type_id;
    `;

    const result = await db.query(sql, [branchIDInt, roomTypeName]);
    return result.rowCount > 0;

  }catch(err){
    console.error(err);
    return null;
  }

}



// type_id SERIAL PRIMARY KEY,
// branch_id INT ,
// type_name VARCHAR(50)  ,
// daily_rate DECIMAL(10,2)  ,
// late_checkout_rate DECIMAL(10,2)  ,
// capacity INT  ,
// amenities VARCHAR(255) ,
//
//
// roomTypeId: number;
// branchId: number;
// roomTypeName: string;
// dailyRate: number;
// lateCheckoutRate: number;
// capacity: number;
// amenities: string;