// backend/src/models/guestBillingModel.ts

import { 
  GuestBillingPublic, 
  GuestBillingFilters,
} from "@src/types/guestBillingTypes";
import { getGuestBillingDB } from "@src/repos/guestBillingRepo";

/**
 * Business logic layer for guest billing data
 * Retrieves billing information with payment status
 * 
 * @param filters - Optional filters for guest, booking, status, or dates
 * @returns Promise resolving to array of guest billing records
 */
export async function getGuestBillingModel(
  filters: GuestBillingFilters = {},
): Promise<GuestBillingPublic[]> {
  // Validate date formats if provided
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;

  if (filters.startDate && !datePattern.test(filters.startDate)) {
    throw new Error("Invalid startDate format. Expected format: YYYY-MM-DD");
  }

  if (filters.endDate && !datePattern.test(filters.endDate)) {
    throw new Error("Invalid endDate format. Expected format: YYYY-MM-DD");
  }

  // Validate that startDate is before endDate if both are provided
  if (filters.startDate && filters.endDate) {
    const start = new Date(filters.startDate);
    const end = new Date(filters.endDate);
    if (start > end) {
      throw new Error("startDate must be before or equal to endDate");
    }
  }

  // Validate payment status if provided
  const validPaymentStatuses = ["Paid", "Unpaid", "Pending"];
  if (
    filters.paymentStatus 
    && !validPaymentStatuses.includes(filters.paymentStatus)
  ) {
    throw new Error(
      `Invalid paymentStatus. Must be one of: ${validPaymentStatuses.join(", ")}`,
    );
  }

  // Validate minOutstanding if provided
  if (filters.minOutstanding !== undefined && filters.minOutstanding < 0) {
    throw new Error("minOutstanding must be a non-negative number");
  }

  // Fetch data from repository
  const billingData = await getGuestBillingDB(filters);
  return billingData;
}
