import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date string into a human-readable format
 * @param dateString ISO date string to format
 * @param formatStr Optional format string (default: 'MMM d, yyyy')
 * @returns Formatted date string
 */
export function formatDate(dateString: string, formatStr: string = "MMM d, yyyy"): string {
  try {
    if (!dateString) return "N/A"
    
    const date = parseISO(dateString)
    return format(date, formatStr)
  } catch (error) {
    console.error("Error formatting date:", error)
    return dateString || "N/A"
  }
}
