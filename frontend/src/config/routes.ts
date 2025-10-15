import React from "react";
import type { RouteObject } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Bookings from "../pages/Bookings";
import Rooms from "../pages/Rooms";
import Guests from "../pages/Guests";
import Reports from "../pages/Reports";
import SettingsPage from "../pages/Settings";

export interface AppRoute {
  path: string;
  element: React.ComponentType;
  label: string;
}

export const routes: AppRoute[] = [
  {
    path: "/",
    element: Dashboard,
    label: "Dashboard",
  },
  {
    path: "/bookings",
    element: Bookings,
    label: "Bookings",
  },
  {
    path: "/rooms",
    element: Rooms,
    label: "Rooms",
  },
  {
    path: "/guests",
    element: Guests,
    label: "Guests",
  },
  {
    path: "/reports",
    element: Reports,
    label: "Reports",
  },
  {
    path: "/settings",
    element: SettingsPage,
    label: "Settings",
  },
];

// Convert to React Router format
export const routerConfig: RouteObject[] = routes.map((route) => ({
  path: route.path,
  element: React.createElement(route.element),
}));

// For easier usage in components that don't need React Router format
export const getRouteByPath = (path: string): AppRoute | undefined => {
  return routes.find((route) => route.path === path);
};
