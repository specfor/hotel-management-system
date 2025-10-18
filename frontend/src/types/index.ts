// Central export for all type definitions

// Component types
export type {
  NotificationItem,
  NotificationProps,
  UserProfile,
  HeaderProps,
  NavigationItem,
  SidebarProps,
} from "./components";

// Room types
export type { Room, RoomType, RoomStatus, RoomFilters, RoomTypeFilters, Branch } from "./room";

// UI component types
export type {
  ComponentSize,
  ComponentVariant,
  ComponentState,
  BaseComponentProps,
  ButtonProps,
  InputProps,
  CardProps,
  BadgeProps,
  AvatarProps,
  LoadingSpinnerProps,
} from "./ui";

// Auth types
export type { User, UserRole, Permission, LoginCredentials, AuthResponse, AuthContextType, JwtPayload } from "./auth";

// Table types
export type { TableColumn, TableAction, TablePagination, TableSort, TableFilter, TableProps } from "./table";

// Alert types
export type { AlertType, AlertMessage, AlertContextType, AlertProps, AlertContainerProps } from "./alert";

// Modal types
export type {
  ModalSize,
  ModalProps,
  ModalItem,
  ModalContextType,
  ConfirmationModalProps,
  FormModalProps,
} from "./modal";

// Staff types
export type {
  Staff,
  JobTitle,
  StaffFilters,
  StaffFormData,
  StaffDetailsModalProps,
  Branch as StaffBranch,
} from "./staff";
export { JobTitle as StaffJobTitle } from "./staff";

// Guest types
export type { Guest, GuestFilters, GuestFormData, GuestDetailsModalProps, BookingStatus } from "./guest";
export { BookingStatus as GuestBookingStatus } from "./guest";
