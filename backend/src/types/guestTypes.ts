export interface GuestRepo {
  guestId: number;
  nic: string | null;
  name: string | null;
  age: number | null;
  contactNo: string | null;
  email: string | null;
  password: string | null;              
}

export interface GuestPublic {
  guestId: number;
  nic: string | null;
  name: string | null;
  age: number | null;
  contactNo: string | null;
  email: string | null;
}

export interface GuestPassword {
  guestId: number;
  password: string;
}


