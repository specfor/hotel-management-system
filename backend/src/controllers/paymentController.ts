/* eslint-disable max-len*/
import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";
import { jsonResponse } from "@src/common/util/response";
import { Request, Response } from "express";
import {
  getAllPayments_repo,
  getPaymentByID_repo,
  addNewPayment_repo,
  updatePaymentInfo_repo,
  deletePayment_repo,
} from "@src/repos/paymentRepo";
import { PaymentPublic } from "@src/types/paymentTypes";

/**
 * Handles the HTTP request to retrieve all Payments.
 * 
 * @param req - The Express request object.
 * @param res - The Express response object.
 * @returns A promise that resolves when the response is sent.
 * PaymentPublic
 * Responds with a JSON object containing the list of all Payments.
 */
export async function getAllPayments(req: Request, res: Response): Promise<void> {
  const Payments = await getAllPayments_repo();
  jsonResponse(res, true, HttpStatusCodes.OK, { Payments });
}

export async function getPaymentByID(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, { error: "Invalid Payment ID" });
    return;
  }
  const Payment = await getPaymentByID_repo(id);
  
  if (!Payment) {
    jsonResponse(res, false, HttpStatusCodes.NOT_FOUND, { error: "Payment not found" });
    return;
  }
  jsonResponse(res, true, HttpStatusCodes.OK, { Payment });
}

export async function addNewPayment(req: Request, res: Response): Promise<void> {
  
  const Payment = await addNewPayment_repo(req.body as PaymentPublic);
  
  jsonResponse(res, true, HttpStatusCodes.OK, { Payment });
}

export async function updatePayment(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, { error: "Invalid Payment ID" });
    return;
  }
  const Payment = await updatePaymentInfo_repo(req.body as PaymentPublic);
  
  jsonResponse(res, true, HttpStatusCodes.OK, { Payment });
}

export async function deletePayment(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, { error: "Invalid Payment ID" });
    return;
  }
  await deletePayment_repo(id);
  
  jsonResponse(res, true, HttpStatusCodes.OK, {});
}