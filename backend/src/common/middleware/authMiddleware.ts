import { Request, Response, NextFunction } from "express";
import { verifyToken, JwtPayload } from "@src/common/util/auth";
import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";
import { isPublicRoute } from "@src/common/config/publicRoutes";
import { jsonResponse } from "@src/common/util/response";

//Extended Request interface with user information
export interface AuthRequest extends Request {
  user?: JwtPayload;
}

//Global authentication middleware with public routes whitelist
export function globalAuthMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  // Skip authentication for public routes
  if (isPublicRoute(req.path)) {
    return next();
  }

  // Check for Authorization header
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        error: "No token provided. Authorization header must be: Bearer <token>",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        error: "No token provided",
      });
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch {
    return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
      error: "Invalid or expired token",
    });
  }
}

//Individual route authentication middleware (for specific routes if needed)
export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        error: "No token provided. Authorization header must be: Bearer <token>",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        error: "No token provided",
      });
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch {
    return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
      error: "Invalid or expired token",
    });
  }
}
