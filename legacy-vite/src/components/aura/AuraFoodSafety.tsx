import { useState } from "react";
import { CheckCircle2, Circle, AlertTriangle, Clock, Thermometer, Droplets, Bug, Utensils } from "lucide-react";

const color = "#5AADA0";

interface CheckItem {
  id: string;
  label: string;
  category: string;
  required: boolean;
  tempField?: boolean;
}

const DAILY_CHECKS: CheckItem[] = [
  // Opening
  { id: "hand_wash", label: "Hand wash station stocked (soap, paper towels, sanitiser)", category: "Opening", required: true },
  { id: "staff_health", label: "Staff health declarations — no vomiting/diarrhoea in last 48hrs", category: "Opening", required: true },
  { id: "uniform", label: "Clean uniforms, hair restrained, no jewellery", category: "Opening", required: true },
  { id: "surfaces", label: "All food contact surfaces cleaned and sanitised", category: "Opening", required: true },
  // Temperature
  { id: "fridge_temp", label: "Fridge temperature ≤ 5°C", category: "Temperature", required: true, tempField: true },
  { id: "freezer_temp", label: "Freezer temperature ≤ -18°C", category: "Temperature", required: true, tempField: true },
  { id: "hot_hold", label: "Hot hold display ≥ 65°C (if applicable)", category: "Temperature", required: false, tempField: true },
  { id: "chiller_display", label: "Display chiller ≤ 5°C (if applicable)", category: "Temperature", required: false, tempField: true },
  // Food handling
  { id: "date_labels", label: "All prep items date-labelled (use within 3 days)", category: "Food Handling", required: true },
  { id: "raw_cooked", label: "Raw and cooked foods separated (raw below cooked)", category: "Food Handling", required: true },
  { id: "deliveries", label: "Deliveries checked — temperature, dates, packaging intact", category: "Food Handling", required: true },
  { id: "allergens", label: "Allergen info available and up to date for all menu items", category: "Food Handling", required: true },
  // Cleaning
  { id: "sanitiser_strength", label: "Sanitiser at correct dilution (test strip check)", category: "Cleaning", required: true },
  { id: "dishwasher", label: "Dishwasher rinse temp ≥ 82°C or chemical sanitise cycle working", category: "Cleaning", required: true },
  { id: "bins", label: "Waste bins emptied, clean, and lined", category: "Cleaning", required: true },
  { id: "pest_check", label: "No evidence of pests (droppings, damage, sightings)", category: "Pest Control", required: true },
  // Closing
  { id: "leftover", label: "Leftover food cooled within 2hrs, stored, labelled", category: "Closing", required: true },
  { id: "deep_clean", label: "End-of-day deep clean completed (floors, drains, equipment)", category: "Closing", required: true },
  { id: "close_temps", label: "Final fridge/freezer temperature check recorded", category: "Closing", required: true, tempField: true },
];

interface Props { onGenerate?: (prompt: string) => void; }

