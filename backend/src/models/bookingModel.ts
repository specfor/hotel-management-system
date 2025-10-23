/* eslint-disable max-len */
// backend/src/models/bookingModel.ts
import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";
import { BookingCreateSchema, BookingUpdateSchema } from "@src/models/schemas/bookingSchema";
import { BookingCreate, BookingUpdate, BookingPublic } from "@src/types/bookingTypes";
import {
  createBookingDB,
  updateBookingDB,
  getConflictingBookings,
  getBookingByIDDB,
  deleteBookingDB,
} from "@src/repos/bookingRepo";
import { RouteError } from "@src/common/util/route-errors";
import { BookingStatus } from "@src/types/bookingTypes";
import { getAllBookingsDB } from "@src/repos/bookingRepo";

// --- Validation Helpers ---
export const isValidBookingStatus = (status: unknown): status is BookingStatus => {
  const validStatuses: BookingStatus[] = ["Booked", "Checked-In", "Checked-Out", "Cancelled"];
  return validStatuses.includes(status as BookingStatus);
};

// The functions below are structured to receive raw data, validate it, and transform it.
// This interface mirrors the raw string data coming from req.body for creation

interface IncomingBookingCreateData {
  userId: number;
  guestId: number;
  roomId: number;
  checkIn: string; // Incoming is string from HTTP
  checkOut: string; // Incoming is string from HTTP
}
interface IncomingBookingUpdateData {
  bookingId: number;
  userId?: number;
  guestId?: number;
  roomId?: number;
  bookingStatus?: BookingStatus;
  checkIn?: string | Date; // Accepts string or Date
  checkOut?: string | Date; // Accepts string or Date
}

/**
 * Business logic and persistence layer for creating a new booking.
 * Handles Joi validation, date transformation, and availability checks.
 */
export async function createBookingModel(data: IncomingBookingCreateData): Promise<BookingPublic | null> {
  //   1. Joi Validation:

  const { error } = BookingCreateSchema.validate(data);
  if (error) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, error.details[0].message);
  }

  // 2. Data Transformation (string -> Date object)
  const bookingData: BookingCreate = {
    userId: data.userId,
    guestId: data.guestId,
    roomId: data.roomId,
    checkIn: new Date(data.checkIn),
    checkOut: new Date(data.checkOut),
  };

  // 3. Proactive Business Logic Check (Availability check)
  const conflicts = await getConflictingBookings(bookingData.roomId, bookingData.checkIn, bookingData.checkOut);

  if (conflicts && conflicts.length > 0) {
    //  Throw a 409 Conflict error for proper HTTP response
    throw new RouteError(HttpStatusCodes.CONFLICT, "Room is unavailable due to conflicting booking(s).");
  }

  // 4. Repository Call
  return createBookingDB(bookingData);
}

/**
 * Business logic and persistence layer for updating an existing booking.
 */

export async function updateBookingModel(data: IncomingBookingUpdateData): Promise<BookingPublic | null> {
  // 1. Joi Validation:
  const { error } = BookingUpdateSchema.validate(data);
  if (error) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, error.details[0].message);
  }

  const updateData: BookingUpdate = { bookingId: data.bookingId };

  // 2. Data Transformation and Assignment
  if (data.userId !== undefined) updateData.userId = data.userId;
  if (data.guestId !== undefined) updateData.guestId = data.guestId;
  if (data.roomId !== undefined) updateData.roomId = data.roomId;
  if (data.bookingStatus !== undefined) updateData.bookingStatus = data.bookingStatus;

  // Convert date strings to Date objects if they exist in the update body
  if (data.checkIn && typeof data.checkIn === "string") {
    updateData.checkIn = new Date(data.checkIn);
  } else if (data.checkIn instanceof Date) {
    updateData.checkIn = data.checkIn;
  }

  if (data.checkOut && typeof data.checkOut === "string") {
    updateData.checkOut = new Date(data.checkOut);
  } else if (data.checkOut instanceof Date) {
    updateData.checkOut = data.checkOut;
  }

  // 3. Repository Call
  return updateBookingDB(updateData);
}

export async function getAllBookingsModel({
  guestId,
  roomId,
  branchId,
}: {
  guestId?: number;
  roomId?: number;
  branchId?: number;
}): Promise<BookingPublic[]> {
  const filters = { guestId, roomId, branchId };
  const bookings = await getAllBookingsDB(filters);
  if (!bookings) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, "Booking not found");
  }
  return bookings;
}

export async function getBookingByIDModel(bookingId: number): Promise<BookingPublic> {
  const booking = await getBookingByIDDB(bookingId);
  if (!booking) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, "Booking not found");
  }
  return booking;
}

export async function getConflictingBookingsModel(
  roomId: number,
  checkIn: Date,
  checkOut: Date
): Promise<BookingPublic[]> {
  const bookings = await getAllBookingsDB({ roomId });
  if (!bookings) {
    return [];
  }
  return bookings.filter((booking) => {
    const bookingCheckIn = new Date(booking.checkIn);
    const bookingCheckOut = new Date(booking.checkOut);
    return bookingCheckIn < checkOut && bookingCheckOut > checkIn;
  });
}

export async function deleteBookingModel(bookingId: number): Promise<boolean> {
  const booking = await getBookingByIDDB(bookingId);
  if (!booking) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, "Booking not found");
  }
  return deleteBookingDB(bookingId);
}
