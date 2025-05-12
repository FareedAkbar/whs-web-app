import React from "react";
import { cn } from "@/lib/utils"; // Optional utility to combine classNames

interface ButtonProps {
  title: string;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  icon?: React.ReactNode;
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onClick,
  variant = "primary",
  icon,
  className,
  type = "button",
  disabled = false,
  loading = false,
}) => {
  const baseClasses =
    "inline-flex items-center justify-center gap-2 h-fit px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300";

  const variants = {
    primary: "bg-primary text-white shadow-xl hover:brightness-110",
    secondary:
      "bg-white dark:bg-gray-900 text-primary shadow-lg hover:brightness-110 hover:shadow-xl",
  };

  const iconWrapper = {
    primary: "bg-white text-primary p-1 rounded-full",
    secondary: "bg-[#F2F2F2] dark:bg-gray-700 text-primary p-1 rounded-full",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        baseClasses,
        variants[variant],
        disabled || loading ? "cursor-not-allowed opacity-50" : "",
        className,
      )}
    >
      {loading && (
        <div className="h-4 w-4 animate-spin rounded-full border-t border-white bg-transparent" />
      )}
      {icon && !loading && (
        <span className={iconWrapper[variant]}>
          <span className="flex items-center justify-center">{icon}</span>
        </span>
      )}

      <span className="whitespace-nowrap">{title}</span>
    </button>
  );
};

export default Button;
