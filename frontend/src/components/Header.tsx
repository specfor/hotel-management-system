import React, { useState, useRef, useEffect } from "react";
import { Button, Avatar, Card } from "./primary";
import Notification from "./Notification";
import { Home, ChevronDown, User, Settings, HelpCircle, LogOut } from "lucide-react";
import type { HeaderProps } from "../types";

const Header: React.FC<HeaderProps> = ({
  hotelName = "Hotel Management System",
  user,
  notifications,
  onNotificationClick,
  onProfileClick,
  onLogout,
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProfileClick = () => {
    setIsProfileOpen(false);
    if (onProfileClick) {
      onProfileClick();
    }
  };

  const handleLogout = () => {
    setIsProfileOpen(false);
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 fixed top-0 right-0 left-0 z-30 transition-all duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Hotel Name */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">{hotelName}</h1>
          </div>

          {/* Right side - Notifications and Profile */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <Notification
              notifications={notifications}
              onNotificationClick={onNotificationClick}
              onMarkAsRead={() => {}}
              onMarkAllAsRead={() => {}}
              onClearAll={() => {}}
            />

            {/* User Profile Dropdown */}
            <div className="relative" ref={profileDropdownRef}>
              <Button
                variant="ghost"
                size="md"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1 hover:bg-gray-100"
              >
                <Avatar
                  src={user.avatar}
                  initials={user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                  size="md"
                />
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  <div className="text-xs text-gray-500">{user.role}</div>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform ${isProfileOpen ? "rotate-180" : ""}`}
                />
              </Button>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 z-50">
                  <Card variant="elevated" padding="sm">
                    <div className="p-2">
                      {/* User Info */}
                      <div className="flex items-center gap-3 p-2 border-b border-gray-100 mb-2">
                        <Avatar
                          src={user.avatar}
                          initials={user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                          size="md"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">{user.name}</div>
                          <div className="text-xs text-gray-500 truncate">{user.email}</div>
                          <div className="text-xs text-blue-600 font-medium">{user.role}</div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="space-y-1">
                        <button
                          onClick={handleProfileClick}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-2 transition-colors"
                        >
                          <User className="w-4 h-4" />
                          View Profile
                        </button>

                        <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-2 transition-colors">
                          <Settings className="w-4 h-4" />
                          Settings
                        </button>

                        <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-2 transition-colors">
                          <HelpCircle className="w-4 h-4" />
                          Help & Support
                        </button>

                        <div className="border-t border-gray-100 mt-2 pt-2">
                          <button
                            onClick={handleLogout}
                            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
