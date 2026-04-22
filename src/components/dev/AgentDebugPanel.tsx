/**
 * Floating debug panel for the chat page.
 * Shows: raw URL slug, SLUG_TO_ID mapping, resolved agent id, agent name/color.
 *
 * Only renders when ?debug=1 is in the URL OR localStorage.assembl_debug === "1".
 * Toggle in DevTools console: localStorage.setItem("assembl_debug","1")
 */
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SLUG_TO_ID } from "@/lib/agentSlugMap";
import type { Agent } from "@/data/agents";

interface AgentDebugPanelProps {
  rawAgentId: string | undefined;
  resolvedAgentId: string | undefined;
  agent: Agent | undefined;
}

export function AgentDebugPanel({ rawAgentId, resolvedAgentId, agent }: AgentDebugPanelProps) {
  const [searchParams] = useSearchParams();
  const [collapsed, setCollapsed] = useState(false);

  const enabled =
    searchParams.get("debug") === "1" ||
    (typeof window !== "undefined" && window.localStorage?.getItem("assembl_debug") === "1");

  if (!enabled) return null;

  const aliasMatched = rawAgentId ? Object.prototype.hasOwnProperty.call(SLUG_TO_ID, rawAgentId) : false;
  const aliasTarget = rawAgentId ? SLUG_TO_ID[rawAgentId] : undefined;
  const resolvedOk = !!agent;

  return (
    <div
      className="fixed bottom-3 right-3 z-[9999] font-mono text-[10px] rounded-lg shadow-xl"
      style={{
        background: "rgba(14,14,26,0.92)",
        border: "1px solid rgba(255,255,255,0.12)",
        color: "#E8EEEC",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        maxWidth: 280,
      }}
      role="complementary"
      aria-label="Agent debug panel"
    >
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="w-full flex items-center justify-between px-3 py-1.5 border-b border-white/10"
        style={{ color: resolvedOk ? "#5AADA0" : "#E8856B" }}
      >
        <span className="font-bold tracking-wide uppercase text-[9px]">
          {resolvedOk ? "● agent debug" : "● agent debug · UNRESOLVED"}
        </span>
        <span className="opacity-60">{collapsed ? "▸" : "▾"}</span>
      </button>

      {!collapsed && (
        <div className="px-3 py-2 space-y-1.5">
          <Row label="raw url slug" value={rawAgentId ?? "—"} />
          <Row
            label="slug → id alias"
            value={aliasMatched ? `✓ "${rawAgentId}" → "${aliasTarget}"` : "no alias (passthrough)"}
            tone={aliasMatched ? "ok" : "muted"}
          />
          <Row
            label="resolved agentId"
            value={resolvedAgentId ?? "—"}
            tone={resolvedOk ? "ok" : "warn"}
          />
          <Row label="agent.name" value={agent?.name ?? "(not found)"} tone={resolvedOk ? "ok" : "warn"} />
          <Row label="agent.designation" value={agent?.designation ?? "—"} />
          <Row label="agent.pack" value={agent?.pack ?? "—"} />
          <div className="flex items-center justify-between pt-1">
            <span className="opacity-60">agent.color</span>
            <div className="flex items-center gap-1.5">
              <span
                className="inline-block w-3 h-3 rounded-sm"
                style={{ background: agent?.color ?? "transparent", border: "1px solid rgba(255,255,255,0.2)" }}
              />
              <span style={{ color: agent?.color ?? "#999" }}>{agent?.color ?? "—"}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, tone = "default" }: { label: string; value: string; tone?: "ok" | "warn" | "muted" | "default" }) {
  const color = tone === "ok" ? "#5AADA0" : tone === "warn" ? "#E8856B" : tone === "muted" ? "#8A8FA0" : "#E8EEEC";
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="opacity-60 shrink-0">{label}</span>
      <span className="text-right break-all" style={{ color }}>{value}</span>
    </div>
  );
}
