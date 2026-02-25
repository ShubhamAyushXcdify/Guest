"use client"
import { cn } from "@/lib/utils"

type LoaderProps = {
  label?: string
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizeMap: Record<NonNullable<LoaderProps["size"]>, string> = {
  sm: "h-5 w-5",
  md: "h-8 w-8",
  lg: "h-12 w-12",
}

export function Loader({ label = "Loading…", size = "md", className }: LoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn("flex items-center gap-3 text-foreground", className)}
    >
      {/* Spinner: uses primary color and respects reduced motion */}
      <span
        className={cn(
          "inline-block rounded-full border-2 border-muted/60 border-t-primary motion-safe:animate-spin motion-reduce:animate-none",
          sizeMap[size],
        )}
        aria-hidden="true"
      />
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  )
}

export default Loader
