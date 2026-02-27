import * as React from "react"

import { cn } from "~/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-10 w-full min-w-0 rounded-lg border-2 border-border bg-card px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 shadow-sm transition-all duration-200 outline-none",
        "focus:border-primary/50 focus:ring-2 focus:ring-primary/15 focus:shadow-md",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40",
        "file:text-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        className
      )}
      {...props}
    />
  )
}

export { Input }
