// backend/src/controllers/bookingController.ts

import { Request, Response } from "express";
import { jsonResponse } from "@src/common/util/response";
import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";
import logger from "jet-logger";
import {
  createBookingModel,
  updateBookingModel,
  isValidBookingStatus,
  getConflictingBookingsModel,
  deleteBookingModel,
} from "@src/models/bookingModel";
import { BookingStatus, BookingUpdate } from "@src/types/bookingTypes";
import { getAllBookingsModel, getBookingByIDModel } from "@src/models/bookingModel";
import { AuthRequest } from "@src/common/middleware/authMiddleware";

// --- READ Endpoints ---

/**
 * Get all bookings. (READ All)
 */
export async function getAllBookings(req: Request, res: Response) {
  try {
    const { guestId, roomId, branchId } = req.query;
    const bookings = await getAllBookingsModel({
      guestId: guestId ? Number(guestId) : undefined,
      roomId: roomId ? Number(roomId) : undefined,
      branchId: branchId ? Number(branchId) : undefined,
    });

    return jsonResponse(res, true, HttpStatusCodes.OK, { bookings });
  } catch (err) {
    logger.err(err);
    return jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, { message: "Server error" });
  }
}

/**
 * Get a single booking record by ID. (READ One)
 */
export async function getBookingByID(req: Request, res: Response) {
  try {
    const bookingIDStr: string = req.params.bookingID;
    const bookingIDInt: number = parseInt(bookingIDStr, 10);

    if (isNaN(bookingIDInt)) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, { message: "Booking ID must be a valid number" });
    }

    const booking = await getBookingByIDModel(bookingIDInt);

    if (booking == null) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, { message: "No booking found with that ID" });
    } else {
      return jsonResponse(res, true, HttpStatusCodes.OK, { booking });
    }
  } catch (err) {
    logger.err(err);
    return jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, { message: "Server error" });
  }
}

/**
 * Check room availability by Room ID and Date Range. (NEW FUNCTION)
 * Uses query parameters for checkIn and checkOut dates.
 */
export async function checkRoomAvailability(req: Request, res: Response) {
  try {
    const { roomID, checkIn, checkOut } = req.query; // Use req.query for GET parameters

    if (!roomID || !checkIn || !checkOut) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        message: "Missing required query parameters: roomID, checkIn, checkOut",
      });
    }

    const roomIDInt: number = parseInt(roomID as string, 10);
    const checkInDate = new Date(checkIn as string);
    const checkOutDate = new Date(checkOut as string);

    if (isNaN(roomIDInt) || isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, { message: "Invalid format for roomID or dates" });
    }

    const conflictingBookings = await getConflictingBookingsModel(roomIDInt, checkInDate, checkOutDate);

    if (conflictingBookings == null) {
      // No conflicts found
      return jsonResponse(res, true, HttpStatusCodes.OK, { message: "Room is available for the requested period." });
    } else {
      // Conflicts found
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        message: "Room is unavailable due to conflicting booking(s).",
        conflictingBookings,
      });
    }
  } catch (err) {
    logger.err(err);
    return jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, { message: "Server error" });
  }
}

// --- MUTATION Endpoints (Existing CRUD) ---

/**
 * Create a new booking. (CREATE)
 */
export async function createBooking(req: AuthRequest, res: Response) {
  try {
    const { guestId, roomId, checkIn, checkOut } = req.body as {
      guestId: number;
      roomId: number;
      checkIn: string;
      checkOut: string;
    };

    // Get userId from authenticated user
    const userId = req.user?.staffId;

    if (!userId || !guestId || !roomId || !checkIn || !checkOut) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        message: "Missing required fields for creation or user not authenticated",
      });
    }

    const bookingData = {
      userId,
      guestId,
      roomId,
      checkIn,
      checkOut,
    };

    const createdBooking = await createBookingModel(bookingData);

    if (createdBooking == null) {
      return jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, { message: "Booking was not created" });
    } else {
      return jsonResponse(res, true, HttpStatusCodes.OK, {
        message: "Booking created successfully",
        booking: createdBooking,
      });
    }
  } catch (err) {
    logger.err(err);
    return jsonResponse(
      res,
      false,
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      // eslint-disable-next-line max-len
      { message: "Server error during booking creation (e.g., double booking or invalid IDs)" }
    );
  }
}

/**
 * Update an existing booking. (UPDATE)
 */
export async function updateBooking(req: AuthRequest, res: Response) {
  try {
    const bookingIDStr: string = req.params.bookingID;
    const bookingIDInt: number = parseInt(bookingIDStr, 10);

    // 1. Safely cast req.body once to a temporary type for access
    const body = req.body as {
      bookingStatus?: unknown;
      userId?: number;
      guestId?: number;
      roomId?: number;
      checkIn?: string;
      checkOut?: string;
      [key: string]: unknown;
    };

    if (isNaN(bookingIDInt)) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, { message: "Booking ID must be a valid number" });
    }

    // 2. Validation checks are now safe
    if (body.bookingStatus && !isValidBookingStatus(body.bookingStatus)) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, { message: "Invalid booking status provided" });
    }

    // 3. Construct the type-safe updateData object by MANUAL ASSIGNMENT
    const updateData: BookingUpdate = { bookingId: bookingIDInt };

    // Explicitly copy and cast properties from the 'body' object to the target interface
    // Only copy if the field exists (is not undefined)
    // If userId is not provided in the body, use the authenticated user's ID
    if (body.userId !== undefined) {
      updateData.userId = body.userId;
    } else if (req.user?.staffId) {
      updateData.userId = req.user.staffId;
    }

    if (body.guestId !== undefined) updateData.guestId = body.guestId;
    if (body.roomId !== undefined) updateData.roomId = body.roomId;

    // Cast validated fields to their final type (BookingStatus)
    // eslint-disable-next-line max-len
    if (body.bookingStatus) updateData.bookingStatus = body.bookingStatus as BookingStatus;
    // Convert checkIn/checkOut strings to Date objects if they exist
    if (body.checkIn) updateData.checkIn = new Date(body.checkIn);
    if (body.checkOut) updateData.checkOut = new Date(body.checkOut);

    // 4. Check if any actual fields were set for update (other than the ID)
    if (Object.keys(body).length === 0) {
      // Checking req.body length is sufficient for this check
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        message: "At least one field must be provided for update",
      });
    }

    // 5. Pass the complete, safely constructed updateData
    const updatedBooking = await updateBookingModel(updateData);

    if (updatedBooking == null) {
      return jsonResponse(res, false, HttpStatusCodes.NOT_FOUND, {
        message: "Booking with ID " + bookingIDInt + " not found or no changes made",
      });
    } else {
      return jsonResponse(res, true, HttpStatusCodes.OK, {
        message: "Booking updated successfully",
        booking: updatedBooking,
      });
    }
  } catch (err) {
    logger.err(err);
    return jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, { message: "Server error" });
  }
}

/**
 * Delete a booking. (DELETE)
 */
export async function deleteBooking(req: Request, res: Response) {
  try {
    const bookingIDStr: string = req.params.bookingID;
    const bookingIDInt: number = parseInt(bookingIDStr, 10);

    if (isNaN(bookingIDInt)) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, { message: "Booking ID must be a valid number" });
    }

    const deleted = await deleteBookingModel(bookingIDInt);

    if (!deleted) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        message: "No booking found with ID " + bookingIDInt,
      });
    } else {
      return jsonResponse(res, true, HttpStatusCodes.OK, { message: "Booking deleted successfully" });
    }
  } catch (err) {
    logger.err(err);
    return jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, { message: "Server error" });
  }
}
