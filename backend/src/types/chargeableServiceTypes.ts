// The public structure of the service data returned by the API
export interface ChargeableServicePublic {
    serviceId: number;
    branchId: number;
    serviceName: string;
    unitPrice: number;
    unitType: string;
}

// The structure for creating a new service
export interface ChargeableServiceCreate {
    branchId: number;
    serviceName: string;
    unitPrice: number;
    unitType: string;
}

export interface ChargeableServiceUpdate {
    // REQUIRED: Must know WHICH record to update
    serviceId: number; 

    // OPTIONAL: Any fields that can be modified
    branchId?: number;
    serviceName?: string;
    unitPrice?: number;
    unitType?: string;
}