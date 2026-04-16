import { useState } from "react";
import { Plus, Palette, FileText, BarChart3 } from "lucide-react";

const FORGE_COLOR = "#FF4D6A";

interface BrandProfile {
  id: string; name: string; primaryColor: string; secondaryColor: string;
  tone: string; tagline: string; models: string[]; coopBudget: string;
  guidelines: string; logoUrl?: string;
}

const DEMO_BRANDS: BrandProfile[] = [
  { id: "1", name: "Toyota", primaryColor: "#EB0A1E", secondaryColor: "#282830", tone: "Reliable, trusted, family-focused. 'Let's Go Places' energy.", tagline: "Let's Go Places", models: ["Corolla", "RAV4", "Hilux", "Camry", "Land Cruiser", "Yaris Cross"], coopBudget: "$15,000/quarter", guidelines: "Red must be Toyota Red (PMS 485). No modification to logo. All local ads require distributor sign-off." },
  { id: "2", name: "Mazda", primaryColor: "#910000", secondaryColor: "#2C2C2C", tone: "Premium, emotive, design-forward. 'Feel Alive' brand energy.", tagline: "Feel Alive", models: ["CX-5", "CX-30", "CX-60", "Mazda3", "BT-50", "MX-5"], coopBudget: "$12,000/quarter", guidelines: "Soul Red Crystal is hero colour. Kodo design language in all creative. Clean, minimal layouts." },
  { id: "3", name: "Hyundai", primaryColor: "#002C5F", secondaryColor: "#00AAD2", tone: "Progressive, accessible, innovative. 'New Thinking. New Possibilities.'", tagline: "New Thinking. New Possibilities", models: ["Tucson", "Kona", "Santa Fe", "i30", "IONIQ 5", "Staria"], coopBudget: "$10,000/quarter", guidelines: "Hyundai blue is primary. Modern sans-serif typography. Emphasise technology and safety." },
];

