"use client"

import { useEffect, useRef, useState } from "react"

interface UseIntersectionObserverProps {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
}

export function useIntersectionObserver({
  threshold = 0.1,
  rootMargin = "0px",
  triggerOnce = true,
}: UseIntersectionObserverProps = {}) {
  const [hasIntersected, setHasIntersected] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      // Fallback: immediately set as intersected if IntersectionObserver is not supported
      setHasIntersected(true)
      return
    }

    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setHasIntersected(true)
            if (triggerOnce && observerRef.current) {
              observerRef.current.disconnect()
            }
          }
        },
        {
          threshold,
          rootMargin,
        },
      )
    }

    observerRef.current.observe(element)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
        observerRef.current = null
      }
    }
  }, [threshold, rootMargin, triggerOnce])

  return {
    elementRef,
    hasIntersected,
  }
}
