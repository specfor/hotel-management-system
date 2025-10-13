export type ComponentSize = "sm" | "md" | "lg";
export type ComponentVariant = "primary" | "secondary" | "outline" | "ghost";
export type ComponentState = "default" | "hover" | "active" | "disabled";

export interface BaseComponentProps {
  className?: string;
  disabled?: boolean;
  size?: ComponentSize;
}

export interface ButtonProps extends BaseComponentProps {
  variant?: ComponentVariant;
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit" | "reset";
  loading?: boolean;
  fullWidth?: boolean;
}

export interface InputProps extends BaseComponentProps {
  type?: "text" | "email" | "password" | "number" | "tel" | "url";
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  label?: string;
  required?: boolean;
  id?: string;
  name?: string;
}

export interface CardProps extends BaseComponentProps {
  children: React.ReactNode;
  variant?: "default" | "elevated" | "outlined";
  padding?: ComponentSize;
}

export interface BadgeProps extends BaseComponentProps {
  children?: React.ReactNode;
  variant?: "primary" | "secondary" | "success" | "warning" | "error";
  dot?: boolean;
}

export interface AvatarProps extends BaseComponentProps {
  src?: string;
  alt?: string;
  fallback?: string;
  initials?: string;
}

export interface LoadingSpinnerProps extends BaseComponentProps {
  color?: "primary" | "secondary" | "white";
}
