import React from "react";
import type { BadgeProps } from "./types";

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "primary",
  size = "md",
  dot = false,
  disabled = false,
  className = "",
}) => {
  const baseClasses = "inline-flex items-center font-medium rounded-full";

  const sizeClasses = {
    sm: dot ? "w-2 h-2" : "px-2 py-0.5 text-xs",
    md: dot ? "w-2.5 h-2.5" : "px-2.5 py-1 text-sm",
    lg: dot ? "w-3 h-3" : "px-3 py-1.5 text-base",
  };

  const variantClasses = {
    primary: "bg-blue-100 text-blue-800",
    secondary: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    error: "bg-red-100 text-red-800",
  };

  const disabledClasses = disabled ? "opacity-50" : "";

  const classes = [baseClasses, sizeClasses[size], variantClasses[variant], disabledClasses, className]
    .filter(Boolean)
    .join(" ");

  if (dot) {
    return <span className={classes} />;
  }

  return <span className={classes}>{children}</span>;
};

export default Badge;
