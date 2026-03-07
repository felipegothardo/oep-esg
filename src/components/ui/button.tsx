import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[linear-gradient(135deg,hsl(var(--primary)),hsl(var(--blue-light)))] bg-[length:200%_200%] bg-[position:0%_50%] text-primary-foreground shadow-eco hover:bg-[position:100%_50%] hover:shadow-glow hover:scale-[1.02] active:scale-[0.98] after:absolute after:inset-0 after:pointer-events-none after:bg-[linear-gradient(120deg,transparent_30%,rgba(255,255,255,0.3)_50%,transparent_70%)] after:translate-x-[-140%] hover:after:translate-x-[140%] after:transition-transform after:duration-700",
        destructive:
          "bg-[linear-gradient(135deg,hsl(var(--destructive)),hsl(0_70%_45%))] text-destructive-foreground shadow-soft hover:brightness-110 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
        outline:
          "border-2 border-primary/70 bg-background/90 text-primary shadow-soft hover:border-transparent hover:bg-[linear-gradient(135deg,hsl(var(--primary)),hsl(var(--accent)))] hover:text-primary-foreground hover:shadow-accent hover:scale-[1.02] active:scale-[0.98]",
        secondary:
          "bg-[linear-gradient(135deg,hsl(var(--secondary)),hsl(var(--muted)))] text-secondary-foreground shadow-soft hover:brightness-110 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
        ghost:
          "hover:bg-accent/80 hover:text-accent-foreground hover:shadow-soft hover:scale-[1.02] active:scale-[0.98]",
        link: "text-primary underline-offset-4 hover:underline",
        vibrant:
          "bg-gradient-vibrant bg-[length:200%_200%] bg-[position:0%_50%] text-white shadow-md hover:bg-[position:100%_50%] hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] font-bold after:absolute after:inset-0 after:pointer-events-none after:bg-[linear-gradient(120deg,transparent_30%,rgba(255,255,255,0.25)_50%,transparent_70%)] after:translate-x-[-140%] hover:after:translate-x-[140%] after:transition-transform after:duration-700",
        success:
          "bg-[linear-gradient(135deg,hsl(var(--success)),hsl(var(--green-light)))] text-success-foreground shadow-soft hover:brightness-110 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
      },
      size: {
        default: "h-11 px-6 py-3 text-base",
        sm: "h-9 rounded-md px-4 text-sm",
        lg: "h-14 rounded-xl px-10 py-4 text-lg",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
