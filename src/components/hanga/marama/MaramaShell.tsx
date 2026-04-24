import { ReactNode } from "react";
import { motion } from "framer-motion";
import { MARAMA_WAIHANGA as M } from "./tokens";

interface MaramaShellProps {
  eyebrow?: string;
  title: string;
  titleMi?: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}

/**
 * Standard page shell for every WAIHANGA dashboard.
 * Provides the Mist background, the Cormorant headline,
 * and a 24px content rhythm.
 */
export function MaramaShell({
  eyebrow,
  title,
  titleMi,
  description,
  icon,
  actions,
  children,
}: MaramaShellProps) {
  return (
    <div
      className="min-h-screen w-full"
      style={{ background: M.surface, color: M.textPrimary }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">
        <motion.header
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-wrap items-end justify-between gap-6"
        >
          <div className="flex items-start gap-4">
            {icon && (
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                style={{
                  background: M.accentSoft,
                  border: `1px solid ${M.borderSoft}`,
                  color: M.accentDeep,
                }}
              >
                {icon}
              </div>
            )}
            <div>
              {eyebrow && (
                <p
                  className="font-mono text-[11px] uppercase tracking-[0.2em] mb-2"
                  style={{ color: M.textSecondary }}
                >
                  {eyebrow}
                </p>
              )}
              <h1
                className="font-display font-light leading-tight text-3xl sm:text-4xl"
                style={{ color: M.textPrimary }}
              >
                {title}
                {titleMi && (
                  <span
                    className="ml-3 font-mono text-base align-middle"
                    style={{ color: M.textMuted }}
                  >
                    {titleMi}
                  </span>
                )}
              </h1>
              {description && (
                <p
                  className="mt-2 max-w-2xl text-sm leading-relaxed"
                  style={{ color: M.textSecondary }}
                >
                  {description}
                </p>
              )}
            </div>
          </div>
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </motion.header>
        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
}
