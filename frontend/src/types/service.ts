// Service and Discount related types

// Chargeable Service types
export interface ChargeableService {
  service_id: number;
  branch_id: number;
  service_name: string;
  unit_type: UnitType;
  unit_price: number;
  created_at: string;
  updated_at: string;
  // Populated fields for display
  branch_name?: string;
}

export const UnitType = {
  PER_HOUR: "per_hour",
  PER_ITEM: "per_item",
  PER_DAY: "per_day",
  PER_NIGHT: "per_night",
  PER_PERSON: "per_person",
  PER_USE: "per_use",
  FLAT_RATE: "flat_rate",
} as const;

export type UnitType = (typeof UnitType)[keyof typeof UnitType];

// Discount types
export interface Discount {
  discount_id: number;
  branch_id: number;
  discount_name: string;
  discount_rate: number; // percentage (0-100)
  condition_type: DiscountConditionType;
  condition_value?: number; // amount for amount-based discounts
  valid_from: string;
  valid_to: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Populated fields for display
  branch_name?: string;
}

export const DiscountConditionType = {
  SEASONAL: "seasonal",
  AMOUNT_GREATER_THAN: "amount_greater_than",
  AMOUNT_LESS_THAN: "amount_less_than",
  MINIMUM_NIGHTS: "minimum_nights",
  EARLY_BOOKING: "early_booking",
  LOYALTY_MEMBER: "loyalty_member",
} as const;

export type DiscountConditionType = (typeof DiscountConditionType)[keyof typeof DiscountConditionType];

// Filter interfaces
export interface ServiceFilters {
  service_name?: string;
  branch_id?: number;
  unit_type?: UnitType;
  price_min?: number;
  price_max?: number;
}

export interface DiscountFilters {
  discount_name?: string;
  branch_id?: number;
  condition_type?: DiscountConditionType;
  is_active?: boolean;
  valid_date?: string; // filter by date within valid range
}

// Form data interfaces
export interface ServiceFormData {
  service_name: string;
  branch_id: string;
  unit_type: UnitType;
  unit_price: string;
}

export interface DiscountFormData {
  discount_name: string;
  branch_id: string;
  discount_rate: string;
  condition_type: DiscountConditionType;
  condition_value: string;
  valid_from: string;
  valid_to: string;
  is_active: boolean;
}

// Branch interface for dropdowns (reuse if needed)
export interface Branch {
  branch_id: number;
  branch_name: string;
  city: string;
  address: string;
}

// Helper functions for display
export const formatUnitType = (unitType: UnitType): string => {
  return unitType
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const formatConditionType = (conditionType: DiscountConditionType): string => {
  switch (conditionType) {
    case DiscountConditionType.SEASONAL:
      return "Seasonal Discount";
    case DiscountConditionType.AMOUNT_GREATER_THAN:
      return "Amount Greater Than";
    case DiscountConditionType.AMOUNT_LESS_THAN:
      return "Amount Less Than";
    case DiscountConditionType.MINIMUM_NIGHTS:
      return "Minimum Nights";
    case DiscountConditionType.EARLY_BOOKING:
      return "Early Booking";
    case DiscountConditionType.LOYALTY_MEMBER:
      return "Loyalty Member";
    default:
      return String(conditionType)
        .split("_")
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
  }
};

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
};

export const formatPercentage = (rate: number): string => {
  return `${rate}%`;
};
