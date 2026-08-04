type ClassInput = string | undefined | null | false | Record<string, boolean>;

/**
 * Merge class names, filtering out falsy values.
 * Lightweight alternative to clsx + tailwind-merge for this project's needs.
 */
export function cn(...inputs: ClassInput[]): string {
  return inputs
    .filter(Boolean)
    .map((input) => {
      if (typeof input === "string") return input;
      if (typeof input === "object" && input !== null) {
        return Object.entries(input)
          .filter(([, value]) => Boolean(value))
          .map(([key]) => key)
          .join(" ");
      }
      return "";
    })
    .join(" ")
    .trim();
}