import React from "react";
import type { RouteObject } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Bookings from "../pages/Bookings";
import Rooms from "../pages/Rooms";
import Guests from "../pages/Guests";
import Reports from "../pages/Reports";
import SettingsPage from "../pages/Settings";
import Login from "../pages/Login";
import type { Permission } from "../types/auth";

export interface AppRoute {
  path: string;
  element: React.ComponentType;
  label: string;
  protected?: boolean;
  requiredPermissions?: Permission[];
}

// Protected routes (require authentication)
export const protectedRoutes: AppRoute[] = [
  {
    path: "/",
    element: Dashboard,
    label: "Dashboard",
    protected: true,
    requiredPermissions: ["view_dashboard"],
  },
  {
    path: "/bookings",
    element: Bookings,
    label: "Bookings",
    protected: true,
    requiredPermissions: ["view_bookings"],
  },
  {
    path: "/rooms",
    element: Rooms,
    label: "Rooms",
    protected: true,
    requiredPermissions: ["view_rooms"],
  },
  {
    path: "/guests",
    element: Guests,
    label: "Guests",
    protected: true,
    requiredPermissions: ["view_guests"],
  },
  {
    path: "/reports",
    element: Reports,
    label: "Reports",
    protected: true,
    requiredPermissions: ["view_reports"],
  },
  {
    path: "/settings",
    element: SettingsPage,
    label: "Settings",
    protected: true,
    requiredPermissions: ["view_settings"],
  },
];

// Public routes (don't require authentication)
export const publicRoutes: AppRoute[] = [
  {
    path: "/login",
    element: Login,
    label: "Login",
    protected: false,
  },
];

// All routes combined
export const routes: AppRoute[] = [...protectedRoutes, ...publicRoutes];

// Convert to React Router format
export const routerConfig: RouteObject[] = routes.map((route) => ({
  path: route.path,
  element: React.createElement(route.element),
}));

// For easier usage in components that don't need React Router format
export const getRouteByPath = (path: string): AppRoute | undefined => {
  return routes.find((route) => route.path === path);
};
