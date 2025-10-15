/* eslint-disable max-len */
import {BranchPublic} from "@src/types/branchTypes";    // named export
import db from "@src/common/util/db";
import * as console from "node:console";   // default export

export async function getAllBranchesDB(): Promise<BranchPublic[] | null>{
  try{
    const sql = `
        SELECT
            branch_id as branchID,
            branch_name as branchName,
            city,
            address
        FROM
            branch;
    `;
    const result = await db.query(sql);
    return result.rows as BranchPublic[];
  }catch(err){
    console.error(err);
    return null;
  }
}

export async function getBranchByIdDB(branchID:number): Promise<BranchPublic | null>{
  try{
    const sql = `
        SELECT
            branch_id as branchID,
            branch_name as branchName,
            city,
            address
        FROM
            branch
        WHERE
            branch_id = $1;
        `;

    const result = await db.query(sql, [branchID]);

    if(result.rows.length == 0){
      return null;
    }else{
      return result.rows[0] as BranchPublic;
    }
  }catch(err){
    console.error(err);
    return null;
  }
}

export async function createBranchDB(branchName: string, city: string, address: string): Promise<BranchPublic | null>{

  try{
    const sql = `
        INSERT INTO branch (branch_name, city, address)
        VALUES ($1, $2, $3)
        RETURNING 
            branch_id AS "branchID",
            branch_name AS "branchName",
            city,
            address;
        `;

    const createdBranch = await db.query(sql, [branchName, city, address]);
    return createdBranch.rows[0] as BranchPublic;

  }catch(err){
    console.error(err);
    return null;
  }

}

export async function updateBranchDB(branchID: number, branchName?: string, city?: string, address?: string): Promise<BranchPublic | null>{
  try{
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if(branchName){
      updates.push("branch_name = $"+paramIndex);
      values.push(branchName);
      paramIndex++;
    }

    if(city){
      updates.push("city = $"+paramIndex);
      values.push(city);
      paramIndex++;
    }

    if(address){
      updates.push("address = $"+paramIndex);
      values.push(address);
      paramIndex++;
    }

    const sql = `
      UPDATE branch
      SET ${updates.join(", ")}
      WHERE branch_id = $${paramIndex}
      RETURNING branch_id as "branchID", branch_name as "branchName", city, address;
    `;
    values.push(branchID);

    const result = await db.query(sql, values);

    if (result.rows.length === 0){
      return null;
    }
    return result.rows[0] as BranchPublic;

  }catch(err){
    console.error(err);
    return null;
  }

}

export async function deleteBranchDB(branchID: number): Promise<void>{
  try {
    const sql = `
      DELETE FROM branch
      WHERE branch_id = $1
      RETURNING branch_id;
    `;

    const result = await db.query(sql, [branchID]);

    return result.rowCount > 0;

  } catch (err) {
    console.error("Database error:", err);
    return false;
  }
}
