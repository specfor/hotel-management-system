/* eslint-disable max-len */
// backend/src/repos/bookingRepo.ts

import { BookingPublic, BookingCreate, BookingUpdate, BookingStatus, PaymentMethod } from "@src/types/bookingTypes";
import db from "@src/common/util/db";
import logger from "jet-logger";

// --- Helper Functions ---
const mapToPublic = (row: any): BookingPublic => ({
    bookingId: row.booking_id,
    userId: row.user_id,
    guestId: row.guest_id,
    roomId: row.room_id,
    bookingStatus: row.booking_status as BookingStatus,
    paymentMethod: row.payment_method,
    dateTime: row.date_time,
    checkIn: row.check_in,
    checkOut: row.check_out,
});

// --- CRUD Operations ---

/**
 * Get all booking records. (READ All)
 */
export async function getAllBookingsDB(): Promise<BookingPublic[] | null> {
    try {
        const sql = `
            SELECT 
                booking_id, user_id, guest_id, room_id, booking_status, payment_method, date_time, check_in, check_out
            FROM 
                booking
            ORDER BY check_in DESC;
        `;
        const result = await db.query(sql);
        return result.rows.map(mapToPublic);
    } catch (err) {
        logger.err(err);
        return null;
    }
}

/**
 * Get a single booking record by ID. (READ One)
 */
export async function getBookingByIDDB(bookingId: number): Promise<BookingPublic | null> {
    try {
        const sql = `
            SELECT 
                booking_id, user_id, guest_id, room_id, booking_status, payment_method, date_time, check_in, check_out
            FROM 
                booking
            WHERE
                booking_id = $1;
        `;
        const result = await db.query(sql, [bookingId]);

        if (result.rows.length === 0) {
            return null;
        }
        return mapToPublic(result.rows[0]);
    } catch (err) {
        logger.err(err);
        return null;
    }
}

/**
 * Get all booking records for a single guest. (NEW FUNCTION)
 */
export async function getBookingsByGuestIDDB(guestId: number): Promise<BookingPublic[] | null> {
    try {
        const sql = `
            SELECT 
                booking_id, user_id, guest_id, room_id, booking_status, payment_method, date_time, check_in, check_out
            FROM 
                booking
            WHERE
                guest_id = $1
            ORDER BY check_in DESC;
        `;
        const result = await db.query(sql, [guestId]);
        
        if (result.rows.length === 0) {
            return null;
        }
        return result.rows.map(mapToPublic);
    } catch (err) {
        logger.err(err);
        return null;
    }
}

/**
 * Get all booking records for a specific room. (NEW FUNCTION)
 */
export async function getBookingsByRoomIDDB(roomId: number): Promise<BookingPublic[] | null> {
    try {
        const sql = `
            SELECT 
                booking_id, user_id, guest_id, room_id, booking_status, payment_method, date_time, check_in, check_out
            FROM 
                booking
            WHERE
                room_id = $1
            ORDER BY check_in DESC;
        `;
        const result = await db.query(sql, [roomId]);
        
        if (result.rows.length === 0) {
            return null;
        }
        return result.rows.map(mapToPublic);
    } catch (err) {
        logger.err(err);
        return null;
    }
}

/**
 * Check if a room is booked (conflicts) during a specific date range. (NEW FUNCTION)
 * Returns conflicting bookings, or null if available.
 */
export async function getConflictingBookings(roomId: number, checkIn: Date, checkOut: Date): Promise<BookingPublic[] | null> {
    try {
        const sql = `
            SELECT 
                booking_id, user_id, guest_id, room_id, booking_status, payment_method, date_time, check_in, check_out
            FROM 
                booking
            WHERE
                room_id = $1
                AND booking_status IN ('Booked', 'Checked-In')
                AND TSTZRANGE(check_in, check_out) && TSTZRANGE($2, $3)
            ORDER BY check_in;
        `;
        const values = [roomId, checkIn, checkOut];
        const result = await db.query(sql, values);
        
        if (result.rows.length === 0) {
            return null; // Room is available
        }
        return result.rows.map(mapToPublic); // Returns conflicting bookings
    } catch (err) {
        logger.err(err);
        return null;
    }
}

/**
 * Create a new booking record. (CREATE)
 */
export async function createBookingDB(bookingData: BookingCreate): Promise<BookingPublic | null> {
    try {
        // Default status is 'Booked'
        const defaultStatus: BookingStatus = 'Booked';

        const sql = `
            INSERT INTO booking (user_id, guest_id, room_id, payment_method, check_in, check_out, booking_status, date_time)
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
            RETURNING *;
        `;
        const values = [
            bookingData.userId,
            bookingData.guestId,
            bookingData.roomId,
            bookingData.paymentMethod,
            bookingData.checkIn,
            bookingData.checkOut,
            defaultStatus,
        ];

        const createdBooking = await db.query(sql, values);
        return mapToPublic(createdBooking.rows[0]);

    } catch (error) {
        logger.err(error);
        return null;
    }
}

/**
 * Update an existing booking record. (UPDATE)
 */
export async function updateBookingDB(bookingData: BookingUpdate): Promise<BookingPublic | null> {
    try {
        const updates: string[] = [];
        const values: (string | number | Date | BookingStatus | PaymentMethod)[] = [];
        let paramIndex = 1;

        if (bookingData.userId !== undefined) {
            updates.push("user_id = $" + paramIndex);
            values.push(bookingData.userId);
            paramIndex++;
        }

        if (bookingData.guestId !== undefined) {
            updates.push("guest_id = $" + paramIndex);
            values.push(bookingData.guestId);
            paramIndex++;
        }
        
        if (bookingData.roomId !== undefined) {
            updates.push("room_id = $" + paramIndex);
            values.push(bookingData.roomId);
            paramIndex++;
        }

        if (bookingData.bookingStatus) {
            updates.push("booking_status = $" + paramIndex);
            values.push(bookingData.bookingStatus);
            paramIndex++;
        }
        
        if (bookingData.paymentMethod) {
            updates.push("payment_method = $" + paramIndex);
            values.push(bookingData.paymentMethod);
            paramIndex++;
        }

        if (bookingData.checkIn) {
            updates.push("check_in = $" + paramIndex);
            values.push(bookingData.checkIn);
            paramIndex++;
        }
        
        if (bookingData.checkOut) {
            updates.push("check_out = $" + paramIndex);
            values.push(bookingData.checkOut);
            paramIndex++;
        }

        if (updates.length === 0) {
            return null; 
        }

        const sql = `
          UPDATE booking
          SET ${updates.join(", ")}
          WHERE booking_id = $${paramIndex}
          RETURNING *;
        `;
        values.push(bookingData.bookingId); // The ID is the last parameter

        const result = await db.query(sql, values);

        if (result.rows.length === 0) {
            return null;
        }

        return mapToPublic(result.rows[0]);

    } catch (error) {
        logger.err(error);
        return null;
    }
}

/**
 * Delete a booking record by ID. (DELETE)
 */
export async function deleteBookingDB(bookingId: number): Promise<boolean> {
    try {
        const sql = `
          DELETE FROM booking
          WHERE booking_id = $1
          RETURNING booking_id;
        `;

        const result = await db.query(sql, [bookingId]);

        return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
        logger.err("Database error:", error);
        return false;
    }
}