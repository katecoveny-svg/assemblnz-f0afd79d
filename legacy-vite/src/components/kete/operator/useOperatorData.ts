import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { IndustrySlug } from "@/assets/brand/kete";

/**
 * useOperatorData — fetches the four operator-pane datasets for a kete.
 *
 * The DB stores `kete` as the upper-case industry code (MANAAKI, WAIHANGA…)
 * while the URL/slug is lower-case. We normalise here so callers stay simple.
 */

export type DraftRow = {
  id: string;
  request_id: string;
  action_type: string;
  context: Record<string, unknown>;
  status: string;
  requested_at: string | null;
  expires_at: string | null;
};

export type EvidenceRow = {
  id: string;
  request_id: string;
  action_type: string;
  watermark: string;
  signed_by: string | null;
  signed_at: string | null;
  created_at: string | null;
  share_view_count: number;
};

export type SimRow = {
  id: string;
  agent_slug: string;
  prompt: string;
  overall_verdict: string | null;
  verdict_kahu: string | null;
  verdict_ta: string | null;
  verdict_mana: string | null;
  created_at: string;
};

export type GateRow = {
  id: string;
  request_id: string;
  gate_type: string;
  purpose: string;
  status: string;
  conditions: string | null;
  decided_at: string | null;
  created_at: string;
};

const keteCode = (slug: IndustrySlug): string => slug.toUpperCase();

export function useOperatorDrafts(slug: IndustrySlug) {
  return useQuery({
    queryKey: ["operator", "drafts", slug],
    queryFn: async (): Promise<DraftRow[]> => {
      const { data, error } = await supabase
        .from("approval_queue")
        .select(
          "id, request_id, action_type, context, status, requested_at, expires_at",
        )
        .eq("kete", keteCode(slug))
        .eq("status", "pending")
        .order("requested_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as DraftRow[];
    },
  });
}

export function useOperatorEvidence(slug: IndustrySlug) {
  return useQuery({
    queryKey: ["operator", "evidence", slug],
    queryFn: async (): Promise<EvidenceRow[]> => {
      const { data, error } = await supabase
        .from("evidence_packs")
        .select(
          "id, request_id, action_type, watermark, signed_by, signed_at, created_at, share_view_count",
        )
        .eq("kete", keteCode(slug))
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as EvidenceRow[];
    },
  });
}

export function useOperatorSims(slug: IndustrySlug) {
  return useQuery({
    queryKey: ["operator", "sims", slug],
    queryFn: async (): Promise<SimRow[]> => {
      const { data, error } = await supabase
        .from("agent_test_results")
        .select(
          "id, agent_slug, prompt, overall_verdict, verdict_kahu, verdict_ta, verdict_mana, created_at",
        )
        .eq("kete", keteCode(slug))
        .order("created_at", { ascending: false })
        .limit(80);
      if (error) throw error;
      return (data ?? []) as SimRow[];
    },
  });
}

export function useOperatorGates(slug: IndustrySlug) {
  return useQuery({
    queryKey: ["operator", "gates", slug],
    queryFn: async (): Promise<GateRow[]> => {
      const { data, error } = await supabase
        .from("governance_gates")
        .select(
          "id, request_id, gate_type, purpose, status, conditions, decided_at, created_at",
        )
        .eq("kete", keteCode(slug))
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as GateRow[];
    },
  });
}
