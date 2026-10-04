"use client"

import { Star } from "lucide-react"
import Image from "next/image"
import { useState, useEffect } from "react"

const testimonials = [
  {
    name: "Mario & Sylvia Jacobo",
    avatar: "/client/mario_sylvia.jpg",
    text: "Working with Reza meant to be working with excellency! We had an incredible experience, due to his professionalism, was very knowledgeable, and truly invested his willingness and time in helping us find the place we chose.",
  },
  {
    name: "Fern Siegel",
    avatar: "/client/fern_siegel.jpg",
    text: "Reza Barghlalmeno made buying our home such an incredible experience—one of the best we've had as a family, and I've been through quite a few home purchases in my 80+ years!",
  },
  {
    name: "Max & MaryJane Gantman",
    avatar: "/client/gantman_family.jpg",
    text: "My husband and I are first time buyers in San Diego. From the moment we met him, Reza has been helpful, understanding, patient, professional, empathetic, and has operated with the highest level of integrity.",
  },
  {
    name: "Russell & Susan McQueen",
    avatar: "/client/russell_macqueen.jpeg",
    text: "Reza was the best agent we have ever worked with. His expertise was beyond belief. He had an approach working with a new realty group that allowed us to make updates to our home and within 3 weeks we had one three day showing and we had 5 offers over asking price.",
  },
  {
    name: "Pulkit & Sayely Kaushal",
    avatar: "/client/pulkit_kaushal.jpg",
    text: "Reza was incredibly helpful in our home search and in securing our first house! He had knowledge about the area and was always responsive to our questions.",
  },
]

export default function CustomerReviewCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length)
        setIsTransitioning(false)
      }, 300)
    }, 5000) // Change review every 5 seconds

    return () => clearInterval(interval)
  }, [])

  const currentReview = testimonials[currentIndex]

  return (
    <div className="w-full">
      <div
        className={`
          relative border border-[var(--coastal-border)] bg-[var(--surface)] shadow-md rounded-[22px]
          p-4 md:p-6
          transition-all duration-300
          ${isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}
        `}
      >
        {/* Quote icon */}
        <div className="absolute top-3 right-3 text-[var(--coastal-border)] opacity-30">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.3 6.2H16.7L13.2 12.8V17.8H18.8V12.8H16.7L20.2 6.2V2.4H11.3V6.2ZM2.8 6.2H8.2L4.7 12.8V17.8H10.3V12.8H8.2L11.7 6.2V2.4H2.8V6.2Z" />
          </svg>
        </div>

        {/* Avatar + Name row — always horizontal */}
        <div className="flex items-center gap-3 mb-3">
          <div className="relative rounded-full overflow-hidden flex-shrink-0 h-11 w-11 md:h-16 md:w-16">
            <Image
              src={currentReview.avatar || "/placeholder.svg"}
              alt={currentReview.name}
              fill
              className={`object-cover ${
                currentReview.avatar?.includes('gantman_family')
                  ? 'object-[25%_center]'
                  : currentReview.avatar?.includes('maxim_gantman') || currentReview.name?.includes('Gantman')
                    ? 'object-bottom'
                    : 'object-center'
              }`}
              sizes="(max-width: 768px) 44px, 64px"
            />
          </div>
          <div>
            <h3 className="font-bold text-sm md:text-base text-[var(--coastal-text)] leading-tight">
              {currentReview.name}
            </h3>
            <div className="flex items-center gap-0.5 mt-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3 w-3 md:h-3.5 md:w-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
          </div>
        </div>

        {/* Review text */}
        <blockquote className="text-[var(--coastal-muted-text)] text-xs md:text-sm leading-relaxed mb-3">
          &ldquo;{currentReview.text}&rdquo;
        </blockquote>

        {/* Pagination dots */}
        <div className="flex items-center justify-center gap-0.3">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsTransitioning(true)
                setTimeout(() => {
                  setCurrentIndex(index)
                  setIsTransitioning(false)
                }, 300)
              }}
              aria-label={`Go to review ${index + 1}`}
              style={{
                background: 'transparent',
                border: 'none',
                padding: 0,
                width: '44px',
                height: '44px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  display: 'block',
                  width: index === currentIndex ? '20px' : '7px',
                  height: '7px',
                  borderRadius: '9999px',
                  backgroundColor: index === currentIndex
                    ? 'var(--coastal-primary)'
                    : 'var(--coastal-border)',
                  transition: 'all 0.3s',
                  flexShrink: 0,
                }}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
