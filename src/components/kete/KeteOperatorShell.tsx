import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ASSEMBL_TOKENS, type IndustryCode } from "@/design/assemblTokens";
import { INDUSTRY_KETE, type IndustrySlug } from "@/assets/brand/kete";

/**
 * KeteOperatorShell — the shared operator workspace chrome for every kete.
 *
 * Distinct from `KeteDashboardShell` (which is for marketing / landing /
 * showcase dashboards). This shell is for the **operator workflow surface**:
 * draft queues, evidence packs, simulation status, compliance gates.
 *
 * Locked to Brand Guidelines v1.0 (2026-04-22) — Mist background, Soft Gold
 * primary, glass cards with 24px radius, charcoal text. Per-kete accent is
 * applied as the active-state highlight only — chrome stays consistent.
 */

export interface OperatorPaneCount {
  drafts: number;
  evidence: number;
  sims: number;
  gates: number;
}

interface KeteOperatorShellProps {
  /** Industry slug — drives accent + label */
  slug: IndustrySlug;
  /** Optional override for the page title (defaults to "<Industry> operator") */
  title?: string;
  /** Optional subtitle line under title */
  subtitle?: string;
  /** Counts for the four operator panes */
  counts?: Partial<OperatorPaneCount>;
  /** Active pane id */
  activePane?: PaneId;
  /** Pane change handler */
  onPaneChange?: (id: PaneId) => void;
  /** Main pane content (rendered inside the working area) */
  children?: React.ReactNode;
}

export type PaneId = "drafts" | "evidence" | "sims" | "gates";

const PANES: { id: PaneId; label: string; hint: string }[] = [
  { id: "drafts",   label: "Draft queue",       hint: "Awaiting human sign-off" },
  { id: "evidence", label: "Evidence packs",    hint: "Filed, forwarded, footnoted" },
  { id: "sims",     label: "Simulation runs",   hint: "Pilot gate: 80 cases" },
  { id: "gates",    label: "Compliance gates",  hint: "Tā rules · Mana hard rules" },
];

