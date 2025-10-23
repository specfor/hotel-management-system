import Joi from "joi";
import { BookingStatus } from "@src/types/bookingTypes";

const validBookingStatuses: BookingStatus[] = ["Booked", "Checked-In", "Checked-Out", "Cancelled"];

export const BookingCreateSchema = Joi.object({
  // Required fields for a new booking
  userId: Joi.number().integer().min(1).required(),
  guestId: Joi.number().integer().min(1).required(),
  roomId: Joi.number().integer().min(1).required(),

  // Dates are sent as strings over HTTP, must be validated as valid dates
  checkIn: Joi.date().iso().required(),
  checkOut: Joi.date().iso().required(),

  // Rule: CheckOut must be after CheckIn
  // Joi.ref allows comparison of two fields
}).custom((value: { checkIn: string; checkOut: string }, helpers) => {
  if (new Date(value.checkIn) >= new Date(value.checkOut)) {
    return helpers.error("date.checkOutBeforeCheckIn");
  }
  return value;
}, "Check-out date validation");

export const BookingUpdateSchema = Joi.object({
  // All fields are optional for an update, but must be validated if present
  userId: Joi.number().integer().min(1).optional(),
  guestId: Joi.number().integer().min(1).optional(),
  roomId: Joi.number().integer().min(1).optional(),
  bookingId: Joi.number().integer().min(1),

  // CheckIn/CheckOut must be valid dates if provided
  checkIn: Joi.date().iso().optional(),
  checkOut: Joi.date().iso().optional(),

  // bookingStatus must be one of the defined ENUM values
  bookingStatus: Joi.string()
    .valid(...validBookingStatuses)
    .optional(),

  // Note: We don't need the checkOut > checkIn rule here,
  // as one of the dates might be missing in a partial update.
  // The Model layer (next step) can add more complex checks.
});
