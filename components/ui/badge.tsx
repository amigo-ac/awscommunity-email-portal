import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-sky-500/20 text-sky-400 border-sky-500/30",
        secondary:
          "border-transparent bg-slate-700 text-gray-300",
        destructive:
          "border-transparent bg-red-500/20 text-red-400 border-red-500/30",
        outline:
          "border-slate-700 text-gray-400",
        success:
          "border-transparent bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
        warning:
          "border-transparent bg-amber-500/20 text-amber-400 border-amber-500/30",
        // Community type specific badges
        cc: "bg-violet-500/20 text-violet-400 border-violet-500/30",
        ug: "bg-amber-500/20 text-amber-400 border-amber-500/30",
        cb: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
        hero: "bg-pink-500/20 text-pink-400 border-pink-500/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
