import { useAuth } from "../hooks/useAuth";
import { canAccessPage } from "../utils/permissions";
import type { ReactNode } from "react";
import type { UserRole } from "../types/auth";

interface RoleBasedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  fallback?: ReactNode;
  path?: string;
}

const RoleBasedRoute = ({ children, allowedRoles, fallback, path }: RoleBasedRouteProps) => {
  const { user } = useAuth();

  // If no user, don't render anything (should be handled by ProtectedRoute)
  if (!user) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
            <p className="text-gray-500">You need to be logged in to access this page.</p>
          </div>
        </div>
      )
    );
  }

  // Check path-based access if path is provided
  if (path && !canAccessPage(user.role, path)) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
            <p className="text-gray-500">You don't have permission to access this page.</p>
            <p className="text-sm text-gray-400 mt-2">Your role: {user.role}</p>
          </div>
        </div>
      )
    );
  }

  // Check role-based access if allowedRoles is provided
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
            <p className="text-gray-500">You don't have the required role to access this content.</p>
            <p className="text-sm text-gray-400 mt-2">Required roles: {allowedRoles.join(", ")}</p>
            <p className="text-sm text-gray-400">Your role: {user.role}</p>
          </div>
        </div>
      )
    );
  }

  // User has required role, render children
  return <>{children}</>;
};

export default RoleBasedRoute;
