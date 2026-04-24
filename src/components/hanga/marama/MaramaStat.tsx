import { ReactNode } from "react";
import { motion } from "framer-motion";
import { MARAMA_WAIHANGA as M } from "./tokens";

interface MaramaStatProps {
  label: string;
  value: ReactNode;
  delta?: string;
  deltaTone?: "ok" | "warn" | "alert" | "neutral";
  icon?: ReactNode;
  index?: number;
}

const DELTA_COLORS = {
  ok: M.ok,
  warn: M.warn,
  alert: M.alert,
  neutral: M.textSecondary,
} as const;

export function MaramaStat({
  label,
  value,
  delta,
  deltaTone = "neutral",
  icon,
  index = 0,
}: MaramaStatProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="rounded-3xl p-5 backdrop-blur-md"
      style={{
        background: "rgba(255,255,255,0.85)",
        border: `1px solid ${M.borderSoft}`,
        boxShadow: M.shadowCard,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p
            className="font-mono text-[10px] uppercase tracking-[0.18em]"
            style={{ color: M.textSecondary }}
          >
            {label}
          </p>
          <p
            className="font-display text-3xl font-light mt-2"
            style={{ color: M.textPrimary }}
          >
            {value}
          </p>
          {delta && (
            <p
              className="text-[11px] mt-2 font-medium"
              style={{ color: DELTA_COLORS[deltaTone] }}
            >
              {delta}
            </p>
          )}
        </div>
        {icon && (
          <div
            className="flex h-10 w-10 items-center justify-center rounded-2xl"
            style={{
              background: M.accentSoft,
              color: M.accentDeep,
            }}
          >
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  );
}
