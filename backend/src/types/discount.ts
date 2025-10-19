export interface DiscountPublic{
    discountId: number;
    branchId: number;
    discountName: string;
    discountType: string;
    discountValue: number;
    minBillAmount: number;
    discountCondition: string;
    validFrom: Date;
    validTo: Date;
}

export interface DiscountCreateInput {
    branchId: number;
    discountName: string;
    discountType: string;
    discountValue: number;
    minBillAmount?: number | null;
    discountCondition?: string | null;
    validFrom: Date;
    validTo: Date;
}

export interface DiscountUpdateInput {
    branchId?: number;
    discountName?: string;
    discountType?: string;
    discountValue?: number;
    minBillAmount?: number | null;
    discountCondition?: string | null;
    validFrom?: Date;
    validTo?: Date;
}