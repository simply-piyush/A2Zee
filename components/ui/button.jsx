import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-semibold font-outfit transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer active:scale-[0.99]",
  {
    variants: {
      variant: {
        default:
          "bg-[#1F4072] text-white hover:bg-[#163056] shadow-xs border border-transparent",
        destructive:
          "bg-rose-600 text-white hover:bg-rose-700 shadow-xs",
        outline:
          "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 hover:border-slate-300 shadow-xs",
        secondary:
          "bg-slate-100 text-slate-900 hover:bg-slate-200 border border-slate-200",
        ghost:
          "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
        link:
          "text-[#1F4072] underline-offset-4 hover:underline",
        coop:
          "bg-[#1F4072] text-white hover:bg-[#163056] shadow-xs active:scale-[0.98]",
        emerald:
          "bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs active:scale-[0.98]",
        explore:
          "bg-[#FFEDE0] hover:bg-white text-[#1F4072] font-display text-sm md:text-base px-6 py-2.5 rounded-full shadow hover:shadow-md active:scale-95 uppercase tracking-wide border-0",
        category:
          "h-16 sm:h-18 w-full flex-row items-center justify-start gap-3 rounded-2xl bg-white hover:bg-[#FFF9F5] border border-gray-200/90 hover:border-[#1F4072]/40 text-gray-800 hover:text-[#1F4072] shadow-xs hover:shadow-md active:scale-[0.98] transition-all px-3.5 sm:px-4 py-2 text-left",
      },
      size: {
        default: "h-10 px-4 py-2 rounded-xl",
        sm: "h-9 rounded-xl px-3 text-xs gap-1.5",
        md: "h-11 rounded-xl px-4 text-sm gap-2",
        lg: "h-12 rounded-xl px-6 text-base gap-2.5",
        xl: "h-14 rounded-2xl px-6 text-base font-bold gap-2.5 shadow-lg",
        icon: "h-10 w-10 rounded-xl p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(
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
export default Button
