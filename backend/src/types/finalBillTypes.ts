export interface FinalBillPublic {
  bill_id: number;
  user_id: number;
  booking_id: number;
  room_charges: number;
  total_service_charges: number;
  total_tax: number;
  total_discount: number;
  late_checkout_charge: number;
  total_amount: number | null;
  paid_amount: number;
  outstanding_amount: number;
  created_at: string | Date | null;
}


