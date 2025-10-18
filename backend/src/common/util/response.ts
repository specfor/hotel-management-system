import { Response } from "express";

export function jsonResponse(
  res: Response,
  success: boolean, 
  status: number,
  data: object): Response {
  return res.status(status).json({ success, data});
}
