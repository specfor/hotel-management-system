import { BaseApiService } from "./base";
import type { ApiResponse } from "./base";
import type { FinalBill } from "../types";

export interface FinalBillCreateRequest {
  user_id: number;
  booking_id: number;
}

export interface FinalBillUpdateRequest {
  user_id?: number;
  booking_id?: number;
  room_charges?: number;
  total_service_charges?: number;
  total_tax?: number;
  total_discount?: number;
  late_checkout_charge?: number;
  total_amount?: number;
  paid_amount?: number;
  outstanding_amount?: number;
}

class FinalBillApiService extends BaseApiService {
  constructor() {
    super("/final-bill");
  }

  // Get all final bills
  async getAllFinalBills(): Promise<ApiResponse<{ finalBills: FinalBill[] }>> {
    return this.get<{ finalBills: FinalBill[] }>(this.endpoint);
  }

  // Get final bill by booking ID
  async getFinalBillByBookingId(bookingId: number): Promise<ApiResponse<{ finalBill: FinalBill }>> {
    return this.get<{ finalBill: FinalBill }>(`${this.endpoint}/${bookingId}`);
  }

  // Create new final bill
  async createFinalBill(billData: FinalBillCreateRequest): Promise<ApiResponse<{ billId: number }>> {
    return this.post<{ billId: number }>(this.endpoint, billData);
  }

  // Update final bill
  async updateFinalBill(
    billId: number,
    billData: FinalBillUpdateRequest
  ): Promise<ApiResponse<{ finalBill: FinalBill }>> {
    return this.put<{ finalBill: FinalBill }>(`${this.endpoint}/${billId}`, billData);
  }

  // Delete final bill
  async deleteFinalBill(billId: number): Promise<ApiResponse<void>> {
    return this.delete<void>(`${this.endpoint}/${billId}`);
  }
}

export const finalBillApi = new FinalBillApiService();
export default finalBillApi;
