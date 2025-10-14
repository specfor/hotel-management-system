import {RoomPublic} from "@src/types/room";
import db from "@src/common/util/db";

export async function getAllRoomsDB():Promise<RoomPublic[] | null>{
  try{
    const sql = `
        SELECT * FROM room;
    `;
    const results = await db.query(sql);
    return results.rows as RoomPublic[];
  }catch(err){
    console.error(err);
    return null;
  }
}

export async function getRoomsByBranchDB(
  branchID: number,
  type?: string,
  status?: string,
): Promise<RoomPublic[] | null> {

  try {
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
    const values: any[] = [branchID];
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
    return result.rows as RoomPublic[];

  } catch (err) {
    console.error(err);
    return null;
  }

}

export async function createRoomDB(branchIdInt, roomTypeId):Promise<RoomPublic>{
  try {
    const sql = `
      INSERT INTO room (branch_id, type_id, room_status)
      VALUES ($1, $2, 'Available')
      RETURNING 
        room_id AS "roomID",
        branch_id AS "branchID",
        type_id AS "typeID",
        room_status AS "status";
    `;

    const result = await db.query(sql, [branchIdInt, roomTypeId]);
    return result.rows[0] as RoomPublic;

  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function updateRoomDB(
  roomID: number,
  typeID?: number,
  status?: string,
): Promise<RoomPublic | null> {
  try {
    const updates: string[] = [];
    const values: any[] = [];
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
    return result.rows[0] as RoomPublic;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function deleteRoomDB(roomID: number): Promise<boolean> {
  try {
    const sql = `
      DELETE FROM room
      WHERE room_id = $1
      RETURNING room_id;
    `;

    const result = await db.query(sql, [roomID]);
    return result.rowCount > 0;
  } catch (err) {
    console.error(err);
    return false;
  }
}

export async function getBranchIdOfRoom(roomID: number):Promise<{branchID: number}>{
  try {
    const sql = `
            SELECT branch_id AS "branchID"
            FROM room
            WHERE room_id = $1;
        `;

    const result = await db.query(sql, [roomID]);
    return result.rows[0];
  } catch (err) {
    console.error(err);
    return false;
  }
}