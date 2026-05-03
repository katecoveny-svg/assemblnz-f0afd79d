import { ReactNode } from "react";
import { motion } from "framer-motion";
import { useMaramaTokens } from "./MaramaKeteContext";
import { KeteSlug, maramaTokens } from "./tokens";

interface MaramaStatProps {
  label: string;
  value: ReactNode;
  delta?: string;
  deltaTone?: "ok" | "warn" | "alert" | "neutral";
  icon?: ReactNode;
  index?: number;
  kete?: KeteSlug;
}

export function MaramaStat({
  label,
  value,
  delta,
  deltaTone = "neutral",
  icon,
  index = 0,
  kete,
}: MaramaStatProps) {
  const ctx = useMaramaTokens();
  const T = kete ? maramaTokens(kete) : ctx;

  const deltaColor = {
    ok: T.ok,
    warn: T.warn,
    alert: T.alert,
    neutral: T.textSecondary,
  }[deltaTone];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="rounded-3xl p-5 backdrop-blur-md"
      style={{
        background: "rgba(255,255,255,0.85)",
        border: `1px solid ${T.borderSoft}`,
        boxShadow: T.shadowCard,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p
            className="font-mono text-[10px] uppercase tracking-[0.18em]"
            style={{ color: T.textSecondary }}
          >
            {label}
          </p>
          <p
            className="font-display text-3xl font-light mt-2"
            style={{ color: T.textPrimary }}
          >
            {value}
          </p>
          {delta && (
            <p
              className="text-[11px] mt-2 font-medium"
              style={{ color: deltaColor }}
            >
              {delta}
            </p>
          )}
        </div>
        {icon && (
          <div
            className="flex h-10 w-10 items-center justify-center rounded-2xl"
            style={{
              background: T.accentSoft,
              color: T.accentDeep,
            }}
          >
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  );
}
