"use client"

import { useState, useEffect, useCallback } from "react"

export interface Toast {
  id: number
  title: string
  description?: string
  duration?: number
}

export type ToastProps = Omit<Toast, "id">

export interface ToastContextType {
  toast: (props: ToastProps) => void
  dismiss: (id: number) => void
  toasts: Toast[]
}

export function useToast(): ToastContextType {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback(({ title, description = "", duration = 3000 }: ToastProps) => {
    const id = Date.now()
    const newToast: Toast = { id, title, description, duration }
    setToasts((prevToasts) => [...prevToasts, newToast])
    return id
  }, [])

  const dismiss = useCallback((id: number) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
  }, [])

  useEffect(() => {
    const timers = toasts.map((toast) => {
      return setTimeout(() => {
        dismiss(toast.id)
      }, toast.duration)
    })

    return () => {
      timers.forEach(clearTimeout)
    }
  }, [toasts, dismiss])

  return { toast, dismiss, toasts }
}
