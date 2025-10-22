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
export async function getAllBookingsDB(filters: { guestId?: number,
   roomId?: number,
  branchId?: number, } = {}): Promise<BookingPublic[] | null> {

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
  // 3. Check for branchId filter
  if (filters.branchId !== undefined) {
    conditions.push(`room_id IN (SELECT room_id FROM room WHERE branch_id = $${paramIndex})`);
    values.push(filters.branchId);
    paramIndex++;
  }

  // 4. Build the WHERE clause dynamically
  if (conditions.length > 0) {
    sql += ` WHERE ${conditions.join(" AND ")}`;
  }

  // 5. Add ORDER BY clause
  sql += " ORDER BY check_in DESC;";

  // 6. Execute the dynamic query
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
 * Create a new booking record with transaction isolation. (CREATE)
 * Uses SERIALIZABLE isolation level to prevent double bookings.
 */
export async function createBookingDB(bookingData: BookingCreate): Promise<BookingPublic | null> {
  const client = await db.getClient();
  
  try {
    // Start transaction with SERIALIZABLE isolation level
    await client.query("BEGIN ISOLATION LEVEL SERIALIZABLE");

    // Check for conflicting bookings with row locking
    const conflictSql = `
      SELECT booking_id
      FROM booking
      WHERE room_id = $1
        AND booking_status IN ('Booked', 'Checked-In')
        AND TSTZRANGE(check_in, check_out) && TSTZRANGE($2, $3)
      FOR UPDATE;
    `;
    
    const conflicts = await client.query(conflictSql, [
      bookingData.roomId,
      bookingData.checkIn,
      bookingData.checkOut,
    ]);

    if (conflicts.rows.length > 0) {
      await client.query("ROLLBACK");
      throw new Error("Room is not available for the selected dates");
    }

    // Insert the new booking
    const defaultStatus: BookingStatus = "Booked";
    const insertSql = `
      INSERT INTO booking (user_id, guest_id, room_id, check_in, check_out, booking_status, date_time)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
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

    const result = await client.query(insertSql, values);
    
    // Commit transaction
    await client.query("COMMIT");
    
    return mapToPublic(result.rows[0] as BookingRow);

  } catch (error) {
    // Rollback on any error
    await client.query("ROLLBACK");
    throw error;
  } finally {
    // Always release the client back to the pool
    client.release();
  }
}

/**
 * Update an existing booking record with transaction isolation. (UPDATE)
 * Uses SERIALIZABLE isolation level to prevent conflicts.
 */
export async function updateBookingDB(bookingData: BookingUpdate): Promise<BookingPublic | null> {
  const client = await db.getClient();
  
  try {
    await client.query("BEGIN ISOLATION LEVEL SERIALIZABLE");

    // Lock current booking and get its details
    const currentSql = `
      SELECT * FROM booking WHERE booking_id = $1 FOR UPDATE;
    `;
    const current = await client.query(currentSql, [bookingData.bookingId]);
    
    if (current.rows.length === 0) {
      await client.query("ROLLBACK");
      return null;
    }

    // If changing room or dates, check for conflicts
    if (bookingData.roomId !== undefined || bookingData.checkIn || bookingData.checkOut) {
      const row = current.rows[0] as BookingRow;
      const newRoomId = bookingData.roomId ?? row.room_id;
      const newCheckIn = bookingData.checkIn ?? row.check_in;
      const newCheckOut = bookingData.checkOut ?? row.check_out;

      const conflictSql = `
        SELECT booking_id
        FROM booking
        WHERE room_id = $1
          AND booking_id != $2
          AND booking_status IN ('Booked', 'Checked-In')
          AND TSTZRANGE(check_in, check_out) && TSTZRANGE($3, $4)
        FOR UPDATE;
      `;
      
      const conflicts = await client.query(conflictSql, [
        newRoomId,
        bookingData.bookingId,
        newCheckIn,
        newCheckOut,
      ]);

      if (conflicts.rows.length > 0) {
        await client.query("ROLLBACK");
        throw new Error("Room is not available for the selected dates");
      }
    }

    // Build update query
    const updates: string[] = [];
    const values: (number | Date | BookingStatus)[] = [];
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
      await client.query("ROLLBACK");
      return null;
    }

    const updateSql = `
      UPDATE booking
      SET ${updates.join(", ")}
      WHERE booking_id = $${paramIndex}
      RETURNING *;
    `;
    values.push(bookingData.bookingId);

    const result = await client.query(updateSql, values);
    
    await client.query("COMMIT");

    if (result.rows.length === 0) {
      return null;
    }

    return mapToPublic(result.rows[0] as BookingRow);

  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Delete a booking record by ID with transaction. (DELETE)
 */
export async function deleteBookingDB(bookingId: number): Promise<boolean> {
  const client = await db.getClient();
  
  try {
    await client.query("BEGIN");

    const sql = `
      DELETE FROM booking
      WHERE booking_id = $1
      RETURNING booking_id;
    `;

    const result = await client.query(sql, [bookingId]);

    await client.query("COMMIT");

    return result.rowCount !== null && result.rowCount > 0;

  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}