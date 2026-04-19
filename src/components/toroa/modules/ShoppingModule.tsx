import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Plus, Check, DollarSign, X } from "lucide-react";

const TEAL_ACCENT = "#4AA5A8";
const POUNAMU = "#3A7D6E";
const BONE = "#F5F0E8";

interface ShoppingItem {
  id: string;
  item: string;
  quantity: number;
  category: string;
  estimated_cost_cents?: number;
  purchased: boolean;
}

interface Props {
  items: ShoppingItem[];
  weeklyBudget: number;
  spent: number;
  onToggle: (id: string) => void;
  onAdd: (item: string) => void;
  onDelete?: (id: string) => void;
}

const glass = {
  background: "rgba(255,255,255,0.65)",
  border: `1px solid ${POUNAMU}15`,
  backdropFilter: "blur(14px)",
};

const categories = ["groceries", "household", "school", "personal", "other"];

export default function ShoppingModule({ items, weeklyBudget, spent, onToggle, onAdd, onDelete }: Props) {
  const [newItem, setNewItem] = useState("");
  const pct = Math.min(100, Math.round((spent / weeklyBudget) * 100));
  const over = spent > weeklyBudget;

  const grouped = categories.reduce((acc, cat) => {
    const catItems = items.filter(i => i.category === cat);
    if (catItems.length > 0) acc[cat] = catItems;
    return acc;
  }, {} as Record<string, ShoppingItem[]>);

  return (
    <div className="space-y-4">
      <h2 className="font-display text-xs uppercase tracking-[0.2em] flex items-center gap-2" style={{ color: "#6B7280" }}>
        <ShoppingCart size={14} style={{ color: POUNAMU }} /> Shopping
      </h2>

      {/* Budget bar */}
      <div className="rounded-xl p-4" style={glass}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <DollarSign size={12} style={{ color: TEAL_ACCENT }} />
            <span className="font-body text-xs" style={{ color: "#6B7280" }}>Weekly budget</span>
          </div>
          <span className="font-mono text-xs px-2 py-0.5 rounded" style={{ background: over ? "rgba(239,68,68,0.12)" : `${POUNAMU}15`, color: over ? "#fca5a5" : POUNAMU }}>
            ${(spent / 100).toFixed(0)} / ${(weeklyBudget / 100).toFixed(0)}
          </span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#9CA3AF" }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: over ? "#ef4444" : `linear-gradient(90deg, ${POUNAMU}, ${TEAL_ACCENT})` }} />
        </div>
      </div>

      {/* Categorised items */}
      {Object.entries(grouped).map(([cat, catItems]) => (
        <div key={cat} className="rounded-xl p-4 space-y-2" style={glass}>
          <h3 className="font-display text-[10px] uppercase tracking-wider" style={{ color: `${POUNAMU}AA` }}>{cat}</h3>
          {catItems.map((item) => (
            <div key={item.id} className="group flex items-center gap-2">
              <motion.button
                onClick={() => onToggle(item.id)}
                className="flex-1 flex items-center gap-2 p-2 rounded-lg text-left transition-all"
                style={{ background: item.purchased ? `${POUNAMU}06` : "transparent" }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="w-5 h-5 rounded flex items-center justify-center shrink-0" style={{
                  border: `1px solid ${item.purchased ? POUNAMU : "#9CA3AF"}`,
                  background: item.purchased ? `${POUNAMU}20` : "transparent"
                }}>
                  {item.purchased && <Check size={12} style={{ color: POUNAMU }} />}
                </div>
                <span className={`font-body text-xs flex-1 ${item.purchased ? "line-through" : ""}`} style={{ color: item.purchased ? "#9CA3AF" : "#9CA3AF" }}>
                  {item.item}{item.quantity > 1 ? ` ×${item.quantity}` : ""}
                </span>
                {item.estimated_cost_cents && (
                  <span className="font-mono text-[9px]" style={{ color: "#9CA3AF" }}>
                    ${(item.estimated_cost_cents / 100).toFixed(2)}
                  </span>
                )}
              </motion.button>
              {onDelete && (
                <button onClick={() => onDelete(item.id)} className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50">
                  <X size={12} style={{ color: "#ef4444" }} />
                </button>
              )}
            </div>
          ))}
        </div>
      ))}

      {/* Add item */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newItem}
          onChange={e => setNewItem(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && newItem.trim()) { onAdd(newItem.trim()); setNewItem(""); } }}
          placeholder="Add item…"
          className="flex-1 px-3 py-2.5 rounded-xl text-xs font-body outline-none"
          style={{ background: "#9CA3AF", border: `1px solid ${POUNAMU}18`, color: "#1A1D29" }}
        />
        <button onClick={() => { if (newItem.trim()) { onAdd(newItem.trim()); setNewItem(""); } }} className="px-3 py-2.5 rounded-xl" style={{ background: `${POUNAMU}18`, color: POUNAMU }}>
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}
