import React from "react";
import type { RouteObject } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Bookings from "../pages/booking/BookingManagement";
import BookingDetails from "../pages/booking/BookingDetails";
import Rooms from "../pages/room/Rooms";
import Guests from "../pages/guests/GuestManagement";
import Services from "../pages/services/Services";
import Reports from "../pages/Reports";
import SettingsPage from "../pages/Settings";
import Login from "../pages/Login";
import Branches from "../pages/branch/Branch";
import StaffManagement from "../pages/staff/StaffManagement";
import type { UserRole } from "../types/auth";

export interface AppRoute {
  path: string;
  element: React.ComponentType;
  label: string;
  protected?: boolean;
  allowedRoles?: UserRole[];
}

// Protected routes (require authentication)
export const protectedRoutes: AppRoute[] = [
  {
    path: "/",
    element: Dashboard,
    label: "Dashboard",
    protected: true,
    allowedRoles: ["admin", "manager", "staff", "receptionist"], // All roles can access dashboard
  },
  {
    path: "/bookings",
    element: Bookings,
    label: "Bookings",
    protected: true,
    allowedRoles: ["admin", "manager", "staff", "receptionist"], // All roles can access bookings
  },
  {
    path: "/bookings/:bookingId",
    element: BookingDetails,
    label: "Booking Details",
    protected: true,
    allowedRoles: ["admin", "manager", "staff", "receptionist"], // All roles can access bookings
  },
  {
    path: "/rooms",
    element: Rooms,
    label: "Rooms",
    protected: true,
    allowedRoles: ["admin", "manager", "staff", "receptionist"], // All roles can access rooms
  },
  {
    path: "/guests",
    element: Guests,
    label: "Guests",
    protected: true,
    allowedRoles: ["admin", "manager", "staff", "receptionist"], // All roles can access guests
  },
  {
    path: "/services",
    element: Services,
    label: "Services",
    protected: true,
    allowedRoles: ["admin", "manager"], // Only admin and manager can access services and discounts
  },
  {
    path: "/reports",
    element: Reports,
    label: "Reports",
    protected: true,
    allowedRoles: ["admin", "manager"], // Only admin and manager can access reports
  },
  {
    path: "/settings",
    element: SettingsPage,
    label: "Settings",
    protected: true,
    allowedRoles: ["admin", "manager"], // Only admin and manager can access settings
  },
  {
    path: "/branches",
    element: Branches,
    label: "Branches",
    protected: true,
    allowedRoles: ["admin", "manager"], // Only admin and manager can access branches
  },
  {
    path: "/staff",
    element: StaffManagement,
    label: "Staff",
    protected: true,
    allowedRoles: ["admin", "manager"], // Only admin and manager can access staff management
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
