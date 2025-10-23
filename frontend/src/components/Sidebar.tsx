import React from "react";
import { NavLink } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button, Badge } from "./primary";
import { useAuth } from "../hooks/useAuth";
import type { SidebarProps } from "../types";

const Sidebar: React.FC<SidebarProps> = ({ navigationItems, isCollapsed = true, onToggleCollapse, className = "" }) => {
  const { user } = useAuth();
  const sidebarWidth = isCollapsed ? "w-16" : "w-64";

  // Filter navigation items based on user role
  const filteredNavigationItems = navigationItems.filter((item) => {
    // If no roles required, show the item
    if (!item.allowedRoles || item.allowedRoles.length === 0) {
      return true;
    }

    // Check if user has the required role
    return user && item.allowedRoles.includes(user.role);
  });

  return (
    <div
      className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 flex flex-col z-40 ${sidebarWidth} ${className}`}
    >
      {/* Sidebar Header with Toggle */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>}
        <Button variant="ghost" size="sm" onClick={onToggleCollapse} className="p-1.5 hover:bg-gray-100">
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 py-4">
        <div className="space-y-1 px-2">
          {filteredNavigationItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group ${
                  isActive
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={`w-5 h-5 ${isActive ? "text-blue-700" : "text-gray-400 group-hover:text-gray-600"}`}
                  />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <Badge variant={isActive ? "primary" : "secondary"} size="sm" className="ml-auto">
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Sidebar Footer */}
      <div className="border-t border-gray-200 p-4">
        {isCollapsed ? (
          <div className="w-8 h-8 bg-gray-100 rounded-full"></div>
        ) : (
          <div className="text-xs text-gray-500 text-center">Hotel Management v1.0</div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
