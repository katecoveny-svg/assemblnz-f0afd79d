import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Calendar, Users, DollarSign, Compass, Loader2, ChevronDown, ChevronRight, UtensilsCrossed, Bed, Lightbulb, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const NZ_REGIONS = [
  "Northland", "Auckland", "Waikato", "Bay of Plenty", "Gisborne",
  "Hawke's Bay", "Taranaki", "Manawatū-Whanganui", "Wellington",
  "Tasman", "Nelson", "Marlborough", "West Coast", "Canterbury",
  "Otago", "Southland", "South Island", "North Island",
];

const INTEREST_OPTIONS = [
  "Adventure", "Nature", "Food & Wine", "Culture", "Hiking",
  "Beach", "Snow Sports", "Hot Springs", "Māori Heritage",
  "Wildlife", "Photography", "Family Friendly", "Luxury", "Budget",
];

const ACCOM_STYLES = [
  { value: "budget", label: "Budget (hostels, camping, DOC huts)" },
  { value: "mixed", label: "Mixed (motels, Airbnb, some splurges)" },
  { value: "comfort", label: "Comfort (hotels, B&Bs)" },
  { value: "luxury", label: "Luxury (lodges, boutique hotels)" },
];

interface Activity {
  time: string;
  name: string;
  description: string;
  duration?: string;
  costNzd?: number;
  bookingRequired?: boolean;
  type?: string;
}

interface DayPlan {
  day: number;
  date?: string;
  title: string;
  activities: Activity[];
  meals?: { breakfast?: string; lunch?: string; dinner?: string };
  accommodation?: { name?: string; type?: string; costNzd?: number };
  tips?: string[];
  estimatedCostNzd?: number;
}

interface ItineraryResult {
  itinerary: DayPlan[];
  summary: string;
  totalEstimatedCostNzd: number;
  bestTimeToBook?: string;
  packingTips?: string[];
}

const activityTypeColors: Record<string, string> = {
  adventure: "#3A7D6E",
  culture: "#4AA5A8",
  nature: "#5AADA0",
  food: "#A8DDDB",
  relaxation: "#6B8FA3",
};

