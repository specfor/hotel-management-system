import { createContext, useReducer, useCallback } from "react";
import type { ReactNode } from "react";
import type { AlertMessage, AlertContextType } from "../types/alert";

// Alert state interface
interface AlertState {
  alerts: AlertMessage[];
}

// Alert actions
type AlertAction =
  | { type: "ADD_ALERT"; payload: AlertMessage }
  | { type: "REMOVE_ALERT"; payload: string }
  | { type: "CLEAR_ALL" };

// Initial state
const initialState: AlertState = {
  alerts: [],
};

// Alert reducer
function alertReducer(state: AlertState, action: AlertAction): AlertState {
  switch (action.type) {
    case "ADD_ALERT":
      return {
        ...state,
        alerts: [...state.alerts, action.payload],
      };
    case "REMOVE_ALERT":
      return {
        ...state,
        alerts: state.alerts.filter((alert) => alert.id !== action.payload),
      };
    case "CLEAR_ALL":
      return {
        ...state,
        alerts: [],
      };
    default:
      return state;
  }
}

// Create context
const AlertContext = createContext<AlertContextType | undefined>(undefined);

// Alert provider props
interface AlertProviderProps {
  children: ReactNode;
}

// Generate unique ID for alerts
const generateId = () => `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Alert provider component
export function AlertProvider({ children }: AlertProviderProps) {
  const [state, dispatch] = useReducer(alertReducer, initialState);

  // Add alert
  const showAlert = useCallback((alert: Omit<AlertMessage, "id">): string => {
    const id = generateId();
    const newAlert: AlertMessage = {
      id,
      duration: 5000, // Default 5 seconds
      dismissible: true,
      ...alert,
    };

    dispatch({ type: "ADD_ALERT", payload: newAlert });

    // Auto-dismiss if duration is set and > 0
    if (newAlert.duration && newAlert.duration > 0) {
      setTimeout(() => {
        dispatch({ type: "REMOVE_ALERT", payload: id });
      }, newAlert.duration);
    }

    return id;
  }, []);

  // Convenience methods for different alert types
  const showSuccess = useCallback(
    (message: string, options?: Partial<AlertMessage>): string => {
      return showAlert({
        type: "success",
        message,
        ...options,
      });
    },
    [showAlert]
  );

  const showWarning = useCallback(
    (message: string, options?: Partial<AlertMessage>): string => {
      return showAlert({
        type: "warning",
        message,
        ...options,
      });
    },
    [showAlert]
  );

  const showError = useCallback(
    (message: string, options?: Partial<AlertMessage>): string => {
      return showAlert({
        type: "error",
        message,
        duration: 0, // Errors persist by default
        ...options,
      });
    },
    [showAlert]
  );

  const showInfo = useCallback(
    (message: string, options?: Partial<AlertMessage>): string => {
      return showAlert({
        type: "info",
        message,
        ...options,
      });
    },
    [showAlert]
  );

  // Dismiss alert
  const dismissAlert = useCallback((id: string) => {
    dispatch({ type: "REMOVE_ALERT", payload: id });
  }, []);

  // Clear all alerts
  const clearAll = useCallback(() => {
    dispatch({ type: "CLEAR_ALL" });
  }, []);

  // Context value
  const value: AlertContextType = {
    alerts: state.alerts,
    showAlert,
    showSuccess,
    showWarning,
    showError,
    showInfo,
    dismissAlert,
    clearAll,
  };

  return <AlertContext.Provider value={value}>{children}</AlertContext.Provider>;
}

export default AlertContext;
