import * as React from 'react'

import { cn } from '@/lib/utils'

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-11 w-full rounded-xl border border-input/80 bg-background/72 px-3.5 py-2 text-base shadow-[0_10px_24px_rgba(15,23,42,0.04)] ring-offset-background transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground/78 focus-visible:border-primary/35 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/15 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:bg-muted/60 disabled:text-muted-foreground md:text-sm dark:bg-background/56 dark:shadow-[0_16px_34px_rgba(0,0,0,0.16)]',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
