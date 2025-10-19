import React, { useState } from "react";
import { AlertCircle } from "lucide-react";
import type { InputProps } from "../../types";

const Input: React.FC<InputProps> = ({
  type = "text",
  placeholder,
  value,
  defaultValue,
  onChange,
  onFocus,
  onBlur,
  error,
  label,
  required = false,
  disabled = false,
  size = "md",
  className = "",
  id,
  name,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(event);
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    onBlur?.(event);
  };

  const baseClasses =
    "w-full rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:bg-gray-100 disabled:cursor-not-allowed";

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-5 py-3 text-lg",
  };

  const stateClasses = error
    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
    : isFocused
    ? "border-blue-500 ring-2 ring-blue-500"
    : "border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-blue-500";

  const inputClasses = [baseClasses, sizeClasses[size], stateClasses, className].filter(Boolean).join(" ");

  const labelClasses = `block text-sm font-medium mb-1 ${error ? "text-red-700" : "text-gray-700"}`;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className={labelClasses}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        id={id}
        name={name}
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        required={required}
        className={inputClasses}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center">
          <AlertCircle className="w-4 h-4 mr-1" />
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
