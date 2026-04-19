import React from "react";
import { cn } from "@/lib/utils";

/**
 * GlowBadge — Mārama status pill with soft color halo.
 * Use for status / count badges on dashboards.
 */
type Tone = "teal" | "ochre" | "lavender" | "success" | "error" | "info" | "neutral";

interface Props {
  children: React.ReactNode;
  tone?: Tone;
  size?: "sm" | "md";
  className?: string;
  pulse?: boolean;
  icon?: React.ReactNode;
}

const TONES: Record<Tone, { bg: string; fg: string; rgb: string }> = {
  teal:     { bg: "rgba(74,165,168,0.14)",  fg: "#1F6F71", rgb: "74,165,168"  },
  ochre:    { bg: "rgba(74,165,168,0.18)",  fg: "#7E5612", rgb: "232,169,72"  },
  lavender: { bg: "rgba(155,143,191,0.18)", fg: "#5A4E84", rgb: "155,143,191" },
  success:  { bg: "rgba(74,165,168,0.14)",  fg: "#1F6F71", rgb: "74,165,168"  },
  error:    { bg: "rgba(200,90,84,0.16)",   fg: "#8C2A26", rgb: "200,90,84"   },
  info:     { bg: "rgba(90,122,156,0.16)",  fg: "#2E4A6B", rgb: "90,122,156"  },
  neutral:  { bg: "rgba(31,35,48,0.06)",    fg: "#3D4250", rgb: "31,35,48"    },
};

export default function GlowBadge({ children, tone = "teal", size = "sm", className, pulse, icon }: Props) {
  const t = TONES[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium tracking-tight",
        size === "sm" ? "text-[11px] px-2.5 py-1 rounded-[10px]" : "text-xs px-3 py-1.5 rounded-[12px]",
        className,
      )}
      style={{
        backgroundColor: t.bg,
        color: t.fg,
        border: `1px solid rgba(${t.rgb},0.32)`,
        boxShadow: `0 0 14px rgba(${t.rgb},0.28), inset 0 1px 0 rgba(255,255,255,0.7)`,
        backdropFilter: "blur(10px) saturate(150%)",
        WebkitBackdropFilter: "blur(10px) saturate(150%)",
      }}
    >
      {pulse && (
        <span
          className="w-1.5 h-1.5 rounded-full animate-pulse"
          style={{ backgroundColor: t.fg, boxShadow: `0 0 8px rgba(${t.rgb},0.8)` }}
        />
      )}
      {icon}
      {children}
    </span>
  );
}
