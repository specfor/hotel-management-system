// backend/src/types/bookingTypes.ts

// Enums from migration file:
export type BookingStatus = 'Booked' | 'Checked-In' | 'Checked-Out' | 'Cancelled';
export type PaymentMethod = 'Cash' | 'Credit Card' | 'Debit Card' | 'Bank Transfer' | 'Online Wallet';

// Public data structure for a booking record (Output)
export interface BookingPublic {
    bookingId: number;
    userId: number | null; // Can be null (ON DELETE SET NULL FK)
    guestId: number;
    roomId: number;
    bookingStatus: BookingStatus;
    paymentMethod: PaymentMethod | null;
    dateTime: Date;
    checkIn: Date;
    checkOut: Date;
}

// Structure for creating a new booking (Input for POST)
export interface BookingCreate {
    userId: number;
    guestId: number;
    roomId: number;
    paymentMethod: PaymentMethod;
    checkIn: Date;
    checkOut: Date;
}

// Structure for updating an existing booking (Input for PUT)
export interface BookingUpdate {
    bookingId: number; // Required to know WHICH booking to update
    userId?: number;
    guestId?: number;
    roomId?: number;
    bookingStatus?: BookingStatus;
    paymentMethod?: PaymentMethod;
    checkIn?: Date;
    checkOut?: Date;
}