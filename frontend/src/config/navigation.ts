import { LayoutDashboard, Calendar, Bed, Users, BarChart3, Settings, Building, UserCheck } from "lucide-react";
import type { NavigationItem } from "../types";

export const navigationItems: NavigationItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
    allowedRoles: ["admin", "manager", "staff", "receptionist"], // All roles can access dashboard
  },
  {
    id: "bookings",
    label: "Bookings",
    path: "/bookings",
    icon: Calendar,
    badge: "3",
    allowedRoles: ["admin", "manager", "staff", "receptionist"], // All roles can access bookings
  },
  {
    id: "rooms",
    label: "Rooms",
    path: "/rooms",
    icon: Bed,
    allowedRoles: ["admin", "manager", "staff", "receptionist"], // All roles can access rooms
  },
  {
    id: "guests",
    label: "Guests",
    path: "/guests",
    icon: Users,
    allowedRoles: ["admin", "manager", "staff", "receptionist"], // All roles can access guests
  },
  {
    id: "branches",
    label: "Branches",
    path: "/branches",
    icon: Building,
    allowedRoles: ["admin", "manager"], // Only admin and manager can access branches
  },
  {
    id: "staff",
    label: "Staff",
    path: "/staff",
    icon: UserCheck,
    allowedRoles: ["admin", "manager"], // Only admin and manager can access staff management
  },
  {
    id: "reports",
    label: "Reports",
    path: "/reports",
    icon: BarChart3,
    allowedRoles: ["admin", "manager"], // Only admin and manager can access reports
  },
  {
    id: "settings",
    label: "Settings",
    path: "/settings",
    icon: Settings,
    allowedRoles: ["admin", "manager"], // Only admin and manager can access settings
  },
];
