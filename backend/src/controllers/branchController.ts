/* eslint-disable max-len */
import {BranchPublic} from "@src/types/branchTypes";
import {createBranchDB, getAllBranchesDB, getBranchByIdDB, updateBranchDB, deleteBranchDB} from "@src/repos/branchRepo";
import {jsonResponse} from "@src/common/util/response";
import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";
import * as console from "node:console";
import {Request, Response} from "express";

export async function getAllBranches(req: Request, res: Response): Promise<void>{
  try{
    const branchArr = await getAllBranchesDB();
    return jsonResponse(res, true, HttpStatusCodes.OK, {branchArr});

  }catch(err){
    console.error(err);
    return jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, {message: "Server error"});
  }
}

export async function getBranchByID(req: Request, res: Response): Promise<void>{
  try{
    const branchIDStr: string = req.params.branchID;
    const branchIDInt: number = parseInt(branchIDStr, 10);

    // checking weather ID is not a number
    if(isNaN(branchIDInt)){
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {message: "ID is not a number"});
    }

    const branch = await getBranchByIdDB(branchIDInt);
    if(branch == null){
      return jsonResponse(res, false, HttpStatusCodes.NOT_FOUND, {message: "No branch with the ID" + branchIDInt});
    }else{
      return jsonResponse(res, true, HttpStatusCodes.OK, {branch});
    }

  }catch(err){
    console.error(err);
    return jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, {message: "Server error"});
  }
}

export async function createBranch(req: Request, res: Response): Promise<void>{
  try{
     
    const {branchName, city, address} = req.body;

    if(!branchName || !city || !address){
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {message: "At least one required fields is missing"});
    }

    const createdBranch = await createBranchDB(branchName, city, address);

    if(createdBranch == null){
      return jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, {message: "Branch was not created"});
    }else{
      return jsonResponse(res, true, HttpStatusCodes.CREATED, {message: "Branch creation successful", createdBranch});
    }

  }catch(err){
    console.log(err);
    return jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, {message: "Server error"});
  }
}

export async function updateBranch(req: Request, res: Response): Promise<void>{
  try{
    const branchIDStr: string = req.params.branchID;
    const branchIDInt: number = parseInt(branchIDStr, 10);

    if(isNaN(branchIDInt)){
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {message: "ID is not a number"});
    }

    const {branchName, city, address} = req.body;

    if(!branchName && !city && !address){
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {message: "At least one field should be not null"});
    }

    const branch = await updateBranchDB(branchIDInt, branchName, city, address);

    if(!branch){
      return jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, {message: "No branch with ID" + branchIDInt});
    }else{
      return jsonResponse(res, true, HttpStatusCodes.OK, {message: "Branch updated successfully"});
    }

  }catch(err){
    console.log(err);
    return jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, {message: "Server error"});
  }
}

export async function deleteBranch(req: Request, res: Response): Promise<void>{
  try{
    const branchIDStr: string = req.params.branchID;
    const branchIDInt: number = parseInt(branchIDStr, 10);

    if(isNaN(branchIDInt)){
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {message: "ID is not a number"});
    }

    const deleted = await deleteBranchDB(branchIDInt);

    if (!deleted) {
      return jsonResponse(res, false, HttpStatusCodes.NOT_FOUND, {message: "No branch with ID " + branchIDInt});
    }else{
      return jsonResponse(res, true, HttpStatusCodes.OK, {message: "Branch with ID " + branchIDInt + " deleted successfully"});
    }

  }catch(err){
    console.log(err);
    return jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, {message: "Server error"});
  }
}