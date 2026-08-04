import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/utils";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Enable hover elevation */
  hover?: boolean;
  /** Border style */
  bordered?: boolean;
}

export default function Card({
  children,
  className,
  hover = false,
  bordered = true,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl bg-white",
        bordered && "border border-border-subtle",
        hover && "hover:shadow-lg hover:border-emerald-200 transition-all duration-300",
        "shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}