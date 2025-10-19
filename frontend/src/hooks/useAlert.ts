import { useContext } from "react";
import AlertContext from "../contexts/AlertContext";
import type { AlertContextType } from "../types/alert";

// Hook to use alert context
export function useAlert(): AlertContextType {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
}
