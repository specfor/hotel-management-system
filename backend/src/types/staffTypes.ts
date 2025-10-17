//Staff entity from database (matches "staff" table schema)
export interface Staff {
  staff_id: number;
  branch_id: number;
  name: string;
  contact_no: number;
  email: string;
  job_title: string;
  salary: number;
}

//Create staff data
export interface StaffCreate {
  branch_id: number;
  name: string;
  contact_no: number;
  email: string;
  job_title: string;
  salary: number;
}

//Update staff data
export interface StaffUpdate {
  branch_id?: number;
  name?: string;
  contact_no?: number;
  email?: string;
  job_title?: string;
  salary?: number;
}

//Public staff data (may exclude sensitive info like salary)
export interface StaffPublic {
  staff_id: number;
  branch_id: number;
  name: string;
  contact_no: number;
  email: string;
  job_title: string;
}

//Pagination and filter parameters
export interface StaffQueryParams {
  page?: number;
  limit?: number;
  branch_id?: number;
  job_title?: string;
  name?: string;
}

//Paginated response
export interface PaginatedStaffResponse {
  success: boolean;
  data: Staff[];
  pagination: {
    currentPage: number,
    totalPages: number,
    totalRecords: number,
    recordsPerPage: number,
    hasNextPage: boolean,
    hasPreviousPage: boolean,
  };
}
