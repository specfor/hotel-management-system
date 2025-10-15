import React from "react";
import type { AvatarProps } from "../../types";

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  fallback,
  initials,
  size = "md",
  disabled = false,
  className = "",
}) => {
  const baseClasses =
    "inline-flex items-center justify-center rounded-full overflow-hidden bg-gray-100 text-gray-600 font-medium";

  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg",
  };

  const disabledClasses = disabled ? "opacity-50 grayscale" : "";

  const classes = [baseClasses, sizeClasses[size], disabledClasses, className].filter(Boolean).join(" ");

  // Display image if src is provided
  if (src) {
    return (
      <img
        src={src}
        alt={alt || "Avatar"}
        className={classes}
        onError={(e) => {
          // Hide the image and show fallback if image fails to load
          e.currentTarget.style.display = "none";
        }}
      />
    );
  }

  // Display initials or fallback text
  const displayText = initials || fallback || "?";

  return <div className={classes}>{displayText.slice(0, 2).toUpperCase()}</div>;
};

export default Avatar;
