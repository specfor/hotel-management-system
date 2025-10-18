import { LayoutDashboard, Calendar, Bed, Users, BarChart3, Settings, Building } from "lucide-react";
import type { NavigationItem } from "../types";

export const navigationItems: NavigationItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
    requiredPermissions: ["view_dashboard"],
  },
  {
    id: "bookings",
    label: "Bookings",
    path: "/bookings",
    icon: Calendar,
    badge: "3",
    requiredPermissions: ["view_bookings"],
  },
  {
    id: "rooms",
    label: "Rooms",
    path: "/rooms",
    icon: Bed,
    requiredPermissions: ["view_rooms"],
  },
  {
    id: "guests",
    label: "Guests",
    path: "/guests",
    icon: Users,
    requiredPermissions: ["view_guests"],
  },
  {
    id: "branches",
    label: "Branches",
    path: "/branches",
    icon: Building,
    requiredPermissions: ["view_branches"],
  },
  {
    id: "reports",
    label: "Reports",
    path: "/reports",
    icon: BarChart3,
    requiredPermissions: ["view_reports"],
  },
  {
    id: "settings",
    label: "Settings",
    path: "/settings",
    icon: Settings,
    requiredPermissions: ["view_settings"],
  },
];
