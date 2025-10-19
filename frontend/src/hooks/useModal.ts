import { useContext } from "react";
import ModalContext from "../contexts/ModalContext";
import type { ModalContextType } from "../types/modal";

// Hook to use modal context
export function useModal(): ModalContextType {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}
