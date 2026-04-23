import React, { useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import KeteOperatorShell, {
  type PaneId,
} from "@/components/kete/KeteOperatorShell";
import { INDUSTRY_KETE, type IndustrySlug } from "@/assets/brand/kete";

/**
 * /operator/:slug — per-kete operator workspace.
 *
 * Renders the locked KeteOperatorShell scaffold themed for the requested kete.
 * Real pane content (draft queue rows, evidence pack list, sim results,
 * compliance gate ledger) plugs in here as each kete is wired up.
 */
const OperatorWorkspacePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [pane, setPane] = useState<PaneId>("drafts");

  const normalised = (slug ?? "").toLowerCase() as IndustrySlug;
  const kete = INDUSTRY_KETE[normalised];
  if (!kete) return <Navigate to="/" replace />;

  // Demo counts — these will come from Supabase queries per kete
  const counts = { drafts: 0, evidence: 0, sims: 0, gates: 0 };

  return (
    <KeteOperatorShell
      slug={normalised}
      subtitle={`${kete.code} · operator workspace · pilot scaffold`}
      counts={counts}
      activePane={pane}
      onPaneChange={setPane}
    />
  );
};

export default OperatorWorkspacePage;
