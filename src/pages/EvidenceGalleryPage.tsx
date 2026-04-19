import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ShieldCheck, FileText, ArrowRight, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import LightPageShell from "@/components/LightPageShell";
import { KETE_CONFIG } from "@/components/kete/KeteConfig";

const TEAL = "#4AA5A8";
const POUNAMU = "#3A7D6E";

interface PackRow {
  id: string;
  kete: string;
  action_type: string;
  watermark: string | null;
  signed_by: string | null;
  signed_at: string | null;
  created_at: string;
}

// Curated showcase examples — guarantees a populated gallery even when
// the live evidence_packs table is sparse.
const SHOWCASE: Array<{ kete: string; action_type: string; signed_by: string; days_ago: number; summary: string }> = [
  { kete: "manaaki", action_type: "Booking compliance pack", signed_by: "AURA · Front-of-house", days_ago: 1, summary: "Allergens cross-checked, alcohol licence verified, duty manager confirmed before guest arrival." },
  { kete: "waihanga", action_type: "Site safety induction", signed_by: "STRATA · H&S lead", days_ago: 2, summary: "PCBU obligations, hazard register, and contractor SWMS approved with timestamped sign-off chain." },
  { kete: "auaha", action_type: "Brand campaign approval", signed_by: "PRISM · Brand engine", days_ago: 3, summary: "Visual identity, copy compliance, FTA claim review and platform-specific brief packaged." },
  { kete: "arataki", action_type: "Vehicle delivery checklist", signed_by: "ROUTE · Service manager", days_ago: 4, summary: "WoF/CoF current, MVSA disclosures issued, customer guarantees acknowledged on handover." },
  { kete: "pikau", action_type: "Customs entry pack", signed_by: "BORDER · Customs broker", days_ago: 5, summary: "HS code validated, MPI biosecurity standards applied, landed-cost workings stored as evidence." },
  { kete: "manaaki", action_type: "Food safety verification", signed_by: "SAFFRON · Kitchen", days_ago: 6, summary: "Food Control Plan checks logged, allergen matrix cross-referenced against tonight's bookings." },
];

export default function EvidenceGalleryPage() {
  const [packs, setPacks] = useState<PackRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("evidence_packs")
        .select("id, kete, action_type, watermark, signed_by, signed_at, created_at")
        .order("created_at", { ascending: false })
        .limit(12);
      setPacks((data as PackRow[]) ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <LightPageShell>
      <SEO
        title="Evidence Pack gallery | Assembl"
        description="Browse recent (anonymised) evidence packs — the signed Proof-of-Life artefact every Assembl workflow produces."
        keywords="evidence pack, NZ compliance evidence, Assembl proof of life, governance audit"
      />
      <BrandNav />
      <main className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4" style={{ background: `${TEAL}14`, border: `1px solid ${TEAL}40` }}>
            <ShieldCheck size={13} style={{ color: TEAL }} />
            <span className="text-xs font-medium uppercase tracking-wider" style={{ color: TEAL, fontFamily: "'JetBrains Mono', monospace" }}>Proof of Life · Recent activity</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-light text-foreground mb-3">Every workflow leaves a paper trail</h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            An evidence pack is the signed, watermarked artefact every Assembl workflow produces — your audit-ready record of what was decided, when, by which agent, and against which NZ legislation.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            <>
              {packs.map((p, i) => <PackCard key={p.id} pack={p} index={i} />)}
              {SHOWCASE.slice(0, Math.max(0, 9 - packs.length)).map((s, i) => (
                <ShowcaseCard key={`s-${i}`} item={s} index={packs.length + i} />
              ))}
            </>
          )}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-12 p-6 rounded-2xl text-center" style={{ background: "rgba(74,165,168,0.06)", border: `1px solid ${TEAL}22` }}>
          <Sparkles size={18} style={{ color: TEAL, margin: "0 auto 8px" }} />
          <p className="text-sm mb-4" style={{ color: "#3D4250" }}>Run a workflow, get a pack like this.</p>
          <Link to="/workflows" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium" style={{ background: TEAL, color: "white" }}>
            Try a workflow <ArrowRight size={14} />
          </Link>
        </motion.div>
      </main>
      <BrandFooter />
    </LightPageShell>
  );
}

