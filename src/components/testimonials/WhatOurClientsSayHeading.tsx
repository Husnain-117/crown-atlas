import React from "react"

interface WhatOurClientsSayHeadingProps {
  h2ClassName?: string
}

export function WhatOurClientsSayHeading({
  h2ClassName = "font-display text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--coastal-text)] mb-6 text-balance theme-transition",
}: WhatOurClientsSayHeadingProps) {
  return (
    <h2 className={h2ClassName}>
      <span className="block">What Our</span>
      <span className="block text-gradient-luxury bg-clip-text text-transparent">Clients Say</span>
    </h2>
  )
}

