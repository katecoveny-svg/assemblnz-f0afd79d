// ═══════════════════════════════════════════════════════════════
// KnowledgeSourcesStrip — drop-in section that surfaces the live
// authoritative sources powering a given kete. Reads from
// industry_knowledge_base, shows count, top tier-1 docs, and links
// to the full /knowledge catalogue. Light glass aesthetic.
// ═══════════════════════════════════════════════════════════════
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, ExternalLink, ArrowRight, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { KETE_BY_CODE } from "@/data/keteLabels";

interface KnowledgeDoc {
  id: string;
  doc_title: string;
  doc_source_url: string | null;
  doc_source_publisher: string | null;
  tier: number;
  update_cadence: string | null;
  last_fetched_at: string | null;
}

interface Props {
  /** kete code as stored in industry_knowledge_base.kete (e.g. "MANAAKI") */
  keteCode: string;
  /** include OPEN_DATA cross-cutting sources too */
  includeOpenData?: boolean;
  /** override the heading copy */
  heading?: string;
  /** subtle vs prominent variant */
  tone?: "subtle" | "prominent";
}

const KnowledgeSourcesStrip: React.FC<Props> = ({
  keteCode,
  includeOpenData = true,
  heading,
  tone = "prominent",
}) => {
  const [docs, setDocs] = useState<KnowledgeDoc[]>([]);
  const [counts, setCounts] = useState<{ kete: number; openData: number } | null>(null);
  const label = KETE_BY_CODE[keteCode];

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const codes = includeOpenData ? [keteCode, "OPEN_DATA"] : [keteCode];
      const { data: top } = await supabase
        .from("industry_knowledge_base")
        .select("id, doc_title, doc_source_url, doc_source_publisher, tier, update_cadence, last_fetched_at")
        .in("kete", codes)
        .order("tier", { ascending: true })
        .order("doc_title", { ascending: true })
        .limit(8);
      if (cancelled) return;
      setDocs((top ?? []) as KnowledgeDoc[]);

      const { data: all } = await supabase
        .from("industry_knowledge_base")
        .select("kete")
        .in("kete", codes);
      if (cancelled) return;
      const k = (all ?? []).filter((r) => r.kete === keteCode).length;
      const o = (all ?? []).filter((r) => r.kete === "OPEN_DATA").length;
      setCounts({ kete: k, openData: o });
    })();
    return () => { cancelled = true; };
  }, [keteCode, includeOpenData]);

  if (!label) return null;
  const total = (counts?.kete ?? 0) + (includeOpenData ? counts?.openData ?? 0 : 0);

  return (
    <section
      className="relative rounded-3xl p-8 md:p-10 my-16 mx-4 md:mx-0 overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.65)",
        backdropFilter: "blur(22px) saturate(160%)",
        WebkitBackdropFilter: "blur(22px) saturate(160%)",
        border: "1px solid rgba(255,255,255,0.6)",
        boxShadow:
          "10px 10px 28px rgba(166,166,180,0.22), -8px -8px 24px rgba(255,255,255,0.95), inset 0 2px 0 rgba(255,255,255,0.95)",
      }}
    >
      <div
        className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${label.accent}, transparent 70%)` }}
      />

      <header className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck size={16} style={{ color: label.accent }} />
            <span className="text-xs uppercase tracking-[0.2em] font-medium" style={{ color: label.accent }}>
              Live knowledge base
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-light tracking-tight" style={{ color: "#1A1D29" }}>
            {heading ?? `${total} authoritative sources powering ${label.short}`}
          </h2>
          <p className="text-sm md:text-base mt-2 max-w-2xl" style={{ color: "#6B7280" }}>
            Every {label.short} agent answer is grounded in {counts?.kete ?? "—"} {label.english.toLowerCase()} sources
            {includeOpenData ? ` plus ${counts?.openData ?? "—"} cross-cutting NZ open datasets` : ""}.
            Refreshed via Firecrawl, hashed for change detection, then chunked for retrieval.
          </p>
        </div>
        <Link
          to="/knowledge"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all hover:gap-3"
          style={{
            background: "rgba(255,255,255,0.85)",
            border: `1px solid ${label.accent}40`,
            color: label.accent,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          View full catalogue <ArrowRight size={14} />
        </Link>
      </header>

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {docs.map((doc) => (
          <li
            key={doc.id}
            className="rounded-2xl p-4 flex items-start gap-3 group transition-all hover:-translate-y-0.5"
            style={{
              background: "rgba(255,255,255,0.55)",
              border: "1px solid rgba(255,255,255,0.7)",
              boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
            }}
          >
            <BookOpen size={16} className="mt-1 flex-shrink-0" style={{ color: label.accent }} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded"
                  style={{ background: `${label.accent}20`, color: label.accent }}
                >
                  Tier {doc.tier}
                </span>
                {doc.last_fetched_at && (
                  <span className="text-[10px] uppercase tracking-wider" style={{ color: "#3A7D6E" }}>● live</span>
                )}
              </div>
              <p className="text-sm font-medium leading-snug mb-1 line-clamp-2" style={{ color: "#1A1D29" }}>
                {doc.doc_title}
              </p>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs truncate" style={{ color: "#6B7280" }}>
                  {doc.doc_source_publisher ?? "—"} {doc.update_cadence && `· ${doc.update_cadence}`}
                </p>
                {doc.doc_source_url && (
                  <a
                    href={doc.doc_source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: label.accent }}
                    aria-label={`Open ${doc.doc_title}`}
                  >
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          </li>
        ))}
        {docs.length === 0 && (
          <li className="col-span-full text-center text-sm py-8" style={{ color: "#9CA3AF" }}>
            Loading sources…
          </li>
        )}
      </ul>
    </section>
  );
};

export default KnowledgeSourcesStrip;
