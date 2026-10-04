"use client"

import { type ReactNode, useEffect, useState } from "react"

/** Native details must be open on desktop; CSS cannot reveal a closed details subtree. */
export default function FooterDisclosure({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(true)
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)")
    const update = () => setOpen(desktop.matches)
    update()
    desktop.addEventListener("change", update)
    return () => desktop.removeEventListener("change", update)
  }, [])

  return <details className="group" open={open} onToggle={event => setOpen(event.currentTarget.open)}>{children}</details>
}
