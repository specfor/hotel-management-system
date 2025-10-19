import type { ReactNode } from "react";

// Modal types
export type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: ModalSize;
  children: ReactNode;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  footer?: ReactNode;
  preventScroll?: boolean;
}

// Modal Context types
export interface ModalItem {
  id: string;
  component: ReactNode;
  title?: string;
  size?: ModalSize;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  onClose?: () => void;
  className?: string;
  footer?: ReactNode;
}

export interface ModalContextType {
  modals: ModalItem[];
  openModal: (modal: Omit<ModalItem, "id">) => string;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
  updateModal: (id: string, updates: Partial<ModalItem>) => void;
}

// Confirmation modal types
export interface ConfirmationModalProps {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "danger";
  onConfirm: () => void;
  onCancel?: () => void;
}

// Form modal types
export interface FormModalProps {
  title: string;
  children: ReactNode;
  submitText?: string;
  cancelText?: string;
  onSubmit?: () => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  size?: ModalSize;
}
