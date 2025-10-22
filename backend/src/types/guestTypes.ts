export interface GuestCreate {
  nic: string | null;
  name: string | null;
  age: number | null;
  contact_no: string | null;
  email: string | null;
}

export interface GuestUpdate {
  guest_id: number;
  nic?: string | null;  
  name?: string | null;
  age?: number | null;
  contact_no?: string | null;
  email?: string | null;
}

export interface GuestsAllPublic {
  guest_id: number;
  nic: string | null;
  name: string | null;
  age: number | null;
  contact_no: string | null;
  email: string | null;
}

export interface GuestPublic {
  guest_id: number;
  nic: string | null;
  name: string | null;
  age: number | null;
  contact_no: string | null;
  email: string | null;
  updated_at: Date;
  created_at: Date;
}

export interface GuestPassword {
  guest_id: number;
  password: string;
}