export default function ForgeBrandHub() {
  const [brands, setBrands] = useState<BrandProfile[]>(DEMO_BRANDS);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [tab, setTab] = useState<"profiles" | "guidelines" | "dashboard">("profiles");

  const brand = brands.find(b => b.id === selectedBrand);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      <h2 className="text-lg font-bold text-foreground">Brand Hub</h2>
      <div className="flex gap-2">
        {[
          { id: "profiles" as const, label: "Brand Profiles", icon: <Palette size={10} /> },
          { id: "guidelines" as const, label: "Guidelines Library", icon: <FileText size={10} /> },
          { id: "dashboard" as const, label: "Multi-Brand Dashboard", icon: <BarChart3 size={10} /> },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium"
            style={{ backgroundColor: tab === t.id ? FORGE_COLOR + "20" : "transparent", color: tab === t.id ? FORGE_COLOR : "hsl(var(--muted-foreground))", border: `1px solid ${tab === t.id ? FORGE_COLOR + "40" : "hsl(var(--border))"}` }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === "profiles" && !selectedBrand && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {brands.map(b => (
            <button key={b.id} onClick={() => setSelectedBrand(b.id)}
              className="text-left p-4 rounded-xl border border-border bg-card hover:border-foreground/10 transition-colors space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: b.primaryColor }} />
                <div>
                  <h3 className="text-sm font-bold text-foreground">{b.name}</h3>
                  <p className="text-[9px] text-muted-foreground">{b.models.length} models</p>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground italic">"{b.tagline}"</p>
              <div className="flex gap-1">
                <div className="w-4 h-4 rounded-full border border-border" style={{ backgroundColor: b.primaryColor }} />
                <div className="w-4 h-4 rounded-full border border-border" style={{ backgroundColor: b.secondaryColor }} />
              </div>
            </button>
          ))}
          <button className="flex items-center justify-center p-4 rounded-xl border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors">
            <Plus size={16} className="mr-1" /> Add Brand
          </button>
        </div>
      )}

      {tab === "profiles" && brand && (
        <div className="space-y-3">
          <button onClick={() => setSelectedBrand(null)} className="text-xs text-muted-foreground hover:text-foreground">← All brands</button>
          <div className="p-4 rounded-xl border bg-card" style={{ borderColor: brand.primaryColor + "40" }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black text-foreground" style={{ backgroundColor: brand.primaryColor }}>
                {brand.name[0]}
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">{brand.name}</h3>
                <p className="text-[10px] text-muted-foreground italic">"{brand.tagline}"</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-muted-foreground">Colours</span>
                <div className="flex gap-2 mt-1">
                  <div className="flex items-center gap-1"><div className="w-5 h-5 rounded" style={{ backgroundColor: brand.primaryColor }} /><span className="text-[9px] text-foreground">{brand.primaryColor}</span></div>
                  <div className="flex items-center gap-1"><div className="w-5 h-5 rounded" style={{ backgroundColor: brand.secondaryColor }} /><span className="text-[9px] text-foreground">{brand.secondaryColor}</span></div>
                </div>
              </div>
              <div><span className="text-[10px] text-muted-foreground">Co-op Budget</span><p className="text-foreground font-medium mt-1">{brand.coopBudget}</p></div>
              <div className="col-span-2"><span className="text-[10px] text-muted-foreground">Tone of Voice</span><p className="text-foreground mt-1">{brand.tone}</p></div>
              <div className="col-span-2"><span className="text-[10px] text-muted-foreground">Current Models</span><div className="flex flex-wrap gap-1 mt-1">{brand.models.map(m => <span key={m} className="px-2 py-0.5 rounded-full text-[9px] bg-muted text-foreground">{m}</span>)}</div></div>
            </div>
          </div>
        </div>
      )}

      {tab === "guidelines" && (
        <div className="space-y-3">
          {brands.map(b => (
            <div key={b.id} className="p-3 rounded-xl border border-border bg-card">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 rounded" style={{ backgroundColor: b.primaryColor }} />
                <h4 className="text-xs font-bold text-foreground">{b.name} Guidelines</h4>
              </div>
              <p className="text-[10px] text-foreground/70">{b.guidelines}</p>
              <div className="mt-2 flex gap-2">
                <button className="text-[9px] px-2 py-1 rounded border border-border text-muted-foreground"> Upload PDF</button>
                <button className="text-[9px] px-2 py-1 rounded border border-border text-muted-foreground"> Edit Rules</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "dashboard" && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {brands.map(b => (
              <div key={b.id} className="p-3 rounded-xl border bg-card" style={{ borderColor: b.primaryColor + "30" }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: b.primaryColor }} />
                  <h4 className="text-xs font-bold text-foreground">{b.name}</h4>
                </div>
                <div className="space-y-1 text-[10px]">
                  <div className="flex justify-between"><span className="text-muted-foreground">Stock</span><span className="text-foreground font-medium">{Math.floor(Math.random() * 15) + 3} units</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Sales MTD</span><span className="text-foreground font-medium">{Math.floor(Math.random() * 5) + 1}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Marketing spend</span><span className="text-foreground font-medium">${(Math.floor(Math.random() * 5) + 2) * 1000}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Co-op remaining</span><span className="text-foreground font-medium">{b.coopBudget}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Events planned</span><span className="text-foreground font-medium">{Math.floor(Math.random() * 3)}</span></div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 rounded-xl border border-border bg-card">
            <h4 className="text-xs font-bold text-foreground mb-2">Stock Split by Brand</h4>
            <div className="flex gap-1 h-6 rounded-full overflow-hidden">
              {brands.map((b, i) => <div key={b.id} className="h-full" style={{ backgroundColor: b.primaryColor, flex: brands.length - i }} />)}
            </div>
            <div className="flex justify-between mt-1">{brands.map(b => <span key={b.id} className="text-[8px] text-muted-foreground">{b.name}</span>)}</div>
          </div>
        </div>
      )}
    </div>
  );
}
