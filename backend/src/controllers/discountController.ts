/* eslint-disable max-len */
import { Request, Response } from "express";
import console from "node:console";
import {jsonResponse} from "@src/common/util/response";
import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";
import {getAllDiscountsDB, getDiscountByIdDB, getDiscountsByBranchDB, createDiscountDB, updateDiscountDB, deleteDiscountDB} from "@src/repos/discountRepo";

export async function getAllDiscounts(req: Request, res: Response): Promise<void>{
  try{
    const discounts = await getAllDiscountsDB();

    if (!discounts || discounts.length === 0) {
      return jsonResponse(res, false, HttpStatusCodes.NOT_FOUND, {message: "No discounts found"});
    }

    return jsonResponse(res, true, HttpStatusCodes.OK, {message: "Discounts fetched successfully", data: discounts});

  }catch(err){
    console.error(err);
    return jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, {message: "Server error"});
  }
}

export async function getDiscountById(req: Request, res: Response): Promise<void> {
  try {
    const discountID = parseInt(req.params.discountID, 10);

    if (isNaN(discountID)) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {message: "Invalid discount ID"});
    }

    const discount = await getDiscountByIdDB(discountID);

    if (!discount) {
      return jsonResponse(res, false, HttpStatusCodes.NOT_FOUND, {message: "Discount not found"});
    }

    return jsonResponse(res, true, HttpStatusCodes.OK, {message: "Discount fetched successfully", data: discount,
    });

  } catch (err) {
    console.error("Error in getDiscountById:", err);
    return jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, {message: "Server error while fetching discount"});
  }
}

export async function getDiscountsByBranch(req: Request, res: Response): Promise<void> {
  try {
    const branchID = parseInt(req.params.branchID, 10);

    if (isNaN(branchID)) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {message: "Invalid branch ID"});
    }

    const discounts = await getDiscountsByBranchDB(branchID);

    if (!discounts || discounts.length === 0) {
      return jsonResponse(res, false, HttpStatusCodes.NOT_FOUND, {message: "No discounts found for this branch"});
    }

    return jsonResponse(res, true, HttpStatusCodes.OK, {message: "Discounts fetched successfully", data: discounts,
    });

  } catch (err) {
    console.error("Error in getDiscountsByBranch:", err);
    return jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, {message: "Server error while fetching discounts by branch"});
  }
}

export async function createDiscount(req: Request, res: Response): Promise<void> {
  try {
    const {
      branchId,
      discountName,
      discountType,
      discountValue,
      minBillAmount,
      discountCondition,
      validFrom,
      validTo,
    } = req.body;

    if (
      !branchId ||
            !discountName ||
        !discountType ||
        !discountValue ||
        !validFrom ||
        !validTo
    ) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {message: "Missing required fields"});
    }

    if (discountType !== "fixed" && discountType !== "percentage") {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {message: "Invalid discount type — must be 'fixed' or 'percentage'"});
    }

    const fromDate = new Date(validFrom);
    const toDate = new Date(validTo);

    if (fromDate > toDate) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {message: "Invalid date range — 'validFrom' cannot be after 'validTo'"});
    }

    const newDiscount = await createDiscountDB({
      branchId,
      discountName,
      discountType,
      discountValue,
      minBillAmount,
      discountCondition,
      validFrom: fromDate,
      validTo: toDate,
    });

    if (!newDiscount) {
      return jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, {message: "Failed to create discount"});
    }

    return jsonResponse(res, true, HttpStatusCodes.CREATED, {message: "Discount created successfully", data: newDiscount,
    });

  } catch (err) {
    console.error("Error in createDiscount:", err);
    return jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: "Server error while creating discount",
    });
  }
}

export async function updateDiscount(req: Request, res: Response): Promise<void> {
  try {
    const discountID = parseInt(req.params.discountID, 10);
    if (isNaN(discountID)) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        message: "Invalid discount ID",
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
    } = req.body;

    if (
      !branchId &&
            !discountName &&
            !discountType &&
            !discountValue &&
            !minBillAmount &&
            !discountCondition &&
            !validFrom &&
            !validTo
    ) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        message: "No fields provided to update",
      });
    }

    if (discountType && discountType !== "fixed" && discountType !== "percentage") {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        message: "Invalid discount type — must be 'fixed' or 'percentage'",
      });
    }

    const fromDate = validFrom ? new Date(validFrom) : undefined;
    const toDate = validTo ? new Date(validTo) : undefined;

    if (fromDate && toDate && fromDate > toDate) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        message: "'validFrom' cannot be after 'validTo'",
      });
    }

    const updatedDiscount = await updateDiscountDB(discountID, {
      branchId,
      discountName,
      discountType,
      discountValue,
      minBillAmount,
      discountCondition,
      validFrom: fromDate,
      validTo: toDate,
    });

    if (!updatedDiscount) {
      return jsonResponse(res, false, HttpStatusCodes.NOT_FOUND, {
        message: "Discount not found or update failed",
      });
    }

    return jsonResponse(res, true, HttpStatusCodes.OK, {
      message: "Discount updated successfully",
      data: updatedDiscount,
    });
  } catch (err) {
    console.error("Error in updateDiscount:", err);
    return jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: "Server error while updating discount",
    });
  }
}

export async function deleteDiscount(req: Request, res: Response): Promise<void> {
  try {
    const discountID = parseInt(req.params.discountID, 10);

    if (isNaN(discountID)) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        message: "Invalid discount ID",
      });
    }

    const deleted = await deleteDiscountDB(discountID);

    if (!deleted) {
      return jsonResponse(res, false, HttpStatusCodes.NOT_FOUND, {
        message: "Discount not found or already deleted",
      });
    }

    return jsonResponse(res, true, HttpStatusCodes.OK, {
      message: "Discount deleted successfully",
    });

  } catch (err) {
    console.error("Error in deleteDiscount:", err);
    return jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: "Server error while deleting discount",
    });
  }
}