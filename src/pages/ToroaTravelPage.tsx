import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Compass, Loader2, Send, Sparkles } from "lucide-react";

const TEAL = "#4AA5A8";
const CHARCOAL = "#3D4250";

const EXAMPLES = [
  "12 days Italy end of June. Rome → Florence → Cinque Terre → Lake Como. Two families, 4 adults 3 kids. Mix of culture and food.",
  "Long weekend Coromandel for the Wilson and Patel whānau, March 2026. Beach, hot pools, easy walks. Drive from Auckland.",
  "5 days South Island for 2 families with kids 6–10. Queenstown + Wānaka, mid-July, snow-friendly. Budget conscious.",
  "School holidays Northland — 7 days, Bay of Islands and Cape Reinga. One family, 2 adults 3 teens. Camping + lodges.",
];

export default function ToroaTravelPage() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    document.title = "Plan an Italy trip with Voyage | Assembl";
    const desc = "Multi-family Italy trip planner — describe your trip, get destinations, day-by-day itinerary, families on a live map.";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) { meta = document.createElement("meta"); meta.setAttribute("name", "description"); document.head.appendChild(meta); }
    meta.setAttribute("content", desc);
    inputRef.current?.focus();
  }, []);

  const submit = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true); setError(null); setStatus("Voyage is reading your brief…");
    try {
      setTimeout(() => setStatus("Picking destinations and dates…"), 800);
      setTimeout(() => setStatus("Building day-by-day itinerary…"), 2400);
      setTimeout(() => setStatus("Plotting families and convoys on the map…"), 4200);

      const { data, error } = await supabase.functions.invoke("voyage-agent", {
        body: { mode: "natural", prompt },
      });
      if (error) throw error;
      if (!data?.trip_id) throw new Error(data?.error || "No trip returned");
      setStatus("Trip ready — opening Command Mode…");
      navigate(`/voyage/command?trip=${data.trip_id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Voyage couldn't plan that trip. Try a more specific brief.");
      setLoading(false); setStatus("");
    }
  };

  return (
    <main className="min-h-screen" style={{ background: "transparent" }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-24">
        <Link to="/toro" className="inline-flex items-center gap-2 text-sm hover:opacity-70 mb-8" style={{ color: "#9CA3AF" }}>
          <ArrowLeft className="w-4 h-4" /> Back to Tōro
        </Link>

        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: `${TEAL}15`, border: `1px solid ${TEAL}30` }}>
              <Compass className="w-5 h-5" style={{ color: TEAL }} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: TEAL }}>Voyage Agent · Italy preset</p>
              <h1 className="font-display text-3xl sm:text-4xl" style={{ fontWeight: 300, color: CHARCOAL }}>Plan a multi-family trip</h1>
            </div>
          </div>
          <p className="text-sm leading-relaxed max-w-xl" style={{ color: "#6B7280" }}>
            Describe your trip in plain English. Voyage builds the destinations, day-by-day itinerary, family convoys and live map — and drops you into Command Mode the moment it's ready.
          </p>
        </header>

        <div className="rounded-3xl overflow-hidden shadow-sm" style={{ background: "white", border: `1px solid ${TEAL}20` }}>
          <textarea
            ref={inputRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit(); }}
            placeholder="e.g. 12 days Italy end of June. Rome, Florence, Cinque Terre, Lake Como. Two families, mix of culture and food…"
            rows={5}
            className="w-full p-5 text-sm outline-none resize-none bg-transparent"
            style={{ color: CHARCOAL }}
            disabled={loading}
          />
          <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: `1px solid ${TEAL}15` }}>
            <p className="text-xs" style={{ color: "#9CA3AF" }}>⌘/Ctrl + Enter to submit</p>
            <button
              onClick={submit}
              disabled={loading || !prompt.trim()}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium disabled:opacity-40 transition-opacity"
              style={{ background: TEAL, color: "white" }}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {loading ? "Building…" : "Plan trip"}
            </button>
          </div>
        </div>

        {status && (
          <div className="mt-4 flex items-center gap-2 text-sm" style={{ color: TEAL }}>
            <Sparkles className="w-4 h-4" /> {status}
          </div>
        )}
        {error && (
          <div className="mt-4 rounded-2xl p-4 text-sm" style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#991B1B" }}>
            {error}
          </div>
        )}

        <div className="mt-12">
          <p className="text-xs uppercase tracking-[0.2em] mb-4" style={{ color: "#9CA3AF" }}>Example briefs</p>
          <div className="space-y-2">
            {EXAMPLES.map((ex, i) => (
              <button
                key={i}
                onClick={() => { setPrompt(ex); inputRef.current?.focus(); }}
                disabled={loading}
                className="block w-full text-left rounded-2xl p-4 text-sm hover:shadow-sm transition-all"
                style={{ background: "white", border: `1px solid ${TEAL}15`, color: CHARCOAL }}
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
