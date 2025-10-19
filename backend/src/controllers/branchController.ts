import {
  createBranchDB, getAllBranchesDB,
  getBranchByIdDB, updateBranchDB,
  deleteBranchDB} from "@src/repos/branchRepo";
import {jsonResponse} from "@src/common/util/response";
import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";

import * as console from "node:console";
import {Request, Response} from "express";
import Joi from "joi";

export async function getAllBranches(req: Request, res: Response){
  try{
    const branchArr = await getAllBranchesDB();

    if(branchArr == null || branchArr.length == 0){
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        message: "No branches stored",
      });
    }

    return jsonResponse(res, true, HttpStatusCodes.OK, {branchArr});

  }catch(err){
    console.error(err);
    return jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: "Server error",
    });
  }
}

export async function getBranchByID(req: Request, res: Response){
  try{
    const paramsSchema = Joi.object<{branchId: number}>({
      branchId: Joi.number().integer().positive().required(),
    });

    const paramResult = paramsSchema.validate(req.params,{
      abortEarly: false,
    });

    if(paramResult.error){
      const messages = paramResult.error.details.map((details) => details.message);
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        message: "invalid input data",
        details: messages,
      });
    }

    const branchIDInt: number =  paramResult.value.branchId;

    const branch = await getBranchByIdDB(branchIDInt);

    if(branch == null){
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        message: "No branch with the ID " + branchIDInt,
      });
    }
    return jsonResponse(res, true, HttpStatusCodes.OK, {branch});

  }catch(err){
    console.error(err);
    return jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: "Server error",
    });
  }
}

export async function createBranch(req: Request, res: Response){
  try{
    const bodySchema = Joi.object<{branchName:string, city:string, address:string}>({
      branchName: Joi.string().required(),
      city: Joi.string().required(),
      address: Joi.string().required(),
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

    const branchName = bodyResult.value.branchName;
    const city = bodyResult.value.city;
    const address = bodyResult.value.address;

    const createdBranch = await createBranchDB(branchName, city, address);

    if(createdBranch == null){
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        message: "Branch was not created",
      });
    }
    return jsonResponse(res, true, HttpStatusCodes.OK, {
      message: "Branch creation successful ", createdBranch,
    });

  }catch(err){
    console.log(err);
    return jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: "Server error",
    });
  }
}

export async function updateBranch(req: Request, res: Response){
  try{
    const paramSchema = Joi.object<{branchId: number}>({
      branchId: Joi.number().integer().positive().required(),
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

    const branchId: number = paramResult.value.branchId;

    const bodySchema = Joi.object<{branchName:string, city:string, address:string}>({
      branchName: Joi.string().optional(),
      city: Joi.string().optional(),
      address: Joi.string().optional(),
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

    const branchName = bodyResult.value.branchName;
    const city = bodyResult.value.city;
    const address = bodyResult.value.address;

    if(!branchName && !city && !address){
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        message: "At least one field should be not null",
      });
    }

    const branch = await updateBranchDB(branchId, branchName, city, address);

    if(!branch){
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        message: "Branch updating unsuccessful",
      });
    }

    return jsonResponse(res, true, HttpStatusCodes.OK, {
      message: "Branch updated successfully",
      details: branch,
    });

  }catch(err){
    console.log(err);
    return jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: "Server error",
    });
  }
}

export async function deleteBranch(req: Request, res: Response){
  try{
    const paramSchema = Joi.object<{branchId: number}>({
      branchId: Joi.number().integer().positive().required(),
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

    const deleted = await deleteBranchDB(branchId);

    if (!deleted) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        message: "Branch deletion unsuccessful",
      });
    }

    return jsonResponse(res, true, HttpStatusCodes.OK, {
      message: "Branch with ID " + branchId + " deleted successfully",
    });

  }catch(err){
    console.log(err);
    return jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: "Server error",
    });
  }
}