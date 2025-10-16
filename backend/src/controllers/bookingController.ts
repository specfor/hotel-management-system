// backend/src/controllers/bookingController.ts

import { Request, Response } from "express";
import { jsonResponse } from "@src/common/util/response";
import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";
import logger from "jet-logger";
import { 
    getAllBookingsDB, 
    getBookingByIDDB,
    createBookingDB,
    updateBookingDB,
    deleteBookingDB,
    getBookingsByGuestIDDB, // <--- NEW IMPORT
    getBookingsByRoomIDDB,   // <--- NEW IMPORT
    getConflictingBookings,  // <--- NEW IMPORT
} from "@src/repos/bookingRepo";
import { BookingStatus, PaymentMethod } from "@src/types/bookingTypes";

// --- Validation Helpers ---
const isValidBookingStatus = (status: any): status is BookingStatus => {
    const validStatuses: BookingStatus[] = ['Booked', 'Checked-In', 'Checked-Out', 'Cancelled'];
    return validStatuses.includes(status);
};

const isValidPaymentMethod = (method: any): method is PaymentMethod => {
    const validMethods: PaymentMethod[] = ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Online Wallet'];
    return validMethods.includes(method);
};

// --- READ Endpoints ---

/**
 * Get all bookings. (READ All)
 */
export async function getAllBookings(req: Request, res: Response) {
    try {
        const bookings = await getAllBookingsDB();
        
        if (!bookings || bookings.length === 0) {
            return jsonResponse(res, false, HttpStatusCodes.NOT_FOUND, { message: "No bookings found" });
        }
        
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

        const booking = await getBookingByIDDB(bookingIDInt);

        if (booking == null) {
            return jsonResponse(res, false, HttpStatusCodes.NOT_FOUND, { message: "No booking found with that ID" });
        } else {
            return jsonResponse(res, true, HttpStatusCodes.OK, { booking });
        }
    } catch (err) {
        logger.err(err);
        return jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, { message: "Server error" });
    }
}

/**
 * Get bookings by Guest ID. (NEW FUNCTION)
 */
export async function getBookingsByGuestID(req: Request, res: Response) {
    try {
        const guestIDStr: string = req.params.guestID;
        const guestIDInt: number = parseInt(guestIDStr, 10);

        if (isNaN(guestIDInt)) {
            return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, { message: "Guest ID must be a valid number" });
        }

        const bookings = await getBookingsByGuestIDDB(guestIDInt);

        if (!bookings || bookings.length === 0) {
            return jsonResponse(res, false, HttpStatusCodes.NOT_FOUND, { message: "No bookings found for this guest" });
        } else {
            return jsonResponse(res, true, HttpStatusCodes.OK, { bookings });
        }
    } catch (err) {
        logger.err(err);
        return jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, { message: "Server error" });
    }
}

/**
 * Get bookings by Room ID. (NEW FUNCTION)
 */
export async function getBookingsByRoomID(req: Request, res: Response) {
    try {
        const roomIDStr: string = req.params.roomID;
        const roomIDInt: number = parseInt(roomIDStr, 10);

        if (isNaN(roomIDInt)) {
            return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, { message: "Room ID must be a valid number" });
        }

        const bookings = await getBookingsByRoomIDDB(roomIDInt);

        if (!bookings || bookings.length === 0) {
            return jsonResponse(res, false, HttpStatusCodes.NOT_FOUND, { message: "No bookings found for this room" });
        } else {
            return jsonResponse(res, true, HttpStatusCodes.OK, { bookings });
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
            return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, { message: "Missing required query parameters: roomID, checkIn, checkOut" });
        }
        
        const roomIDInt: number = parseInt(roomID as string, 10);
        const checkInDate = new Date(checkIn as string);
        const checkOutDate = new Date(checkOut as string);

        if (isNaN(roomIDInt) || isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
            return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, { message: "Invalid format for roomID or dates" });
        }

        const conflictingBookings = await getConflictingBookings(roomIDInt, checkInDate, checkOutDate);

        if (conflictingBookings == null) {
            // No conflicts found
            return jsonResponse(res, true, HttpStatusCodes.OK, { message: "Room is available for the requested period." });
        } else {
            // Conflicts found
            return jsonResponse(res, false, HttpStatusCodes.CONFLICT, { 
                message: "Room is unavailable due to conflicting booking(s).",
                conflictingBookings
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
export async function createBooking(req: Request, res: Response) {
    try {
        const { userId, guestId, roomId, paymentMethod, checkIn, checkOut } = req.body;

        if (!userId || !guestId || !roomId || !paymentMethod || !checkIn || !checkOut) {
            return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, { message: "Missing required fields for creation" });
        }

        if (!isValidPaymentMethod(paymentMethod)) {
            return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, { message: "Invalid payment method" });
        }
        
        const createdBooking = await createBookingDB(req.body);

        if (createdBooking == null) {
            return jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, { message: "Booking was not created" });
        } else {
            return jsonResponse(res, true, HttpStatusCodes.CREATED, { message: "Booking created successfully", createdBooking });
        }
    } catch (err) {
        logger.err(err);
        return jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, { message: "Server error during booking creation (e.g., double booking or invalid IDs)" });
    }
}

/**
 * Update an existing booking. (UPDATE)
 */
export async function updateBooking(req: Request, res: Response) {
    try {
        const bookingIDStr: string = req.params.bookingID;
        const bookingIDInt: number = parseInt(bookingIDStr, 10);

        if (isNaN(bookingIDInt)) {
            return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, { message: "Booking ID must be a valid number" });
        }
        
        if (req.body.bookingStatus && !isValidBookingStatus(req.body.bookingStatus)) {
            return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, { message: "Invalid booking status provided" });
        }
        
        if (req.body.paymentMethod && !isValidPaymentMethod(req.body.paymentMethod)) {
            return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, { message: "Invalid payment method provided" });
        }

        const updateData = { bookingId: bookingIDInt, ...req.body };

        if (Object.keys(req.body).length === 0) {
            return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, { message: "At least one field must be provided for update" });
        }

        const updatedBooking = await updateBookingDB(updateData);

        if (updatedBooking == null) {
            return jsonResponse(res, false, HttpStatusCodes.NOT_FOUND, { message: "Booking with ID " + bookingIDInt + " not found or no changes made" });
        } else {
            return jsonResponse(res, true, HttpStatusCodes.OK, { message: "Booking updated successfully", updatedBooking });
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

        const deleted = await deleteBookingDB(bookingIDInt);

        if (!deleted) {
            return jsonResponse(res, false, HttpStatusCodes.NOT_FOUND, { message: "No booking found with ID " + bookingIDInt });
        } else {
            return jsonResponse(res, true, HttpStatusCodes.OK, { message: "Booking deleted successfully" });
        }
    } catch (err) {
        logger.err(err);
        return jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, { message: "Server error" });
    }
}