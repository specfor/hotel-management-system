import { useAuth } from "./useAuth";
import type { UserRole } from "../types/auth";

export function usePermissions() {
  const { user, hasPermission, hasAnyPermission } = useAuth();

  return {
    user,
    userRole: user?.role as UserRole | null,
    hasPermission,
    hasAnyPermission,

    // Convenience methods for common permission checks
    canViewDashboard: () => hasPermission("view_dashboard"),
    canViewBookings: () => hasPermission("view_bookings"),
    canCreateBookings: () => hasPermission("create_bookings"),
    canEditBookings: () => hasPermission("edit_bookings"),
    canDeleteBookings: () => hasPermission("delete_bookings"),
    canViewRooms: () => hasPermission("view_rooms"),
    canManageRooms: () => hasPermission("manage_rooms"),
    canViewGuests: () => hasPermission("view_guests"),
    canManageGuests: () => hasPermission("manage_guests"),
    canViewReports: () => hasPermission("view_reports"),
    canViewSettings: () => hasPermission("view_settings"),
    canManageSettings: () => hasPermission("manage_settings"),
    canManageUsers: () => hasPermission("manage_users"),

    // Role checks
    isAdmin: () => user?.role === "admin",
    isManager: () => user?.role === "manager",
    isStaff: () => user?.role === "staff",
    isReceptionist: () => user?.role === "receptionist",

    // Check if user has management level access
    hasManagementAccess: () => hasAnyPermission(["manage_rooms", "manage_guests", "manage_settings"]),

    // Check if user can perform booking operations
    canManageBookings: () => hasAnyPermission(["create_bookings", "edit_bookings", "delete_bookings"]),
  };
}
