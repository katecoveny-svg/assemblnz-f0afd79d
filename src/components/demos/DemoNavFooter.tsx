import { Link, useLocation } from "react-router-dom";
import { ArrowRight, Copy, MessageCircle, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export const DEMO_SEQUENCE = [
  { slug: "pipeline", title: "Five-stage pipeline", path: "/demos/pipeline" },
  { slug: "evidence-pack", title: "Evidence pack", path: "/demos/evidence-pack" },
  { slug: "confidence-scoring", title: "Confidence scoring", path: "/demos/confidence-scoring" },
  { slug: "kaitiaki-gate", title: "Kaitiaki gate", path: "/demos/kaitiaki-gate" },
];

export const DEMO_PROVES: Record<string, string> = {
  pipeline: "Every output is governed. Nothing bypasses the pipeline.",
  "evidence-pack": "We produce audit-grade evidence, not chat replies.",
  "confidence-scoring": "Every claim is cited. No hallucinations.",
  "kaitiaki-gate": "Tikanga posture, not a compliance label.",
};

export const DemoBreadcrumb = ({ title }: { title: string }) => (
  <nav className="flex items-center gap-2 text-[11px] mb-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(245,240,232,0.45)" }}>
    <Link to="/demos" className="hover:text-white/70 transition-colors">Demos</Link>
    <ChevronRight size={10} />
    <span style={{ color: "rgba(245,240,232,0.7)" }}>{title}</span>
  </nav>
);

export const DemoProvesCard = ({ slug }: { slug: string }) => {
  const proves = DEMO_PROVES[slug];
  if (!proves) return null;
  return (
    <div className="rounded-xl px-4 py-3 mb-8" style={{ background: "rgba(58,125,110,0.08)", border: "1px solid rgba(58,125,110,0.2)" }}>
      <p className="text-[11px] tracking-[2px] uppercase mb-1" style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(79,228,167,0.7)" }}>What this proves</p>
      <p className="text-[13px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(245,240,232,0.8)" }}>{proves}</p>
    </div>
  );
};

export const DemoBottomNav = () => {
  const location = useLocation();
  const currentIdx = DEMO_SEQUENCE.findIndex(d => d.path === location.pathname);
  const next = currentIdx >= 0 && currentIdx < DEMO_SEQUENCE.length - 1
    ? DEMO_SEQUENCE[currentIdx + 1]
    : null;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied");
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-20 pt-10">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl p-5"
        style={{ background: "rgba(245,240,232,0.03)", border: "1px solid rgba(245,240,232,0.06)" }}>
        <div className="flex items-center gap-4">
          {next ? (
            <Link to={next.path} className="inline-flex items-center gap-2 text-[13px] font-medium hover:gap-3 transition-all" style={{ color: "#4AA5A8" }}>
              Next demo: {next.title} <ArrowRight size={14} />
            </Link>
          ) : (
            <Link to="/demos" className="inline-flex items-center gap-2 text-[13px] font-medium hover:gap-3 transition-all" style={{ color: "#4AA5A8" }}>
              Back to demo hub <ArrowRight size={14} />
            </Link>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleShare}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] transition-colors hover:bg-white/[0.04]"
            style={{ border: "1px solid rgba(245,240,232,0.1)", color: "rgba(245,240,232,0.6)" }}>
            <Copy size={12} /> Share this demo
          </button>
          <Link to="/contact?topic=demo"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] transition-colors hover:bg-white/[0.04]"
            style={{ border: "1px solid rgba(245,240,232,0.1)", color: "rgba(245,240,232,0.6)" }}>
            <MessageCircle size={12} /> Questions?
          </Link>
        </div>
      </div>
    </div>
  );
};
