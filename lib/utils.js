import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Standard shadcn-ui class merger utility for Next.js.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
