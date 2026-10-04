"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Image from "@/components/property-image"
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import * as DialogPrimitive from "@radix-ui/react-dialog"

interface PropertyGalleryProps {
  images: string[]
}

export default function PropertyGallery({ images }: PropertyGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const lastTouchDistance = useRef<number | null>(null)

  const goToPrevious = () => {
    const isFirstImage = currentIndex === 0
    const newIndex = isFirstImage ? images.length - 1 : currentIndex - 1
    setCurrentIndex(newIndex)
    resetZoom()
  }

  const goToNext = () => {
    const isLastImage = currentIndex === images.length - 1
    const newIndex = isLastImage ? 0 : currentIndex + 1
    setCurrentIndex(newIndex)
    resetZoom()
  }

  const resetZoom = useCallback(() => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }, [])

  const clamp = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), max)

  const getPanBounds = useCallback((nextZoom: number) => {
    const container = containerRef.current
    const image = imageRef.current

    if (!container || !image || !image.naturalWidth || !image.naturalHeight) {
      return { maxX: 0, maxY: 0 }
    }

    const containerWidth = container.clientWidth
    const containerHeight = container.clientHeight
    const imageRatio = image.naturalWidth / image.naturalHeight
    const containerRatio = containerWidth / containerHeight

    let baseWidth = containerWidth
    let baseHeight = containerHeight

    if (imageRatio > containerRatio) {
      baseHeight = containerWidth / imageRatio
    } else {
      baseWidth = containerHeight * imageRatio
    }

    const scaledWidth = baseWidth * nextZoom
    const scaledHeight = baseHeight * nextZoom

    const maxX = Math.max(0, (scaledWidth - containerWidth) / 2)
    const maxY = Math.max(0, (scaledHeight - containerHeight) / 2)

    return { maxX, maxY }
  }, [])

  const clampPan = useCallback(
    (nextPan: { x: number; y: number }, nextZoom: number) => {
      const { maxX, maxY } = getPanBounds(nextZoom)
      return {
        x: clamp(nextPan.x, -maxX, maxX),
        y: clamp(nextPan.y, -maxY, maxY),
      }
    },
    [getPanBounds]
  )

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault()
    const delta = e.deltaY * -0.001
    const newZoom = Math.min(Math.max(1, zoom + delta), 4)
    setZoom(newZoom)
    
    if (newZoom > 1 && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const newPanX = pan.x - (x - rect.width / 2) * delta
      const newPanY = pan.y - (y - rect.height / 2) * delta
      setPan(clampPan({ x: newPanX, y: newPanY }, newZoom))
    } else {
      setPan({ x: 0, y: 0 })
    }
  }

  // Mouse drag for panning
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (zoom > 1) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging && zoom > 1) {
      const nextPan = {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      }
      setPan(clampPan(nextPan, zoom))
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Touch handlers for pinch zoom
  const getTouchDistance = (touches: React.TouchList) => {
    if (touches.length < 2) return null
    const touch1 = touches[0]
    const touch2 = touches[1]
    return Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    )
  }

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      lastTouchDistance.current = getTouchDistance(e.touches)
    } else if (e.touches.length === 1 && zoom > 1) {
      setIsDragging(true)
      setDragStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
      })
    }
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2 && lastTouchDistance.current) {
      e.preventDefault()
      const currentDistance = getTouchDistance(e.touches)
      if (currentDistance) {
        const scale = currentDistance / lastTouchDistance.current
        const newZoom = Math.min(Math.max(1, zoom * scale), 4)
        setZoom(newZoom)
        setPan((prev) => clampPan(prev, newZoom))
        lastTouchDistance.current = currentDistance
      }
    } else if (e.touches.length === 1 && isDragging && zoom > 1) {
      const nextPan = {
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      }
      setPan(clampPan(nextPan, zoom))
    }
  }

  const handleTouchEnd = () => {
    lastTouchDistance.current = null
    setIsDragging(false)
  }

  // Handle click on main image to open fullscreen
  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Don't open if clicking on buttons or if already dragging
    const target = e.target as HTMLElement
    if (target.closest('button') || isDragging) {
      return
    }
    
    // Check if click is in the middle area (not near edges where buttons are)
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const clickY = e.clientY - rect.top
    // Only open if click is in the middle 60% of the image
    const marginX = rect.width * 0.2
    const marginY = rect.height * 0.2
    
    if (
      clickX > marginX && 
      clickX < rect.width - marginX &&
      clickY > marginY && 
      clickY < rect.height - marginY
    ) {
      setIsDialogOpen(true)
    }
  }

  // Reset zoom when dialog opens/closes or image changes
  useEffect(() => {
    resetZoom()
  }, [currentIndex, resetZoom])

  useEffect(() => {
    if (zoom === 1) {
      setPan({ x: 0, y: 0 })
      return
    }

    setPan((prev) => {
      const clamped = clampPan(prev, zoom)
      if (clamped.x === prev.x && clamped.y === prev.y) {
        return prev
      }
      return clamped
    })
  }, [zoom, clampPan])

  return (
    <div className="relative min-w-0 w-full">
      {/* Main Gallery View */}
      <div
        className={`relative overflow-hidden rounded-lg ${images.length > 0 ? "h-[240px] sm:h-[360px] md:h-[480px] cursor-pointer" : "h-[180px] sm:h-[240px]"}`}
        onClick={handleImageClick}
      >
        {images[currentIndex] ? (
          <Image
            src={images[currentIndex]}
            alt={`Property image ${currentIndex + 1}`}
            fill
            priority
            sizes="(max-width: 640px) calc(100vw - 32px), (min-width: 1024px) 1216px, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-[var(--surface-muted)]">
            <span className="text-[var(--coastal-muted-text)]">Image not available</span>
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-black/10" aria-hidden="true" />

        {/* Navigation Buttons */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Previous property image"
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-[var(--surface)]/90 hover:bg-[var(--surface)] text-[var(--coastal-text)] rounded-full h-11 w-11 border border-[var(--coastal-border)] z-10"
              onClick={(e) => {
                e.stopPropagation()
                goToPrevious()
              }}
            >
              <ChevronLeft className="h-4 w-4 sm:h-6 sm:w-6" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              aria-label="Next property image"
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-[var(--surface)]/90 hover:bg-[var(--surface)] text-[var(--coastal-text)] rounded-full h-11 w-11 border border-[var(--coastal-border)] z-10"
              onClick={(e) => {
                e.stopPropagation()
                goToNext()
              }}
            >
              <ChevronRight className="h-4 w-4 sm:h-6 sm:w-6" />
            </Button>
          </>
        )}

        {/* Fullscreen Button */}
        {images.length > 0 && <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open)
            resetZoom()
          }}
        >
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open full-screen property gallery"
              className="absolute right-2 sm:right-4 top-2 sm:top-4 bg-[var(--surface)]/90 hover:bg-[var(--surface)] text-[var(--coastal-text)] rounded-full h-11 w-11 border border-[var(--coastal-border)] z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <Expand className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </DialogTrigger>
          <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50" />
          <DialogPrimitive.Content
            data-slot="dialog-content"
            className="bg-[var(--surface)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 translate-x-[-50%] translate-y-[-50%] flex flex-col w-[calc(100vw-2rem)] sm:w-[calc(100vw-3rem)] max-w-[1600px] h-[calc(100vh-2rem)] p-0 gap-0 rounded-lg border border-[var(--coastal-border)] shadow-lg duration-200 overflow-hidden"
          >
              <DialogPrimitive.Title className="sr-only">Property photo gallery</DialogPrimitive.Title>
              <DialogPrimitive.Description className="sr-only">
                Browse, zoom, and pan through the listing photos.
              </DialogPrimitive.Description>
              {/* Main Image Container */}
              <div
                ref={containerRef}
                className="relative flex-1 w-full flex items-center justify-center min-h-0 overflow-hidden"
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{ cursor: zoom > 1 ? 'grab' : 'default' }}
              >
                <Image
                  ref={imageRef}
                  src={images[currentIndex] || "/placeholder.svg"}
                  alt={`Property image ${currentIndex + 1}`}
                  fill
                  sizes="100vw"
                  className="object-contain select-none"
                  style={{
                    transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                    transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                  }}
                  draggable={false}
                />
                
                {/* Navigation buttons inside zoomed view */}
                {images.length > 1 && <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Previous property image"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-[var(--surface)]/95 hover:bg-[var(--surface)] text-[var(--coastal-text)] rounded-full h-12 w-12 shadow-lg z-10 border border-[var(--coastal-border)]"
                  onClick={goToPrevious}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>}

                {images.length > 1 && <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Next property image"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-[var(--surface)]/95 hover:bg-[var(--surface)] text-[var(--coastal-text)] rounded-full h-12 w-12 shadow-lg z-10 border border-[var(--coastal-border)]"
                  onClick={goToNext}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>}

                {/* Image Counter */}
                <div className="absolute bottom-4 right-4 bg-[var(--coastal-primary)]/80 text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-lg">
                  {currentIndex + 1} / {images.length}
                </div>
              </div>

              {/* Thumbnail Strip Below Zoomed Image */}
              <div className="flex-shrink-0 border-t border-[var(--coastal-border)] bg-[var(--surface)] px-4 py-3">
                <div className="flex gap-2 overflow-x-auto justify-center pb-1 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      aria-label={`Show property image ${index + 1}`}
                      aria-pressed={index === currentIndex}
                      className={`relative h-16 w-24 sm:h-20 sm:w-32 rounded-[var(--radius)] overflow-hidden flex-shrink-0 transition-all duration-200 ${
                        index === currentIndex 
                          ? "ring-4 ring-[var(--coastal-primary)] shadow-lg scale-105" 
                          : "opacity-60 hover:opacity-100 hover:scale-105"
                      }`}
                    >
                      <Image
                        src={image || "/placeholder.svg"}
                        alt=""
                        fill
                        sizes="128px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

            <DialogPrimitive.Close 
              className="ring-offset-background focus:ring-[var(--coastal-secondary)] absolute top-3 right-3 z-50 rounded-full bg-[var(--surface)]/95 hover:bg-[var(--surface)] shadow-lg p-2 transition-all hover:scale-110 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none border border-[var(--coastal-border)]"
              onClick={resetZoom}
            >
              <X className="h-5 w-5 text-[var(--coastal-text)]" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        </Dialog>}

        {/* Image Counter */}
        {images.length > 0 && <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 bg-[var(--coastal-primary)]/80 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm">
          {currentIndex + 1} / {images.length}
        </div>}
      </div>

      {/* Thumbnail Gallery */}
      <div className="flex gap-1.5 sm:gap-2 mt-2 overflow-x-auto pb-2">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Show property image ${index + 1}`}
            aria-pressed={index === currentIndex}
            className={`relative h-16 w-24 sm:h-20 sm:w-32 rounded-[var(--radius)] overflow-hidden flex-shrink-0 transition ${
              index === currentIndex ? "ring-2 ring-[var(--coastal-primary)]" : "opacity-70"
            }`}
          >
            <Image
              src={image || "/placeholder.svg"}
              alt=""
              fill
              sizes="128px"
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  )
}
