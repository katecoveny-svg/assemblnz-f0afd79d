/**
 * AkoTransparencyPackGenerator — interactive demo that calls the
 * ako-transparency-pack edge function and renders the four whānau-facing
 * documents with copy-to-clipboard + download. Used inside the AKO
 * landing page below the workflow explorer.
 *
 * HIGH-RISK kete: every output is watermarked DRAFT and requires
 * head-teacher sign-off before issuing.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Copy, Check, Download, FileText, Loader2, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AKO_BLUE = "#7BA7C7";

interface CentreState {
  name: string;
  licenceNumber: string;
  manager: string;
  address: string;
  lastEroReview: string;
  policies: string;
}

interface DocResp {
  complaints: string;
  ero: string;
  licensing: string;
  operational: string;
}

interface PackResponse {
  ok: boolean;
  version: string;
  generatedAt: string;
  mode: "ai" | "fallback";
  modelNote?: string;
  documents: DocResp;
  error?: string;
}

const TABS: Array<{ id: keyof DocResp; label: string }> = [
  { id: "complaints",  label: "Complaints" },
  { id: "ero",         label: "ERO access" },
  { id: "licensing",   label: "Licensing" },
  { id: "operational", label: "Operational" },
];

const DEFAULT_STATE: CentreState = {
  name: "Tūi & Pīwakawaka ECC",
  licenceNumber: "60-1234",
  manager: "Ngaire Williams",
  address: "12 Karaka Street, Mount Eden, Auckland",
  lastEroReview: "March 2024",
  policies: [
    "Behaviour management policy",
    "Sleep & rest policy",
    "Excursions policy",
    "Sun safety policy",
    "Food safety policy",
    "Emergency response & evacuation plan",
  ].join("\n"),
};

export default function AkoTransparencyPackGenerator() {
  const [state, setState] = useState<CentreState>(DEFAULT_STATE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pack, setPack] = useState<PackResponse | null>(null);
  const [activeTab, setActiveTab] = useState<keyof DocResp>("complaints");
  const [copiedTab, setCopiedTab] = useState<keyof DocResp | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    setPack(null);
    try {
      const { data, error } = await supabase.functions.invoke<PackResponse>(
        "ako-transparency-pack",
        {
          body: {
            centre: {
              name: state.name,
              licenceNumber: state.licenceNumber,
              manager: state.manager,
              address: state.address,
              lastEroReview: state.lastEroReview,
              policiesHeld: state.policies.split("\n").map((s) => s.trim()).filter(Boolean),
            },
            voice: "warm",
          },
        },
      );
      if (error) throw new Error(error.message);
      if (!data?.ok) throw new Error(data?.error ?? "Generation failed");
      setPack(data);
      setActiveTab("complaints");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  function copyDoc(id: keyof DocResp) {
    if (!pack) return;
    navigator.clipboard.writeText(pack.documents[id]);
    setCopiedTab(id);
    setTimeout(() => setCopiedTab(null), 1500);
  }

  function downloadDoc(id: keyof DocResp) {
    if (!pack) return;
    const blob = new Blob([pack.documents[id]], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const safeName = state.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
    a.download = `${safeName}-${id}-${pack.version}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div
      className="rounded-3xl p-6 sm:p-8"
      style={{
        background: "rgba(255,255,255,0.7)",
        backdropFilter: "blur(20px) saturate(140%)",
        border: "1px solid rgba(255,255,255,0.9)",
        boxShadow: "0 10px 40px -10px rgba(123,167,199,0.18)",
      }}
    >
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <p
            className="text-[10px] tracking-[3px] uppercase mb-1"
            style={{ color: AKO_BLUE, fontFamily: "'IBM Plex Mono', monospace" }}
          >
            NOVA-AKO · Workflow 2 · Live
          </p>
          <h3 className="text-xl sm:text-2xl font-light" style={{ color: "#3D4250" }}>
            Transparency pack generator
          </h3>
          <p className="text-sm mt-1" style={{ color: "#6B7280" }}>
            Four whānau-facing documents in the centre voice — every one DRAFT for head-teacher sign-off.
          </p>
        </div>
        <div
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] tracking-[2px] uppercase"
          style={{ background: "#FEF3C7", color: "#92400E", fontFamily: "'IBM Plex Mono', monospace" }}
        >
          <AlertTriangle size={10} /> High-risk kete
        </div>
      </div>

      {/* Centre form */}
      <div className="grid sm:grid-cols-2 gap-3 mb-4">
        <Field label="Centre name"   value={state.name}          onChange={(v) => setState({ ...state, name: v })} />
        <Field label="Licence #"     value={state.licenceNumber} onChange={(v) => setState({ ...state, licenceNumber: v })} />
        <Field label="Service manager" value={state.manager}     onChange={(v) => setState({ ...state, manager: v })} />
        <Field label="Last ERO review" value={state.lastEroReview} onChange={(v) => setState({ ...state, lastEroReview: v })} />
      </div>
      <Field label="Address" value={state.address} onChange={(v) => setState({ ...state, address: v })} />
      <div className="mt-3">
        <label className="block text-[10px] tracking-[2px] uppercase mb-1.5"
          style={{ color: "#6B7280", fontFamily: "'IBM Plex Mono', monospace" }}>
          Policies held (one per line)
        </label>
        <textarea
          value={state.policies}
          onChange={(e) => setState({ ...state, policies: e.target.value })}
          rows={6}
          className="w-full text-sm rounded-xl px-3 py-2 outline-none transition-all"
          style={{
            background: "rgba(255,255,255,0.7)",
            border: "1px solid rgba(123,167,199,0.2)",
            color: "#3D4250",
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "12px",
          }}
        />
      </div>

      <button
        onClick={generate}
        disabled={loading}
        className="mt-4 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-60"
        style={{ background: AKO_BLUE, color: "#fff" }}
      >
        {loading
          ? (<><Loader2 size={14} className="animate-spin" /> Generating pack…</>)
          : (<><Sparkles size={14} /> Generate transparency pack</>)}
      </button>

      {error && (
        <div className="mt-4 p-3 rounded-xl text-sm"
             style={{ background: "#FEF2F2", color: "#991B1B", border: "1px solid #FECACA" }}>
          {error}
        </div>
      )}

      <AnimatePresence>
        {pack && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] tracking-[2px] uppercase"
                 style={{ color: "#6B7280", fontFamily: "'IBM Plex Mono', monospace" }}>
                MANA · Pack {pack.version} · {pack.mode === "ai" ? "AI-drafted" : "deterministic fallback"}
              </p>
              <p className="text-[10px]" style={{ color: "#6B7280" }}>
                {new Date(pack.generatedAt).toLocaleString("en-NZ")}
              </p>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-3">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all"
                  style={{
                    background: activeTab === t.id ? AKO_BLUE : "rgba(123,167,199,0.1)",
                    color: activeTab === t.id ? "#fff" : "#3D4250",
                  }}
                >
                  <FileText size={11} /> {t.label}
                </button>
              ))}
            </div>

            {/* Doc body */}
            <div
              className="rounded-2xl p-4 sm:p-5 max-h-[420px] overflow-y-auto"
              style={{ background: "transparent", border: "1px solid rgba(123,167,199,0.15)" }}
            >
              <pre className="text-[12.5px] leading-[1.7] whitespace-pre-wrap font-sans"
                   style={{ color: "#3D4250" }}>
                {pack.documents[activeTab]}
              </pre>
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              <button
                onClick={() => copyDoc(activeTab)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
                style={{ background: "rgba(123,167,199,0.1)", color: "#3D4250" }}
              >
                {copiedTab === activeTab
                  ? (<><Check size={11} /> Copied</>)
                  : (<><Copy size={11} /> Copy markdown</>)}
              </button>
              <button
                onClick={() => downloadDoc(activeTab)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
                style={{ background: "rgba(123,167,199,0.1)", color: "#3D4250" }}
              >
                <Download size={11} /> Download .md
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-[10px] tracking-[2px] uppercase mb-1.5"
        style={{ color: "#6B7280", fontFamily: "'IBM Plex Mono', monospace" }}>
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-sm rounded-xl px-3 py-2 outline-none"
        style={{
          background: "rgba(255,255,255,0.7)",
          border: "1px solid rgba(123,167,199,0.2)",
          color: "#3D4250",
        }}
      />
    </div>
  );
}
