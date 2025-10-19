import {
  getAllDiscountsDB,
  getDiscountByIdDB,
  getDiscountsByBranchDB,
  createDiscountDB,
  updateDiscountDB,
  deleteDiscountDB,
} from "@src/repos/discountRepo";
import { jsonResponse } from "@src/common/util/response";
import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";

import * as console from "node:console";
import { Request, Response } from "express";
import Joi from "joi";

export async function getAllDiscounts(req: Request, res: Response) {
  try {
    const discounts = await getAllDiscountsDB();

    if (!discounts || discounts.length === 0) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        message: "No discounts stored",
      });
    }

    return jsonResponse(res, true, HttpStatusCodes.OK, {
      message: "Discounts fetched successfully",
      details: discounts,
    });
  } catch (err) {
    console.error(err);
    return jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: "Server error",
    });
  }
}

export async function getDiscountById(req: Request, res: Response) {
  try {
    const paramSchema = Joi.object<{ discountId: number }>({
      discountId: Joi.number().integer().positive().required(),
    });

    const paramResult = paramSchema.validate(req.params, {
      abortEarly: false,
    });

    if (paramResult.error) {
      const messages = paramResult.error.details.map((details) => details.message);
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        message: "invalid input data",
        details: messages,
      });
    }

    const discountId: number = paramResult.value.discountId;

    const discount = await getDiscountByIdDB(discountId);

    if (!discount) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        message: "No discount found with ID " + discountId,
      });
    }

    return jsonResponse(res, true, HttpStatusCodes.OK, {
      message: "Discount fetched successfully",
      details: discount,
    });
  } catch (err) {
    console.error(err);
    return jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: "Server error",
    });
  }
}

export async function getDiscountsByBranch(req: Request, res: Response) {
  try {
    const paramSchema = Joi.object<{ branchId: number }>({
      branchId: Joi.number().integer().positive().required(),
    });

    const paramResult = paramSchema.validate(req.params, {
      abortEarly: false,
    });

    if (paramResult.error) {
      const messages = paramResult.error.details.map((details) => details.message);
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        message: "invalid input data",
        details: messages,
      });
    }

    const branchId: number = paramResult.value.branchId;

    const discounts = await getDiscountsByBranchDB(branchId);

    if (!discounts || discounts.length === 0) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        message: "No discounts found for branch ID " + branchId,
      });
    }

    return jsonResponse(res, true, HttpStatusCodes.OK, {
      message: "Discounts fetched successfully",
      details: discounts,
    });
  } catch (err) {
    console.error(err);
    return jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: "Server error",
    });
  }
}

export async function createDiscount(req: Request, res: Response) {
  try {
    const bodySchema = Joi.object<{
          branchId: number,
          discountName: string,
          discountType: string,
          discountValue: number,
          minBillAmount?: number,
          discountCondition: string,
          validFrom: Date,
          validTo: Date,
      }>({
        branchId: Joi.number().integer().positive().required(),
        discountName: Joi.string().required(),
        discountType: Joi.string().valid("fixed", "percentage").required(),
        discountValue: Joi.number().positive().required(),
        minBillAmount: Joi.number().positive().optional(),
        discountCondition: Joi.string().required(),
        validFrom: Joi.date().required(),
        validTo: Joi.date().required(),
      });

    const bodyResult = bodySchema.validate(req.body, {
      abortEarly: false,
    });

    if (bodyResult.error) {
      const messages = bodyResult.error.details.map((details) => details.message);
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        message: "invalid input data",
        details: messages,
      });
    }

    const {
      branchId,
      discountName,
      discountType,
      discountValue,
      minBillAmount,
      discountCondition,
      validFrom,
      validTo,
    } = bodyResult.value;

    if (new Date(validFrom) > new Date(validTo)) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        message: "Invalid date range — 'validFrom' cannot be after 'validTo'",
      });
    }

    const createdDiscount = await createDiscountDB({
      branchId,
      discountName,
      discountType,
      discountValue,
      minBillAmount,
      discountCondition,
      validFrom,
      validTo,
    });

    if (!createdDiscount) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        message: "Discount creation unsuccessful",
      });
    }

    return jsonResponse(res, true, HttpStatusCodes.OK, {
      message: "Discount created successfully",
      details: createdDiscount,
    });
  } catch (err) {
    console.log(err);
    return jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: "Server error",
    });
  }
}

export async function updateDiscount(req: Request, res: Response) {
  try{
    const paramSchema = Joi.object<{discountId: number}>({
      discountId: Joi.number().integer().positive().required(),
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

    const discountId: number = paramResult.value.discountId;

    const bodySchema = Joi.object<{
            branchId?: number,
            discountName?: string,
            discountType?: string,
            discountValue?: number,
            minBillAmount?: number,
            discountCondition?: string,
            validFrom?: Date,
            validTo?: Date,
        }>({
          branchId: Joi.number().integer().positive().optional(),
          discountName: Joi.string().optional(),
          discountType: Joi.string().valid("fixed", "percentage").optional(),
          discountValue: Joi.number().positive().optional(),
          minBillAmount: Joi.number().positive().optional(),
          discountCondition: Joi.string().optional(),
          validFrom: Joi.date().optional(),
          validTo: Joi.date().optional(),
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
    const discountName = bodyResult.value.discountName;
    const discountType = bodyResult.value.discountType;
    const discountValue = bodyResult.value.discountValue;
    const minBillAmount = bodyResult.value.minBillAmount;
    const discountCondition = bodyResult.value.discountCondition;
    const validFrom = bodyResult.value.validFrom;
    const validTo = bodyResult.value.validTo;

    if(
      !branchId &&
            !discountName &&
            !discountType &&
            !discountValue &&
            !minBillAmount &&
            !discountCondition &&
            !validFrom &&
            !validTo
    ){
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        message: "At least one field should be not null",
      });
    }

    if(validFrom && validTo && new Date(validFrom) > new Date(validTo)){
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        message: "Invalid date range — 'validFrom' cannot be after 'validTo'",
      });
    }

    const updatedDiscount = await updateDiscountDB(discountId, {
      branchId,
      discountName,
      discountType,
      discountValue,
      minBillAmount,
      discountCondition,
      validFrom,
      validTo,
    });

    if(!updatedDiscount){
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        message: "Discount updating unsuccessful",
      });
    }

    return jsonResponse(res, true, HttpStatusCodes.OK, {
      message: "Discount updated successfully",
      details: updatedDiscount,
    });

  }catch(err){
    console.log(err);
    return jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: "Server error",
    });
  }

}

export async function deleteDiscount(req: Request, res: Response) {
  try {
    const paramSchema = Joi.object<{ discountId: number }>({
      discountId: Joi.number().integer().positive().required(),
    });

    const paramResult = paramSchema.validate(req.params, {
      abortEarly: false,
    });

    if (paramResult.error) {
      const messages = paramResult.error.details.map((details) => details.message);
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        message: "invalid input data",
        details: messages,
      });
    }

    const discountId = paramResult.value.discountId;

    const deleted = await deleteDiscountDB(discountId);

    if (!deleted) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        message: "Discount deletion unsuccessful",
      });
    }

    return jsonResponse(res, true, HttpStatusCodes.OK, {
      message: "Discount with ID " + discountId + " deleted successfully",
    });
  } catch (err) {
    console.log(err);
    return jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: "Server error",
    });
  }
}
