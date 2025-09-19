import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate a URL-safe slug from a name:
// - lowercase
// - replace non-alphanumeric with '-'
// - collapse multiple dashes
// - trim leading/trailing dashes
// - enforce max length
export function slugify(input: string, maxLength = 48): string {
  if (!input) return "";
  const ascii = input.normalize("NFKD").replace(/[^\p{L}\p{N}\s-]/gu, "");
  const dashed = ascii
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");
  return dashed.slice(0, maxLength);
}