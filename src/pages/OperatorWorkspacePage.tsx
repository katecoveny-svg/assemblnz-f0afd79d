import React, { useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import KeteOperatorShell, {
  type PaneId,
} from "@/components/kete/KeteOperatorShell";
import {
  DraftsPane,
  EvidencePane,
  SimsPane,
  GatesPane,
} from "@/components/kete/operator/OperatorPanes";
import {
  useOperatorDrafts,
  useOperatorEvidence,
  useOperatorSims,
  useOperatorGates,
} from "@/components/kete/operator/useOperatorData";
import { INDUSTRY_KETE, type IndustrySlug } from "@/assets/brand/kete";

/**
 * /operator/:slug — per-kete operator workspace, wired to live Supabase data.
 *
 * Pane data: drafts → approval_queue, evidence → evidence_packs,
 * sims → agent_test_results, gates → governance_gates. All filtered by the
 * upper-case kete code (see useOperatorData).
 */
const OperatorWorkspacePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [pane, setPane] = useState<PaneId>("drafts");

  const normalised = (slug ?? "").toLowerCase() as IndustrySlug;
  const kete = INDUSTRY_KETE[normalised];

  const drafts = useOperatorDrafts(normalised);
  const evidence = useOperatorEvidence(normalised);
  const sims = useOperatorSims(normalised);
  const gates = useOperatorGates(normalised);

  if (!kete) return <Navigate to="/" replace />;

  const counts = {
    drafts: drafts.data?.length ?? 0,
    evidence: evidence.data?.length ?? 0,
    sims: sims.data?.length ?? 0,
    gates: gates.data?.filter((g) => g.status === "pending").length ?? 0,
  };

  const accent = kete.accentHex;

  return (
    <KeteOperatorShell
      slug={normalised}
      subtitle={`${kete.code} · operator workspace · live pilot data`}
      counts={counts}
      activePane={pane}
      onPaneChange={setPane}
    >
      {pane === "drafts" && <DraftsPane slug={normalised} accent={accent} />}
      {pane === "evidence" && <EvidencePane slug={normalised} accent={accent} />}
      {pane === "sims" && <SimsPane slug={normalised} accent={accent} />}
      {pane === "gates" && <GatesPane slug={normalised} accent={accent} />}
    </KeteOperatorShell>
  );
};

export default OperatorWorkspacePage;
