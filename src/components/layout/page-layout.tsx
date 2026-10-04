import React from "react";
import { cn } from "@/lib/utils";

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
  noPadding?: boolean;
  background?: "default" | "surface" | "muted";
}

/**
 * Consistent page layout wrapper for all pages
 * Provides standardized spacing and container behavior
 */
export function PageLayout({
  children,
  className,
  fullWidth = false,
  noPadding = false,
  background = "default",
}: PageLayoutProps) {
  const backgroundClasses = {
    default: "bg-[var(--bg)] text-[var(--coastal-text)] min-h-screen",
    surface: "bg-[var(--surface)] text-[var(--coastal-text)] min-h-screen",
    muted: "bg-[var(--surface-muted)] text-[var(--coastal-text)] min-h-screen",
  };

  const containerClasses = fullWidth
    ? "w-full"
    : "container mx-auto px-4";

  const paddingClasses = noPadding
    ? ""
    : "py-8 pt-24 sm:pt-28";

  return (
    <div className={cn(backgroundClasses[background], className)}>
      <div className={cn(containerClasses, paddingClasses)}>
        {children}
      </div>
    </div>
  );
}

export default PageLayout;
