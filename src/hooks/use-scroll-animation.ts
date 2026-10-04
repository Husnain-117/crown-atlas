import { useEffect, useRef, useState } from 'react'

interface UseScrollAnimationOptions {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
}

export function useScrollAnimation(options: UseScrollAnimationOptions = {}) {
  const {
    threshold = 0.1,
    rootMargin = '0px 0px -50px 0px',
    triggerOnce = true,
  } = options

  const [isVisible, setIsVisible] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = elementRef.current
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            if (triggerOnce && element) {
              observer.unobserve(element)
            }
          } else if (!triggerOnce) {
            setIsVisible(false)
          }
        })
      },
      {
        threshold,
        rootMargin,
      }
    )

    if (element) {
      observer.observe(element)
    }

    return () => {
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [threshold, rootMargin, triggerOnce])

  return { elementRef, isVisible }
}

export function useScrollAnimationMultiple(count: number, options: UseScrollAnimationOptions = {}) {
  const {
    threshold = 0.1,
    rootMargin = '0px 0px -50px 0px',
    triggerOnce = true,
  } = options

  const [visibleItems, setVisibleItems] = useState<boolean[]>(new Array(count).fill(false))
  const itemRefs = useRef<(HTMLElement | null)[]>([])

  // Update visibleItems array when count changes
  useEffect(() => {
    setVisibleItems((prev) => {
      const newArray = new Array(count).fill(false)
      // Preserve existing visible states
      prev.forEach((value, index) => {
        if (index < count) {
          newArray[index] = value
        }
      })
      return newArray
    })
  }, [count])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = itemRefs.current.findIndex((ref) => ref === entry.target)
          if (index !== -1 && entry.isIntersecting) {
            setVisibleItems((prev) => {
              const updated = [...prev]
              updated[index] = true
              return updated
            })
            if (triggerOnce) {
              observer.unobserve(entry.target)
            }
          } else if (index !== -1 && !triggerOnce && !entry.isIntersecting) {
            setVisibleItems((prev) => {
              const updated = [...prev]
              updated[index] = false
              return updated
            })
          }
        })
      },
      {
        threshold,
        rootMargin,
      }
    )

    itemRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => observer.disconnect()
  }, [count, threshold, rootMargin, triggerOnce])

  return { itemRefs, visibleItems }
}

