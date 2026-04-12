// ═══════════════════════════════════════════════════════════════
// Sovereignty Badge — Compact status indicator for kete headers
// ═══════════════════════════════════════════════════════════════

import React from "react";
import { Shield } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useSovereigntyStats } from "@/hooks/useSovereigntyData";

interface SovereigntyBadgeProps {
  kete: string;
  accentColor: string;
}

const SovereigntyBadge: React.FC<SovereigntyBadgeProps> = ({ kete, accentColor }) => {
  const stats = useSovereigntyStats(kete);

  const hasIssues = stats.pendingGates > 0;
  const badgeColor = hasIssues ? "#D69E2E" : "#38A169";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className="flex items-center gap-1.5 px-2 py-1 rounded-full cursor-default transition-all hover:scale-105"
          style={{
            background: `rgba(${hexToRgb(badgeColor)}, 0.1)`,
            border: `1px solid rgba(${hexToRgb(badgeColor)}, 0.2)`,
          }}
        >
          <Shield size={11} style={{ color: badgeColor }} />
          <span className="text-[10px] font-medium" style={{ color: badgeColor }}>
            MDS {hasIssues ? `· ${stats.pendingGates} pending` : "· Active"}
          </span>
          {hasIssues && (
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#D69E2E" }} />
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-xs">
        <div className="text-xs space-y-1">
          <p className="font-semibold">Māori Data Sovereignty</p>
          <p>{stats.maoriDatasets} datasets · {stats.tapuDatasets} tapu · {stats.nzOnlyDatasets} NZ-only</p>
          <p>{stats.approvedGates} gates approved · {stats.pendingGates} pending</p>
          <p className="text-white/40">Te Mana Raraunga aligned</p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

export default SovereigntyBadge;
