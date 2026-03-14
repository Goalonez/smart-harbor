import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'border border-primary/15 bg-primary text-primary-foreground shadow-[0_14px_32px_hsl(var(--primary)/0.26)] hover:-translate-y-0.5 hover:bg-primary/95 hover:shadow-[0_18px_40px_hsl(var(--primary)/0.3)]',
        destructive:
          'border border-destructive/20 bg-destructive text-destructive-foreground shadow-[0_12px_28px_hsl(var(--destructive)/0.2)] hover:-translate-y-0.5 hover:bg-destructive/92',
        outline:
          'border border-border/80 bg-background/72 text-foreground shadow-[0_10px_24px_rgba(15,23,42,0.06)] backdrop-blur-md hover:-translate-y-0.5 hover:border-primary/25 hover:bg-accent/70 hover:text-accent-foreground dark:bg-background/55 dark:shadow-[0_16px_32px_rgba(0,0,0,0.18)]',
        secondary:
          'border border-border/70 bg-secondary/85 text-secondary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] hover:-translate-y-0.5 hover:bg-secondary',
        ghost: 'text-foreground/85 hover:bg-accent/80 hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-11 px-4 py-2',
        sm: 'h-10 rounded-xl px-3.5',
        lg: 'h-12 rounded-xl px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    )
  }
)
Button.displayName = 'Button'

export { Button }
