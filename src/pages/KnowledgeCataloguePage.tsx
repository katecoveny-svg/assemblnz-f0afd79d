// ═══════════════════════════════════════════════════════════════
// /knowledge — public catalogue of every authoritative source
// powering the platform. Grouped by kete, searchable, with tier
// chips and direct source links. Read-only; no auth required.
// ═══════════════════════════════════════════════════════════════
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, BookOpen, ExternalLink, ShieldCheck, Database } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { KETE_LABELS, KETE_BY_CODE } from "@/data/keteLabels";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import LightPageShell from "@/components/LightPageShell";
import SEO from "@/components/SEO";

interface KbDoc {
  id: string;
  kete: string;
  doc_title: string;
  doc_source_url: string | null;
  doc_source_publisher: string | null;
  tier: number;
  update_cadence: string | null;
  last_fetched_at: string | null;
  last_fetch_status: string | null;
  summary: string | null;
}

const TIER_LABEL: Record<number, string> = { 1: "Tier 1 · Foundational", 2: "Tier 2 · Operational", 3: "Tier 3 · Reference" };

export default function KnowledgeCataloguePage() {
  const [docs, setDocs] = useState<KbDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [activeKete, setActiveKete] = useState<string>("ALL");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("industry_knowledge_base")
        .select("id, kete, doc_title, doc_source_url, doc_source_publisher, tier, update_cadence, last_fetched_at, last_fetch_status, summary")
        .order("kete", { ascending: true })
        .order("tier", { ascending: true })
        .order("doc_title", { ascending: true });
      setDocs((data ?? []) as KbDoc[]);
      setLoading(false);
    })();
  }, []);

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    docs.forEach((d) => { map[d.kete] = (map[d.kete] ?? 0) + 1; });
    return map;
  }, [docs]);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return docs.filter((d) => {
      if (activeKete !== "ALL" && d.kete !== activeKete) return false;
      if (!q) return true;
      return (
        d.doc_title.toLowerCase().includes(q) ||
        (d.doc_source_publisher ?? "").toLowerCase().includes(q) ||
        (d.summary ?? "").toLowerCase().includes(q)
      );
    });
  }, [docs, filter, activeKete]);

  const grouped = useMemo(() => {
    const map = new Map<string, KbDoc[]>();
    filtered.forEach((d) => {
      const arr = map.get(d.kete) ?? [];
      arr.push(d);
      map.set(d.kete, arr);
    });
    return Array.from(map.entries()).sort(([a], [b]) => {
      const ai = KETE_LABELS.findIndex((k) => k.code === a);
      const bi = KETE_LABELS.findIndex((k) => k.code === b);
      return ai - bi;
    });
  }, [filtered]);

  const liveCount = docs.filter((d) => d.last_fetched_at).length;

  return (
    <LightPageShell>
      <SEO
        title="Knowledge Library — every NZ source powering Assembl agents"
        description={`Public catalogue of ${docs.length} authoritative New Zealand sources — legislation, regulators, datasets, councils — that ground every Assembl agent answer.`}
        path="/knowledge"
      />
      <BrandNav />

      <main className="pt-32 pb-24 px-4 md:px-8 max-w-7xl mx-auto">
        <header className="mb-12 max-w-3xl">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck size={16} style={{ color: "#4AA5A8" }} />
            <span className="text-xs uppercase tracking-[0.2em]" style={{ color: "#4AA5A8" }}>
              Mōhiotanga · Knowledge
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-light tracking-tight mb-6" style={{ color: "#1A1D29" }}>
            Every source. Every kete. Always live.
          </h1>
          <p className="text-lg md:text-xl font-light leading-relaxed" style={{ color: "#3D4250" }}>
            {docs.length} authoritative New Zealand and global sources power every Assembl agent answer — from
            legislation.govt.nz and WorkSafe to Stats NZ, NIWA and 21 regional council open-data portals.
            Refreshed on cadence, hashed for change detection, chunked for retrieval.
          </p>
        </header>

        {/* KPI strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Total sources", value: docs.length, icon: Database },
            { label: "Industry kete", value: KETE_LABELS.length, icon: BookOpen },
            { label: "Live (fetched)", value: liveCount, icon: ShieldCheck },
            { label: "Tier 1 foundational", value: docs.filter((d) => d.tier === 1).length, icon: ShieldCheck },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-2xl p-5"
              style={{
                background: "rgba(255,255,255,0.65)",
                backdropFilter: "blur(22px) saturate(160%)",
                border: "1px solid rgba(255,255,255,0.6)",
                boxShadow: "10px 10px 28px rgba(166,166,180,0.18), -8px -8px 24px rgba(255,255,255,0.95)",
              }}
            >
              <kpi.icon size={16} style={{ color: "#4AA5A8" }} className="mb-3" />
              <div className="text-3xl font-light" style={{ color: "#1A1D29" }}>{kpi.value}</div>
              <div className="text-xs uppercase tracking-wider mt-1" style={{ color: "#6B7280" }}>{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* Search + kete tabs */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-xl">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "#9CA3AF" }} />
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search by title, publisher, or topic…"
              className="w-full pl-11 pr-4 py-3 rounded-full text-sm focus:outline-none"
              style={{
                background: "rgba(255,255,255,0.85)",
                border: "1px solid rgba(255,255,255,0.6)",
                color: "#1A1D29",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <KeteTab active={activeKete === "ALL"} onClick={() => setActiveKete("ALL")} label="All" count={docs.length} accent="#1A1D29" />
            {KETE_LABELS.map((k) => (
              <KeteTab
                key={k.code}
                active={activeKete === k.code}
                onClick={() => setActiveKete(k.code)}
                label={`${k.short} · ${k.english}`}
                count={counts[k.code] ?? 0}
                accent={k.accent}
              />
            ))}
          </div>
        </div>

        {loading && <p style={{ color: "#6B7280" }}>Loading…</p>}

        {!loading && grouped.map(([kete, items]) => {
          const label = KETE_BY_CODE[kete] ?? { short: kete, english: "", accent: "#3D4250", href: null };
          return (
            <section key={kete} className="mb-14">
              <div className="flex items-baseline justify-between gap-4 mb-5 pb-3" style={{ borderBottom: `1px solid ${label.accent}30` }}>
                <h2 className="text-2xl font-light" style={{ color: "#1A1D29" }}>
                  <span style={{ color: label.accent }}>{label.short}</span>
                  <span className="text-base ml-2" style={{ color: "#6B7280" }}>{label.english}</span>
                </h2>
                <span className="text-sm" style={{ color: "#6B7280" }}>{items.length} sources</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {items.map((doc) => (
                  <article
                    key={doc.id}
                    className="rounded-2xl p-5 transition-all hover:-translate-y-0.5"
                    style={{
                      background: "rgba(255,255,255,0.7)",
                      backdropFilter: "blur(20px)",
                      border: "1px solid rgba(255,255,255,0.6)",
                      boxShadow: "6px 6px 16px rgba(166,166,180,0.18), -4px -4px 12px rgba(255,255,255,0.9)",
                    }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded"
                          style={{ background: `${label.accent}20`, color: label.accent }}
                        >
                          Tier {doc.tier}
                        </span>
                        {doc.last_fetched_at && (
                          <span className="text-[10px] uppercase tracking-wider" style={{ color: "#3A7D6E" }}>
                            ● live
                          </span>
                        )}
                      </div>
                      {doc.doc_source_url && (
                        <a href={doc.doc_source_url} target="_blank" rel="noopener noreferrer" style={{ color: label.accent }} aria-label="Open source">
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                    <h3 className="text-sm font-medium leading-snug mb-2" style={{ color: "#1A1D29" }}>
                      {doc.doc_title}
                    </h3>
                    <p className="text-xs mb-2" style={{ color: "#6B7280" }}>
                      {doc.doc_source_publisher ?? "—"}
                      {doc.update_cadence && ` · ${doc.update_cadence}`}
                    </p>
                    {doc.summary && (
                      <p className="text-xs leading-relaxed line-clamp-3" style={{ color: "#4B5563" }}>
                        {doc.summary}
                      </p>
                    )}
                  </article>
                ))}
              </div>
              {label.href && (
                <div className="mt-4 text-right">
                  <Link
                    to={label.href}
                    className="text-xs underline-offset-4 hover:underline"
                    style={{ color: label.accent }}
                  >
                    Visit {label.short} kete →
                  </Link>
                </div>
              )}
            </section>
          );
        })}
      </main>

      <BrandFooter />
    </LightPageShell>
  );
}

const KeteTab: React.FC<{
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  accent: string;
}> = ({ active, onClick, label, count, accent }) => (
  <button
    onClick={onClick}
    className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
    style={{
      background: active ? accent : "rgba(255,255,255,0.7)",
      color: active ? "#FFF" : "#3D4250",
      border: `1px solid ${active ? accent : "rgba(255,255,255,0.6)"}`,
      boxShadow: active ? `0 4px 12px ${accent}40` : "0 1px 4px rgba(0,0,0,0.04)",
    }}
  >
    {label} <span style={{ opacity: 0.7 }}>· {count}</span>
  </button>
);
