export interface PaymentPublic {
    payment_id: number | null;
    bill_id: number | null;
    paid_method: string | null;
    paid_amount: number | null;
    date_time: Date | null;
}
