// Staff related types
export interface Staff {
  staff_id: number;
  branch_id: number;
  name: string;
  contact_number: string;
  email: string;
  job_title: JobTitle;
  salary: number;
  created_at: string;
  updated_at: string;
  // Populated fields for display
  branch_name?: string;
}

export const JobTitle = {
  MANAGER: "manager",
  RECEPTIONIST: "receptionist",
  HOUSEKEEPING: "housekeeping",
  MAINTENANCE: "maintenance",
  SECURITY: "security",
  CHEF: "chef",
  WAITER: "waiter",
  ACCOUNTANT: "accountant",
  HR: "hr",
  IT_SUPPORT: "it_support",
} as const;

export type JobTitle = (typeof JobTitle)[keyof typeof JobTitle];

// Filter interfaces
export interface StaffFilters {
  name?: string;
  branch_id?: number;
  job_title?: JobTitle;
  email?: string;
}

// Branch interface for dropdowns (reuse from room types if needed)
export interface Branch {
  branch_id: number;
  branch_name: string;
  city: string;
  address: string;
}

// Form data interfaces
export interface StaffFormData {
  name: string;
  branch_id: string;
  contact_number: string;
  email: string;
  job_title: JobTitle;
  salary: string;
}

export interface StaffDetailsModalProps {
  staff: Staff | null;
  isOpen: boolean;
  onClose: () => void;
  onSendPassword: (staffId: number) => void;
}
