import { BaseApiService } from "./base";
import type { ApiResponse } from "./base";

export interface Payment {
  payment_id: number;
  bill_id: number;
  paid_method: "Cash" | "Card" | "Online" | "BankTransfer";
  paid_amount: number;
  date_time: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentCreateRequest {
  bill_id: number;
  paid_method: "Cash" | "Card" | "Online" | "BankTransfer";
  paid_amount: number;
  date_time?: string;
}

export interface PaymentUpdateRequest {
  bill_id?: number;
  paid_method?: "Cash" | "Card" | "Online" | "BankTransfer";
  paid_amount?: number;
  date_time?: string;
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
    return this.get<{ Payments: Payment[] }>(`${this.endpoint}/${billId}`, { params: queryParams });
  }

  // Get single payment by ID
  async getPaymentById(paymentId: number): Promise<ApiResponse<{ Payment: Payment }>> {
    return this.get<{ Payment: Payment }>(`${this.endpoint}/${paymentId}`);
  }

  // Create new payment
  async createPayment(paymentData: PaymentCreateRequest): Promise<ApiResponse<{ payment_id: number }>> {
    return this.post<{ payment_id: number }>(this.endpoint, paymentData);
  }

  // Update payment
  async updatePayment(
    paymentId: number,
    paymentData: PaymentUpdateRequest
  ): Promise<ApiResponse<{ Payment: Payment }>> {
    return this.put<{ Payment: Payment }>(`${this.endpoint}/${paymentId}`, paymentData);
  }

  // Delete payment
  async deletePayment(paymentId: number): Promise<ApiResponse<void>> {
    return this.delete<void>(`${this.endpoint}/${paymentId}`);
  }
}

export const paymentApi = new PaymentApiService();
export default paymentApi;
