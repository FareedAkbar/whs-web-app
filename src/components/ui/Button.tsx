import React from "react";
import { cn } from "@/lib/utils"; // Optional utility to combine classNames

interface ButtonProps {
  title: string;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  icon?: React.ReactNode;
  className?: string;
  type?: "button" | "submit" | "reset";
}

const Button: React.FC<ButtonProps> = ({
  title,
  onClick,
  variant = "primary",
  icon,
  className,
  type = "button",
}) => {
  const baseClasses =
    "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300";

  const variants = {
    primary: "bg-primary text-white shadow-xl hover:brightness-110",
    secondary: "bg-white text-primary shadow-lg hover:shadow-xl",
  };

  const iconWrapper = {
    primary: "bg-white text-primary p-0.5 rounded-full",
    secondary: "bg-[#F2F2F2] text-primary p-0.5 rounded-full",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(baseClasses, variants[variant], className)}
    >
      {icon && <span className={iconWrapper[variant]}>{icon}</span>}
      <span>{title}</span>
    </button>
  );
};

export default Button;
