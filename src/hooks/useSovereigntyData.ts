// ═══════════════════════════════════════════════════════════════
// Hook: useSovereigntyData
// Fetches sovereignty registry, audit log, and governance gates
// ═══════════════════════════════════════════════════════════════

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface RegistryEntry {
  id: string;
  dataset_name: string;
  dataset_description: string | null;
  is_maori_data: boolean;
  provenance: Record<string, unknown>;
  iwi_hapu_relevance: string[];
  tapu_noa_classification: string;
  permitted_purposes: string[];
  locality_restriction: string;
  kaitiaki_contact: Record<string, unknown>;
  governance_status: string;
  approval_expiry: string | null;
  source_kete: string | null;
  created_at: string;
}

export interface AuditEntry {
  id: string;
  action_type: string;
  dataset_id: string | null;
  agent_code: string | null;
  kete: string | null;
  purpose_declared: string | null;
  decision: string;
  obligations: unknown[];
  provenance_chain: unknown[];
  created_at: string;
}

export interface GovernanceGate {
  id: string;
  request_id: string;
  gate_type: string;
  kete: string | null;
  purpose: string;
  benefit_hypothesis: string | null;
  harm_hypothesis: string | null;
  status: string;
  conditions: string | null;
  kaitiaki_decision_by: string | null;
  decided_at: string | null;
  expiry: string | null;
  created_at: string;
}

// Use type assertion to work with tables not yet in generated types
const db = supabase as unknown as {
  from: (table: string) => ReturnType<typeof supabase.from>;
};

export function useSovereigntyRegistry(kete?: string) {
  return useQuery({
    queryKey: ["sovereignty-registry", kete],
    queryFn: async () => {
      let q = db.from("maori_data_registry")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (kete) q = q.eq("source_kete", kete);
      const { data, error } = await q;
      if (error) throw error;
      return ((data ?? []) as unknown) as RegistryEntry[];
    },
  });
}

export function useSovereigntyAudit(kete?: string) {
  return useQuery({
    queryKey: ["sovereignty-audit", kete],
    queryFn: async () => {
      let q = db.from("sovereignty_audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (kete) q = q.eq("kete", kete);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as AuditEntry[];
    },
  });
}

export function useGovernanceGates(kete?: string) {
  return useQuery({
    queryKey: ["governance-gates", kete],
    queryFn: async () => {
      let q = db.from("governance_gates")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (kete) q = q.eq("kete", kete);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as GovernanceGate[];
    },
  });
}

/** Summary stats for a sovereignty badge */
export function useSovereigntyStats(kete?: string) {
  const registry = useSovereigntyRegistry(kete);
  const gates = useGovernanceGates(kete);
  const audit = useSovereigntyAudit(kete);

  const registryData = registry.data ?? [];
  const gatesData = gates.data ?? [];
  const auditData = audit.data ?? [];

  return {
    isLoading: registry.isLoading || gates.isLoading || audit.isLoading,
    totalDatasets: registryData.length,
    maoriDatasets: registryData.filter(r => r.is_maori_data).length,
    tapuDatasets: registryData.filter(r => r.tapu_noa_classification === "tapu").length,
    pendingGates: gatesData.filter(g => g.status === "pending").length,
    approvedGates: gatesData.filter(g => g.status === "approved" || g.status === "approved_with_conditions").length,
    declinedGates: gatesData.filter(g => g.status === "declined").length,
    totalAuditEntries: auditData.length,
    blockedActions: auditData.filter(a => a.decision === "deny").length,
    nzOnlyDatasets: registryData.filter(r => r.locality_restriction === "nz_only").length,
    registry: registryData,
    gates: gatesData,
    audit: auditData,
  };
}
