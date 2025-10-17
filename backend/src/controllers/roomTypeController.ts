import {jsonResponse} from "@src/common/util/response";
import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";
import {Request, Response} from "express";
import {getAllRoomTypesDB, getRoomTypesByBranchDB,
  createRoomTypeDB, updateRoomTypeDB, deleteRoomTypeDB} from "@src/repos/roomTypeRepo";
import {getBranchByIdDB} from "@src/repos/branchRepo";
import * as console from "node:console";
import Joi from "joi";

export async function getAllRoomTypes(req:Request, res: Response){
  try{
    const roomTypeArr = await getAllRoomTypesDB();

    if(!roomTypeArr){
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        message: "No room types stored",
      });
    }else{
      return jsonResponse(res, true, HttpStatusCodes.OK, roomTypeArr);
    }

  }catch(err){
    console.log(err);
    return jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: "Server error",
    });
  }

}

export async function getRoomTypesByBranch(req:Request, res: Response){
  try{
    const paramSchema = Joi.object<{branchId: number}>({
      branchId: Joi.number().integer().positive().required(),
    });

    const paramResult = paramSchema.validate(req.params, {
      abortEarly : false,
    });

    if(paramResult.error){
      const messages = paramResult.error.details.map((details) => details.message);
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        message: "invalid input data",
        details: messages,
      });
    }

    const roomTypeId = paramResult.value.branchId;

    const roomTypeArr = await getRoomTypesByBranchDB(roomTypeId);

    if(!roomTypeArr){
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        message: "No room types stored",
      });
    }else{
      return jsonResponse(res, true, HttpStatusCodes.OK, {roomTypeArr});
    }

  }catch(err){
    console.log(err);
    return jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: "Server error",
    });
  }
}

export async function createRoomType(req: Request, res: Response){
  try{
    const bodySchema = Joi.object<{
        branchId:number, roomTypeName:string,
        dailyRate:number, lateCheckoutRate?:number,
        capacity?:number, amenities?:string,
    }>({
      branchId: Joi.number().integer().positive().required(),
      roomTypeName: Joi.string().required(),
      dailyRate: Joi.number().integer().positive().required(),
      lateCheckoutRate: Joi.number().integer().positive().optional(),
      capacity: Joi.number().integer().positive().optional(),
      amenities: Joi.string().optional(),
    });

    const bodyResult = bodySchema.validate(req.body, {
      abortEarly: false,
    });

    if(bodyResult.error){
      const messages = bodyResult.error.details.map((details) => details.message);
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        message: "invalid input data",
        details: messages,
      });
    }

    const branchId = bodyResult.value.branchId;
    const roomTypeName = bodyResult.value.roomTypeName;
    const dailyRateInt = bodyResult.value.dailyRate;
    const lateCheckoutRateInt = bodyResult.value.lateCheckoutRate;
    const capacityInt = bodyResult.value.capacity;
    const amenities = bodyResult.value.amenities;

    if(!(await getBranchByIdDB(branchId))){
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        message: "Branch ID is not valid",
      });
    }

    const roomTypesAvailable = await getRoomTypesByBranchDB(branchId);

    console.log("before the for loop");

    if (roomTypesAvailable) {
      for (const roomType of roomTypesAvailable) {
        console.log(roomType.roomTypeName);
        if (roomType.roomTypeName === roomTypeName) {
          return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
            message: `Room type '${roomTypeName}' already exists in branch ${branchId}`,
          });
        }
      }
    }

    console.log("after the for loop");

    const roomType = await createRoomTypeDB(
      branchId, roomTypeName,
      dailyRateInt, lateCheckoutRateInt,
      capacityInt, amenities,
    );

    if(!roomType){
      return jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: "Room type was not created",
      });
    }else{

      return jsonResponse(res, true, HttpStatusCodes.OK, {
        message: "Room type created successfully", roomType,
      });
    }

  }catch(err){
    console.log(err);
    return jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: "Server error",
    });
  }
}

export async function updateRoomType(req: Request, res: Response){
  try{
    const paramSchema = Joi.object<{branchId: number, roomTypeName: string}>({
      branchId: Joi.number().integer().positive().required(),
      roomTypeName: Joi.string().required(),
    });

    const paramResult = paramSchema.validate(req.params, {
      abortEarly: false,
    });

    if(paramResult.error) {
      const messages = paramResult.error.details.map((details) => details.message);
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        message: "invalid input data",
        details: messages,
      });
    }

    const branchId = paramResult.value.branchId;
    const roomTypeName = paramResult.value.roomTypeName;

    const bodySchema = Joi.object<{
        dailyRate?:number, lateCheckoutRate?:number,
        capacity?: number, amenities?: string,
    }>({
      dailyRate: Joi.number().integer().positive().optional(),
      lateCheckoutRate: Joi.number().integer().positive().optional(),
      capacity: Joi.number().integer().positive().optional(),
      amenities: Joi.string().optional(),
    });

    const bodyResult = bodySchema.validate(req.body, {
      abortEarly: false,
    });

    if(bodyResult.error) {
      const messages = bodyResult.error.details.map((details) => details.message);
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        message: "invalid input data",
        details: messages,
      });
    }

    const dailyRate = bodyResult.value.dailyRate;
    const lateCheckoutRate = bodyResult.value.lateCheckoutRate;
    const capacity = bodyResult.value.capacity;
    const amenities = bodyResult.value.amenities;

    if(!dailyRate && !lateCheckoutRate && !capacity && !amenities){
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        message: "At least one field should be not null",
      });
    }

    if(!(await getBranchByIdDB(branchId))){
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        message: "Branch ID is not valid",
      });
    }

    const roomType = await updateRoomTypeDB(
      branchId, roomTypeName, dailyRate, lateCheckoutRate, capacity, amenities,
    );

    if(!roomType){
      return jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: "Updating unsuccessful",
      });
    }

    return jsonResponse(res, true, HttpStatusCodes.OK, {
      message: "Room type updated successfully",
    });

  }catch(err){
    console.log(err);
    return jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: "Server error",
    });
  }
}

export async function deleteRoomType(req: Request, res: Response){
  try{
    const paramSchema = Joi.object<{branchId: number, roomTypeName: string}>({
      branchId: Joi.number().integer().positive().required(),
      roomTypeName: Joi.string().required(),
    });

    const paramResult = paramSchema.validate(req.params, {
      abortEarly: false,
    });

    if(paramResult.error){
      const messages = paramResult.error.details.map((details) => details.message);
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        message: "invalid input data",
        details: messages,
      });
    }

    const branchId = paramResult.value.branchId;
    const roomTypeName = paramResult.value.roomTypeName;

    const deleted = await deleteRoomTypeDB(branchId, roomTypeName);

    if (!deleted) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        message: "Deletion unsuccessful",
      });
    }

    return jsonResponse(res, true, HttpStatusCodes.OK, {
      message: "Deleted successfully",
    });
    
  }catch(err){
    console.log(err);
    return jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: "Server error",
    });
  }
}
