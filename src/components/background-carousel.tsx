"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

interface BackgroundCarouselProps {
  images: string[]
  interval?: number
}

export default function BackgroundCarousel({ images, interval = 5000 }: BackgroundCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const nextIndex = images.length > 1 ? (currentIndex + 1) % images.length : currentIndex

  useEffect(() => {
    if (images.length <= 1 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return
    }

    const timer = window.setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
    }, interval)

    return () => window.clearInterval(timer)
  }, [images.length, interval])

  useEffect(() => {
    if (images.length <= 1) return

    const timer = window.setTimeout(() => {
      const preload = new window.Image()
      preload.src = images[nextIndex]
    }, 1500)

    return () => window.clearTimeout(timer)
  }, [images, nextIndex])

  if (images.length === 0) return null

  return (
    <div className="absolute inset-0 w-full h-full">
      <Image
        key={images[currentIndex]}
        src={images[currentIndex]}
        alt="Luxury coastal homes for sale in California"
        fill
        className="object-cover animate-fade-in"
        priority={currentIndex === 0}
        fetchPriority={currentIndex === 0 ? "high" : undefined}
        sizes="100vw"
        placeholder={currentIndex === 0 ? "blur" : "empty"}
        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
      />
    </div>
  )
}
