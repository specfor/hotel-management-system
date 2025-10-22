export interface PaymentPublic {
    payment_id: number | null;
    bill_id: number ;
    paid_method: string;
    paid_amount: number;
    notes: string | null;
    date_time?: string | null;
}

export interface PaymentPrivate {
    bill_id: number ;
    paid_method: string;
    paid_amount: number;
    notes: string | null;
    date_time?: string | null;
}

