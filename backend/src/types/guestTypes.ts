export interface GuestRepo {
  guest_id?: number;
  nic: string | null;
  name: string | null;
  age: number | null;
  contact_no: string | null;
  email: string | null;
  password: string | null;              
}

export interface GuestPublic {
  guest_id: number;
  nic: string | null;
  name: string | null;
  age: number | null;
  contact_no: string | null;
  email: string | null;
  room_id: number | null;
  booking_status: string | null;
}

export interface GuestPassword {
  guest_id: number;
  password: string;
}


