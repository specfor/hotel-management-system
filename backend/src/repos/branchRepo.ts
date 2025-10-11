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
            branch
    `;
        const result = await db.query(sql);
        return result.rows as BranchPublic[];
    }catch(err){
        console.error(err);
        return null;
    }
}

