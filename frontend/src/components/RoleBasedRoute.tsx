import { useAuth } from "../hooks/useAuth";
import { canAccessPage } from "../utils/permissions";
import type { ReactNode } from "react";
import type { Permission } from "../types/auth";

interface RoleBasedRouteProps {
  children: ReactNode;
  permissions?: Permission[];
  requiredPermission?: Permission;
  fallback?: ReactNode;
  path?: string;
}

const RoleBasedRoute = ({ children, permissions, requiredPermission, fallback, path }: RoleBasedRouteProps) => {
  const { user, hasPermission, hasAnyPermission } = useAuth();

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
            <p className="text-sm text-gray-400 mt-2">Required role: Contact your administrator for access.</p>
          </div>
        </div>
      )
    );
  }

  // Check specific permission if provided
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Insufficient Permissions</h3>
            <p className="text-gray-500">You don't have the required permission to access this content.</p>
            <p className="text-sm text-gray-400 mt-2">Required permission: {requiredPermission.replace("_", " ")}</p>
          </div>
        </div>
      )
    );
  }

  // Check multiple permissions if provided (user needs ANY of them)
  if (permissions && permissions.length > 0 && !hasAnyPermission(permissions)) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Insufficient Permissions</h3>
            <p className="text-gray-500">You don't have the required permissions to access this content.</p>
            <p className="text-sm text-gray-400 mt-2">
              Required permissions: {permissions.map((p) => p.replace("_", " ")).join(", ")}
            </p>
          </div>
        </div>
      )
    );
  }

  // User has required permissions, render children
  return <>{children}</>;
};

export default RoleBasedRoute;
