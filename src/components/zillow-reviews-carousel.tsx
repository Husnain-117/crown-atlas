"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronLeftIcon, ChevronRightIcon, ExternalLink, Star } from "lucide-react"
import Image from "next/image"
import { Card, CardContent } from "./ui/card"

interface ZillowReview {
  id: string
  author: string
  rating: number
  date?: string
  review: string
  location?: string
  avatar?: string
}

interface ZillowReviewsCarouselProps {
  reviews: ZillowReview[]
}

export default function ZillowReviewsCarousel({ reviews }: ZillowReviewsCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScrollability = () => {
    if (!scrollContainerRef.current) return
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
  }

  useEffect(() => {
    checkScrollability()
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener('scroll', checkScrollability)
      window.addEventListener('resize', checkScrollability)
      return () => {
        container.removeEventListener('scroll', checkScrollability)
        window.removeEventListener('resize', checkScrollability)
      }
    }
  }, [reviews])

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return
    
    const container = scrollContainerRef.current
    const scrollAmount = container.clientWidth * 0.8
    const targetScroll = direction === 'left' 
      ? container.scrollLeft - scrollAmount 
      : container.scrollLeft + scrollAmount
    
    container.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    })
  }

  return (
    <div className="relative">
      {/* Scroll Buttons */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-2 top-1/2 z-20 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-md bg-[var(--surface)]/90 text-[var(--coastal-text)] shadow-medium transition-all duration-300 hover:bg-[var(--surface)] hover:shadow-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--coastal-primary)]"
          aria-label="Scroll left"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
      )}
      
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-2 top-1/2 z-20 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-md bg-[var(--surface)]/90 text-[var(--coastal-text)] shadow-medium transition-all duration-300 hover:bg-[var(--surface)] hover:shadow-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--coastal-primary)]"
          aria-label="Scroll right"
        >
          <ChevronRightIcon className="h-5 w-5" />
        </button>
      )}

      {/* Scrollable Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-6 overflow-x-auto pb-4 hide-scrollbar scroll-smooth items-stretch"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {reviews.map((review) => (
          <Card
            key={review.id}
            className="flex min-h-[400px] w-[min(350px,calc(100vw-2rem))] flex-shrink-0 flex-col rounded-lg border border-[var(--coastal-border)] bg-[var(--surface)] shadow-sm transition-all duration-300 hover:shadow-lg"
          >
            <CardContent className="p-6 flex flex-col flex-grow h-full">
              {/* Author Info - Moved to Top */}
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-3">
                  {review.avatar ? (
                    <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={review.avatar}
                        alt={review.author}
                        fill
                        className="object-cover object-center"
                        sizes="48px"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-sm">
                        {review.author.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[var(--coastal-text)] text-base">
                      {review.author}
                    </div>
                    {review.location && (
                      <div className="text-xs text-[var(--coastal-muted-text)] truncate">
                        {review.location}
                      </div>
                    )}
                    {review.date && (
                      <div className="mt-1 text-xs text-[var(--coastal-muted-text)]">
                        {review.date}
                      </div>
                    )}
                  </div>
                </div>
                {/* Star Rating */}
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < review.rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-[var(--coastal-border)] text-[var(--coastal-border)]'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Review Text */}
              <blockquote className="text-[var(--coastal-muted-text)] mb-4 leading-relaxed flex-grow text-sm md:text-base">
                "{review.review}"
              </blockquote>

              <div className="mt-auto pt-4 border-t border-[var(--coastal-border)]">
                <a
                  href="https://www.zillow.com/profile/RezaSoCal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[var(--coastal-primary)] hover:underline"
                >
                  View external profile
                  <ExternalLink aria-hidden="true" className="h-4 w-4" />
                </a>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

