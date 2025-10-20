// Guest related types
export interface Guest {
  guest_id: number;
  nic: string;
  name: string;
  age: number;
  contact_number: string;
  email: string;
  created_at: string;
  updated_at: string;
  // Additional fields for display/relationships
  current_booking?: {
    booking_id: number;
    room_number: string;
    check_in_date: string;
    check_out_date: string;
    status: string;
  };
}

// Filter interfaces
export interface GuestFilters {
  name?: string;
  nic?: string;
  email?: string;
  contact_number?: string;
  age_min?: number;
  age_max?: number;
}

// Form data interfaces
export interface GuestFormData {
  nic: string;
  name: string;
  age: string;
  contact_number: string;
  email: string;
}

// Backend form data interface (for API calls)
export interface GuestFormDataBackend {
  nic: string;
  name: string;
  age: number;
  contact_no: string; // Backend field name
  email: string;
}

// Guest details modal props
export interface GuestDetailsModalProps {
  guest: Guest | null;
  isOpen: boolean;
  onClose: () => void;
  onSendPassword: (guestId: number) => void;
  loading?: boolean;
}

// Guest status for current booking
export const BookingStatus = {
  CHECKED_IN: "checked_in",
  CHECKED_OUT: "checked_out",
  CANCELLED: "cancelled",
  CONFIRMED: "confirmed",
} as const;

export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];
