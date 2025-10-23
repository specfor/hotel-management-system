import { BaseApiService } from "./base";
import type { ApiResponse } from "./base";

export interface Payment {
  payment_id: number | null;
  bill_id: number;
  paid_method: "Cash" | "Card" | "Online" | "BankTransfer";
  paid_amount: number;
  notes: string | null;
  date_time: string | null;
}

export interface PaymentCreateRequest {
  bill_id: number;
  paid_method: "Cash" | "Card" | "Online" | "BankTransfer";
  paid_amount: number;
  date_time?: string | null;
  notes?: string | null;
}

export interface PaymentUpdateRequest {
  bill_id?: number;
  paid_method?: "Cash" | "Card" | "Online" | "BankTransfer";
  paid_amount?: number;
  date_time?: string | null;
  notes?: string | null;
}

export interface PaymentFilters extends Record<string, unknown> {
  method?: string;
  reference?: string;
  notes?: string;
  date_time?: string;
}

class PaymentApiService extends BaseApiService {
  constructor() {
    super("/payment");
  }

  // Get all payments
  async getAllPayments(): Promise<ApiResponse<{ Payments: Payment[] }>> {
    return this.get<{ Payments: Payment[] }>(this.endpoint);
  }

  // Get payments by bill ID
  async getPaymentsByBillId(billId: number, filters?: PaymentFilters): Promise<ApiResponse<{ Payments: Payment[] }>> {
    const queryParams = this.buildQueryParams(filters || {});
    return this.get<{ Payments: Payment[] }>(`${this.endpoint}/bill/${billId}`, { params: queryParams });
  }

  // Get single payment by ID
  async getPaymentById(paymentId: number): Promise<ApiResponse<{ Payment: Payment }>> {
    return this.get<{ Payment: Payment }>(`${this.endpoint}/${paymentId}`);
  }

  // Create new payment
  async createPayment(paymentData: PaymentCreateRequest): Promise<ApiResponse<{ payment_id: number }>> {
    const backendData = {
      bill_id: paymentData.bill_id,
      paid_method: paymentData.paid_method,
      paid_amount: paymentData.paid_amount,
      date_time: paymentData.date_time || new Date().toISOString(),
      notes: paymentData.notes || null,
    };
    return this.post<{ payment_id: number }>(this.endpoint, backendData);
  }

  // Update payment
  async updatePayment(
    paymentId: number,
    paymentData: PaymentUpdateRequest
  ): Promise<ApiResponse<{ Payment: Payment }>> {
    const backendData: Record<string, unknown> = {};

    if (paymentData.bill_id !== undefined) backendData.bill_id = paymentData.bill_id;
    if (paymentData.paid_method !== undefined) backendData.paid_method = paymentData.paid_method;
    if (paymentData.paid_amount !== undefined) backendData.paid_amount = paymentData.paid_amount;
    if (paymentData.date_time !== undefined) backendData.date_time = paymentData.date_time;
    if (paymentData.notes !== undefined) backendData.notes = paymentData.notes;

    return this.put<{ Payment: Payment }>(`${this.endpoint}/${paymentId}`, backendData);
  }

  // Delete payment
  async deletePayment(paymentId: number): Promise<ApiResponse<void>> {
    return this.delete<void>(`${this.endpoint}/${paymentId}`);
  }
}

export const paymentApi = new PaymentApiService();
export default paymentApi;
