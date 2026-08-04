import { cn } from "../../lib/utils";

type Align = "left" | "center";

export interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  /** Eyebrow label shown above the title (e.g. "How It Works") */
  eyebrow?: string;
  align?: Align;
  className?: string;
}

export default function SectionHeading({
  title,
  subtitle,
  eyebrow,
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        align === "center" ? "mx-auto max-w-2xl text-center" : "text-left",
        className
      )}
    >
      {eyebrow && (
        <p className="text-sm font-semibold text-emerald-600 uppercase tracking-widest">
          {eyebrow}
        </p>
      )}
      <h2
        className={cn(
          "mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-text-primary",
          eyebrow ? "" : "mt-0"
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p className={cn("mt-6 text-lg text-text-muted leading-relaxed")}>
          {subtitle}
        </p>
      )}
    </div>
  );
}