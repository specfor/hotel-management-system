import {BranchPublic} from "@src/types/branchTypes";
import {getAllBranchesDB} from "@src/repos/branchRepo";
import {jsonResponse} from "@src/common/util/response";
import {Request, Response} from "express";
import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";

export async function getAllBranches(req: Request, res: Response): Promise<void>{
    let branchArr = await getAllBranchesDB();
    return jsonResponse(res, true, HttpStatusCodes.OK, {branchArr});
}