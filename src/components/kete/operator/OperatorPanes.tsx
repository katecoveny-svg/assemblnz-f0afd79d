import React, { useState } from "react";
import { toast } from "sonner";
import { Download, Loader2 } from "lucide-react";
import { ASSEMBL_TOKENS } from "@/design/assemblTokens";
import type { IndustrySlug } from "@/assets/brand/kete";
import { supabase } from "@/integrations/supabase/client";
import { generateAndDownloadEvidencePack } from "@/lib/evidencePackPdf";
import type { CrossAgentSection } from "@/lib/pdfBranding";
import {
  useOperatorDrafts,
  useOperatorEvidence,
  useOperatorSims,
  useOperatorGates,
  type DraftRow,
  type EvidenceRow,
  type SimRow,
  type GateRow,
} from "./useOperatorData";

/**
 * OperatorPanes — the live data renderers for KeteOperatorShell.
 *
 * Each pane is a small read-only view onto the relevant Supabase table,
 * filtered by kete. No mutations here — sign-off / decisions live in the
 * dedicated approval flows; this is the operator's status surface.
 */

// ───────────────────── Drafts ─────────────────────

export const DraftsPane: React.FC<{ slug: IndustrySlug; accent: string }> = ({
  slug,
  accent,
}) => {
  const { data, isLoading, error } = useOperatorDrafts(slug);
  if (isLoading) return <Loading label="Loading draft queue…" />;
  if (error) return <Failure error={error} />;
  if (!data?.length)
    return (
      <Empty
        accent={accent}
        title="No drafts waiting"
        body="When the agent produces a customer message, document, or evidence artefact, it lands here for human sign-off before anything ships."
      />
    );

  return (
    <Table
      headers={["Action", "Requested", "Expires", "Request ID"]}
      rows={data.map((d: DraftRow) => [
        <strong key="a">{d.action_type}</strong>,
        formatDate(d.requested_at),
        formatDate(d.expires_at),
        <Mono key="r">{shortId(d.request_id)}</Mono>,
      ])}
    />
  );
};

// ───────────────────── Evidence ─────────────────────

export const EvidencePane: React.FC<{ slug: IndustrySlug; accent: string }> = ({
  slug,
  accent,
}) => {
  const { data, isLoading, error } = useOperatorEvidence(slug);
  if (isLoading) return <Loading label="Loading evidence packs…" />;
  if (error) return <Failure error={error} />;
  if (!data?.length)
    return (
      <Empty
        accent={accent}
        title="No evidence packs filed yet"
        body="Every completed workflow ends in a contemporaneous pack — board, auditor, regulator, or client can accept it as filed proof."
      />
    );

  return (
    <Table
      headers={["Action", "Filed", "Signed by", "Views", "Watermark", ""]}
      rows={data.map((e: EvidenceRow) => [
        <strong key="a">{e.action_type}</strong>,
        formatDate(e.created_at),
        e.signed_by ?? <Muted>unsigned</Muted>,
        <Mono key="v">{e.share_view_count}</Mono>,
        <Mono key="w">{e.watermark.slice(0, 10)}…</Mono>,
        <DownloadEvidenceButton key="dl" packId={e.id} accent={accent} />,
      ])}
    />
  );
};

