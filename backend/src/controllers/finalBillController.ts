/* eslint-disable max-len*/
import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";
import { jsonResponse } from "@src/common/util/response";
import { Request, Response } from "express";
import Joi from "joi";
import { addNewFinalBill_model, updateFinalBillInfo_model } from "@src/models/finalBillModel";
import {
  getAllFinalBills_repo,
  getFinalBillByID_repo,
  getFinalBillByBookingID_repo,
  deleteFinalBill_repo,
} from "@src/repos/finalBillRepo";
import { FinalBillInsert, FinalBillUpdate } from "@src/types/finalBillTypes";


/**
 * Handles the HTTP request to retrieve all final bills.
 */
export async function getAllFinalBills(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const finalBills = await getAllFinalBills_repo();
    if (finalBills === null) {
      jsonResponse(res, false, HttpStatusCodes.NOT_FOUND, {
        error: "Final bills not found",
      });
      return;
    }
    jsonResponse(res, true, HttpStatusCodes.OK, { finalBills });
  } catch {
    jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      error: "Database Error - Error Happened in the repo",
    });
  }
  
}

export async function getFinalBillByID(req: Request, res: Response): Promise<void> {
  try {
    const bill_id = parseInt(req.params.bill_id);
    if (isNaN(bill_id)) {
      jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, { error: "Invalid Bill ID" });
      return;
    }
    const finalBill = await getFinalBillByID_repo(bill_id);
    if (!finalBill) {
      jsonResponse(res, false, HttpStatusCodes.NOT_FOUND, { error: "Final bill not found" });
      return;
    }
    jsonResponse(res, true, HttpStatusCodes.OK, { finalBill });
  } catch {
    jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      error: "Database Error - Error Happened in the repo",
    });
  }
}

export async function getFinalBillByBookingID(req: Request, res: Response): Promise<void> {
  try {
    const booking_id = parseInt(req.params.booking_id);
    if (isNaN(booking_id)) {
      jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, { error: "Invalid Booking ID" });
      return;
    }
    const finalBill = await getFinalBillByBookingID_repo(booking_id);
    if (!finalBill) {
      jsonResponse(res, false, HttpStatusCodes.NOT_FOUND, { error: "Final bill with that booking ID not found" });
      // addNewFinalBill(req, res);
      return;
    }
    jsonResponse(res, true, HttpStatusCodes.OK, { finalBill });
  } catch {
    jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      error: "Database Error - Error Happened in the repo",
    });
  }
}

export async function addNewFinalBill(req: Request, res: Response): Promise<void> {
  try {
    const newFinalBillSchema = Joi.object({
      user_id: Joi.number().integer().positive().required().label("User ID"),
      booking_id: Joi.number().integer().positive().required().label("Booking ID"),
      // total_tax: Joi.number().precision(2).min(0).required().label("Total Tax"),
    });

    const validationResult = newFinalBillSchema.validate(req.body);
    if (validationResult.error) {
      jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        error: validationResult.error.message,
      });
      return;
    }

    const billId = await addNewFinalBill_model(
      req.body as FinalBillInsert,
    );
    jsonResponse(res, true, HttpStatusCodes.OK, { billId });
  } catch {
    jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      error: "Database Error - Error Happened in the repo",
    });
  }
}

export async function updateFinalBill(req: Request, res: Response): Promise<void> {
  try {
    const bill_id = parseInt(req.params.bill_id);
    if (isNaN(bill_id)) {
      jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, { error: "Invalid Bill ID" });
      return;
    }

    const updateFinalBillSchema = Joi.object({
      user_id: Joi.number().integer().positive().required().label("User ID"),
      booking_id: Joi.number().integer().positive().required().label("Booking ID"),
      room_charges: Joi.number().precision(2).min(0).required().label("Room Charges"),
      total_service_charges: Joi.number().precision(2).min(0).required().label("Service Charges"),
      total_tax: Joi.number().precision(2).min(0).required().label("Total Tax"),
      total_discount: Joi.number().precision(2).min(0).required().label("Total Discount"),
      late_checkout_charge: Joi.number().precision(2).min(0).required().label("Late Checkout Charge"),
      total_amount: Joi.number().precision(2).allow(null).label("Total Amount"),
      paid_amount: Joi.number().precision(2).min(0).required().label("Paid Amount"),
      outstanding_amount: Joi.number().precision(2).allow(null).label("Outstanding Amount"),
    });

    const validationResult = updateFinalBillSchema.validate(req.body);
    if (validationResult.error) {
      jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        error: validationResult.error.message,
      });
      return;
    }

    const updatedBill = await updateFinalBillInfo_model(
      bill_id,
      req.body as FinalBillUpdate,
    );

    jsonResponse(res, true, HttpStatusCodes.OK, { updatedBill });
  } catch {
    jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      error: "Database Error - Error Happened in the repo",
    });
  }
}

export async function deleteFinalBill(req: Request, res: Response): Promise<void> {
  try {
    const bill_id = parseInt(req.params.bill_id);
    if (isNaN(bill_id)) {
      jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, { error: "Invalid Bill ID" });
      return;
    }
    await deleteFinalBill_repo(bill_id);
    jsonResponse(res, true, HttpStatusCodes.OK, {});
  } catch {
    jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      error: "Database Error - Error Happened in the repo",
    });
  }
}