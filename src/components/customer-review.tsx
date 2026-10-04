"use client"

import { ChevronDown, ChevronUp, Quote, Star } from "lucide-react"
import Image from "next/image"
import { validateImageUrl } from "@/constants/placeholders"
import { useState } from "react"
import { CLIENT_TESTIMONIALS } from "@/lib/client-testimonials"

// Truncate at nearest word boundary (avoid cutting words in half)
function truncateAtWord(text: string, limit = 300) {
  if (!text) return text
  if (text.length <= limit) return text
  const slice = text.slice(0, limit)
  const lastSpace = slice.lastIndexOf(" ")
  if (lastSpace === -1) return slice + "..."
  return slice.slice(0, lastSpace) + "..."
}

type CustomerReviewProps = {
  gridClassName?: string
  limit?: number
}

const CustomerReview = ({ gridClassName, limit }: CustomerReviewProps) => {
  const [expandedSet, setExpandedSet] = useState<Set<number>>(new Set())
  const testimonials = limit
    ? CLIENT_TESTIMONIALS.slice(0, limit)
    : CLIENT_TESTIMONIALS

  const toggleExpanded = (index: number) => {
    setExpandedSet((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  return (
    <div className="relative">
      <div
        className={
          gridClassName ??
          "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 lg:gap-8 items-start"
        }
      >
        {testimonials.map((testimonial, index) => {
          const isExpanded = expandedSet.has(index)
          const truncatedText = truncateAtWord(testimonial.text, 300)
          const needsExpansion = testimonial.text.length > 300
          
          return (
            <div
              key={index}
              className={[
                "overflow-hidden",
                "border",
                "border-[var(--coastal-border)]",
                "bg-[var(--surface)]",
                "transition-all",
                "duration-300",
                "ease-out",
                "rounded-lg",
                "shadow-sm",
                isExpanded ? "shadow-lg" : "shadow-sm hover:shadow-md",
                "h-full",
                "flex",
                "flex-col",
              ].join(" ")}
            >
              <div className="p-4 sm:p-5 relative flex flex-col flex-grow">
                <Quote
                  aria-hidden="true"
                  className="absolute right-3 top-3 h-7 w-7 text-[var(--coastal-border)]"
                />

                <div className="flex items-center gap-3 mb-3">
                  <div className="relative rounded-full overflow-hidden flex-shrink-0 h-12 w-12 sm:h-14 sm:w-14">
                    <Image
                      src={validateImageUrl(testimonial.avatar, 'user', index.toString())}
                      alt={testimonial.name}
                      fill
                      className={
                        "object-cover " +
                        (testimonial.avatar?.includes("gantman_family")
                          ? "object-[25%_center]"
                          : testimonial.avatar?.includes("maxim_gantman") ||
                            testimonial.name?.includes("Gantman")
                            ? "object-bottom"
                            : "object-center")
                      }
                      sizes="(max-width: 640px) 48px, 56px"
                    />
                  </div>
                  <div className="flex flex-col items-center">
                    <h3 className="font-semibold text-sm md:text-base text-[var(--coastal-text)] text-center">
                      {testimonial.name}
                    </h3>
                    <div className="flex items-center justify-center mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          aria-hidden="true"
                          className="h-3 w-3 sm:h-3 sm:w-3 md:h-4 md:w-4 fill-amber-400 text-amber-400"
                        />
                      ))}
                    </div>
                  </div>

                </div>

                <blockquote
                  id={`client-review-${index}`}
                  className="text-[var(--coastal-muted-text)] italic mb-3 leading-relaxed flex-grow text-sm"
                >
                  {isExpanded ? `"${testimonial.text}"` : `"${truncatedText}"`}
                </blockquote>

                {needsExpansion && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleExpanded(index)
                    }}
                    aria-controls={`client-review-${index}`}
                    aria-expanded={isExpanded}
                    aria-label={`${isExpanded ? "Read less" : "Read more"}: review from ${testimonial.name}`}
                    className="mt-auto inline-flex min-h-11 items-center gap-1 self-start text-sm font-semibold text-[#0F2A44] transition-colors duration-200 hover:text-[#285473] dark:text-[#A8D7D2] dark:hover:text-white"
                  >
                    {isExpanded ? (
                      <>
                        <span>Read less</span>
                        <ChevronUp aria-hidden="true" className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        <span>Read more</span>
                        <ChevronDown aria-hidden="true" className="h-4 w-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CustomerReview
