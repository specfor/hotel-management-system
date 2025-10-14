/* eslint-disable max-len*/
import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";
import { jsonResponse } from "@src/common/util/response";
import { Request, Response } from "express";
import {
  getAllfinalBills_repo,
  getfinalBillByID_repo,
  addNewfinalBill_repo,
  updatefinalBillInfo_repo,
  deletefinalBill_repo,
} from "@src/repos/finalBillRepo";
import { FinalBillPublic } from "@src/types/finalBillType";

/**
 * Handles the HTTP request to retrieve all final bills.
 */
export async function getAllFinalBills(req: Request, res: Response): Promise<void> {
  const finalBills = await getAllfinalBills_repo();
  jsonResponse(res, true, HttpStatusCodes.OK, { finalBills });
}

export async function getFinalBillByID(req: Request, res: Response): Promise<void> {
  const bill_id = parseInt(req.params.bill_id);
  if (isNaN(bill_id)) {
    jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, { error: "Invalid Bill ID" });
    return;
  }
  const finalBill = await getfinalBillByID_repo(bill_id);

  if (!finalBill) {
    jsonResponse(res, false, HttpStatusCodes.NOT_FOUND, { error: "Final bill not found" });
    return;
  }
  jsonResponse(res, true, HttpStatusCodes.OK, { finalBill });
}

export async function addNewFinalBill(req: Request, res: Response): Promise<void> {
  const billId = await addNewfinalBill_repo(req.body as Omit<FinalBillPublic, "bill_id" | "created_at">);
  jsonResponse(res, true, HttpStatusCodes.OK, { billId });
}

export async function updateFinalBill(req: Request, res: Response): Promise<void> {
  const bill_id = parseInt(req.params.bill_id);
  if (isNaN(bill_id)) {
    jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, { error: "Invalid Bill ID" });
    return;
  }
  const updatedBill = await updatefinalBillInfo_repo({
    ...req.body,
    bill_id,
  } as FinalBillPublic);

  jsonResponse(res, true, HttpStatusCodes.OK, { updatedBill });
}

export async function deleteFinalBill(req: Request, res: Response): Promise<void> {
  const bill_id = parseInt(req.params.bill_id);
  if (isNaN(bill_id)) {
    jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, { error: "Invalid Bill ID" });
    return;
  }
  await deletefinalBill_repo(bill_id);

  jsonResponse(res, true, HttpStatusCodes.OK, {});
}