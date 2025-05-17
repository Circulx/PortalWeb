"use client"

import { useCallback } from "react"
import { useLoading } from "@/contexts/LoadingContext"
import { useToast } from "@/components/ui/use-toast"

export function useLoadingAction() {
  const { startLoading, stopLoading } = useLoading()
  const { toast } = useToast()

  const withLoading = useCallback(
    async <T,>(
      asyncFn: () => Promise<T>,
      options: {
        onSuccess?: (result: T) => void
        onError?: (error: Error) => void
        successMessage?: string
        errorMessage?: string
      } = {},
    ): Promise<T | undefined> => {
      try {
        console.log("Starting loading action...")
        startLoading()
        const result = await asyncFn()

        if (options.successMessage) {
          toast({
            title: "Success",
            description: options.successMessage,
          })
        }

        if (options.onSuccess) {
          options.onSuccess(result)
        }

        return result
      } catch (error) {
        console.error("Error in loading action:", error)

        if (options.errorMessage) {
          toast({
            title: "Error",
            description: options.errorMessage || (error as Error).message,
            variant: "destructive",
          })
        }

        if (options.onError) {
          options.onError(error as Error)
        }

        return undefined
      } finally {
        console.log("Stopping loading action...")
        stopLoading()
      }
    },
    [startLoading, stopLoading, toast],
  )

  return { withLoading }
}
