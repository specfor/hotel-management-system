import { useAuth } from "../hooks/useAuth";
import type { ReactNode } from "react";
import type { UserRole, Permission } from "../types/auth";

interface ConditionalRenderProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  requiredPermissions?: Permission[];
  requireAllPermissions?: boolean; // If true, user must have ALL permissions, if false, user needs ANY permission
  fallback?: ReactNode;
  showFallback?: boolean;
  hideFromRoles?: UserRole[]; // Roles that should NOT see this content
}

/**
 * ConditionalRender component - Advanced conditional rendering based on roles and permissions
 *
 * @param children - The component(s) to render if conditions are met
 * @param allowedRoles - Array of roles that are allowed to see the content
 * @param requiredPermissions - Array of permissions required to see the content
 * @param requireAllPermissions - If true, user must have ALL permissions; if false, ANY permission (default: false)
 * @param fallback - Optional fallback content to show if user doesn't have access
 * @param showFallback - Whether to show fallback content or nothing at all (default: false)
 * @param hideFromRoles - Array of roles that should NOT see this content
 *
 * @example
 * // Only admins and managers can see this
 * <ConditionalRender allowedRoles={['admin', 'manager']}>
 *   <DeleteButton />
 * </ConditionalRender>
 *
 * @example
 * // User needs booking permissions
 * <ConditionalRender requiredPermissions={['create_bookings', 'edit_bookings']}>
 *   <BookingForm />
 * </ConditionalRender>
 *
 * @example
 * // Admin role AND specific permissions
 * <ConditionalRender
 *   allowedRoles={['admin']}
 *   requiredPermissions={['manage_users']}
 *   requireAllPermissions={true}
 * >
 *   <UserManagement />
 * </ConditionalRender>
 *
 * @example
 * // Hide from receptionists
 * <ConditionalRender hideFromRoles={['receptionist']}>
 *   <SensitiveData />
 * </ConditionalRender>
 */
const ConditionalRender = ({
  children,
  allowedRoles = [],
  requiredPermissions = [],
  requireAllPermissions = false,
  fallback = null,
  showFallback = false,
  hideFromRoles = [],
}: ConditionalRenderProps) => {
  const { user, isAuthenticated, hasPermission, hasAnyPermission } = useAuth();

  // If user is not authenticated, don't render anything
  if (!isAuthenticated || !user) {
    return showFallback ? fallback : null;
  }

  // Check if user's role is in the hideFromRoles list
  if (hideFromRoles.length > 0 && hideFromRoles.includes(user.role)) {
    return showFallback ? fallback : null;
  }

  // Check role-based access
  let hasRoleAccess = true;
  if (allowedRoles.length > 0) {
    hasRoleAccess = allowedRoles.includes(user.role);
  }

  // Check permission-based access
  let hasPermissionAccess = true;
  if (requiredPermissions.length > 0) {
    if (requireAllPermissions) {
      // User must have ALL permissions
      hasPermissionAccess = requiredPermissions.every((permission) => hasPermission(permission));
    } else {
      // User needs ANY permission
      hasPermissionAccess = hasAnyPermission(requiredPermissions);
    }
  }

  // User must pass both role and permission checks
  const hasAccess = hasRoleAccess && hasPermissionAccess;

  // If user has access, render children
  if (hasAccess) {
    return <>{children}</>;
  }

  // User doesn't have access, show fallback or nothing
  return showFallback ? fallback : null;
};

export default ConditionalRender;
