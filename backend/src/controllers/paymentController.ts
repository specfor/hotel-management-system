/* eslint-disable max-len*/
import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";
import { jsonResponse } from "@src/common/util/response";
import { Request, Response } from "express";

import {
  addNewPayment_model,
  deletePayment_model,
  updatePaymentInfo_model,
} from "@src/models/paymentModel";
import {
  getAllPayments_repo,
  getPaymentByID_repo,
  updatePaymentInfo_repo,
  deletePayment_repo,
} from "@src/repos/paymentRepo";
import { PaymentPrivate, PaymentPublic } from "@src/types/paymentTypes";
// ES Modules
import Joi from "joi";
// CommonJS

/**
 * Handles the HTTP request to retrieve all Payments.
 *
 * @param req - The Express request object.
 * @param res - The Express response object.
 * @returns A promise that resolves when the response is sent.
 * PaymentPublic
 * Responds with a JSON object containing the list of all Payments.
 */
export async function getAllPayments(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const Payments = await getAllPayments_repo();
    if (Payments === null) {
      jsonResponse(res, false, HttpStatusCodes.NOT_FOUND, {
        error: "Payments not found",
      });
      return;
    }
    jsonResponse(res, true, HttpStatusCodes.OK, { Payments });
  } catch (error) {
    jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      error: "Database Error - Error Happened in the repo",
    });
  }
  
}

export async function getPaymentByID(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        error: "Invalid Payment ID",
      });
      return;
    }
    const Payment = await getPaymentByID_repo(id);

    if (!Payment) {
      jsonResponse(res, false, HttpStatusCodes.NOT_FOUND, {
        error: "Payment not found",
      });
      return;
    }
    jsonResponse(res, true, HttpStatusCodes.OK, { Payment });
  } catch {
    jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      error: "Database Error - Error Happened in the repo",
    });
  }
}

export async function addNewPayment(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const newPaymentSchema = Joi.object({
      bill_id: Joi.number().integer().positive().required().label("Bill ID"),

      paid_method: Joi.string()
        .valid("Cash", "Card", "Online", "BankTransfer")
        .required()
        .label("Paid Method"),

      paid_amount: Joi.number()
        .positive()
        .precision(2)
        .required()
        .label("Paid Amount"),

      date_time: Joi.date().iso().allow(null).label("Date and Time"),
    });
    const validationResult = newPaymentSchema.validate(req.body);
    // The validation result contains either an error or the validated value
    if (validationResult.error) {
      jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        error: validationResult.error.message,
      });
    } else {
      const result = await addNewPayment_model(req.body);
      const { success } = result;
      if (success) {
        const { payment_id } = result;
        jsonResponse(res, true, HttpStatusCodes.OK, { payment_id });
      } else {
        const { error } = result;
        jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, { error });
      }
    }
  } catch {
    jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      error: "Database Error - Error Happened in the repo",
    });
  }
}

export async function updatePayment(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        error: "Invalid Payment ID",
      });
      return;
    }
    const updatePaymentSchema = Joi.object({
      bill_id: Joi.number().integer().positive().required().label("Bill ID"),

      paid_method: Joi.string()
        .valid("Cash", "Card", "Online", "BankTransfer")
        .required()
        .label("Paid Method"),

      paid_amount: Joi.number()
        .positive()
        .precision(2)
        .required()
        .label("Paid Amount"),

      date_time: Joi.date().iso().allow(null).label("Date and Time"),
    });
    const Payment = await updatePaymentInfo_model(
      req.body as PaymentPublic,
      id
    );

    jsonResponse(res, true, HttpStatusCodes.OK, { Payment });
  } catch (error) {
    jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      error: "Database Error - Error Happened in the repo",
    });
  }
}

export async function deletePayment(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        error: "Invalid Payment ID",
      });
      return;
    }
    const result = await deletePayment_model(id);
    const { success } = result;
    if (success) {
      jsonResponse(res, true, HttpStatusCodes.OK, {});
    } else {
      const { error } = result;
      jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, { error });
    }

    jsonResponse(res, true, HttpStatusCodes.OK, {});
  } catch {
    jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      error: "Database Error - Error Happened in the repo",
    });
  }
}
