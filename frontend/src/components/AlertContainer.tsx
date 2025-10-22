import { createPortal } from "react-dom";
import { useAlert } from "../hooks/useAlert";
import Alert from "./Alert";
import type { AlertContainerProps } from "../types/alert";

const AlertContainer = ({ position = "top-right", maxAlerts = 5, className = "" }: AlertContainerProps) => {
  const { alerts, dismissAlert } = useAlert();

  // Limit the number of visible alerts
  const visibleAlerts = alerts.slice(-maxAlerts);

  // Get position classes
  const getPositionClasses = () => {
    switch (position) {
      case "top-right":
        return "fixed top-4 right-4 z-50";
      case "top-left":
        return "fixed top-4 left-4 z-50";
      case "bottom-right":
        return "fixed bottom-4 right-4 z-50";
      case "bottom-left":
        return "fixed bottom-4 left-4 z-50";
      case "top-center":
        return "fixed top-4 left-1/2 transform -translate-x-1/2 z-50";
      case "bottom-center":
        return "fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50";
      default:
        return "fixed top-4 right-4 z-50";
    }
  };

  // Don't render if no alerts
  if (visibleAlerts.length === 0) {
    return null;
  }

  const containerElement = (
    <div className={`${getPositionClasses()} ${className}`}>
      <div className="flex flex-col space-y-2 max-w-md min-w-[300px]">
        {visibleAlerts.map((alert) => (
          <Alert key={alert.id} alert={alert} onDismiss={dismissAlert} />
        ))}
      </div>
    </div>
  );

  // Use portal to render outside normal component tree
  return createPortal(containerElement, document.body);
};

export default AlertContainer;
