// backend/src/types/serviceUsageTypes.ts

// Structure of the service usage record returned by the API
export interface ServiceUsagePublic {
    recordId: number;
    serviceId: number;
    bookingId: number;
    dateTime: Date;
    quantity: number;
    totalPrice: number;
}

// Structure for creating a new service usage record
// recordId, dateTime (set by NOW()), and totalPrice (set by trigger) are excluded
export interface ServiceUsageCreate {
    serviceId: number;
    bookingId: number;
    quantity: number;
}

// Structure for updating an existing service usage record
export interface ServiceUsageUpdate {
    recordId: number; // Required to identify WHICH record to update
    serviceId?: number;
    bookingId?: number;
    dateTime?: Date;
    quantity?: number;
}