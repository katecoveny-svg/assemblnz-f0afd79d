import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ASSEMBL_TOKENS } from "@/design/assemblTokens";
import { INDUSTRY_KETE, type IndustrySlug } from "@/assets/brand/kete";

/**
 * /operator/:slug/gates/:gateId — gate detail surface.
 *
 * Shows the full purpose, conditions, benefit/harm hypotheses, and
 * legislation reference for a governance gate. Linked from the operator
 * workspace Gates pane.
 */

interface GateDetail {
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
  governance_pack: Record<string, unknown> | null;
  simulator_results: Record<string, unknown> | null;
}

const GateDetailPage: React.FC = () => {
  const { slug, gateId } = useParams<{ slug: string; gateId: string }>();
  const navigate = useNavigate();
  const normalised = (slug ?? "").toLowerCase() as IndustrySlug;
  const kete = INDUSTRY_KETE[normalised];

  const { data, isLoading, error } = useQuery({
    queryKey: ["gate-detail", gateId],
    queryFn: async (): Promise<GateDetail | null> => {
      if (!gateId) return null;
      const { data, error } = await supabase
        .from("governance_gates")
        .select(
          "id, request_id, gate_type, kete, purpose, benefit_hypothesis, harm_hypothesis, status, conditions, kaitiaki_decision_by, decided_at, expiry, created_at, governance_pack, simulator_results",
        )
        .eq("id", gateId)
        .maybeSingle();
      if (error) throw error;
      return data as GateDetail | null;
    },
    enabled: !!gateId,
  });

  const accent = kete?.accentHex ?? "#D9BC7A";
  const legislationRef =
    (data?.governance_pack as { legislation_ref?: string } | null)?.legislation_ref ??
    null;

  return (
    <div
      className="min-h-screen px-6 py-10"
      style={{ background: ASSEMBL_TOKENS.core.text["bg-mist"] ?? "#F7F3EE" }}
    >
      <div className="max-w-3xl mx-auto">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm mb-6 hover:underline"
          style={{ color: ASSEMBL_TOKENS.core.text["text-secondary"] }}
        >
          <ArrowLeft size={14} />
          Back to operator workspace
        </button>

        {isLoading && (
          <div className="text-sm" style={{ color: ASSEMBL_TOKENS.core.text["text-secondary"] }}>
            Loading gate detail…
          </div>
        )}
        {error && (
          <div className="text-sm" style={{ color: "#C85A54" }}>
            Could not load gate: {error instanceof Error ? error.message : "unknown error"}
          </div>
        )}
        {!isLoading && !error && !data && (
          <div className="text-sm" style={{ color: ASSEMBL_TOKENS.core.text["text-secondary"] }}>
            Gate not found.{" "}
            <Link to={`/operator/${normalised}`} className="underline">
              Return to workspace
            </Link>
          </div>
        )}

        {data && (
          <article
            className="rounded-3xl p-8"
            style={{
              background: "rgba(255,255,255,0.7)",
              border: `1px solid ${ASSEMBL_TOKENS.core.text["border-soft"]}`,
              boxShadow: "0 8px 30px rgba(111,97,88,0.08)",
            }}
          >
            <div
              className="inline-block px-3 py-1 rounded-full text-xs mb-4"
              style={{
                background: `${accent}33`,
                border: `1px solid ${accent}66`,
                color: ASSEMBL_TOKENS.core.text["text-primary"],
                fontFamily: ASSEMBL_TOKENS.core.fonts.mono,
              }}
            >
              {data.gate_type} · {data.status}
            </div>

            <h1
              className="text-3xl mb-2"
              style={{
                fontFamily: ASSEMBL_TOKENS.core.fonts.display,
                color: ASSEMBL_TOKENS.core.text["text-primary"],
                fontWeight: 400,
              }}
            >
              {data.purpose}
            </h1>
            <p
              className="text-xs mb-8"
              style={{
                color: ASSEMBL_TOKENS.core.text["text-secondary"],
                fontFamily: ASSEMBL_TOKENS.core.fonts.mono,
              }}
            >
              Request {data.request_id} · created {formatDate(data.created_at)}
              {data.decided_at ? ` · decided ${formatDate(data.decided_at)}` : ""}
              {data.expiry ? ` · expires ${formatDate(data.expiry)}` : ""}
            </p>

            <Section label="Conditions">
              {data.conditions ? (
                <p>{data.conditions}</p>
              ) : (
                <p style={{ color: ASSEMBL_TOKENS.core.text["text-secondary"] }}>
                  No conditions recorded for this gate.
                </p>
              )}
            </Section>

            <Section label="Legislation reference">
              {legislationRef ? (
                <p style={{ fontFamily: ASSEMBL_TOKENS.core.fonts.mono }}>
                  {legislationRef}
                  <ExternalLink size={12} className="inline ml-1.5 -mt-0.5" />
                </p>
              ) : (
                <p style={{ color: ASSEMBL_TOKENS.core.text["text-secondary"] }}>
                  No legislation reference attached. Add one to the governance pack to
                  surface it here.
                </p>
              )}
            </Section>

            {data.benefit_hypothesis && (
              <Section label="Benefit hypothesis">
                <p>{data.benefit_hypothesis}</p>
              </Section>
            )}

            {data.harm_hypothesis && (
              <Section label="Harm hypothesis">
                <p>{data.harm_hypothesis}</p>
              </Section>
            )}

            {data.kaitiaki_decision_by && (
              <Section label="Decision by">
                <p style={{ fontFamily: ASSEMBL_TOKENS.core.fonts.mono }}>
                  {data.kaitiaki_decision_by}
                </p>
              </Section>
            )}
          </article>
        )}
      </div>
    </div>
  );
};

const Section: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <section className="mb-6">
    <h2
      className="text-xs uppercase tracking-wider mb-2"
      style={{
        color: ASSEMBL_TOKENS.core.text["text-secondary"],
        letterSpacing: "0.12em",
        fontWeight: 500,
      }}
    >
      {label}
    </h2>
    <div
      className="text-sm leading-relaxed"
      style={{ color: ASSEMBL_TOKENS.core.text["text-body"] }}
    >
      {children}
    </div>
  </section>
);

const formatDate = (iso: string | null): string => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-NZ", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
};

export default GateDetailPage;
