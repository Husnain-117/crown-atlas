import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-[var(--coastal-muted-text)] selection:bg-[var(--coastal-primary)] selection:text-primary-foreground border-[var(--coastal-border)] flex h-12 w-full min-w-0 rounded-[var(--radius)] border bg-[var(--surface)] px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-[var(--coastal-secondary)] focus-visible:ring-[var(--coastal-secondary)]/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-[var(--error)]/20 dark:aria-invalid:ring-[var(--error)]/40 aria-invalid:border-[var(--error)]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
