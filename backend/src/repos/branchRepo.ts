import {BranchPublic} from "@src/types/branchTypes";    // named export
import db from "@src/common/util/db";
import {QueryResult} from "pg";

export async function getAllBranchesDB(): Promise<BranchPublic[] | null>{

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

  if(result.rows.length == 0){
    return null;
  }

  return result.rows as BranchPublic[];

}

export async function getBranchByIdDB(branchID:number): Promise<BranchPublic | null>{

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
  }
  return result.rows[0] as BranchPublic;

}

export async function createBranchDB(
  branchName: string, city: string,
  address: string): Promise<BranchPublic | null>{

  const sql = `
        INSERT INTO branch (branch_name, city, address)
        VALUES ($1, $2, $3)
        RETURNING 
            branch_id AS "branchId",
            branch_name AS "branchName",
            city,
            address;
        `;

  const createdBranch = await db.query(sql, [branchName, city, address]);

  if(createdBranch.rows.length == 0){
    return null;
  }
  return createdBranch.rows[0] as BranchPublic;

}

export async function updateBranchDB(
  branchID: number, branchName?: string,
  city?: string, address?: string): Promise<BranchPublic | null>{

  const updates: string[] = [];
  const values:  (string | number)[] = [];
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

}

export async function deleteBranchDB(branchID: number): Promise<boolean>{

  const sql = `
      DELETE FROM branch
      WHERE branch_id = $1
      RETURNING branch_id;
    `;

  const result: QueryResult= await db.query(sql, [branchID]);

  return (result.rowCount ?? 0) > 0;

}
