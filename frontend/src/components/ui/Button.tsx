import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "../../utils/cn";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline" | "success";
  size?: "xs" | "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      className,
      children,
      disabled,
      leftIcon,
      rightIcon,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 select-none",
          {
            "bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 focus:ring-primary-500 shadow-sm":
              variant === "primary",
            "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 active:bg-gray-100 focus:ring-primary-500 shadow-sm dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-700":
              variant === "secondary",
            "bg-danger-500 text-white hover:bg-danger-600 active:bg-red-700 focus:ring-danger-500 shadow-sm":
              variant === "danger",
            "bg-healing-600 text-white hover:bg-healing-700 active:bg-healing-800 focus:ring-healing-500 shadow-sm":
              variant === "success",
            "text-gray-600 hover:bg-gray-100 active:bg-gray-200 focus:ring-gray-400 dark:text-slate-300 dark:hover:bg-slate-700":
              variant === "ghost",
            "border border-primary-300 text-primary-700 hover:bg-primary-50 focus:ring-primary-500 dark:border-primary-600 dark:text-primary-400":
              variant === "outline",
            "px-2.5 py-1 text-xs gap-1": size === "xs",
            "px-3 py-1.5 text-sm gap-1.5": size === "sm",
            "px-4 py-2 text-sm gap-2": size === "md",
            "px-6 py-3 text-base gap-2": size === "lg",
            "opacity-50 cursor-not-allowed pointer-events-none": disabled || isLoading,
          },
          className
        )}
        {...props}
      >
        {isLoading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : leftIcon ? (
          <span className="flex-shrink-0">{leftIcon}</span>
        ) : null}
        {children}
        {!isLoading && rightIcon ? (
          <span className="flex-shrink-0">{rightIcon}</span>
        ) : null}
      </button>
    );
  }
);

Button.displayName = "Button";
