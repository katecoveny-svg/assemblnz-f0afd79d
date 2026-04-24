import { ButtonHTMLAttributes, ReactNode } from "react";
import { useMaramaTokens } from "./MaramaKeteContext";
import { KeteSlug, maramaTokens } from "./tokens";

type Variant = "primary" | "ghost" | "outline" | "subtle" | "accent";
type Size = "sm" | "md";

interface MaramaButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  kete?: KeteSlug;
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
  kete,
  ...rest
}: MaramaButtonProps) {
  const ctx = useMaramaTokens();
  const T = kete ? maramaTokens(kete) : ctx;

  const variantStyle: Record<Variant, React.CSSProperties> = {
    primary: {
      background: T.cta,
      color: "#3F3221",
      border: `1px solid ${T.ctaDeep}`,
      boxShadow: "0 6px 20px rgba(217,188,122,0.28)",
    },
    ghost: {
      background: "transparent",
      color: T.textPrimary,
      border: `1px solid transparent`,
    },
    outline: {
      background: "rgba(255,255,255,0.7)",
      color: T.textPrimary,
      border: `1px solid ${T.borderSoft}`,
    },
    subtle: {
      background: T.accentSoft,
      color: T.accentDeep,
      border: `1px solid ${T.borderSoft}`,
    },
    accent: {
      background: T.accent,
      color: T.accentDeep,
      border: `1px solid ${T.accentRing}`,
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
