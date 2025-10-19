// Component-related types for the application

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

export interface NotificationProps {
  notifications: NotificationItem[];
  onNotificationClick?: (notification: NotificationItem) => void;
  onMarkAsRead?: (notificationId: string) => void;
  onMarkAllAsRead?: () => void;
  onClearAll?: () => void;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
}

export interface HeaderProps {
  hotelName?: string;
  user: UserProfile;
  notifications: NotificationItem[];
  onNotificationClick?: (notification: NotificationItem) => void;
  onProfileClick?: () => void;
  onLogout?: () => void;
}

export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  allowedRoles?: string[];
}

export interface SidebarProps {
  navigationItems: NavigationItem[];
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}
