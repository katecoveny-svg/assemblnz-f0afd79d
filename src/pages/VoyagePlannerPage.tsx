import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Compass, Loader2, Send, Sparkles } from "lucide-react";

const KOWHAI = "#4AA5A8";
const POUNAMU = "#3A7D6E";
const CHARCOAL = "#3D4250";

const EXAMPLES = [
  "5 days South Island for 2 families with kids 6–10. Queenstown + Wānaka, mid-July, snow-friendly. Budget conscious.",
  "Long weekend Coromandel for the Wilson and Patel whānau, March 2026. Beach, hot pools, easy walks. Drive from Auckland.",
  "Italy 12 days end of June. Rome → Florence → Cinque Terre → Lake Como. Two families, 4 adults 3 kids. Mix of culture and food.",
  "School holidays Northland — 7 days, Bay of Islands and Cape Reinga. One family, 2 adults 3 teens. Camping + lodges.",
];

export default function VoyagePlannerPage() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    document.title = "Plan a trip with Voyage | Assembl";
    const desc = "Voyage agent — describe your trip in plain English and get a fully built multi-family itinerary with map, convoys and day-by-day plan.";
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
    <main className="min-h-screen" style={{ background: "#FAFBFC" }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-24">
        <Link to="/toro/dashboard" className="inline-flex items-center gap-2 text-sm hover:opacity-70 transition-opacity mb-8" style={{ color: "#9CA3AF" }}>
          <ArrowLeft className="w-4 h-4" /> Back to Tōro
        </Link>

        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: `${KOWHAI}15`, border: `1px solid ${KOWHAI}30` }}>
              <Compass className="w-5 h-5" style={{ color: KOWHAI }} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: KOWHAI }}>Voyage Agent</p>
              <h1 className="font-display text-3xl sm:text-4xl" style={{ fontWeight: 300, color: CHARCOAL }}>Plan a trip</h1>
            </div>
          </div>
          <p className="text-sm leading-relaxed max-w-xl" style={{ color: "#6B7280" }}>
            Describe your trip in plain English. Voyage builds the destinations, day-by-day itinerary, family convoys
            and live map — and drops you into Command Mode the moment it's ready.
          </p>
        </header>

        {/* Composer */}
        <div className="rounded-3xl overflow-hidden shadow-sm" style={{ background: "white", border: `1px solid ${KOWHAI}20` }}>
          <textarea
            ref={inputRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit(); }}
            disabled={loading}
            rows={5}
            placeholder="e.g. 5 days South Island for the Smith and Tane families, kids 6–10, snow-friendly, mid-July, budget about $3k each…"
            className="w-full p-5 text-sm resize-none outline-none bg-transparent"
            style={{ color: CHARCOAL, fontFamily: "Lato, sans-serif" }}
          />
          <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: `${KOWHAI}15`, background: "rgba(74,165,168,0.04)" }}>
            <p className="text-[10px]" style={{ color: "#9CA3AF" }}>⌘/Ctrl + Enter to send</p>
            <button
              onClick={submit}
              disabled={loading || !prompt.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all disabled:opacity-40"
              style={{ background: KOWHAI, color: "white" }}
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              {loading ? "Planning…" : "Plan trip"}
            </button>
          </div>
        </div>

        {/* Status */}
        {loading && (
          <div className="mt-4 rounded-2xl p-4 flex items-center gap-3" style={{ background: `${POUNAMU}08`, border: `1px solid ${POUNAMU}20` }}>
            <Loader2 className="w-4 h-4 animate-spin" style={{ color: POUNAMU }} />
            <p className="text-xs" style={{ color: POUNAMU }}>{status}</p>
          </div>
        )}
        {error && (
          <div className="mt-4 rounded-2xl p-4" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <p className="text-xs" style={{ color: "#dc2626" }}>{error}</p>
          </div>
        )}

        {/* Examples */}
        {!loading && (
          <section className="mt-10">
            <p className="text-[10px] uppercase tracking-[0.2em] mb-3 flex items-center gap-2" style={{ color: "#9CA3AF" }}>
              <Sparkles className="w-3 h-3" /> Try one of these
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {EXAMPLES.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => { setPrompt(ex); inputRef.current?.focus(); }}
                  className="text-left rounded-2xl p-4 hover:shadow-sm transition-all"
                  style={{ background: "white", border: `1px solid ${KOWHAI}15`, color: CHARCOAL }}
                >
                  <p className="text-xs leading-relaxed">{ex}</p>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* How it works */}
        <section className="mt-12 rounded-3xl p-6" style={{ background: "white", border: `1px solid ${KOWHAI}10` }}>
          <p className="text-[10px] uppercase tracking-[0.2em] mb-4" style={{ color: KOWHAI }}>How Voyage works</p>
          <ol className="space-y-3 text-xs" style={{ color: CHARCOAL }}>
            <li className="flex gap-3"><span className="font-mono" style={{ color: KOWHAI }}>01</span><span>You describe the trip — families, dates, vibe, budget.</span></li>
            <li className="flex gap-3"><span className="font-mono" style={{ color: KOWHAI }}>02</span><span>Voyage drafts destinations, days, activities and family convoys with real coordinates.</span></li>
            <li className="flex gap-3"><span className="font-mono" style={{ color: KOWHAI }}>03</span><span>You're dropped into <strong>Command Mode</strong> with a live map, timeline and day-by-day brief.</span></li>
            <li className="flex gap-3"><span className="font-mono" style={{ color: KOWHAI }}>04</span><span>Edit, share with the other whānau, and lock in bookings.</span></li>
          </ol>
        </section>
      </div>
    </main>
  );
}
