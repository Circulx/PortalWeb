"use client"

import * as React from "react"
import { useFormField } from "./form"
import { Input, type InputProps } from "./input"
import { cn } from "@/lib/utils"

const FormInput = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  const { error } = useFormField()
  
  return (
    <Input
      ref={ref}
      className={cn(className)}
      hasError={!!error}
      {...props}
    />
  )
})
FormInput.displayName = "FormInput"

export { FormInput }


