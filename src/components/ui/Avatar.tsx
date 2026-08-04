import { cn } from "../../lib/utils";

type AvatarSize = "sm" | "md" | "lg" | "xl";

export interface AvatarProps {
  /** Image source URL */
  src?: string;
  /** Fallback text (initials) when no image or loading */
  fallback: string;
  size?: AvatarSize;
  /** Enable the pulse-ring animation around the avatar */
  animate?: boolean;
  className?: string;
}

const sizeStyles: Record<AvatarSize, { container: string; text: string }> = {
  sm: { container: "h-8 w-8", text: "text-xs" },
  md: { container: "h-10 w-10", text: "text-sm" },
  lg: { container: "h-14 w-14", text: "text-lg" },
  xl: { container: "h-20 w-20", text: "text-2xl" },
};

export default function Avatar({
  src,
  fallback,
  size = "md",
  animate = false,
  className,
}: AvatarProps) {
  const { container, text } = sizeStyles[size];

  return (
    <div className={cn("relative inline-flex shrink-0", className)}>
      {animate && (
        <span className="absolute inset-0 rounded-full animate-pulse-ring" />
      )}
      {src ? (
        <img
          src={src}
          alt={fallback}
          className={cn(
            "rounded-full object-cover ring-2 ring-white",
            container
          )}
        />
      ) : (
        <div
          className={cn(
            "flex items-center justify-center rounded-full bg-gradient-emerald text-white font-bold ring-2 ring-white",
            container,
            text
          )}
        >
          {fallback.slice(0, 2).toUpperCase()}
        </div>
      )}
    </div>
  );
}