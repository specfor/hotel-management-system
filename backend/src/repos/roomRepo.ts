import {RoomPublic} from "@src/types/room";
import db from "@src/common/util/db";

export async function getAllRoomsDB():Promise<RoomPublic[] | null>{

  const sql = `
        SELECT
            room_id AS "roomID",
            branch_id AS "branchID",
            type_id AS "typeID",
            room_status AS "roomStatus"
        FROM room;
    `;
  const results = await db.query(sql);

  if(results.rows.length == 0){
    return null;
  }

  return results.rows as RoomPublic[];
  
}

export async function getRoomsByBranchDB(
  branchID: number,
  type?: string,
  status?: string,
): Promise<RoomPublic[] | null> {


  let sql = `
      SELECT 
        r.room_id AS "roomID",
        r.branch_id AS "branchID",
        rt.type_name AS "roomType",
        r.room_status AS "status"
      FROM room r
      JOIN room_type rt ON r.type_id = rt.type_id
      WHERE r.branch_id = $1
    `;
  const values: (string | number)[] = [branchID];
  let paramIndex = 2;

  if (type) {
    sql += ` AND rt.type_name = $${paramIndex++}`;
    values.push(type);
  }

  if (status) {
    sql += ` AND r.room_status = $${paramIndex++}`;
    values.push(status);
  }

  sql += " ORDER BY r.room_id ASC;";

  const result = await db.query(sql, values);

  if(result.rows.length == 0){
    return null;
  }

  return result.rows as RoomPublic[];

}

export async function createRoomDB(
  branchIdInt: number, roomTypeId: number):Promise<RoomPublic | null>{

  const sql = `
      INSERT INTO room (branch_id, type_id, room_status)
      VALUES ($1, $2, 'Available')
      RETURNING 
        room_id AS "roomId",
        branch_id AS "branchId",
        type_id AS "typeId",
        room_status AS "roomStatus";
    `;

  const result = await db.query(sql, [branchIdInt, roomTypeId]);

  if(result.rows.length == 0){
    return null;
  }

  return result.rows[0] as RoomPublic;
    
}

export async function updateRoomDB(
  roomID: number,
  typeID?: number,
  status?: string,
): Promise<RoomPublic | null> {

  const updates: string[] = [];
  const values: (string | number)[] = [];
  let paramIndex = 1;

  if (typeID) {
    updates.push(`type_id = $${paramIndex++}`);
    values.push(typeID);
  }

  if (status) {
    updates.push(`room_status = $${paramIndex++}`);
    values.push(status);
  }

  if (updates.length === 0) return null;

  values.push(roomID);

  const sql = `
      UPDATE room
      SET ${updates.join(", ")}
      WHERE room_id = $${paramIndex}
      RETURNING 
        room_id AS "roomID",
        branch_id AS "branchID",
        type_id AS "typeID",
        room_status AS "status";
    `;

  const result = await db.query(sql, values);
  if (result.rows.length === 0){
    return null;
  }
  return result.rows[0] as RoomPublic;

}

export async function deleteRoomDB(roomID: number): Promise<boolean> {

  const sql = `
      DELETE FROM room
      WHERE room_id = $1
      RETURNING room_id;
    `;

  const result = await db.query(sql, [roomID]);

  return (result.rows.length ?? 0) > 0;

}

export async function getBranchIdOfRoom(roomID: number):Promise<{branchId: number} | null>{
  const sql = `
            SELECT branch_id AS "branchId"
            FROM room
            WHERE room_id = $1;
        `;

  const result = await db.query(sql, [roomID]);
  if(result.rows.length == 0){
    return null;
  }
  return result.rows[0] as {branchId: number};
  
}

export async function getRoomByIdDB(roomId: number):Promise<RoomPublic | null>{
  const sql = `
    SELECT *
    FROM room
    WHERE room_id = $1;
  `;

  const result = await db.query(sql, [roomId]);

  if(result.rows.length == 0){
    return null;
  }

  return result.rows[0] as RoomPublic;
}