export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export type UserRole = "admin" | "manager" | "staff" | "receptionist";

export type Permission =
  | "view_dashboard"
  | "view_bookings"
  | "create_bookings"
  | "edit_bookings"
  | "delete_bookings"
  | "view_rooms"
  | "manage_rooms"
  | "view_guests"
  | "manage_guests"
  | "view_reports"
  | "view_settings"
  | "manage_settings"
  | "manage_users"
  | "view_branches";

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
}

export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  role: UserRole;
  iat: number;
  exp: number;
}