const KeteOperatorShell: React.FC<KeteOperatorShellProps> = ({
  slug,
  title,
  subtitle,
  counts = {},
  activePane = "drafts",
  onPaneChange,
  children,
}) => {
  const kete = INDUSTRY_KETE[slug];
  const accent = kete?.accentHex ?? "#D9BC7A";
  const accentName = kete?.accentName ?? "Soft Gold";
  const heading = title ?? `${kete?.industry ?? "Kete"} operator`;
  const code: IndustryCode | undefined = kete
    ? (Object.keys(ASSEMBL_TOKENS.industries) as IndustryCode[]).find(
        (k) => k.split("-")[0].toLowerCase() === slug.toLowerCase(),
      )
    : undefined;

  const paneCount = (id: PaneId): number => counts[id] ?? 0;

  return (
    <div
      className="min-h-screen"
      style={{
        background: ASSEMBL_TOKENS.core.colors["assembl-mist"],
        color: ASSEMBL_TOKENS.core.text["text-body"],
        fontFamily: ASSEMBL_TOKENS.core.fonts.body,
        // expose accent as a CSS var so child surfaces can pick it up
        ["--kete-accent" as string]: accent,
      } as React.CSSProperties}
    >
      {/* Header — kete identity + breadcrumb */}
      <header
        className="px-6 md:px-10 py-6 border-b"
        style={{ borderColor: ASSEMBL_TOKENS.core.text["border-soft"] }}
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            {kete?.image && (
              <div
                className="h-14 w-14 rounded-3xl overflow-hidden flex-shrink-0"
                style={{
                  border: `1px solid ${ASSEMBL_TOKENS.core.text["border-soft"]}`,
                  boxShadow: ASSEMBL_TOKENS.core.text["shadow-soft"],
                }}
              >
                <img
                  src={kete.image}
                  alt={`${kete.industry} kete`}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <div>
              <Link
                to="/"
                className="text-xs uppercase tracking-[0.18em] hover:underline"
                style={{ color: ASSEMBL_TOKENS.core.text["text-secondary"] }}
              >
                Assembl{code ? ` · ${code}` : ""}
              </Link>
              <h1
                className="text-2xl md:text-3xl mt-1"
                style={{
                  fontFamily: ASSEMBL_TOKENS.core.fonts.display,
                  color: ASSEMBL_TOKENS.core.text["text-primary"],
                  fontWeight: 400,
                  letterSpacing: "-0.01em",
                }}
              >
                {heading}
              </h1>
              {subtitle && (
                <p
                  className="text-sm mt-1"
                  style={{ color: ASSEMBL_TOKENS.core.text["text-secondary"] }}
                >
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <AccentChip name={accentName} hex={accent} />
        </div>
      </header>

      {/* Pane switcher */}
      <nav
        className="px-6 md:px-10 pt-6 pb-2 flex gap-3 flex-wrap"
        aria-label="Operator panes"
      >
        {PANES.map((p) => {
          const isActive = p.id === activePane;
          return (
            <button
              key={p.id}
              onClick={() => onPaneChange?.(p.id)}
              className="text-left transition-all"
              style={{
                background: isActive ? "#FFFFFF" : "rgba(255,255,255,0.55)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                border: `1px solid ${
                  isActive ? accent : ASSEMBL_TOKENS.core.text["border-soft"]
                }`,
                borderRadius: ASSEMBL_TOKENS.core.radius["radius-chip"],
                padding: "12px 18px",
                boxShadow: isActive
                  ? `0 8px 30px ${accent}33`
                  : ASSEMBL_TOKENS.core.text["shadow-soft"],
                cursor: "pointer",
                minWidth: 180,
              }}
              aria-pressed={isActive}
            >
              <div className="flex items-center justify-between gap-3">
                <span
                  className="text-sm"
                  style={{
                    color: ASSEMBL_TOKENS.core.text["text-primary"],
                    fontWeight: 500,
                  }}
                >
                  {p.label}
                </span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: isActive
                      ? accent
                      : ASSEMBL_TOKENS.core.colors["assembl-cloud"],
                    color: isActive
                      ? "#FFFFFF"
                      : ASSEMBL_TOKENS.core.text["text-primary"],
                    fontFamily: ASSEMBL_TOKENS.core.fonts.mono,
                    fontSize: 11,
                  }}
                >
                  {paneCount(p.id)}
                </span>
              </div>
              <div
                className="text-xs mt-1"
                style={{ color: ASSEMBL_TOKENS.core.text["text-secondary"] }}
              >
                {p.hint}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Working area */}
      <motion.main
        key={activePane}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="px-6 md:px-10 py-6"
      >
        <div
          className="p-6 md:p-8"
          style={{
            background: "rgba(255,255,255,0.7)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: `1px solid ${ASSEMBL_TOKENS.core.text["border-soft"]}`,
            borderRadius: ASSEMBL_TOKENS.core.radius["radius-card"],
            boxShadow: ASSEMBL_TOKENS.core.text["shadow-soft"],
            minHeight: 420,
          }}
        >
          {children ?? <EmptyPane paneId={activePane} accent={accent} />}
        </div>
      </motion.main>

      {/* Footer — governance reminder, locked design */}
      <footer
        className="px-6 md:px-10 py-5 text-xs flex flex-wrap gap-x-6 gap-y-2 justify-between"
        style={{
          color: ASSEMBL_TOKENS.core.text["text-secondary"],
          borderTop: `1px solid ${ASSEMBL_TOKENS.core.text["border-soft"]}`,
        }}
      >
        <span>
          Draft-only · A named human signs every external action ·
          Tikanga Māori governance applies to every output.
        </span>
        <span style={{ fontFamily: ASSEMBL_TOKENS.core.fonts.mono }}>
          Brand Guidelines v1.0
        </span>
      </footer>
    </div>
  );
};

/* --------------------------------- helpers -------------------------------- */

const AccentChip: React.FC<{ name: string; hex: string }> = ({ name, hex }) => (
  <div
    className="flex items-center gap-2 px-3 py-1.5 rounded-full"
    style={{
      background: "rgba(255,255,255,0.6)",
      border: `1px solid ${ASSEMBL_TOKENS.core.text["border-soft"]}`,
      backdropFilter: "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
    }}
  >
    <span
      className="h-3.5 w-3.5 rounded-full"
      style={{ background: hex, boxShadow: `0 0 0 1px ${hex}55 inset` }}
      aria-hidden
    />
    <span
      className="text-xs"
      style={{
        color: ASSEMBL_TOKENS.core.text["text-primary"],
        fontFamily: ASSEMBL_TOKENS.core.fonts.mono,
        letterSpacing: "0.04em",
      }}
    >
      {name} · {hex.toUpperCase()}
    </span>
  </div>
);

const EmptyPane: React.FC<{ paneId: PaneId; accent: string }> = ({
  paneId,
  accent,
}) => {
  const copy: Record<PaneId, { title: string; body: string }> = {
    drafts: {
      title: "No drafts waiting",
      body:
        "When the agent produces a customer message, document, or evidence " +
        "artefact, it lands here for human sign-off before anything ships.",
    },
    evidence: {
      title: "No evidence packs filed yet",
      body:
        "Every completed workflow ends in a contemporaneous pack — board, " +
        "auditor, regulator, or client can accept it as filed proof.",
    },
    sims: {
      title: "No simulation runs yet",
      body:
        "This kete must pass an 80-case simulation sweep ≥ 95% before it can " +
        "move from internal pilot to paid pilot.",
    },
    gates: {
      title: "All compliance gates green",
      body:
        "Tā rules and Mana hard rules will appear here as they trigger on " +
        "live traffic. Each row links to the legislation reference.",
    },
  };
  const c = copy[paneId];
  return (
    <div className="text-center py-12 max-w-xl mx-auto">
      <div
        className="mx-auto h-12 w-12 rounded-full mb-5"
        style={{
          background: `${accent}33`,
          border: `1px solid ${accent}66`,
        }}
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
        {c.title}
      </h2>
      <p
        className="text-sm leading-relaxed"
        style={{ color: ASSEMBL_TOKENS.core.text["text-body"] }}
      >
        {c.body}
      </p>
    </div>
  );
};

export default KeteOperatorShell;
