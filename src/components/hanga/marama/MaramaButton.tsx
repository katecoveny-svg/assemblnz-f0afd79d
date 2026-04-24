import { ButtonHTMLAttributes, ReactNode } from "react";
import { MARAMA_WAIHANGA as M } from "./tokens";

type Variant = "primary" | "ghost" | "outline" | "subtle";
type Size = "sm" | "md";

interface MaramaButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
}

const SIZE = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-5 text-sm gap-2",
} as const;

export function MaramaButton({
  variant = "primary",
  size = "md",
  icon,
  className = "",
  children,
  style,
  ...rest
}: MaramaButtonProps) {
  const variantStyle: Record<Variant, React.CSSProperties> = {
    primary: {
      background: M.cta,
      color: "#3F3221",
      border: `1px solid ${M.ctaDeep}`,
      boxShadow: "0 6px 20px rgba(217,188,122,0.28)",
    },
    ghost: {
      background: "transparent",
      color: M.textPrimary,
      border: `1px solid transparent`,
    },
    outline: {
      background: "rgba(255,255,255,0.7)",
      color: M.textPrimary,
      border: `1px solid ${M.borderSoft}`,
    },
    subtle: {
      background: M.accentSoft,
      color: M.accentDeep,
      border: `1px solid ${M.borderSoft}`,
    },
  };
  return (
    <button
      className={`inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 hover:translate-y-[-1px] hover:brightness-105 disabled:opacity-50 disabled:pointer-events-none ${SIZE[size]} ${className}`}
      style={{ ...variantStyle[variant], ...style }}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
