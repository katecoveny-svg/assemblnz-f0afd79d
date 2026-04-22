/**
 * useAgentChatParams — per-agent chat tuning settings.
 *
 * Stores `temperature` and `max_tokens` overrides per agentId in localStorage
 * so the in-chat settings panel can let users dial creativity / response length
 * without touching the server. Values are also validated server-side in the
 * mcp-chat edge function, so this is purely a UX cache.
 */
import { useCallback, useEffect, useState } from "react";
import type { ChatParams } from "@/lib/mcpChat";

const STORAGE_KEY = (agentId: string) => `assembl_chat_params:${agentId}`;

export const PARAM_BOUNDS = {
  temperature: { min: 0, max: 2, step: 0.1, default: 0.7 },
  max_tokens: { min: 64, max: 4096, step: 64, default: 1024 },
} as const;

export const DEFAULT_PARAMS: Required<ChatParams> = {
  temperature: PARAM_BOUNDS.temperature.default,
  max_tokens: PARAM_BOUNDS.max_tokens.default,
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function readParams(agentId: string): Required<ChatParams> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY(agentId));
    if (!raw) return DEFAULT_PARAMS;
    const parsed = JSON.parse(raw) as Partial<ChatParams>;
    return {
      temperature: clamp(
        Number.isFinite(parsed.temperature as number) ? (parsed.temperature as number) : DEFAULT_PARAMS.temperature,
        PARAM_BOUNDS.temperature.min,
        PARAM_BOUNDS.temperature.max,
      ),
      max_tokens: clamp(
        Number.isFinite(parsed.max_tokens as number) ? Math.round(parsed.max_tokens as number) : DEFAULT_PARAMS.max_tokens,
        PARAM_BOUNDS.max_tokens.min,
        PARAM_BOUNDS.max_tokens.max,
      ),
    };
  } catch {
    return DEFAULT_PARAMS;
  }
}

export function useAgentChatParams(agentId: string | undefined) {
  const [params, setParamsState] = useState<Required<ChatParams>>(DEFAULT_PARAMS);
  const [isCustom, setIsCustom] = useState(false);

  // Load whenever the agent changes.
  useEffect(() => {
    if (!agentId) return;
    const next = readParams(agentId);
    setParamsState(next);
    setIsCustom(
      next.temperature !== DEFAULT_PARAMS.temperature ||
      next.max_tokens !== DEFAULT_PARAMS.max_tokens,
    );
  }, [agentId]);

  const setParams = useCallback(
    (next: Partial<ChatParams>) => {
      if (!agentId) return;
      setParamsState((prev) => {
        const merged: Required<ChatParams> = {
          temperature: clamp(
            next.temperature ?? prev.temperature,
            PARAM_BOUNDS.temperature.min,
            PARAM_BOUNDS.temperature.max,
          ),
          max_tokens: clamp(
            Math.round(next.max_tokens ?? prev.max_tokens),
            PARAM_BOUNDS.max_tokens.min,
            PARAM_BOUNDS.max_tokens.max,
          ),
        };
        try {
          window.localStorage.setItem(STORAGE_KEY(agentId), JSON.stringify(merged));
        } catch {
          // localStorage quota / private mode — keep in-memory state.
        }
        setIsCustom(
          merged.temperature !== DEFAULT_PARAMS.temperature ||
          merged.max_tokens !== DEFAULT_PARAMS.max_tokens,
        );
        return merged;
      });
    },
    [agentId],
  );

  const resetParams = useCallback(() => {
    if (!agentId) return;
    try { window.localStorage.removeItem(STORAGE_KEY(agentId)); } catch { /* ignore */ }
    setParamsState(DEFAULT_PARAMS);
    setIsCustom(false);
  }, [agentId]);

  return { params, setParams, resetParams, isCustom };
}
