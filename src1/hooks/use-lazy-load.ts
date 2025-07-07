"use client"

import { useState, useEffect } from "react"
import { useIntersectionObserver } from "./use-intersection-observer"

interface UseLazyLoadProps {
  delay?: number
  threshold?: number
  rootMargin?: string
}

export function useLazyLoad({ delay = 0, threshold = 0.1, rootMargin = "100px" }: UseLazyLoadProps = {}) {
  const [shouldLoad, setShouldLoad] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { elementRef, hasIntersected } = useIntersectionObserver({
    threshold,
    rootMargin,
    triggerOnce: true,
  })

  useEffect(() => {
    if (hasIntersected && !shouldLoad) {
      setIsLoading(true)
      const timer = setTimeout(() => {
        setShouldLoad(true)
        setIsLoading(false)
      }, delay)

      return () => clearTimeout(timer)
    }
  }, [hasIntersected, shouldLoad, delay])

  return {
    elementRef,
    shouldLoad,
    isLoading,
    hasIntersected,
  }
}