const DownloadEvidenceButton: React.FC<{ packId: string; accent: string }> = ({
  packId,
  accent,
}) => {
  const [busy, setBusy] = useState(false);

  const handleClick = async (clickEv: React.MouseEvent) => {
    clickEv.stopPropagation();
    setBusy(true);
    try {
      const { data, error } = await supabase
        .from("evidence_packs")
        .select("kete, action_type, watermark, evidence_json, signed_by, signed_at")
        .eq("id", packId)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error("Evidence pack not found");

      const pack = (data.evidence_json ?? {}) as {
        title?: string;
        client?: string;
        summary?: string;
        simulated?: boolean;
        version?: string;
        sections?: Array<{
          agent?: string;
          title?: string;
          status?: string;
          legislation_ref?: string;
          body?: string;
        }>;
      };

      const sections: CrossAgentSection[] = (ev.sections ?? []).map((s) => ({
        agent: s.agent ?? "Assembl",
        title: s.title ?? "Section",
        body:
          s.body ??
          `Verified entry. Status: ${(s.status ?? "pass").toUpperCase()}.${
            s.legislation_ref ? ` Legislation: ${s.legislation_ref}.` : ""
          }`,
        status: (s.status as CrossAgentSection["status"]) ?? "pass",
        legislationRef: s.legislation_ref,
      }));

      await generateAndDownloadEvidencePack({
        kete: data.kete,
        title: ev.title ?? `${data.action_type} — Evidence Pack`,
        client: ev.client,
        summary: ev.summary,
        sections:
          sections.length > 0
            ? sections
            : [
                {
                  agent: "Assembl",
                  title: data.action_type,
                  body: `Watermark: ${data.watermark}. Filed${
                    data.signed_by ? ` by ${data.signed_by}` : ""
                  }${data.signed_at ? ` on ${data.signed_at}` : ""}.`,
                  status: "pass",
                },
              ],
        version: ev.version,
        simulated: ev.simulated,
      });
      toast.success("Evidence pack downloaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not open evidence pack");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-all hover:brightness-95 disabled:opacity-50"
      style={{
        background: `${accent}33`,
        border: `1px solid ${accent}66`,
        color: ASSEMBL_TOKENS.core.text["text-primary"],
        fontFamily: ASSEMBL_TOKENS.core.fonts.mono,
      }}
      aria-label="Download evidence pack PDF"
    >
      {busy ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
      Open PDF
    </button>
  );
};

// ───────────────────── Sims ─────────────────────

export const SimsPane: React.FC<{ slug: IndustrySlug; accent: string }> = ({
  slug,
  accent,
}) => {
  const { data, isLoading, error } = useOperatorSims(slug);
  if (isLoading) return <Loading label="Loading simulation runs…" />;
  if (error) return <Failure error={error} />;
  if (!data?.length)
    return (
      <Empty
        accent={accent}
        title="No simulation runs yet"
        body="This kete must pass an 80-case simulation sweep ≥ 95% before it can move from internal pilot to paid pilot."
      />
    );

  const total = data.length;
  const passes = data.filter((r) => r.overall_verdict === "pass").length;
  const passRate = total > 0 ? Math.round((passes / total) * 100) : 0;
  const target = 95;
  const meetsGate = passRate >= target && total >= 80;

  return (
    <div>
      <SimSummary
        total={total}
        passes={passes}
        passRate={passRate}
        target={target}
        meetsGate={meetsGate}
        accent={accent}
      />
      <div className="mt-6">
        <Table
          headers={["Agent", "Prompt", "Kahu", "Tā", "Mana", "Verdict", "Run"]}
          rows={data.slice(0, 20).map((r: SimRow) => [
            <Mono key="ag">{r.agent_slug}</Mono>,
            <span key="p" className="line-clamp-1">
              {r.prompt}
            </span>,
            <Verdict key="k" v={r.verdict_kahu} />,
            <Verdict key="t" v={r.verdict_ta} />,
            <Verdict key="m" v={r.verdict_mana} />,
            <Verdict key="o" v={r.overall_verdict} />,
            formatDate(r.created_at),
          ])}
        />
      </div>
    </div>
  );
};

// ───────────────────── Gates ─────────────────────

export const GatesPane: React.FC<{ slug: IndustrySlug; accent: string }> = ({
  slug,
  accent,
}) => {
  const { data, isLoading, error } = useOperatorGates(slug);
  if (isLoading) return <Loading label="Loading compliance gates…" />;
  if (error) return <Failure error={error} />;
  if (!data?.length)
    return (
      <Empty
        accent={accent}
        title="All compliance gates green"
        body="Tā rules and Mana hard rules will appear here as they trigger on live traffic. Each row links to the legislation reference."
      />
    );

  return (
    <Table
      headers={["Gate", "Purpose", "Status", "Decided", "Conditions"]}
      rows={data.map((g: GateRow) => [
        <Mono key="g">{g.gate_type}</Mono>,
        <span key="p" className="line-clamp-2">
          {g.purpose}
        </span>,
        <GateStatus key="s" status={g.status} />,
        formatDate(g.decided_at ?? g.created_at),
        g.conditions ? (
          <span className="line-clamp-1">{g.conditions}</span>
        ) : (
          <Muted>—</Muted>
        ),
      ])}
    />
  );
};

// ───────────────────── shared helpers ─────────────────────

const Table: React.FC<{
  headers: string[];
  rows: React.ReactNode[][];
}> = ({ headers, rows }) => (
  <div className="overflow-x-auto -mx-2">
    <table className="w-full text-sm border-separate" style={{ borderSpacing: "0 6px" }}>
      <thead>
        <tr>
          {headers.map((h) => (
            <th
              key={h}
              className="text-left px-3 py-2 text-xs uppercase tracking-wider font-medium"
              style={{
                color: ASSEMBL_TOKENS.core.text["text-secondary"],
                letterSpacing: "0.12em",
              }}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr
            key={i}
            style={{
              background: "rgba(255,255,255,0.55)",
              boxShadow: ASSEMBL_TOKENS.core.text["shadow-soft"],
            }}
          >
            {row.map((cell, j) => (
              <td
                key={j}
                className="px-3 py-3 align-top"
                style={{
                  color: ASSEMBL_TOKENS.core.text["text-body"],
                  borderTop: `1px solid ${ASSEMBL_TOKENS.core.text["border-soft"]}`,
                  borderBottom: `1px solid ${ASSEMBL_TOKENS.core.text["border-soft"]}`,
                  borderLeft:
                    j === 0
                      ? `1px solid ${ASSEMBL_TOKENS.core.text["border-soft"]}`
                      : undefined,
                  borderRight:
                    j === row.length - 1
                      ? `1px solid ${ASSEMBL_TOKENS.core.text["border-soft"]}`
                      : undefined,
                  borderTopLeftRadius: j === 0 ? 12 : undefined,
                  borderBottomLeftRadius: j === 0 ? 12 : undefined,
                  borderTopRightRadius: j === row.length - 1 ? 12 : undefined,
                  borderBottomRightRadius: j === row.length - 1 ? 12 : undefined,
                  maxWidth: 280,
                }}
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Loading: React.FC<{ label: string }> = ({ label }) => (
  <div
    className="text-center py-12 text-sm"
    style={{ color: ASSEMBL_TOKENS.core.text["text-secondary"] }}
  >
    {label}
  </div>
);

const Failure: React.FC<{ error: unknown }> = ({ error }) => {
  const msg = error instanceof Error ? error.message : "Unknown error";
  return (
    <div
      className="text-center py-12 text-sm"
      style={{ color: "#C85A54" }}
    >
      Could not load this pane: {msg}
    </div>
  );
};

const Empty: React.FC<{ accent: string; title: string; body: string }> = ({
  accent,
  title,
  body,
}) => (
  <div className="text-center py-12 max-w-xl mx-auto">
    <div
      className="mx-auto h-12 w-12 rounded-full mb-5"
      style={{ background: `${accent}33`, border: `1px solid ${accent}66` }}
      aria-hidden
    />
    <h2
      className="text-xl mb-2"
      style={{
        fontFamily: ASSEMBL_TOKENS.core.fonts.display,
        color: ASSEMBL_TOKENS.core.text["text-primary"],
        fontWeight: 400,
      }}
    >
      {title}
    </h2>
    <p
      className="text-sm leading-relaxed"
      style={{ color: ASSEMBL_TOKENS.core.text["text-body"] }}
    >
      {body}
    </p>
  </div>
);

const Mono: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ fontFamily: ASSEMBL_TOKENS.core.fonts.mono, fontSize: 12 }}>
    {children}
  </span>
);

const Muted: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ color: ASSEMBL_TOKENS.core.text["text-secondary"] }}>
    {children}
  </span>
);

const Verdict: React.FC<{ v: string | null | undefined }> = ({ v }) => {
  const value = (v ?? "pending").toLowerCase();
  const palette: Record<string, { bg: string; fg: string }> = {
    pass: { bg: "#C9D8D0", fg: "#3D5C4A" },
    fail: { bg: "#E9C9C7", fg: "#7A2E2A" },
    warn: { bg: "#F2E2BD", fg: "#7A5A1F" },
    pending: { bg: "#EEE7DE", fg: "#6F6158" },
  };
  const p = palette[value] ?? palette.pending;
  return (
    <span
      className="px-2 py-0.5 rounded-full text-xs"
      style={{
        background: p.bg,
        color: p.fg,
        fontFamily: ASSEMBL_TOKENS.core.fonts.mono,
      }}
    >
      {value}
    </span>
  );
};

const GateStatus: React.FC<{ status: string }> = ({ status }) => {
  const s = status.toLowerCase();
  const palette: Record<string, { bg: string; fg: string }> = {
    approved: { bg: "#C9D8D0", fg: "#3D5C4A" },
    approved_with_conditions: { bg: "#F2E2BD", fg: "#7A5A1F" },
    declined: { bg: "#E9C9C7", fg: "#7A2E2A" },
    pending: { bg: "#EEE7DE", fg: "#6F6158" },
  };
  const p = palette[s] ?? palette.pending;
  return (
    <span
      className="px-2 py-0.5 rounded-full text-xs whitespace-nowrap"
      style={{
        background: p.bg,
        color: p.fg,
        fontFamily: ASSEMBL_TOKENS.core.fonts.mono,
      }}
    >
      {s.replace(/_/g, " ")}
    </span>
  );
};

const SimSummary: React.FC<{
  total: number;
  passes: number;
  passRate: number;
  target: number;
  meetsGate: boolean;
  accent: string;
}> = ({ total, passes, passRate, target, meetsGate, accent }) => (
  <div
    className="grid grid-cols-2 md:grid-cols-4 gap-3"
    style={{ color: ASSEMBL_TOKENS.core.text["text-body"] }}
  >
    <Stat label="Runs logged" value={String(total)} />
    <Stat label="Passes" value={String(passes)} />
    <Stat label="Pass rate" value={`${passRate}%`} highlight={accent} />
    <Stat
      label="Pilot gate (≥80 · ≥95%)"
      value={meetsGate ? "Met" : "Not yet"}
      highlight={meetsGate ? "#C9D8D0" : "#F2E2BD"}
    />
  </div>
);

const Stat: React.FC<{ label: string; value: string; highlight?: string }> = ({
  label,
  value,
  highlight,
}) => (
  <div
    className="rounded-2xl p-4"
    style={{
      background: "rgba(255,255,255,0.7)",
      border: `1px solid ${highlight ?? ASSEMBL_TOKENS.core.text["border-soft"]}`,
      boxShadow: ASSEMBL_TOKENS.core.text["shadow-soft"],
    }}
  >
    <div
      className="text-xs uppercase tracking-wider mb-1"
      style={{
        color: ASSEMBL_TOKENS.core.text["text-secondary"],
        letterSpacing: "0.12em",
      }}
    >
      {label}
    </div>
    <div
      className="text-2xl"
      style={{
        fontFamily: ASSEMBL_TOKENS.core.fonts.display,
        color: ASSEMBL_TOKENS.core.text["text-primary"],
        fontWeight: 400,
      }}
    >
      {value}
    </div>
  </div>
);

function formatDate(d: string | null | undefined): React.ReactNode {
  if (!d) return <Muted>—</Muted>;
  try {
    const dt = new Date(d);
    return (
      <span style={{ fontFamily: ASSEMBL_TOKENS.core.fonts.mono, fontSize: 12 }}>
        {dt.toLocaleDateString("en-NZ", {
          day: "2-digit",
          month: "short",
          year: "2-digit",
        })}
      </span>
    );
  } catch {
    return <Muted>—</Muted>;
  }
}

function shortId(id: string): string {
  return id.length > 8 ? `${id.slice(0, 8)}…` : id;
}
