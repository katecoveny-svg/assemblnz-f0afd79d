import { useState } from "react";
import { NeonDocument, NeonCheckmark, NeonChart, NeonStar } from "@/components/NeonIcons";

const color = "#E6B422";

const MENU_TYPES = [
  "Multi-course dinner (5-7 courses)", "Tasting menu with wine pairings", "Breakfast", "Lunch", "Dietary-specific (vegetarian)", "Dietary-specific (vegan)", "Dietary-specific (gluten-free)", "Dietary-specific (halal)",
];

const NZ_SEASONAL = [
  { month: "Jan-Feb", produce: "Stone fruit, berries, tomatoes, courgettes, fresh herbs, lamb" },
  { month: "Mar-Apr", produce: "Feijoas, apples, pears, pumpkin, mushrooms, venison" },
  { month: "May-Jun", produce: "Root vegetables, citrus, kale, celeriac, game meats" },
  { month: "Jul-Aug", produce: "Citrus, brassicas, stored root veg, mussels, crayfish" },
  { month: "Sep-Oct", produce: "Spring lamb, asparagus, new potatoes, peas, whitebait" },
  { month: "Nov-Dec", produce: "Strawberries, cherries, new season produce, salmon" },
];

const WINE_REGIONS = [
  { region: "Central Otago", style: "Pinot Noir (world-class), Pinot Gris, Riesling" },
  { region: "Marlborough", style: "Sauvignon Blanc (iconic), Pinot Noir, Chardonnay" },
  { region: "Hawke's Bay", style: "Syrah, Merlot blends, Chardonnay" },
  { region: "Wairarapa", style: "Pinot Noir, Syrah, boutique wines" },
  { region: "Canterbury", style: "Pinot Noir, Riesling, emerging region" },
];

const ALLERGENS = ["Gluten", "Dairy", "Eggs", "Fish", "Shellfish", "Tree Nuts", "Peanuts", "Soy", "Sesame", "Sulphites", "Lupin", "Celery", "Mustard"];

interface Props { onGenerate?: (prompt: string) => void; }