function PackCard({ pack, index }: { pack: PackRow; index: number }) {
  const kete = KETE_CONFIG.find((k) => k.id === pack.kete);
  const accent = kete?.color ?? TEAL;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.5 }}
      className="p-5 rounded-2xl relative overflow-hidden"
      style={{ background: "rgba(255,255,255,0.85)", border: `1px solid ${accent}30`, backdropFilter: "blur(20px)", boxShadow: `0 8px 24px -10px ${accent}25` }}
    >
      <div className="absolute top-0 right-0 px-2.5 py-1 rounded-bl-lg text-[10px] font-medium uppercase tracking-wider" style={{ background: `${accent}15`, color: accent, fontFamily: "'JetBrains Mono', monospace" }}>
        {kete?.name ?? pack.kete}
      </div>
      <FileText size={20} style={{ color: accent, marginBottom: 10 }} />
      <h3 className="text-sm font-medium mb-2" style={{ color: "#3D4250" }}>{pack.action_type}</h3>
      <div className="text-[11px] space-y-1" style={{ color: "#5B6374", fontFamily: "'JetBrains Mono', monospace" }}>
        {pack.signed_by && <div>Signed by · {pack.signed_by}</div>}
        <div>Watermark · {pack.watermark?.slice(0, 12) ?? pack.id.slice(0, 8)}…</div>
        <div>{timeAgo(new Date(pack.created_at))}</div>
      </div>
    </motion.div>
  );
}

function ShowcaseCard({ item, index }: { item: typeof SHOWCASE[number]; index: number }) {
  const kete = KETE_CONFIG.find((k) => k.id === item.kete);
  const accent = kete?.color ?? TEAL;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.5 }}
      className="p-5 rounded-2xl relative overflow-hidden"
      style={{ background: "rgba(255,255,255,0.7)", border: `1px solid ${accent}25`, backdropFilter: "blur(20px)", boxShadow: `0 8px 24px -10px ${accent}1f` }}
    >
      <div className="absolute top-0 right-0 px-2.5 py-1 rounded-bl-lg text-[10px] font-medium uppercase tracking-wider" style={{ background: `${accent}15`, color: accent, fontFamily: "'JetBrains Mono', monospace" }}>
        {kete?.name ?? item.kete} · sample
      </div>
      <FileText size={20} style={{ color: accent, marginBottom: 10 }} />
      <h3 className="text-sm font-medium mb-2" style={{ color: "#3D4250" }}>{item.action_type}</h3>
      <p className="text-xs mb-3" style={{ color: "#5B6374", lineHeight: 1.55 }}>{item.summary}</p>
      <div className="text-[11px] space-y-1" style={{ color: "#8B92A0", fontFamily: "'JetBrains Mono', monospace" }}>
        <div>Signed by · {item.signed_by}</div>
        <div>{item.days_ago === 1 ? "Yesterday" : `${item.days_ago} days ago`}</div>
      </div>
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className="p-5 rounded-2xl h-44 animate-pulse" style={{ background: "rgba(74,165,168,0.06)" }}>
      <div className="h-5 w-5 rounded mb-3" style={{ background: "rgba(74,165,168,0.15)" }} />
      <div className="h-3 w-3/4 rounded mb-3" style={{ background: "rgba(74,165,168,0.15)" }} />
      <div className="h-3 w-1/2 rounded" style={{ background: "rgba(74,165,168,0.1)" }} />
    </div>
  );
}

function timeAgo(d: Date): string {
  const ms = Date.now() - d.getTime();
  const m = Math.floor(ms / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
