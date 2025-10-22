import type { UserRole, Permission } from "../types/auth";

// Define role-based permissions
export const rolePermissions: Record<UserRole, Permission[]> = {
  admin: [
    "view_dashboard",
    "view_bookings",
    "create_bookings",
    "edit_bookings",
    "delete_bookings",
    "view_rooms",
    "manage_rooms",
    "view_guests",
    "manage_guests",
    "view_reports",
    "view_settings",
    "manage_settings",
    "manage_users",
    "view_branches",
  ],
  manager: [
    "view_dashboard",
    "view_bookings",
    "create_bookings",
    "edit_bookings",
    "delete_bookings",
    "view_rooms",
    "manage_rooms",
    "view_guests",
    "manage_guests",
    "view_reports",
    "view_settings",
    "view_branches",
  ],
  staff: [
    "view_dashboard",
    "view_bookings",
    "create_bookings",
    "edit_bookings",
    "view_rooms",
    "view_guests",
    "manage_guests",
  ],
  receptionist: ["view_dashboard", "view_bookings", "create_bookings", "edit_bookings", "view_rooms", "view_guests"],
};

// Check if a role has a specific permission
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false;
}

// Check if a role has any of the specified permissions
export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

// Check if a role has all of the specified permissions
export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every((permission) => hasPermission(role, permission));
}

// Get all permissions for a role
export function getRolePermissions(role: UserRole): Permission[] {
  return rolePermissions[role] ?? [];
}

// Check if user can access a specific page based on role
export function canAccessPage(role: UserRole, page: string): boolean {
  const pageRoles: Record<string, UserRole[]> = {
    "/": ["admin", "manager", "staff", "receptionist"],
    "/bookings": ["admin", "manager", "staff", "receptionist"],
    "/rooms": ["admin", "manager", "staff", "receptionist"],
    "/guests": ["admin", "manager", "staff", "receptionist"],
    "/reports": ["admin", "manager"],
    "/settings": ["admin", "manager"],
    "/branches": ["admin", "manager"],
  };

  const allowedRoles = pageRoles[page];
  if (!allowedRoles) {
    return true; // Allow access to pages without specific role requirements
  }

  return allowedRoles.includes(role);
}

// Check if user role can access a route
export function canAccessRoute(userRole: UserRole, allowedRoles?: UserRole[]): boolean {
  if (!allowedRoles || allowedRoles.length === 0) {
    return true; // No role restrictions
  }

  return allowedRoles.includes(userRole);
}

// Get user-friendly role display name
export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    admin: "Administrator",
    manager: "Manager",
    staff: "Staff Member",
    receptionist: "Receptionist",
  };

  return roleNames[role] ?? role;
}
