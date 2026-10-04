import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-[var(--radius)] border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-[var(--coastal-secondary)] focus-visible:ring-[var(--coastal-secondary)]/50 focus-visible:ring-[3px] aria-invalid:ring-[var(--error)]/20 dark:aria-invalid:ring-[var(--error)]/40 aria-invalid:border-[var(--error)] transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[var(--coastal-primary)] text-white [a&]:hover:bg-[var(--primary-hover)]",
        secondary:
          "border-transparent bg-[var(--coastal-secondary)] text-[#083133] [a&]:hover:bg-[var(--secondary-hover)]",
        destructive:
          "border-transparent bg-[var(--error)] text-white [a&]:hover:bg-[var(--error)]/90 focus-visible:ring-[var(--error)]/20 dark:focus-visible:ring-[var(--error)]/40 dark:bg-[var(--error)]/60",
        outline:
          "text-[var(--coastal-text)] border-[var(--coastal-border)] [a&]:hover:bg-[var(--surface-muted)] [a&]:hover:text-[var(--coastal-text)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
