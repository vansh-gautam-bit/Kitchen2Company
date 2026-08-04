import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

type BadgeVariant = "default" | "success" | "warning" | "info" | "outline";

export interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
  /** Show a pulsing dot indicator */
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-emerald-50 text-emerald-700 border-emerald-200",
  success: "bg-green-50 text-green-700 border-green-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  info: "bg-blue-50 text-blue-700 border-blue-200",
  outline: "bg-white text-text-muted border-border-light",
};

export default function Badge({
  children,
  variant = "default",
  className,
  dot = false,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
        variantStyles[variant],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            "h-2 w-2 rounded-full",
            variant === "success" && "bg-green-500 animate-pulse",
            variant === "warning" && "bg-amber-500 animate-pulse",
            variant === "info" && "bg-blue-500",
            variant === "default" && "bg-emerald-500 animate-pulse",
            variant === "outline" && "bg-text-subtle"
          )}
        />
      )}
      {children}
    </span>
  );
}