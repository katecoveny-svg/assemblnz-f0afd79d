import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Calendar, ShoppingCart, DollarSign, Bell, MessageSquare, BookOpen,
  Plus, Check, Trash2, Send, ExternalLink,
} from "lucide-react";
import toroaLogo from "@/assets/brand/toroa-logo.svg";
import KeteBrainChat from "@/components/KeteBrainChat";

const KOWHAI = "#D4A843";
const POUNAMU = "#3A7D6E";

const glass = (accent = KOWHAI) => ({
  background: "rgba(15,15,26,0.7)",
  border: `1px solid ${accent}18`,
  backdropFilter: "blur(12px)",
  boxShadow: `0 0 20px ${accent}06, 0 4px 20px rgba(0,0,0,0.3)`,
});

interface CalendarEvent {
  id: string;
  title: string;
  event_date: string;
  event_time: string | null;
  source: string;
  gear_list: string[] | null;
}

interface GroceryItem {
  name: string;
  checked: boolean;
}

export default function ToroaDashboard() {
  const [events] = useState<CalendarEvent[]>([
    { id: "1", title: "School assembly", event_date: "2026-04-06", event_time: "09:00", source: "school_notice", gear_list: null },
    { id: "2", title: "Rugby practice", event_date: "2026-04-07", event_time: "15:30", source: "manual", gear_list: ["mouthguard", "boots", "drink bottle"] },
    { id: "3", title: "Maths test — Year 8", event_date: "2026-04-08", event_time: null, source: "school_notice", gear_list: ["calculator", "ruler"] },
  ]);

  const [groceries, setGroceries] = useState<GroceryItem[]>([
    { name: "Milk (2L)", checked: false },
    { name: "Bread — Vogels", checked: false },
    { name: "Bananas", checked: true },
    { name: "Chicken thighs", checked: false },
    { name: "Broccoli", checked: false },
  ]);
  const [newItem, setNewItem] = useState("");

  const [reminders] = useState([
    { text: "Permission slip — camp (due Fri)", urgent: true },
    { text: "WoF due 15 April", urgent: false },
    { text: "Vet — Buddy's checkup next Tues", urgent: false },
  ]);

  const budget = { limit: 250, spent: 163, transactions: [
    { text: "Pak'n'Save", amount: 89 },
    { text: "Petrol", amount: 45 },
    { text: "School uniform shop", amount: 29 },
  ]};

  const addGrocery = () => {
    if (!newItem.trim()) return;
    setGroceries(prev => [...prev, { name: newItem.trim(), checked: false }]);
    setNewItem("");
  };

  const toggleGrocery = (idx: number) => {
    setGroceries(prev => prev.map((g, i) => i === idx ? { ...g, checked: !g.checked } : g));
  };

  const pct = Math.min(100, Math.round((budget.spent / budget.limit) * 100));
  const overBudget = budget.spent > budget.limit;

  return (
    <div className="min-h-screen" style={{ background: "#09090F" }}>
      {/* Top bar */}
      <header className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between" style={{ ...glass(), borderRadius: 0, borderTop: "none", borderLeft: "none", borderRight: "none" }}>
        <div className="flex items-center gap-3">
          <img src={toroaLogo} alt="Tōroa" className="w-8 h-8" style={{ filter: `drop-shadow(0 0 8px ${KOWHAI}30)` }} />
          <div>
            <h1 className="font-display text-sm" style={{ fontWeight: 300, color: "rgba(255,255,255,0.9)" }}>Tōroa</h1>
            <p className="font-body text-[9px]" style={{ color: "rgba(255,255,255,0.35)" }}>Whānau Navigator</p>
          </div>
        </div>
        <a href="sms:+64XXXXXXXXX" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-display" style={{ background: `${KOWHAI}15`, border: `1px solid ${KOWHAI}25`, color: KOWHAI, fontWeight: 300 }}>
          <MessageSquare size={12} /> Text Tōroa
        </a>
      </header>

      <div className="p-4 md:p-6 space-y-4 max-w-2xl mx-auto pb-24">
        {/* ── Family Calendar ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl p-5" style={glass()}>
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={16} style={{ color: KOWHAI }} />
            <h2 className="font-display text-sm" style={{ fontWeight: 300, color: "rgba(255,255,255,0.8)" }}>This week</h2>
          </div>
          <div className="space-y-3">
            {events.map(ev => (
              <div key={ev.id} className="flex items-start gap-3 p-3 rounded-lg" style={{ background: `${KOWHAI}06` }}>
                <div className="w-10 text-center shrink-0">
                  <div className="font-mono text-lg" style={{ color: KOWHAI }}>{new Date(ev.event_date).getDate()}</div>
                  <div className="font-body text-[8px] uppercase" style={{ color: "rgba(255,255,255,0.3)" }}>
                    {new Date(ev.event_date).toLocaleDateString("en-NZ", { weekday: "short" })}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-body text-xs" style={{ color: "rgba(255,255,255,0.75)" }}>{ev.title}</p>
                  {ev.event_time && <p className="font-mono text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>{ev.event_time}</p>}
                  {ev.source === "school_notice" && <span className="font-body text-[8px] px-1.5 py-0.5 rounded mt-1 inline-block" style={{ background: `${POUNAMU}20`, color: POUNAMU }}>from school notice</span>}
                  {ev.gear_list && ev.gear_list.length > 0 && (
                    <p className="font-body text-[9px] mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
                      Pack: {ev.gear_list.join(", ")}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Grocery List ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl p-5" style={glass(POUNAMU)}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShoppingCart size={16} style={{ color: POUNAMU }} />
              <h2 className="font-display text-sm" style={{ fontWeight: 300, color: "rgba(255,255,255,0.8)" }}>Grocery list</h2>
            </div>
            <span className="font-mono text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>
              {groceries.filter(g => g.checked).length}/{groceries.length} done
            </span>
          </div>
          <div className="space-y-1.5 mb-3">
            {groceries.map((g, i) => (
              <button key={i} onClick={() => toggleGrocery(i)} className="w-full flex items-center gap-2 p-2 rounded-lg text-left transition-all" style={{ background: g.checked ? "rgba(58,125,110,0.08)" : "transparent" }}>
                <div className="w-5 h-5 rounded flex items-center justify-center shrink-0" style={{ border: `1px solid ${g.checked ? POUNAMU : "rgba(255,255,255,0.15)"}`, background: g.checked ? `${POUNAMU}20` : "transparent" }}>
                  {g.checked && <Check size={12} style={{ color: POUNAMU }} />}
                </div>
                <span className={`font-body text-xs ${g.checked ? "line-through" : ""}`} style={{ color: g.checked ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.65)" }}>
                  {g.name}
                </span>
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input type="text" value={newItem} onChange={e => setNewItem(e.target.value)} onKeyDown={e => e.key === "Enter" && addGrocery()}
              placeholder="Add item…" className="flex-1 px-3 py-2 rounded-lg text-xs font-body outline-none"
              style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${POUNAMU}20`, color: "#FFFFFF" }}
            />
            <button onClick={addGrocery} className="px-3 py-2 rounded-lg" style={{ background: `${POUNAMU}20`, color: POUNAMU }}>
              <Plus size={14} />
            </button>
          </div>
        </motion.div>

        {/* ── Budget ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-xl p-5" style={glass()}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <DollarSign size={16} style={{ color: KOWHAI }} />
              <h2 className="font-display text-sm" style={{ fontWeight: 300, color: "rgba(255,255,255,0.8)" }}>Budget this week</h2>
            </div>
            <span className="font-mono text-xs px-2 py-0.5 rounded" style={{ background: overBudget ? "rgba(239,68,68,0.15)" : `${POUNAMU}15`, color: overBudget ? "#ef4444" : POUNAMU }}>
              {overBudget ? "Over budget" : "On track"}
            </span>
          </div>
          {/* Progress bar */}
          <div className="mb-3">
            <div className="flex justify-between text-[10px] font-mono mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>
              <span>${budget.spent} spent</span>
              <span>${budget.limit} limit</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: overBudget ? "#ef4444" : `linear-gradient(90deg, ${POUNAMU}, ${KOWHAI})` }} />
            </div>
          </div>
          <div className="space-y-1.5">
            {budget.transactions.map((t, i) => (
              <div key={i} className="flex justify-between text-xs font-body" style={{ color: "rgba(255,255,255,0.5)" }}>
                <span>{t.text}</span>
                <span className="font-mono">${t.amount}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Reminders ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-xl p-5" style={glass()}>
          <div className="flex items-center gap-2 mb-4">
            <Bell size={16} style={{ color: KOWHAI }} />
            <h2 className="font-display text-sm" style={{ fontWeight: 300, color: "rgba(255,255,255,0.8)" }}>Reminders</h2>
          </div>
          <div className="space-y-2">
            {reminders.map((r, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: r.urgent ? `${KOWHAI}08` : "transparent" }}>
                {r.urgent && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: KOWHAI }} />}
                <span className="font-body text-xs" style={{ color: r.urgent ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.5)" }}>{r.text}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Mārama Learning ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="rounded-xl p-5" style={glass(POUNAMU)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen size={16} style={{ color: POUNAMU }} />
              <h2 className="font-display text-sm" style={{ fontWeight: 300, color: "rgba(255,255,255,0.8)" }}>Mārama Learning</h2>
            </div>
            <Link to="/toroa" className="text-[10px] font-body flex items-center gap-1" style={{ color: POUNAMU }}>
              Open <ExternalLink size={10} />
            </Link>
          </div>
          <p className="font-body text-xs mt-2" style={{ color: "rgba(255,255,255,0.4)" }}>
            Drop a YouTube URL to get vocab flashcards, translations, and quizzes.
          </p>
        </motion.div>

        {/* ── Chat with Tōroa ── */}
        <KeteBrainChat keteId="toroa" keteName="Tōroa" keteNameEn="Family Navigator" accentColor={KOWHAI} />
      </div>
    </div>
  );
}
