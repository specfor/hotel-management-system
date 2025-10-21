// Booking status enum
export const BookingStatus = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  CHECKED_IN: "checked_in",
  CHECKED_OUT: "checked_out",
  CANCELLED: "cancelled",
  NO_SHOW: "no_show",
} as const;

export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];

// Payment method enum
export const PaymentMethod = {
  CASH: "cash",
  CREDIT_CARD: "credit_card",
  DEBIT_CARD: "debit_card",
  BANK_TRANSFER: "bank_transfer",
  MOBILE_PAYMENT: "mobile_payment",
  CHECK: "check",
} as const;

export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

// Main booking interface
export interface Booking {
  booking_id: number;
  guest_id: number;
  room_id: number;
  user_id: number; // Staff member who created the booking
  booking_status: BookingStatus;
  booking_date: string;
  booking_time: string;
  check_in_date: string;
  check_in_time: string;
  check_out_date: string;
  check_out_time: string;
  special_requests?: string;
  total_amount?: number;
  created_at: string;
  updated_at: string;
  // Populated fields for display
  guest_name?: string;
  guest_nic?: string;
  room_number?: string;
  room_type_name?: string;
  branch_name?: string;
  user_name?: string; // Staff member name
}

// Service usage interface
export interface ServiceUsage {
  usage_id: number;
  booking_id: number;
  service_id: number;
  usage_date: string;
  usage_time: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Populated fields for display
  service_name?: string;
  unit_type?: string;
}

// Payment interface
export interface Payment {
  payment_id: number;
  booking_id: number;
  payment_amount: number;
  payment_method: PaymentMethod;
  payment_date: string;
  payment_time: string;
  transaction_reference?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Final bill interface
export interface FinalBill {
  bill_id: number;
  booking_id: number;
  room_charges: number;
  service_charges: number;
  tax_amount: number;
  discount_amount: number;
  late_checkout_charges: number;
  total_amount: number;
  total_paid_amount: number;
  outstanding_amount: number;
  bill_date: string;
  created_at: string;
  updated_at: string;
  // Populated fields for display
  guest_name?: string;
  room_number?: string;
  check_in_date?: string;
  check_out_date?: string;
}

// Request interfaces for API
export interface CreateBookingRequest {
  guest_id: number;
  room_id: number;
  user_id: number;
  booking_status: BookingStatus;
  booking_date: string;
  booking_time: string;
  check_in_date: string;
  check_in_time: string;
  check_out_date: string;
  check_out_time: string;
  special_requests?: string;
}

export interface UpdateBookingRequest extends Partial<CreateBookingRequest> {
  booking_id: number;
}

export interface CreateServiceUsageRequest {
  booking_id: number;
  service_id: number;
  usage_date: string;
  usage_time: string;
  quantity: number;
  notes?: string;
}

export interface CreatePaymentRequest {
  booking_id: number;
  payment_amount: number;
  payment_method: PaymentMethod;
  payment_date: string;
  payment_time: string;
  transaction_reference?: string;
  notes?: string;
}

// Filter interfaces
export interface BookingFilters {
  guest_name?: string;
  guest_nic?: string;
  room_number?: string;
  booking_status?: BookingStatus;
  user_id?: number;
  check_in_date_from?: string;
  check_in_date_to?: string;
  check_out_date_from?: string;
  check_out_date_to?: string;
}

// Helper functions for display
export const formatBookingStatus = (status: BookingStatus): string => {
  switch (status) {
    case BookingStatus.PENDING:
      return "Pending";
    case BookingStatus.CONFIRMED:
      return "Confirmed";
    case BookingStatus.CHECKED_IN:
      return "Checked In";
    case BookingStatus.CHECKED_OUT:
      return "Checked Out";
    case BookingStatus.CANCELLED:
      return "Cancelled";
    case BookingStatus.NO_SHOW:
      return "No Show";
    default:
      return status;
  }
};

export const formatPaymentMethod = (method: PaymentMethod): string => {
  switch (method) {
    case PaymentMethod.CASH:
      return "Cash";
    case PaymentMethod.CREDIT_CARD:
      return "Credit Card";
    case PaymentMethod.DEBIT_CARD:
      return "Debit Card";
    case PaymentMethod.BANK_TRANSFER:
      return "Bank Transfer";
    case PaymentMethod.MOBILE_PAYMENT:
      return "Mobile Payment";
    case PaymentMethod.CHECK:
      return "Check";
    default:
      return method;
  }
};

export const getBookingStatusColor = (status: BookingStatus): string => {
  switch (status) {
    case BookingStatus.PENDING:
      return "bg-yellow-100 text-yellow-800";
    case BookingStatus.CONFIRMED:
      return "bg-blue-100 text-blue-800";
    case BookingStatus.CHECKED_IN:
      return "bg-green-100 text-green-800";
    case BookingStatus.CHECKED_OUT:
      return "bg-gray-100 text-gray-800";
    case BookingStatus.CANCELLED:
      return "bg-red-100 text-red-800";
    case BookingStatus.NO_SHOW:
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const getPaymentMethodColor = (method: PaymentMethod): string => {
  switch (method) {
    case PaymentMethod.CASH:
      return "bg-green-100 text-green-800";
    case PaymentMethod.CREDIT_CARD:
    case PaymentMethod.DEBIT_CARD:
      return "bg-blue-100 text-blue-800";
    case PaymentMethod.BANK_TRANSFER:
      return "bg-purple-100 text-purple-800";
    case PaymentMethod.MOBILE_PAYMENT:
      return "bg-indigo-100 text-indigo-800";
    case PaymentMethod.CHECK:
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};
