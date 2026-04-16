import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Neumorphic push buttons with per-context glow.
 *
 * Glow tint is driven by the CSS variable `--btn-glow` (defaults to pounamu teal).
 * Set it on a parent or on the button itself, e.g.:
 *   style={{ ['--btn-glow' as any]: '232,169,72' }}  // ochre on Auaha
 *   style={{ ['--btn-glow' as any]: '74,165,168' }}  // teal default
 *
 * All variants share the same physical "push" feel: raised dual shadow,
 * soft inner specular, gentle press-down on :active, accent ring on :focus.
 */
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium",
    "ring-offset-background transition-all duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    "active:translate-y-[1px] active:scale-[0.99]",
    "[--btn-glow:74,165,168]", // default tint = pounamu teal
  ].join(" "),
  {
    variants: {
      variant: {
        // ─── Default: bright neumorphic surface, accent glow ───
        default: [
          "text-[#1A1D29] font-semibold",
          "bg-[linear-gradient(145deg,#FFFFFF,#F1F3F7)]",
          "border border-[rgba(255,255,255,0.9)]",
          "shadow-[6px_6px_14px_rgba(166,166,180,0.30),-4px_-4px_12px_rgba(255,255,255,0.95),inset_0_1px_0_rgba(255,255,255,0.95),0_0_24px_rgba(var(--btn-glow),0.18)]",
          "hover:shadow-[8px_8px_18px_rgba(166,166,180,0.34),-5px_-5px_14px_rgba(255,255,255,0.95),inset_0_1px_0_rgba(255,255,255,0.95),0_0_36px_rgba(var(--btn-glow),0.32)]",
          "hover:-translate-y-[1px]",
          "active:shadow-[inset_3px_3px_8px_rgba(166,166,180,0.30),inset_-3px_-3px_8px_rgba(255,255,255,0.85),0_0_18px_rgba(var(--btn-glow),0.20)]",
        ].join(" "),

        // ─── Destructive: same physics, red glow ───
        destructive: [
          "text-[#7A1F1F] font-semibold [--btn-glow:200,72,72]",
          "bg-[linear-gradient(145deg,#FFFFFF,#FDF1F1)]",
          "border border-[rgba(255,255,255,0.9)]",
          "shadow-[6px_6px_14px_rgba(166,166,180,0.30),-4px_-4px_12px_rgba(255,255,255,0.95),inset_0_1px_0_rgba(255,255,255,0.95),0_0_24px_rgba(var(--btn-glow),0.22)]",
          "hover:shadow-[8px_8px_18px_rgba(166,166,180,0.34),-5px_-5px_14px_rgba(255,255,255,0.95),inset_0_1px_0_rgba(255,255,255,0.95),0_0_36px_rgba(var(--btn-glow),0.38)]",
          "hover:-translate-y-[1px]",
          "active:shadow-[inset_3px_3px_8px_rgba(166,166,180,0.30),inset_-3px_-3px_8px_rgba(255,255,255,0.85),0_0_18px_rgba(var(--btn-glow),0.22)]",
        ].join(" "),

        // ─── Outline: lighter neumorphism, subtle inset ring ───
        outline: [
          "text-[#2A2F3D] font-medium",
          "bg-[linear-gradient(145deg,#FBFCFE,#EEF1F5)]",
          "border border-[rgba(74,165,168,0.20)]",
          "shadow-[4px_4px_10px_rgba(166,166,180,0.22),-3px_-3px_10px_rgba(255,255,255,0.92),inset_0_1px_0_rgba(255,255,255,0.95),0_0_18px_rgba(var(--btn-glow),0.10)]",
          "hover:shadow-[6px_6px_14px_rgba(166,166,180,0.28),-4px_-4px_12px_rgba(255,255,255,0.95),inset_0_1px_0_rgba(255,255,255,0.95),0_0_28px_rgba(var(--btn-glow),0.22)]",
          "hover:-translate-y-[1px] hover:text-[#1A1D29]",
          "active:shadow-[inset_3px_3px_7px_rgba(166,166,180,0.28),inset_-3px_-3px_7px_rgba(255,255,255,0.85),0_0_14px_rgba(var(--btn-glow),0.14)]",
        ].join(" "),

        // ─── Secondary: neutral neumorphic ───
        secondary: [
          "text-[#2A2F3D] font-medium",
          "bg-[linear-gradient(145deg,#F4F6FA,#E5E9F0)]",
          "border border-[rgba(166,166,180,0.20)]",
          "shadow-[4px_4px_10px_rgba(166,166,180,0.30),-3px_-3px_10px_rgba(255,255,255,0.92),inset_0_1px_0_rgba(255,255,255,0.85),0_0_18px_rgba(var(--btn-glow),0.10)]",
          "hover:shadow-[6px_6px_14px_rgba(166,166,180,0.34),-4px_-4px_12px_rgba(255,255,255,0.95),inset_0_1px_0_rgba(255,255,255,0.90),0_0_26px_rgba(var(--btn-glow),0.18)]",
          "hover:-translate-y-[1px] hover:text-[#1A1D29]",
          "active:shadow-[inset_3px_3px_7px_rgba(166,166,180,0.32),inset_-3px_-3px_7px_rgba(255,255,255,0.85),0_0_12px_rgba(var(--btn-glow),0.10)]",
        ].join(" "),

        // ─── Ghost: very subtle raise on hover only ───
        ghost: [
          "text-[#2A2F3D] font-medium bg-transparent border border-transparent",
          "hover:bg-[linear-gradient(145deg,#FFFFFF,#F4F6FA)]",
          "hover:border-[rgba(74,165,168,0.16)]",
          "hover:shadow-[3px_3px_10px_rgba(166,166,180,0.22),-2px_-2px_8px_rgba(255,255,255,0.9),0_0_18px_rgba(var(--btn-glow),0.14)]",
          "hover:-translate-y-[1px] hover:text-[#1A1D29]",
          "active:shadow-[inset_2px_2px_6px_rgba(166,166,180,0.22),inset_-2px_-2px_6px_rgba(255,255,255,0.85)]",
        ].join(" "),

        // ─── Link: untouched (text affordance) ───
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-11 rounded-xl px-8 text-base",
        icon: "h-10 w-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
