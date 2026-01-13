import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50",
  {
    variants: {
      variant: {
        default: "bg-sky-500 text-white hover:bg-sky-600 shadow-md shadow-sky-500/20",
        gradient: "gradient-primary text-white hover:opacity-90 shadow-md shadow-sky-500/20",
        destructive:
          "bg-red-500 text-white hover:bg-red-600 shadow-md shadow-red-500/20",
        outline:
          "border border-slate-700 bg-transparent text-gray-300 hover:bg-slate-800 hover:text-white",
        secondary:
          "bg-slate-800 text-gray-300 hover:bg-slate-700 hover:text-white",
        ghost:
          "text-gray-400 hover:bg-slate-800 hover:text-white",
        link: "text-sky-400 underline-offset-4 hover:underline",
        glow: "gradient-primary text-white shadow-lg shadow-sky-500/30 hover:shadow-sky-500/50 hover:scale-[1.02]",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 rounded-md gap-1.5 px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "size-10",
        "icon-sm": "size-8",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
