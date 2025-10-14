export interface FinalBillPublic {
    bill_id: number | null;
    user_id: number | null;
    booking_id: number | null;
    room_charges: number | null;
    total_service_charges: number | null;
    total_tax: number | null;
    total_discount: number | null;
    late_checkout_charge: number | null;
    total_amount: number | null;
    paid_amount: number | null;
    outstanding_amount: number | null;
    created_at: string | null; 
}
