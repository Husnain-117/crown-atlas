"use client"

import { type ReactNode, useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"

interface ViewportDeferredProps {
  children: ReactNode
  className?: string
  fallback?: ReactNode
  minHeight?: number | string
  rootMargin?: string
}

/** Mounts expensive client UI shortly before it reaches the viewport. */
export function ViewportDeferred({
  children,
  className,
  fallback,
  minHeight,
  rootMargin = "500px 0px",
}: ViewportDeferredProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    if (!("IntersectionObserver" in window)) {
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setIsVisible(true)
        observer.disconnect()
      },
      { rootMargin }
    )

    observer.observe(container)
    return () => observer.disconnect()
  }, [rootMargin])

  return (
    <div
      ref={containerRef}
      className={cn("w-full", className)}
      style={{ minHeight }}
      aria-busy={!isVisible}
    >
      {isVisible ? children : fallback}
    </div>
  )
}
