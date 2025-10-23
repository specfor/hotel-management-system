//Revenue entity from database (matches "revenue" table schema)
export interface Revenue {
  record_id: number;
  branch_id: number;
  month: number;
  calculated_data_time: Date;
  amount: number;
}

//Create revenue data
export interface RevenueCreate {
  branch_id: number;
  month: number;
  calculated_data_time: Date;
  amount: number;
}

//Update revenue data
export interface RevenueUpdate {
  branch_id?: number;
  month?: number;
  calculated_data_time?: Date;
  amount?: number;
}

//Pagination and filter parameters for revenue
export interface RevenueQueryParams {
  page?: number;
  limit?: number;
  branch_id?: number;
  month?: number;
  year?: number;
  min_amount?: number;
  max_amount?: number;
}
