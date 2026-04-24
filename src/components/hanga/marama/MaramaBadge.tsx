import { ReactNode } from "react";
import { MARAMA_WAIHANGA as M } from "./tokens";

type Tone = "ok" | "warn" | "alert" | "info" | "neutral" | "accent";

interface MaramaBadgeProps {
  tone?: Tone;
  children: ReactNode;
  icon?: ReactNode;
  size?: "sm" | "md";
}

const TONE_MAP: Record<Tone, { bg: string; fg: string }> = {
  ok: { bg: M.okSoft, fg: M.ok },
  warn: { bg: M.warnSoft, fg: M.warn },
  alert: { bg: M.alertSoft, fg: M.alert },
  info: { bg: M.infoSoft, fg: M.info },
  neutral: { bg: "rgba(142,129,119,0.10)", fg: M.textSecondary },
  accent: { bg: M.accentSoft, fg: M.accentDeep },
};

export function MaramaBadge({
  tone = "neutral",
  children,
  icon,
  size = "md",
}: MaramaBadgeProps) {
  const { bg, fg } = TONE_MAP[tone];
  const sizing =
    size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizing}`}
      style={{ background: bg, color: fg, border: `1px solid ${fg}22` }}
    >
      {icon}
      {children}
    </span>
  );
}
