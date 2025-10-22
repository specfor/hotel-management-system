import { useEffect, useState } from "react";
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { Button } from "./primary";
import type { AlertProps } from "../types/alert";

const Alert = ({ alert, onDismiss }: AlertProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Animation states
  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsExiting(true);
    // Wait for exit animation to complete
    setTimeout(() => {
      onDismiss(alert.id);
    }, 300);
  };

  // Get alert styles based on type
  const getAlertStyles = () => {
    const baseStyles = "border-l-4 shadow-lg backdrop-blur-sm";

    switch (alert.type) {
      case "success":
        return `${baseStyles} bg-green-50 border-green-400 text-green-800`;
      case "warning":
        return `${baseStyles} bg-yellow-50 border-yellow-400 text-yellow-800`;
      case "error":
        return `${baseStyles} bg-red-50 border-red-400 text-red-800`;
      case "info":
        return `${baseStyles} bg-blue-50 border-blue-400 text-blue-800`;
      default:
        return `${baseStyles} bg-gray-50 border-gray-400 text-gray-800`;
    }
  };

  // Get icon based on type
  const getIcon = () => {
    const iconClass = "w-5 h-5 mr-3 flex-shrink-0";

    if (alert.icon) {
      return <div className={iconClass}>{alert.icon}</div>;
    }

    switch (alert.type) {
      case "success":
        return <CheckCircle className={`${iconClass} text-green-500`} />;
      case "warning":
        return <AlertTriangle className={`${iconClass} text-yellow-500`} />;
      case "error":
        return <AlertCircle className={`${iconClass} text-red-500`} />;
      case "info":
        return <Info className={`${iconClass} text-blue-500`} />;
      default:
        return <Info className={`${iconClass} text-gray-500`} />;
    }
  };

  // Animation classes
  const animationClasses = isExiting
    ? "transform translate-x-full opacity-0"
    : isVisible
    ? "transform translate-x-0 opacity-100"
    : "transform translate-x-full opacity-0";

  return (
    <div
      className={`
        w-full max-w-md p-4 mb-3 rounded-lg transition-all duration-300 ease-in-out
        ${getAlertStyles()}
        ${animationClasses}
      `}
      role="alert"
    >
      <div className="flex items-start">
        {getIcon()}

        <div className="flex-1 min-w-0">
          {alert.title && <h4 className="text-sm font-semibold mb-1">{alert.title}</h4>}
          <p className="text-sm">{alert.message}</p>

          {alert.action && (
            <div className="mt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={alert.action.onClick}
                className="text-current hover:bg-black/10"
              >
                {alert.action.label}
              </Button>
            </div>
          )}
        </div>

        {alert.dismissible && (
          <button
            onClick={handleDismiss}
            className="ml-3 p-1 rounded-md hover:bg-black/10 transition-colors flex-shrink-0"
            aria-label="Dismiss alert"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;
