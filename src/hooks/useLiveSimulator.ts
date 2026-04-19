// ═══════════════════════════════════════════════════════════════
// useLiveSimulator — runs a multi-step scenario where every step
// calls a real Supabase edge function (live data) with graceful
// fallback to a scripted detail when the function fails.
// ═══════════════════════════════════════════════════════════════
import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type StepStatus = "idle" | "running" | "pass" | "warn" | "fail";

export interface LiveStep {
  /** Short label shown in the UI */
  label: string;
  /** Edge function name (Supabase functions invoke). null = pure narrative step */
  fn: string | null;
  /** Body to send to the edge function */
  body?: Record<string, unknown>;
  /** Take the function response and produce a human-readable detail line + status */
  render: (data: unknown) => { detail: string; status: Exclude<StepStatus, "idle" | "running"> };
  /** Fallback detail used when the edge function errors */
  fallback: { detail: string; status: Exclude<StepStatus, "idle" | "running"> };
  /** Tag shown next to the step (e.g. "live · MetService") */
  source?: string;
}

export interface LivePack {
  id: string;
  name: string;
  subtitle: string;
  scenario: string;
  color: string;
  inputs: string[];
  outputs: string[];
  compliance: string[];
  steps: LiveStep[];
}

export interface StepResult {
  status: StepStatus;
  detail?: string;
  source?: string;
  /** "live" if the edge function returned successfully, "fallback" otherwise */
  origin?: "live" | "fallback";
  rawOk?: boolean;
}

export function useLiveSimulator() {
  const [results, setResults] = useState<Record<number, StepResult>>({});
  const [running, setRunning] = useState(false);
  const [activePackId, setActivePackId] = useState<string | null>(null);

  const reset = useCallback(() => {
    setResults({});
    setActivePackId(null);
  }, []);

  const run = useCallback(async (pack: LivePack) => {
    setActivePackId(pack.id);
    setResults({});
    setRunning(true);

    for (let i = 0; i < pack.steps.length; i++) {
      const step = pack.steps[i];
      // mark running
      setResults((prev) => ({ ...prev, [i]: { status: "running", source: step.source } }));

      // small visible delay so the UI breathes
      await new Promise((r) => setTimeout(r, 350));

      let result: StepResult;
      try {
        if (!step.fn) {
          // pure narrative step — no live call
          result = {
            status: step.fallback.status,
            detail: step.fallback.detail,
            source: step.source,
            origin: "fallback",
          };
        } else {
          const { data, error } = await supabase.functions.invoke(step.fn, {
            body: step.body ?? {},
          });
          if (error) throw error;
          const rendered = step.render(data);
          result = {
            status: rendered.status,
            detail: rendered.detail,
            source: step.source,
            origin: "live",
            rawOk: true,
          };
        }
      } catch (err) {
        console.warn(`[useLiveSimulator] ${step.fn} failed, using fallback`, err);
        result = {
          status: step.fallback.status,
          detail: step.fallback.detail + " (offline fallback)",
          source: step.source,
          origin: "fallback",
        };
      }

      setResults((prev) => ({ ...prev, [i]: result }));
    }

    setRunning(false);
  }, []);

  return { run, reset, results, running, activePackId };
}
