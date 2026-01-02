"use client"

import { useState, useEffect, useRef } from "react"
import { useIntersectionObserver } from "./use-intersection-observer"

interface UseLazyLoadProps {
  delay?: number
  threshold?: number
  rootMargin?: string
}

export function useLazyLoad({ delay = 0, threshold = 0.1, rootMargin = "100px" }: UseLazyLoadProps = {}) {
  const [shouldLoad, setShouldLoad] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const { elementRef, hasIntersected } = useIntersectionObserver({
    threshold,
    rootMargin,
    triggerOnce: true,
  })

  useEffect(() => {
    if (hasIntersected && !shouldLoad) {
      setIsLoading(true)

      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }

      timerRef.current = setTimeout(() => {
        setShouldLoad(true)
        setIsLoading(false)
        timerRef.current = null
      }, delay)

      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current)
          timerRef.current = null
        }
      }
    }
  }, [hasIntersected, shouldLoad, delay])

  return {
    elementRef,
    shouldLoad,
    isLoading,
    hasIntersected,
  }
}
