import { useAuth } from "../hooks/useAuth";
import type { ReactNode } from "react";
import type { UserRole } from "../types/auth";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallback?: ReactNode;
  showFallback?: boolean;
}

/**
 * RoleGuard component - Conditionally renders children based on user roles
 *
 * @param children - The component(s) to render if user has allowed role
 * @param allowedRoles - Array of roles that are allowed to see the content
 * @param fallback - Optional fallback content to show if user doesn't have access
 * @param showFallback - Whether to show fallback content or nothing at all (default: false)
 *
 * @example
 * // Only admins and managers can see this button
 * <RoleGuard allowedRoles={['admin', 'manager']}>
 *   <Button>Delete User</Button>
 * </RoleGuard>
 *
 * @example
 * // Show different content for unauthorized users
 * <RoleGuard
 *   allowedRoles={['admin']}
 *   fallback={<p>Contact admin for access</p>}
 *   showFallback={true}
 * >
 *   <AdminPanel />
 * </RoleGuard>
 */
const RoleGuard = ({ children, allowedRoles, fallback = null, showFallback = false }: RoleGuardProps) => {
  const { user, isAuthenticated } = useAuth();

  // If user is not authenticated, don't render anything
  if (!isAuthenticated || !user) {
    return showFallback ? fallback : null;
  }

  // Check if user's role is in the allowed roles
  const hasAllowedRole = allowedRoles.includes(user.role);

  // If user has allowed role, render children
  if (hasAllowedRole) {
    return <>{children}</>;
  }

  // User doesn't have allowed role, show fallback or nothing
  return showFallback ? fallback : null;
};

export default RoleGuard;
