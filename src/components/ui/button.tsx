import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center cursor-pointer justify-center gap-2 whitespace-nowrap rounded-[var(--radius)] text-sm font-semibold transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-[var(--coastal-secondary)] focus-visible:ring-offset-2 hover:scale-105 active:scale-95",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--coastal-primary)] text-white shadow-medium hover:shadow-strong hover:bg-[var(--primary-hover)] hover:shadow-[var(--coastal-primary)]/25",
        destructive:
          "bg-[var(--error)] text-white shadow-medium hover:shadow-strong hover:bg-[var(--error)]/90 focus-visible:ring-[var(--error)]/50",
        outline:
          "border border-[var(--coastal-border)] bg-[var(--surface)] text-[var(--coastal-primary)] hover:bg-[var(--surface-muted)] hover:border-[var(--coastal-secondary)] hover:text-[var(--coastal-primary)] hover:shadow-medium theme-transition",
        secondary:
          "bg-[var(--coastal-secondary)] text-[#083133] shadow-soft hover:bg-[var(--secondary-hover)] hover:shadow-medium theme-transition",
        ghost:
          "text-[var(--coastal-muted-text)] hover:bg-[var(--surface-muted)] hover:text-[var(--coastal-text)] rounded-xl theme-transition",
        link: "text-[var(--coastal-link)] underline-offset-4 hover:underline hover:text-[var(--coastal-link)] rounded-none hover:scale-100",
        luxury:
          "bg-[var(--coastal-accent)] text-white shadow-medium hover:shadow-strong hover:shadow-[var(--coastal-accent)]/25",
        accent:
          "bg-[var(--coastal-secondary)] text-white shadow-medium hover:shadow-strong hover:shadow-[var(--coastal-secondary)]/25",
      },
      size: {
        default: "h-12 px-6 py-3 text-sm",
        sm: "h-9 px-4 py-2 text-sm rounded-xl",
        lg: "h-13 px-8 py-4 text-base rounded-2xl",
        xl: "h-16 px-10 py-5 text-lg rounded-3xl",
        icon: "size-12 rounded-[var(--radius)]",
        "icon-sm": "size-9 rounded-xl",
        "icon-lg": "size-13 rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