const AuraFoodSafety = ({ onGenerate }: Props) => {
  const gen = (prompt: string) => onGenerate?.(prompt);
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [temps, setTemps] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState("");
  const [completedBy, setCompletedBy] = useState("");

  const toggle = (id: string) => setChecks(prev => ({ ...prev, [id]: !prev[id] }));
  const setTemp = (id: string, val: string) => setTemps(prev => ({ ...prev, [id]: val }));

  const totalRequired = DAILY_CHECKS.filter(c => c.required).length;
  const completedRequired = DAILY_CHECKS.filter(c => c.required && checks[c.id]).length;
  const allRequiredDone = completedRequired === totalRequired;
  const percentage = Math.round((completedRequired / totalRequired) * 100);

  const categories = [...new Set(DAILY_CHECKS.map(c => c.category))];
  const categoryIcons: Record<string, React.ReactNode> = {
    "Opening": <Clock size={14} />,
    "Temperature": <Thermometer size={14} />,
    "Food Handling": <Utensils size={14} />,
    "Cleaning": <Droplets size={14} />,
    "Pest Control": <Bug size={14} />,
    "Closing": <Clock size={14} />,
  };

  const today = new Date().toLocaleDateString("en-NZ", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const handleExportPDF = () => {
    const summary = DAILY_CHECKS.map(c =>
      `${checks[c.id] ? "" : ""} ${c.label}${c.tempField && temps[c.id] ? ` (${temps[c.id]}°C)` : ""}`
    ).join("\n");
    gen(`Generate a printable Daily Food Safety Record for ${today}. Completed by: ${completedBy || "Not specified"}. Results:\n${summary}\nNotes: ${notes || "None"}\n\nFormat as a professional compliance document suitable for filing as part of our Food Control Plan under the Food Act 2014. Include a sign-off section.`);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {/* Header */}
      <div className="rounded-xl border bg-card p-4" style={{ borderColor: color + "20" }}>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
              <AlertTriangle size={16} style={{ color }} /> Daily Food Safety Checklist
            </h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">Food Act 2014 — Food Control Plan Requirement</p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold" style={{ color: allRequiredDone ? color : "hsl(var(--destructive))" }}>
              {percentage}%
            </div>
            <div className="text-[10px] text-muted-foreground">{completedRequired}/{totalRequired} required</div>
          </div>
        </div>
        <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%`, background: allRequiredDone ? color : percentage > 50 ? "#FFA500" : "hsl(var(--destructive))" }} />
        </div>
        <div className="text-[10px] text-muted-foreground mt-2">{today}</div>
      </div>

      {/* Staff name */}
      <div className="rounded-xl border border-border bg-card p-3">
        <label className="text-[10px] text-muted-foreground block mb-1">Completed by</label>
        <input
          type="text"
          placeholder="Staff member name"
          value={completedBy}
          onChange={e => setCompletedBy(e.target.value)}
          className="w-full bg-transparent border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
          style={{ borderColor: color + "30" }}
        />
      </div>

      {/* Checklist by category */}
      {categories.map(cat => (
        <div key={cat} className="rounded-xl border border-border bg-card p-4" style={{ borderColor: color + "10" }}>
          <h4 className="font-semibold text-xs text-foreground flex items-center gap-2 mb-3" style={{ color }}>
            {categoryIcons[cat]} {cat}
          </h4>
          <div className="space-y-2">
            {DAILY_CHECKS.filter(c => c.category === cat).map(check => (
              <div key={check.id} className="flex items-start gap-2">
                <button onClick={() => toggle(check.id)} className="mt-0.5 shrink-0">
                  {checks[check.id]
                    ? <CheckCircle2 size={18} style={{ color }} />
                    : <Circle size={18} className="text-muted-foreground" />
                  }
                </button>
                <div className="flex-1">
                  <span className={`text-xs ${checks[check.id] ? "line-through text-muted-foreground" : "text-foreground"}`}>
                    {check.label}
                    {check.required && <span className="text-destructive ml-1">*</span>}
                  </span>
                  {check.tempField && (
                    <div className="mt-1">
                      <input
                        type="number"
                        placeholder="°C"
                        value={temps[check.id] || ""}
                        onChange={e => setTemp(check.id, e.target.value)}
                        className="w-20 bg-transparent border border-border rounded px-2 py-1 text-[10px] text-foreground placeholder:text-muted-foreground focus:outline-none"
                        style={{ borderColor: color + "30" }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Notes */}
      <div className="rounded-xl border border-border bg-card p-3">
        <label className="text-[10px] text-muted-foreground block mb-1">Corrective actions / Notes</label>
        <textarea
          placeholder="Record any issues, corrective actions taken, or observations..."
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={3}
          className="w-full bg-transparent border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none resize-none"
          style={{ borderColor: color + "30" }}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleExportPDF}
          className="flex-1 py-2.5 rounded-lg text-xs font-medium"
          style={{ background: color, color: "#0A0A14" }}
        >
          Generate Compliance Record
        </button>
        <button
          onClick={() => gen(`I need help with a food safety corrective action. ${notes ? `The issue is: ${notes}` : "Help me identify and document a food safety issue with the correct corrective action under the Food Act 2014."}`)}
          className="px-4 py-2.5 rounded-lg text-xs font-medium border"
          style={{ borderColor: color + "40", color }}
        >
          Get Help
        </button>
      </div>

      {/* Quick reference */}
      <div className="rounded-xl border border-border bg-card p-4" style={{ borderColor: color + "10" }}>
        <h4 className="font-semibold text-xs mb-2" style={{ color }}>Quick Reference — Food Act 2014</h4>
        <div className="space-y-1">
          {[
            "Fridge: ≤ 5°C | Freezer: ≤ -18°C | Hot hold: ≥ 65°C",
            "Cool food from 60°C to 21°C within 2 hours, then to 5°C within 4 hours",
            "Reheat to ≥ 75°C throughout before serving",
            "Use-by = legal limit (discard after) | Best-before = quality guide",
            "Records must be kept for 4 years minimum",
            "Corrective actions must be documented immediately",
          ].map(rule => (
            <div key={rule} className="text-[10px] text-muted-foreground py-1 border-b border-border last:border-0">{rule}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AuraFoodSafety;