export default function OdysseyTravelPlanner() {
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [travellers, setTravellers] = useState(2);
  const [budget, setBudget] = useState(2000);
  const [interests, setInterests] = useState<string[]>([]);
  const [accomStyle, setAccomStyle] = useState("mixed");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ItineraryResult | null>(null);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  const toggleInterest = (i: string) => {
    setInterests(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  };

  const generateItinerary = async () => {
    if (!destination) { toast.error("Pick a destination first!"); return; }
    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("odyssey-travel", {
        body: {
          action: "generate",
          destination,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          travellers,
          budgetNzd: budget,
          interests,
          accommodationStyle: accomStyle,
        },
      });

      if (error) throw error;
      if (data?.data) {
        setResult(data.data);
        setExpandedDay(0);
        toast.success("Itinerary ready! 🗺️");
      } else {
        throw new Error(data?.error || "Failed to generate");
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to generate itinerary");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Planner Form ── */}
      <div className="rounded-2xl border p-6" style={{
        background: "linear-gradient(145deg, rgba(255,255,255,0.78), rgba(255,255,255,0.62))",
        borderColor: "rgba(255,255,255,0.5)",
      }}>
        <div className="flex items-center gap-2 mb-5">
          <Compass className="w-5 h-5" style={{ color: "#4AA5A8" }} />
          <h2 className="text-lg font-light text-foreground tracking-wide" style={{ fontFamily: "'Lato', sans-serif" }}>
            Plan Your Trip
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
          {/* Destination */}
          <div>
            <label className="text-[10px] text-[#9CA3AF] uppercase tracking-wider mb-1 block">Destination</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <select
                value={destination}
                onChange={e => setDestination(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg text-sm text-foreground border"
                style={{ background: "rgba(255,255,255,0.5)", borderColor: "rgba(255,255,255,0.1)" }}
              >
                <option value="">Choose region...</option>
                {NZ_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          {/* Dates */}
          <div>
            <label className="text-[10px] text-[#9CA3AF] uppercase tracking-wider mb-1 block">Start Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg text-sm text-foreground border"
                style={{ background: "rgba(255,255,255,0.5)", borderColor: "rgba(255,255,255,0.1)" }}
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] text-[#9CA3AF] uppercase tracking-wider mb-1 block">End Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg text-sm text-foreground border"
                style={{ background: "rgba(255,255,255,0.5)", borderColor: "rgba(255,255,255,0.1)" }}
              />
            </div>
          </div>

          {/* Travellers */}
          <div>
            <label className="text-[10px] text-[#9CA3AF] uppercase tracking-wider mb-1 block">Travellers</label>
            <div className="relative">
              <Users className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input type="number" min={1} max={20} value={travellers} onChange={e => setTravellers(Number(e.target.value))}
                className="w-full pl-9 pr-3 py-2 rounded-lg text-sm text-foreground border"
                style={{ background: "rgba(255,255,255,0.5)", borderColor: "rgba(255,255,255,0.1)" }}
              />
            </div>
          </div>

          {/* Budget */}
          <div>
            <label className="text-[10px] text-[#9CA3AF] uppercase tracking-wider mb-1 block">Budget (NZ$)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input type="number" min={200} step={100} value={budget} onChange={e => setBudget(Number(e.target.value))}
                className="w-full pl-9 pr-3 py-2 rounded-lg text-sm text-foreground border"
                style={{ background: "rgba(255,255,255,0.5)", borderColor: "rgba(255,255,255,0.1)" }}
              />
            </div>
          </div>

          {/* Accommodation */}
          <div>
            <label className="text-[10px] text-[#9CA3AF] uppercase tracking-wider mb-1 block">Accommodation</label>
            <select value={accomStyle} onChange={e => setAccomStyle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm text-foreground border"
              style={{ background: "rgba(255,255,255,0.5)", borderColor: "rgba(255,255,255,0.1)" }}
            >
              {ACCOM_STYLES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>

        {/* Interests */}
        <div className="mb-5">
          <label className="text-[10px] text-[#9CA3AF] uppercase tracking-wider mb-2 block">Interests</label>
          <div className="flex flex-wrap gap-2">
            {INTEREST_OPTIONS.map(i => (
              <button
                key={i}
                onClick={() => toggleInterest(i)}
                className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                style={{
                  background: interests.includes(i) ? "#4AA5A8" : "rgba(255,255,255,0.5)",
                  color: interests.includes(i) ? "#09090F" : "rgba(255,255,255,0.5)",
                  borderColor: interests.includes(i) ? "#4AA5A8" : "rgba(255,255,255,0.1)",
                  border: "1px solid",
                }}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={generateItinerary}
          disabled={loading || !destination}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-40"
          style={{ background: "#4AA5A8", color: "#09090F" }}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? "Planning your adventure..." : "Generate Itinerary"}
        </button>
      </div>

      {/* ── Results ── */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {/* Summary */}
            <div className="rounded-2xl border p-6 mb-4" style={{
              background: "linear-gradient(135deg, rgba(58,125,110,0.15), rgba(255,255,255,0.65))",
              borderColor: "rgba(58,125,110,0.2)",
            }}>
              <p className="text-[#3D4250] text-sm leading-relaxed mb-3">{result.summary}</p>
              <div className="flex flex-wrap gap-4 text-xs">
                <span className="text-gray-500">💰 Est. Total: <strong className="text-foreground">NZ${result.totalEstimatedCostNzd?.toLocaleString()}</strong></span>
                {result.bestTimeToBook && <span className="text-gray-500">📅 Book: <strong className="text-foreground">{result.bestTimeToBook}</strong></span>}
                <span className="text-gray-500">{result.itinerary?.length} days</span>
              </div>
              {result.packingTips && result.packingTips.length > 0 && (
                <div className="mt-3 pt-3 border-t" style={{ borderColor: "rgba(255,255,255,0.5)" }}>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Packing Tips</p>
                  <div className="flex flex-wrap gap-2">
                    {result.packingTips.map((tip, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-full text-gray-500" style={{ background: "rgba(255,255,255,0.5)" }}>
                        {tip}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Day-by-day */}
            <div className="space-y-2">
              {result.itinerary?.map((day, idx) => (
                <div key={idx} className="rounded-xl border overflow-hidden" style={{
                  background: "rgba(255,255,255,0.65)",
                  borderColor: expandedDay === idx ? "rgba(212,168,67,0.3)" : "rgba(255,255,255,0.5)",
                }}>
                  <button
                    onClick={() => setExpandedDay(expandedDay === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                        style={{ background: "rgba(212,168,67,0.15)", color: "#4AA5A8" }}>
                        {day.day}
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-foreground">{day.title}</h3>
                        {day.date && <p className="text-[10px] text-gray-400">{day.date}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {day.estimatedCostNzd && (
                        <span className="text-[10px] text-[#9CA3AF]">NZ${day.estimatedCostNzd}</span>
                      )}
                      {expandedDay === idx ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                    </div>
                  </button>

                  <AnimatePresence>
                    {expandedDay === idx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 space-y-3">
                          {/* Activities */}
                          {day.activities?.map((act, ai) => (
                            <div key={ai} className="flex gap-3 pl-2 border-l-2" style={{ borderColor: activityTypeColors[act.type || "nature"] || "#5AADA0" }}>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-gray-400 font-mono">{act.time}</span>
                                  <span className="text-xs text-foreground font-medium">{act.name}</span>
                                  {act.bookingRequired && (
                                    <span className="text-[8px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: "rgba(212,168,67,0.2)", color: "#4AA5A8" }}>BOOK</span>
                                  )}
                                </div>
                                <p className="text-[11px] text-[#9CA3AF] mt-0.5">{act.description}</p>
                                <div className="flex gap-3 mt-1 text-[10px] text-white/25">
                                  {act.duration && <span>{act.duration}</span>}
                                  {act.costNzd !== undefined && <span>💰 NZ${act.costNzd}</span>}
                                </div>
                              </div>
                            </div>
                          ))}

                          {/* Meals */}
                          {day.meals && (
                            <div className="flex gap-4 pt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.5)" }}>
                              <UtensilsCrossed className="w-3.5 h-3.5 text-white/20 mt-0.5 shrink-0" />
                              <div className="text-[10px] text-white/35 space-y-0.5">
                                {day.meals.breakfast && <p>{day.meals.breakfast}</p>}
                                {day.meals.lunch && <p>☀️ {day.meals.lunch}</p>}
                                {day.meals.dinner && <p>🌙 {day.meals.dinner}</p>}
                              </div>
                            </div>
                          )}

                          {/* Accommodation */}
                          {day.accommodation && (
                            <div className="flex gap-4 pt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.5)" }}>
                              <Bed className="w-3.5 h-3.5 text-white/20 mt-0.5 shrink-0" />
                              <div className="text-[10px] text-white/35">
                                <span className="text-gray-500">{day.accommodation.name}</span>
                                {day.accommodation.type && <span className="ml-2 text-white/25">({day.accommodation.type})</span>}
                                {day.accommodation.costNzd && <span className="ml-2">NZ${day.accommodation.costNzd}/night</span>}
                              </div>
                            </div>
                          )}

                          {/* Tips */}
                          {day.tips && day.tips.length > 0 && (
                            <div className="flex gap-4 pt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.5)" }}>
                              <Lightbulb className="w-3.5 h-3.5 text-white/20 mt-0.5 shrink-0" />
                              <div className="text-[10px] text-white/35 space-y-0.5">
                                {day.tips.map((tip, ti) => <p key={ti}>{tip}</p>)}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
