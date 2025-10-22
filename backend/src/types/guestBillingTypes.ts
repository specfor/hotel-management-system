// backend/src/types/guestBillingTypes.ts

/**
 * Guest Billing Summary - Public Type
 * Represents billing information for guests including payment status
 */
export interface GuestBillingPublic {
  guestId: number;
  guestName: string;
  guestNic: string | null;
  guestContact: string | null;
  guestEmail: string | null;
  billId: number | null;
  bookingId: number | null;
  checkInDate: Date | null;
  checkOutDate: Date | null;
  bookingStatus: string | null;
  nightsStayed: number | null;
  roomCharges: number | null;
  totalServiceCharges: number | null;
  totalTax: number | null;
  lateCheckoutCharge: number | null;
  totalDiscount: number | null;
  totalAmount: number | null;
  paidAmount: number | null;
  outstandingAmount: number | null;
  paymentStatus: string;
  billDate: Date | null;
  daysOverdue: number;
  lastPaymentDate: Date | null;
  roomId: number | null;
  roomType: string | null;
  branchId: number | null;
  branchName: string | null;
}

/**
 * Filters for querying guest billing data
 */
export interface GuestBillingFilters {
  guestId?: number;
  guestName?: string;
  paymentStatus?: string; // 'Paid', 'Unpaid', 'Pending'
  branchId?: number;
  bookingStatus?: string;
  startDate?: string; // Format: 'YYYY-MM-DD'
  endDate?: string; // Format: 'YYYY-MM-DD'
  minOutstanding?: number;
  maxOutstanding?: number;
  hasOverdue?: boolean;
}

/**
 * Summary statistics for guest billing
 */
export interface GuestBillingSummary {
  totalGuests: number;
  totalBills: number;
  totalBilled: number;
  totalPaid: number;
  totalOutstanding: number;
  guestsWithUnpaid: number;
  averageBillAmount: number;
  averageOutstanding: number;
}
