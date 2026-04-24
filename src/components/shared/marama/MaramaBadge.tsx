import { ReactNode } from "react";
import { useMaramaTokens } from "./MaramaKeteContext";
import { KeteSlug, maramaTokens } from "./tokens";

type Tone = "ok" | "warn" | "alert" | "info" | "neutral" | "accent";

interface MaramaBadgeProps {
  tone?: Tone;
  children: ReactNode;
  icon?: ReactNode;
  size?: "sm" | "md";
  kete?: KeteSlug;
}

export function MaramaBadge({
  tone = "neutral",
  children,
  icon,
  size = "md",
  kete,
}: MaramaBadgeProps) {
  const ctx = useMaramaTokens();
  const T = kete ? maramaTokens(kete) : ctx;

  const TONE_MAP: Record<Tone, { bg: string; fg: string }> = {
    ok: { bg: T.okSoft, fg: T.ok },
    warn: { bg: T.warnSoft, fg: T.warn },
    alert: { bg: T.alertSoft, fg: T.alert },
    info: { bg: T.infoSoft, fg: T.info },
    neutral: { bg: "rgba(142,129,119,0.10)", fg: T.textSecondary },
    accent: { bg: T.accentSoft, fg: T.accentDeep },
  };

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
