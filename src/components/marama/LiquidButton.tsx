import React from "react";
import { cn } from "@/lib/utils";

/**
 * LiquidButton — 3D pushable Mārama button.
 * Outset neumorphic shadow at rest → inset on :active (truly "pressable").
 * Ambient color glow follows accent. 18px radius. 120ms cubic-bezier.
 *
 * Variants tuned to the Mārama palette: teal (default), ochre, success,
 * error, ghost. Sizes: sm | md | lg | xl.
 */
type Variant = "teal" | "ochre" | "lavender" | "success" | "error" | "ghost";
type Size = "sm" | "md" | "lg" | "xl";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  glow?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

const ACCENT: Record<Variant, { base: string; hover: string; rgb: string; text: string }> = {
  teal:     { base: "#4AA5A8", hover: "#3F8E91", rgb: "74,165,168",  text: "#FFFFFF" },
  ochre:    { base: "#4AA5A8", hover: "#B89238", rgb: "212,168,67",  text: "#FFFFFF" },
  lavender: { base: "#9B8FBF", hover: "#867AAE", rgb: "155,143,191", text: "#FFFFFF" },
  success:  { base: "#4AA5A8", hover: "#3F8E91", rgb: "74,165,168",  text: "#FFFFFF" },
  error:    { base: "#C85A54", hover: "#B14A45", rgb: "200,90,84",   text: "#FFFFFF" },
  ghost:    { base: "transparent", hover: "rgba(31,35,48,0.04)", rgb: "31,35,48", text: "#1A1D29" },
};

const SIZE: Record<Size, string> = {
  sm: "h-9 px-4 text-sm rounded-[14px]",
  md: "h-11 px-5 text-[0.95rem] rounded-[16px]",
  lg: "h-13 px-7 text-base rounded-[18px]",
  xl: "h-16 px-9 text-lg rounded-[22px]",
};

const LiquidButton = React.forwardRef<HTMLButtonElement, Props>(
  ({ children, variant = "teal", size = "md", glow = true, loading = false, icon, className, disabled, ...rest }, ref) => {
    const a = ACCENT[variant];
    const isGhost = variant === "ghost";

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "liquid-button group relative overflow-hidden inline-flex items-center justify-center gap-2 font-medium",
          "transition-[transform,box-shadow,background] duration-150 ease-[cubic-bezier(.2,.8,.2,1)]",
          "active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0",
          SIZE[size],
          className,
        )}
        style={{
          background: isGhost
            ? "rgba(255,255,255,0.55)"
            : `linear-gradient(180deg, ${a.base} 0%, ${a.hover} 100%)`,
          color: a.text,
          boxShadow: isGhost
            ? `inset 0 1px 0 rgba(255,255,255,0.95), 0 1px 2px rgba(31,35,48,0.06), 0 4px 10px rgba(31,35,48,0.05)`
            : `
              inset 0 1px 0 rgba(255,255,255,0.55),
              inset 0 -2px 0 rgba(0,0,0,0.18),
              0 1px 0 rgba(255,255,255,0.9),
              0 6px 14px rgba(${a.rgb},0.34),
              0 12px 26px rgba(31,35,48,0.10)
              ${glow ? `, 0 0 28px rgba(${a.rgb},0.32)` : ""}
            `,
          border: isGhost ? "1px solid rgba(31,35,48,0.10)" : "1px solid rgba(255,255,255,0.45)",
          backdropFilter: isGhost ? "blur(14px) saturate(140%)" : undefined,
          WebkitBackdropFilter: isGhost ? "blur(14px) saturate(140%)" : undefined,
        }}
        {...rest}
      >
        {/* Specular glass highlight (top half) */}
        {!isGhost && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-2 top-[2px] h-[40%] rounded-[14px] opacity-70"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.0) 100%)",
            }}
          />
        )}
        {/* Liquid shimmer band */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-60 transition-opacity duration-500"
          style={{
            background:
              "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.45) 50%, transparent 70%)",
            backgroundSize: "200% 200%",
            animation: "liquidShimmer 2.5s ease-in-out infinite",
            mixBlendMode: "overlay",
          }}
        />
        {loading ? (
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : icon}
        <span className="relative z-10">{children}</span>
      </button>
    );
  },
);
LiquidButton.displayName = "LiquidButton";

export default LiquidButton;
