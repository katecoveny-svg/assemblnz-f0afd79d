/**
 * ChatSettingsPanel — popover with sliders for per-agent model tuning.
 *
 * Lives in the chat header. Reads/writes via useAgentChatParams (localStorage
 * keyed by agentId). Values are forwarded into agentChat({ params }) on each
 * send and re-validated server-side in the mcp-chat edge function.
 */
import { useEffect, useRef, useState } from "react";
import { Settings2, RotateCcw, Thermometer, Hash, X } from "lucide-react";
import { PARAM_BOUNDS, useAgentChatParams } from "@/hooks/useAgentChatParams";

interface Props {
  agentId: string | undefined;
  accentColor: string;
}

export function ChatSettingsPanel({ agentId, accentColor }: Props) {
  const { params, setParams, resetParams, isCustom } = useAgentChatParams(agentId);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Click-outside / Escape to dismiss.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!agentId) return null;

  const tempLabel =
    params.temperature <= 0.3 ? "Focused"
      : params.temperature <= 0.8 ? "Balanced"
      : params.temperature <= 1.3 ? "Creative"
      : "Wild";

  return (
    <div ref={wrapperRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex items-center justify-center w-8 h-8 rounded-lg transition hover:opacity-80"
        style={{
          color: "#3D4250",
          border: "1px solid rgba(0,0,0,0.08)",
          background: "rgba(255,255,255,0.6)",
        }}
        title="Model settings"
        aria-label="Open model settings"
        aria-expanded={open}
      >
        <Settings2 size={14} />
        {isCustom && (
          <span
            className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
            style={{ background: accentColor }}
            aria-hidden
          />
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Model settings"
          className="absolute right-0 top-full mt-2 w-72 rounded-xl shadow-2xl z-50 p-4"
          style={{
            background: "rgba(255,255,255,0.98)",
            border: "1px solid rgba(0,0,0,0.08)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#3D4250" }}>
                Model settings
              </h3>
              <p className="text-[10px] mt-0.5" style={{ color: "#6B7280" }}>
                Saved for this agent on this device
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded hover:bg-black/5"
              aria-label="Close settings"
            >
              <X size={12} style={{ color: "#6B7280" }} />
            </button>
          </div>

          {/* Temperature */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <label className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color: "#3D4250" }}>
                <Thermometer size={12} /> Temperature
              </label>
              <span className="text-[11px] font-mono tabular-nums" style={{ color: accentColor }}>
                {params.temperature.toFixed(1)} · {tempLabel}
              </span>
            </div>
            <input
              type="range"
              min={PARAM_BOUNDS.temperature.min}
              max={PARAM_BOUNDS.temperature.max}
              step={PARAM_BOUNDS.temperature.step}
              value={params.temperature}
              onChange={(e) => setParams({ temperature: Number(e.target.value) })}
              className="w-full accent-current"
              style={{ color: accentColor }}
              aria-label="Temperature"
            />
            <p className="text-[10px] mt-1" style={{ color: "#6B7280" }}>
              Lower = predictable, higher = inventive.
            </p>
          </div>

          {/* Max tokens */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <label className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color: "#3D4250" }}>
                <Hash size={12} /> Max response length
              </label>
              <span className="text-[11px] font-mono tabular-nums" style={{ color: accentColor }}>
                {params.max_tokens} tokens
              </span>
            </div>
            <input
              type="range"
              min={PARAM_BOUNDS.max_tokens.min}
              max={PARAM_BOUNDS.max_tokens.max}
              step={PARAM_BOUNDS.max_tokens.step}
              value={params.max_tokens}
              onChange={(e) => setParams({ max_tokens: Number(e.target.value) })}
              className="w-full"
              style={{ accentColor }}
              aria-label="Max response tokens"
            />
            <p className="text-[10px] mt-1" style={{ color: "#6B7280" }}>
              ~{Math.round(params.max_tokens * 0.75)} words ceiling.
            </p>
          </div>

          <button
            onClick={resetParams}
            disabled={!isCustom}
            className="w-full flex items-center justify-center gap-1.5 text-[11px] font-medium py-1.5 rounded-lg transition disabled:opacity-40"
            style={{
              color: "#3D4250",
              border: "1px solid rgba(0,0,0,0.08)",
              background: "rgba(0,0,0,0.02)",
            }}
          >
            <RotateCcw size={11} /> Reset to defaults
          </button>
        </div>
      )}
    </div>
  );
}
