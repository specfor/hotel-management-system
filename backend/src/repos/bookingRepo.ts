/* eslint-disable max-len */
// backend/src/repos/bookingRepo.ts

import { BookingPublic, BookingCreate, BookingUpdate, BookingStatus } from "@src/types/bookingTypes";
import db from "@src/common/util/db";

// --- Helper Functions ---
interface BookingRow {
  booking_id: number;
  user_id: number;
  guest_id: number;
  room_id: number;
  booking_status: string;
  date_time: Date;
  check_in: Date;
  check_out: Date;
}

const mapToPublic = (row: BookingRow): BookingPublic => ({
  bookingId: row.booking_id,
  userId: row.user_id,
  guestId: row.guest_id,
  roomId: row.room_id,
  bookingStatus: row.booking_status as BookingStatus,
  dateTime: row.date_time,
  checkIn: row.check_in,
  checkOut: row.check_out,
});

// --- CRUD Operations ---

/**
 * Get all booking records. (READ All)
 */
export async function getAllBookingsDB(filters: { guestId?: number, roomId?: number } = {}): Promise<BookingPublic[] | null> {

  let sql = `
            SELECT 
                booking_id, user_id, guest_id, room_id, booking_status, date_time, check_in, check_out
            FROM 
                booking
        `;
    
  const conditions: string[] = [];
  const values: (number)[] = [];
  let paramIndex = 1;

  // 1. Check for guestId filter
  if (filters.guestId !== undefined) {
    conditions.push(`guest_id = $${paramIndex}`);
    values.push(filters.guestId);
    paramIndex++;
  }

  // 2. Check for roomId filter
  if (filters.roomId !== undefined) {
    conditions.push(`room_id = $${paramIndex}`);
    values.push(filters.roomId);
    paramIndex++;
  }

  // 3. Build the WHERE clause dynamically
  if (conditions.length > 0) {
    sql += ` WHERE ${conditions.join(" AND ")}`;
  }
    
  // 4. Add ORDER BY clause
  sql += " ORDER BY check_in DESC;";
    
  // 5. Execute the dynamic query
  const result = await db.query(sql, values);

  if (result.rows.length === 0) {
    return [];
  }
  return (result.rows as BookingRow[]).map(mapToPublic);

}


/**
 * Get a single booking record by ID. (READ One)
 */
export async function getBookingByIDDB(bookingId: number): Promise<BookingPublic | null> {
  
  const sql = `
            SELECT 
                booking_id, user_id, guest_id, room_id, booking_status, date_time, check_in, check_out
            FROM 
                booking
            WHERE
                booking_id = $1;
        `;
  const result = await db.query(sql, [bookingId]);

  if (result.rows.length === 0) {
    return null;
  }
  return mapToPublic(result.rows[0] as BookingRow);
}



/**
 * Check if a room is booked (conflicts) during a specific date range. (NEW FUNCTION)
 * Returns conflicting bookings, or null if available.
 */
export async function getConflictingBookings(roomId: number, checkIn: Date, checkOut: Date): Promise<BookingPublic[] | null> {
  const sql = `
            SELECT 
                booking_id, user_id, guest_id, room_id, booking_status, date_time, check_in, check_out
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
  return (result.rows as BookingRow[]).map(mapToPublic); // Returns conflicting bookings
}

/**
 * Create a new booking record. (CREATE)
 */
export async function createBookingDB(bookingData: BookingCreate): Promise<BookingPublic | null> {
  // Default status is 'Booked'
  const defaultStatus: BookingStatus = "Booked";

  const sql = `
            INSERT INTO booking (user_id, guest_id, room_id, check_in, check_out, booking_status, date_time)
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
            RETURNING *;
        `;
  const values = [
    bookingData.userId,
    bookingData.guestId,
    bookingData.roomId,
    bookingData.checkIn,
    bookingData.checkOut,
    defaultStatus,
  ];

  const createdBooking = await db.query(sql, values);
  return mapToPublic(createdBooking.rows[0] as BookingRow);

}

/**
 * Update an existing booking record. (UPDATE)
 */
export async function updateBookingDB(bookingData: BookingUpdate): Promise<BookingPublic | null> {

  const updates: string[] = [];
  const values: (number | Date | BookingStatus )[] = [];
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

  return mapToPublic(result.rows[0] as BookingRow);

}

/**
 * Delete a booking record by ID. (DELETE)
 */
export async function deleteBookingDB(bookingId: number): Promise<boolean> {
  const sql = `
          DELETE FROM booking
          WHERE booking_id = $1
          RETURNING booking_id;
        `;

  const result = await db.query(sql, [bookingId]);

  return result.rowCount !== null && result.rowCount > 0;

}