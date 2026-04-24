import { ReactNode, HTMLAttributes } from "react";
import { useMaramaTokens } from "./MaramaKeteContext";
import { KeteSlug, maramaTokens } from "./tokens";

interface MaramaCardProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title?: ReactNode;
  eyebrow?: string;
  description?: ReactNode;
  actions?: ReactNode;
  padding?: "sm" | "md" | "lg" | "none";
  tone?: "default" | "raised" | "muted";
  /** Override the inherited kete accent for this card only */
  kete?: KeteSlug;
  /** Show a thin top accent rail in the kete colour */
  accentRail?: boolean;
  children?: ReactNode;
}

const PADDING = { none: "p-0", sm: "p-4", md: "p-6", lg: "p-8" } as const;

/**
 * Light glass card — the only card primitive that should be used inside
 * a Mārama dashboard. Inherits kete accent from context, or override.
 */
export function MaramaCard({
  title,
  eyebrow,
  description,
  actions,
  padding = "md",
  tone = "default",
  kete,
  accentRail = false,
  className = "",
  children,
  style,
  ...rest
}: MaramaCardProps) {
  const ctx = useMaramaTokens();
  const T = kete ? maramaTokens(kete) : ctx;

  const background =
    tone === "muted"
      ? "rgba(238,231,222,0.55)"
      : tone === "raised"
      ? "rgba(255,255,255,0.95)"
      : "rgba(255,255,255,0.78)";

  return (
    <div
      className={`relative rounded-3xl backdrop-blur-md overflow-hidden ${PADDING[padding]} ${className}`}
      style={{
        background,
        border: `1px solid ${T.borderSoft}`,
        boxShadow: T.shadowCard,
        color: T.textPrimary,
        ...style,
      }}
      {...rest}
    >
      {accentRail && (
        <span
          aria-hidden
          className="pointer-events-none absolute top-0 left-[8%] right-[8%] h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${T.accent}, transparent)`,
          }}
        />
      )}
      {(title || actions || eyebrow) && (
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="min-w-0">
            {eyebrow && (
              <p
                className="font-mono text-[10px] uppercase tracking-[0.18em] mb-1"
                style={{ color: T.textSecondary }}
              >
                {eyebrow}
              </p>
            )}
            {title && (
              <h3
                className="font-display text-xl font-light"
                style={{ color: T.textPrimary }}
              >
                {title}
              </h3>
            )}
            {description && (
              <p
                className="mt-1 text-xs leading-relaxed"
                style={{ color: T.textSecondary }}
              >
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex shrink-0 items-center gap-2">{actions}</div>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
