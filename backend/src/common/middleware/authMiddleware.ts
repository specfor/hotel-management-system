import { Request, Response, NextFunction } from "express";
import { verifyToken, JwtPayload } from "@src/common/util/auth";
import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";

//Extended Request interface with user information
export interface AuthRequest extends Request {
  user?: JwtPayload;
}

//Middleware to authenticate JWT tokens
export function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(HttpStatusCodes.BAD_REQUEST).json({
        error: "No token provided. Authorization header must be: Bearer <token>",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(HttpStatusCodes.BAD_REQUEST).json({
        error: "No token provided",
      });
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch {
    return res.status(HttpStatusCodes.BAD_REQUEST).json({
      error: "Invalid or expired token",
    });
  }
}


