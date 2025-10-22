import { createElement } from "react";
import type { ModalContextType, ConfirmationModalProps } from "../types/modal";
import ConfirmationModal from "../components/ConfirmationModal";

// Utility functions for common modal operations
export const modalUtils = {
  // Show confirmation dialog
  confirm: (
    modalContext: ModalContextType,
    options: Omit<ConfirmationModalProps, "onConfirm" | "onCancel">
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      const modalId = modalContext.openModal({
        component: createElement(ConfirmationModal, {
          ...options,
          onConfirm: () => {
            modalContext.closeModal(modalId);
            resolve(true);
          },
          onCancel: () => {
            modalContext.closeModal(modalId);
            resolve(false);
          },
        }),
        title: options.title,
        size: "sm",
        closeOnBackdropClick: false,
        closeOnEscape: true,
        showCloseButton: false,
        onClose: () => resolve(false),
      });
    });
  },

  // Show alert dialog
  alert: (modalContext: ModalContextType, message: string, title: string = "Alert"): Promise<void> => {
    return new Promise((resolve) => {
      const modalId = modalContext.openModal({
        component: createElement(ConfirmationModal, {
          title,
          message,
          confirmText: "OK",
          onConfirm: () => {
            modalContext.closeModal(modalId);
            resolve();
          },
          onCancel: () => {
            modalContext.closeModal(modalId);
            resolve();
          },
        }),
        title,
        size: "sm",
        closeOnBackdropClick: false,
        closeOnEscape: true,
        showCloseButton: false,
        onClose: () => resolve(),
      });
    });
  },
};

export default modalUtils;
