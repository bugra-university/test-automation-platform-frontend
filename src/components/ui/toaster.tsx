import React from "react"
import { Check, Trash2 } from "lucide-react"
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "./toast"
import { useToast } from "./UseToast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        const isRemoved = variant === "removed"
        return (
          <Toast key={id} {...props}>
            <div className="grid min-w-0 flex-1 gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${isRemoved ? "bg-slate-400" : "bg-green-500"}`}
              aria-hidden
            >
              {isRemoved ? (
                <Trash2 className="h-5 w-5 text-white" strokeWidth={2.5} />
              ) : (
                <Check className="h-5 w-5 text-white" strokeWidth={2.5} />
              )}
            </div>
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
