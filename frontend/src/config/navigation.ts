import { LayoutDashboard, Calendar, Bed, Users, BarChart3, Settings } from "lucide-react";
import type { NavigationItem } from "../types";

export const navigationItems: NavigationItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    id: "bookings",
    label: "Bookings",
    path: "/bookings",
    icon: Calendar,
    badge: "3",
  },
  {
    id: "rooms",
    label: "Rooms",
    path: "/rooms",
    icon: Bed,
  },
  {
    id: "guests",
    label: "Guests",
    path: "/guests",
    icon: Users,
  },
  {
    id: "reports",
    label: "Reports",
    path: "/reports",
    icon: BarChart3,
  },
  {
    id: "settings",
    label: "Settings",
    path: "/settings",
    icon: Settings,
  },
];
