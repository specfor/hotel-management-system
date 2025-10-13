/* eslint-disable max-len */
import {jsonResponse} from "@src/common/util/response";
import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";
import {Request, Response} from "express";
import {getAllRoomTypesDB, getRoomTypesByBranchDB, createRoomTypeDB, updateRoomTypeDB, deleteRoomTypeDB} from "@src/repos/roomTypeRepo";
import {getBranchByIdDB} from "@src/repos/branchRepo";
import * as console from "node:console";

export async function getAllRoomTypes(req:Request, res: Response):Promise<void>{
  try{
    const roomTypeArr = await getAllRoomTypesDB();

    if(!roomTypeArr){
      return jsonResponse({ res, success: true, status: HttpStatusCodes.OK, data: { message: "No room types stored or query execution failed" } });
    }else{
      return jsonResponse({ res, success: true, status: HttpStatusCodes.OK, data: roomTypeArr });
    }

  }catch(err){
    console.log(err);
    return jsonResponse({ res, success: false, status: HttpStatusCodes.INTERNAL_SERVER_ERROR, data: { message: "Server error" } });
  }

}

export async function getRoomTypesByBranch(req:Request, res: Response):Promise<void>{
  try{
    const roomTypeIDInt: number = parseInt(req.params.branchID, 10);
    const roomTypeArr = await getRoomTypesByBranchDB(roomTypeIDInt);

    if(!roomTypeArr){
      return jsonResponse({ res, success: true, status: HttpStatusCodes.OK, data: { message: "No room types stored or query execution failed" } });
    }else{
      return jsonResponse({ res, success: true, status: HttpStatusCodes.OK, data: roomTypeArr });
    }

  }catch(err){
    console.log(err);
    return jsonResponse({ res, success: false, status: HttpStatusCodes.INTERNAL_SERVER_ERROR, data: { message: "Server error" } });
  }
}

export async function createRoomType(req: Request, res: Response):Promise<void>{
  try{
    const {branchID, roomTypeName, dailyRate, lateCheckoutRate, capacity, amentities} = req.body;

    const branchIDInt: number = parseInt(branchID, 10);
    const dailyRateInt: number = parseInt(dailyRate, 10);
    const lateCheckoutRateInt: number = parseInt(lateCheckoutRate, 10);
    const capacityInt: number = parseInt(capacity, 10);

    if(isNaN(branchIDInt)){
      return jsonResponse({ res, success: false, status: HttpStatusCodes.BAD_REQUEST, data: { message: "Branch ID is not a number" } });
    }

    if(!(await getBranchByIdDB(branchIDInt))){
      return jsonResponse({ res, success: false, status: HttpStatusCodes.BAD_REQUEST, data: { message: "Branch ID is not valid" } });
    }

    if(isNaN(dailyRateInt)){
      return jsonResponse({ res, success: false, status: HttpStatusCodes.BAD_REQUEST, data: { message: "Daily rate is not a number" } });
    }

    if(isNaN(lateCheckoutRateInt)){
      return jsonResponse({ res, success: false, status: HttpStatusCodes.BAD_REQUEST, data: { message: "Late checkout rate is not a number" } });
    }

    if(isNaN(capacityInt)){
      return jsonResponse({ res, success: false, status: HttpStatusCodes.BAD_REQUEST, data: { message: "Capacity is not a number" } });
    }

    const roomType = await createRoomTypeDB(branchIDInt, roomTypeName, dailyRateInt, lateCheckoutRateInt, capacityInt, amentities);

    if(!roomType){
      return jsonResponse({ res, success: false, status: HttpStatusCodes.INTERNAL_SERVER_ERROR, data: { message: "Room type was not created" } });
    }else{

      return jsonResponse({ res, success: true, status: HttpStatusCodes.CREATED, data: { message: "Room type created successfully", roomType } });
    }

  }catch(err){
    console.log(err);
    return jsonResponse({ res, success: false, status: HttpStatusCodes.INTERNAL_SERVER_ERROR, data: { message: "Server error" } });
  }
}

export async function updateRoomType(req: Request, res: Response): Promise<void>{
  try{
    const branchIDInt:number = parseInt(req.params.branchID, 10);
    const roomTypeName: string = req.params.roomTypeName;

    const{dailyRate, lateCheckoutRate, capacity, amenities} = req.body;

    if(isNaN(branchIDInt)){
      return jsonResponse({ res, success: false, status: HttpStatusCodes.BAD_REQUEST, data: { message: "Branch ID is not a number" } });
    }

    if(!(await getBranchByIdDB(branchIDInt))){
      return jsonResponse({ res, success: false, status: HttpStatusCodes.BAD_REQUEST, data: { message: "Branch ID is not valid" } });
    }

    if(!dailyRate && !lateCheckoutRate && !capacity && !amenities){
      return jsonResponse({ res, success: false, status: HttpStatusCodes.BAD_REQUEST, data: { message: "At least one field should be not null" } });
    }

    const roomType = await updateRoomTypeDB(branchIDInt, roomTypeName, dailyRate, lateCheckoutRate, capacity, amenities);

    if(!roomType){
      return jsonResponse({ res, success: false, status: HttpStatusCodes.INTERNAL_SERVER_ERROR, data: { message: "Updating unsuccessful" } });
    }else{
      return jsonResponse({ res, success: true, status: HttpStatusCodes.OK, data: { message: "Room type updated successfully" } });
    }

  }catch(err){
    console.log(err);
    return jsonResponse({ res, success: false, status: HttpStatusCodes.INTERNAL_SERVER_ERROR, data: { message: "Server error" } });
  }
}

export async function deleteRoomType(req: Request, res: Response): Promise<void>{
  try{
    const branchIDInt:number = parseInt(req.params.branchID, 10);
    const roomTypeName: string = req.params.roomTypeName;

    if(isNaN(branchIDInt)){
      return jsonResponse({ res, success: false, status: HttpStatusCodes.BAD_REQUEST, data: { message: "Branch ID is not a number" } });
    }

    if(!(await getBranchByIdDB(branchIDInt))){
      return jsonResponse({ res, success: false, status: HttpStatusCodes.BAD_REQUEST, data: { message: "Branch ID is not valid" } });
    }

    const deleted = await deleteRoomTypeDB(branchIDInt, roomTypeName);

    if (!deleted) {
      return jsonResponse({ res, success: false, status: HttpStatusCodes.NOT_FOUND, data: { message: "Deletion unsuccessful" } });
    }else{
      return jsonResponse({ res, success: true, status: HttpStatusCodes.OK, data: { message: "Deleted successfully" } });
    }

  }catch(err){
    console.log(err);
    return jsonResponse({ res, success: false, status: HttpStatusCodes.INTERNAL_SERVER_ERROR, data: { message: "Server error" } });
  }
}


// roomTypeId: number;
// branchId: number;
// roomTypeName: string;
// dailyRate: number;
// lateCheckoutRate: number;
// capacity: number;
// amenities: string;