import * as React from "react"
import { ToastProvider, ToastViewport } from "@radix-ui/react-toast"

export function Toaster() {
  return (
    <ToastProvider>
      <ToastViewport className="fixed bottom-0 right-0 p-4 z-50" />
    </ToastProvider>
  )
}

export default Toaster;