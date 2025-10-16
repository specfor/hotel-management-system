import { AlertTriangle, Info } from "lucide-react";
import { Button } from "./primary";
import type { ConfirmationModalProps } from "../types/modal";

const ConfirmationModal = ({
  title = "Confirm Action",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  onConfirm,
  onCancel,
}: ConfirmationModalProps) => {
  const variantConfig = {
    default: {
      icon: Info,
      iconColor: "text-blue-600",
      confirmVariant: "primary" as const,
    },
    danger: {
      icon: AlertTriangle,
      iconColor: "text-red-600",
      confirmVariant: "secondary" as const,
    },
  };

  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div className="text-center">
      {/* Icon */}
      <div className="mb-4">
        <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-gray-100">
          <Icon className={`w-6 h-6 ${config.iconColor}`} />
        </div>
      </div>

      {/* Title */}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>

      {/* Message */}
      <p className="text-sm text-gray-500 mb-6">{message}</p>

      {/* Actions */}
      <div className="flex space-x-3 justify-center">
        <Button variant="outline" onClick={onCancel}>
          {cancelText}
        </Button>
        <Button
          variant={config.confirmVariant}
          onClick={onConfirm}
          className={variant === "danger" ? "bg-red-600 hover:bg-red-700 text-white" : ""}
        >
          {confirmText}
        </Button>
      </div>
    </div>
  );
};

export default ConfirmationModal;