const AuraKitchenFnB = ({ onGenerate }: Props) => {
  const gen = (prompt: string) => onGenerate?.(prompt);
  const [section, setSection] = useState<"menu" | "operations" | "wine">("menu");

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="flex gap-2">
        {([
          { id: "menu" as const, label: "Menu Engineering" },
          { id: "operations" as const, label: "F&B Operations" },
          { id: "wine" as const, label: "Wine & Beverage" },
        ]).map(s => (
          <button key={s.id} onClick={() => setSection(s.id)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{ background: section === s.id ? color + "20" : "transparent", color: section === s.id ? color : "hsl(var(--muted-foreground))", border: `1px solid ${section === s.id ? color + "40" : "hsl(var(--border))"}` }}>
            {s.label}
          </button>
        ))}
      </div>

      {section === "menu" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4" style={{ borderColor: color + "20" }}>
            <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2"><NeonDocument size={16} color={color} /> Menu Design Templates</h3>
            <div className="grid grid-cols-2 gap-2">
              {MENU_TYPES.map(m => (
                <button key={m} onClick={() => gen(`Design a luxury lodge ${m} menu. Use seasonal NZ produce, include wine pairing suggestions for each course, allergen indicators, and elegant descriptions. Format for print.`)} className="text-left p-2.5 rounded-lg border border-border hover:border-foreground/10 transition-all text-[11px] text-foreground/80">{m}</button>
              ))}
            </div>
            <button onClick={() => gen(`Generate a complete seasonal menu template for a luxury NZ lodge. Include seasonal NZ produce for the current month, 5-7 course dinner with wine pairings from NZ regions (Central Otago, Marlborough, Hawke's Bay), cost analysis per cover, and allergen matrix. Format elegantly.`)} className="w-full mt-3 py-2 rounded-lg text-xs font-medium" style={{ background: color, color: "#0A0A14" }}>Generate Menu Template</button>
          </div>

          <div className="rounded-xl border border-border bg-card p-4" style={{ borderColor: color + "20" }}>
            <h3 className="font-semibold text-sm text-foreground mb-3">NZ Seasonal Produce Calendar</h3>
            <div className="space-y-2">
              {NZ_SEASONAL.map(s => (
                <div key={s.month} className="flex gap-3 items-start text-xs p-2 rounded-lg border border-border">
                  <span className="font-medium text-foreground min-w-[60px]">{s.month}</span>
                  <span className="text-foreground/70">{s.produce}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4" style={{ borderColor: color + "20" }}>
            <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2"><NeonCheckmark size={16} /> Allergen Matrix Generator</h3>
            <p className="text-[10px] text-muted-foreground mb-2">Mandatory under NZ Food Act 2014</p>
            <div className="flex flex-wrap gap-1.5">
              {ALLERGENS.map(a => (
                <span key={a} className="px-2 py-1 rounded-full text-[10px] border border-border text-foreground/70">{a}</span>
              ))}
            </div>
            <button onClick={() => gen(`Generate a comprehensive allergen matrix for a luxury lodge menu. Rows: each dish on a typical 7-course dinner + breakfast + lunch menu. Columns: ${ALLERGENS.join(", ")}. Mandatory under NZ Food Act 2014. Include notes on cross-contamination risks and kitchen protocols.`)} className="w-full mt-3 py-2 rounded-lg text-xs font-medium" style={{ background: color, color: "#0A0A14" }}>Generate Allergen Matrix</button>
          </div>
        </div>
      )}

      {section === "operations" && (
        <div className="space-y-3">
          {[
            { title: "Daily Prep List", desc: "Generated from tonight's bookings and dietary requirements" },
            { title: "Kitchen Team Briefing", desc: "Tonight's guests, dietary needs, special occasions, VIP notes" },
            { title: "Stock Take Template", desc: "Comprehensive inventory by category" },
            { title: "Supplier Order Generator", desc: "Based on menu + guest count forecast" },
            { title: "Wastage Tracker", desc: "Track and reduce food waste by category" },
            { title: "Food Safety Compliance", desc: "Food Act 2014, food control plan checklist" },
          ].map(t => (
            <div key={t.title} className="rounded-xl border border-border bg-card p-3 flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-foreground">{t.title}</div>
                <div className="text-[10px] text-muted-foreground">{t.desc}</div>
              </div>
              <button onClick={() => gen(`Generate a "${t.title}" for a luxury lodge kitchen. ${t.desc}. Make it practical, actionable, and NZ-specific. Include Food Act 2014 compliance where relevant.`)} className="px-3 py-1 rounded-full text-[10px] font-medium shrink-0" style={{ background: color + "20", color }}>Generate</button>
            </div>
          ))}
        </div>
      )}

      {section === "wine" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4" style={{ borderColor: color + "20" }}>
            <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2"><NeonStar size={16} /> NZ Wine Regions</h3>
            <div className="space-y-2">
              {WINE_REGIONS.map(w => (
                <div key={w.region} className="flex gap-3 items-start text-xs p-2 rounded-lg border border-border">
                  <span className="font-medium min-w-[100px]" style={{ color }}>{w.region}</span>
                  <span className="text-foreground/70">{w.style}</span>
                </div>
              ))}
            </div>
          </div>

          {[
            { title: "Wine List Builder", desc: "Build curated wine list with NZ region classifications" },
            { title: "Cellar Inventory Tracker", desc: "Track bottles, vintages, and reorder levels" },
            { title: "Wine Cost Analysis", desc: "Pour cost, bottle vs by-the-glass profitability" },
            { title: "Cocktail Menu Generator", desc: "NZ-inspired creations with local ingredients" },
            { title: "Non-Alcoholic Pairings", desc: "Increasingly important for luxury guests" },
            { title: "Staff Wine Training", desc: "Tasting notes, region profiles, food pairings" },
          ].map(t => (
            <div key={t.title} className="rounded-xl border border-border bg-card p-3 flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-foreground">{t.title}</div>
                <div className="text-[10px] text-muted-foreground">{t.desc}</div>
              </div>
              <button className="px-3 py-1 rounded-full text-[10px] font-medium shrink-0" style={{ background: color + "20", color }}>Generate</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AuraKitchenFnB;
