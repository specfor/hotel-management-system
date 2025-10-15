import React from "react";
import type { CardProps } from "../../types";

const Card: React.FC<CardProps> = ({
  children,
  variant = "default",
  padding = "md",
  disabled = false,
  className = "",
}) => {
  const baseClasses = "rounded-xl transition-all duration-200";

  const paddingClasses = {
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  const variantClasses = {
    default: "bg-white shadow-sm hover:shadow-md",
    elevated: "bg-white shadow-lg hover:shadow-xl",
    outlined: "bg-white border-2 border-gray-200 hover:border-gray-300",
  };

  const disabledClasses = disabled ? "opacity-60 cursor-not-allowed" : "";

  const classes = [baseClasses, paddingClasses[padding], variantClasses[variant], disabledClasses, className]
    .filter(Boolean)
    .join(" ");

  return <div className={classes}>{children}</div>;
};

export default Card;
