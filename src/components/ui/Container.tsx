import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

export interface ContainerProps {
  children: ReactNode;
  className?: string;
  /** Max-width breakpoint: 'sm' | 'md' | 'lg' | 'xl' | 'full' */
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
}

const maxWidths = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-7xl",
  xl: "max-w-[90rem]",
  full: "max-w-full",
};

export default function Container({
  children,
  className,
  maxWidth = "lg",
}: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto px-6 lg:px-8",
        maxWidths[maxWidth],
        className
      )}
    >
      {children}
    </div>
  );
}