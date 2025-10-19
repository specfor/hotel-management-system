import type { ReactNode } from "react";

export type AlertType = "success" | "warning" | "error" | "info";

export interface AlertMessage {
  id: string;
  type: AlertType;
  title?: string;
  message: string;
  duration?: number; // in milliseconds, 0 means persistent
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
  icon?: ReactNode;
}

export interface AlertContextType {
  alerts: AlertMessage[];
  showAlert: (alert: Omit<AlertMessage, "id">) => string;
  showSuccess: (message: string, options?: Partial<AlertMessage>) => string;
  showWarning: (message: string, options?: Partial<AlertMessage>) => string;
  showError: (message: string, options?: Partial<AlertMessage>) => string;
  showInfo: (message: string, options?: Partial<AlertMessage>) => string;
  dismissAlert: (id: string) => void;
  clearAll: () => void;
}

export interface AlertProps {
  alert: AlertMessage;
  onDismiss: (id: string) => void;
}

export interface AlertContainerProps {
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center" | "bottom-center";
  maxAlerts?: number;
  className?: string;
}
