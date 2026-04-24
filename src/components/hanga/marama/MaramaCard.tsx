import { ReactNode, HTMLAttributes } from "react";
import { MARAMA_WAIHANGA as M } from "./tokens";

interface MaramaCardProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title?: ReactNode;
  eyebrow?: string;
  description?: ReactNode;
  actions?: ReactNode;
  padding?: "sm" | "md" | "lg";
  tone?: "default" | "raised" | "muted";
  children?: ReactNode;
}

const PADDING = { sm: "p-4", md: "p-6", lg: "p-8" } as const;

/**
 * Light glass card — the only card primitive that should be used
 * inside a WAIHANGA dashboard. Replaces every dark/neumorphic glass
 * variant from the legacy components.
 */
export function MaramaCard({
  title,
  eyebrow,
  description,
  actions,
  padding = "md",
  tone = "default",
  className = "",
  children,
  style,
  ...rest
}: MaramaCardProps) {
  const background =
    tone === "muted"
      ? "rgba(238,231,222,0.55)"
      : tone === "raised"
      ? "rgba(255,255,255,0.95)"
      : "rgba(255,255,255,0.78)";

  return (
    <div
      className={`rounded-3xl backdrop-blur-md ${PADDING[padding]} ${className}`}
      style={{
        background,
        border: `1px solid ${M.borderSoft}`,
        boxShadow: M.shadowCard,
        color: M.textPrimary,
        ...style,
      }}
      {...rest}
    >
      {(title || actions || eyebrow) && (
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="min-w-0">
            {eyebrow && (
              <p
                className="font-mono text-[10px] uppercase tracking-[0.18em] mb-1"
                style={{ color: M.textSecondary }}
              >
                {eyebrow}
              </p>
            )}
            {title && (
              <h3
                className="font-display text-xl font-light"
                style={{ color: M.textPrimary }}
              >
                {title}
              </h3>
            )}
            {description && (
              <p
                className="mt-1 text-xs leading-relaxed"
                style={{ color: M.textSecondary }}
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
