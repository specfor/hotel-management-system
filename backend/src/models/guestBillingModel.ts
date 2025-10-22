// backend/src/models/guestBillingModel.ts

import type {
  GuestBillingFilters,
  GuestBillingPublic,
  GuestBillingSummary,
} from "@src/types/guestBillingTypes";
import guestBillingRepo from "@src/repos/guestBillingRepo";

/**
 * Model for guest billing business logic
 */
class GuestBillingModel {
  /**
   * Get guest billing data with optional filters
   * @param filters - Optional filters for the query
   * @returns Array of guest billing records
   */
  public async getGuestBilling(
    filters?: GuestBillingFilters,
  ): Promise<GuestBillingPublic[]> {
    return await guestBillingRepo.getGuestBilling(filters);
  }

  /**
   * Get billing summary statistics
   * @param filters - Optional filters for the query
   * @returns Summary statistics object
   */
  public async getBillingSummary(
    filters?: GuestBillingFilters,
  ): Promise<GuestBillingSummary> {
    const summary = await guestBillingRepo.getBillingSummary(filters);
    
    return {
      totalGuests: Number(summary.total_guests) || 0,
      totalBills: Number(summary.total_bills) || 0,
      totalBilled: Number(summary.total_billed) || 0,
      totalPaid: Number(summary.total_paid) || 0,
      totalOutstanding: Number(summary.total_outstanding) || 0,
      guestsWithUnpaid: Number(summary.guests_with_unpaid) || 0,
      averageBillAmount: Number(summary.average_bill_amount) || 0,
      averageOutstanding: Number(summary.average_outstanding) || 0,
    };
  }
}

export default new GuestBillingModel();
