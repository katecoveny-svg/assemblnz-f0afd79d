import { useState } from "react";
import { Calculator, Car, ClipboardCheck, Layers, Shield } from "lucide-react";

const FORGE_ACCENT = "#FF4D6A";

/* ── GST Margin Scheme Calculator ── */
const GSTMarginCalc = () => {
  const [purchase, setPurchase] = useState("");
  const [sale, setSale] = useState("");
  const p = parseFloat(purchase) || 0;
  const s = parseFloat(sale) || 0;
  const margin = Math.max(s - p, 0);
  const gstMargin = margin * 3 / 23;
  const gstInvoice = s * 3 / 23;
  const saving = gstInvoice - gstMargin;

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5"><Calculator size={14} style={{ color: FORGE_ACCENT }} /> GST Margin Scheme Calculator</h4>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] text-muted-foreground block mb-1">Purchase Price (NZD)</label>
          <input value={purchase} onChange={e => setPurchase(e.target.value)} type="number" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground" placeholder="0" />
        </div>
        <div>
          <label className="text-[10px] text-muted-foreground block mb-1">Sale Price (NZD)</label>
          <input value={sale} onChange={e => setSale(e.target.value)} type="number" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground" placeholder="0" />
        </div>
      </div>
      {p > 0 && s > 0 && (
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="rounded-lg p-3 bg-background border border-border">
            <p className="text-muted-foreground mb-0.5">Margin Scheme GST</p>
            <p className="font-bold text-foreground">${gstMargin.toFixed(2)}</p>
          </div>
          <div className="rounded-lg p-3 bg-background border border-border">
            <p className="text-muted-foreground mb-0.5">Invoice Basis GST</p>
            <p className="font-bold text-foreground">${gstInvoice.toFixed(2)}</p>
          </div>
          <div className="rounded-lg p-3 col-span-2 border" style={{ borderColor: FORGE_ACCENT + "30", background: FORGE_ACCENT + "08" }}>
            <p className="text-muted-foreground mb-0.5">Saving with Margin Scheme</p>
            <p className="font-bold" style={{ color: FORGE_ACCENT }}>${saving.toFixed(2)}</p>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── FBT Demo Vehicle Tracker ── */
interface DemoVehicle { id: string; make: string; days: string; km: string; costPrice: string; }
const FBTTracker = () => {
  const [vehicles, setVehicles] = useState<DemoVehicle[]>([]);
  const [form, setForm] = useState({ make: "", days: "", km: "", costPrice: "" });
  const addVehicle = () => {
    if (!form.make) return;
    setVehicles(prev => [...prev, { ...form, id: crypto.randomUUID() }]);
    setForm({ make: "", days: "", km: "", costPrice: "" });
  };
  const calcFBT = (v: DemoVehicle) => {
    const cost = parseFloat(v.costPrice) || 0;
    const days = parseInt(v.days) || 0;
    return (cost * 0.2 * days / 365 * 0.49).toFixed(2); // simplified flat rate
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5"><Car size={14} style={{ color: FORGE_ACCENT }} /> FBT Demo Vehicle Tracker</h4>
      <div className="grid grid-cols-4 gap-2">
        {(["make", "days", "km", "costPrice"] as const).map(f => (
          <input key={f} value={form[f]} onChange={e => setForm(p => ({ ...p, [f]: e.target.value }))}
            className="bg-background border border-border rounded-lg px-2 py-1.5 text-[10px] text-foreground"
            placeholder={f === "make" ? "Make/Model" : f === "days" ? "Days used" : f === "km" ? "KM driven" : "Cost price"} type={f === "make" ? "text" : "number"} />
        ))}
      </div>
      <button onClick={addVehicle} className="text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-colors" style={{ borderColor: FORGE_ACCENT + "30", color: FORGE_ACCENT }}>+ Add Vehicle</button>
      {vehicles.length > 0 && (
        <div className="space-y-1.5">
          {vehicles.map(v => (
            <div key={v.id} className="flex items-center justify-between rounded-lg bg-background border border-border px-3 py-2 text-[11px]">
              <span className="text-foreground font-medium">{v.make}</span>
              <span className="text-muted-foreground">{v.days}d · {v.km}km</span>
              <span className="font-bold" style={{ color: FORGE_ACCENT }}>FBT: ${calcFBT(v)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ── OEM Audit Checklist ── */
const OEM_BRANDS = ["Toyota NZ", "Ford NZ", "Hyundai NZ", "Holden NZ", "Mazda NZ", "Honda NZ"] as const;
const CHECKLIST_ITEMS = [
  "Signage & branding compliant", "Showroom layout meets standard", "EV charging available",
  "Digital display boards active", "Customer lounge standard met", "Service bay equipment current",
  "Parts inventory within par", "Staff training certificates current", "Warranty claim docs complete",
  "CSI/SSI targets on track", "Demo fleet age compliant", "Financial reporting up to date",
];
const OEMAudit = () => {
  const [brand, setBrand] = useState<string>(OEM_BRANDS[0]);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const toggle = (item: string) => setChecked(prev => {
    const n = new Set(prev);
    n.has(item) ? n.delete(item) : n.add(item);
    return n;
  });
  const pct = Math.round((checked.size / CHECKLIST_ITEMS.length) * 100);

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5"><ClipboardCheck size={14} style={{ color: FORGE_ACCENT }} /> OEM Audit Checklist</h4>
      <div className="flex gap-1.5 flex-wrap">
        {OEM_BRANDS.map(b => (
          <button key={b} onClick={() => setBrand(b)} className="px-2.5 py-1 rounded-full text-[10px] font-medium border transition-colors"
            style={{ borderColor: brand === b ? FORGE_ACCENT : "hsl(var(--border))", color: brand === b ? FORGE_ACCENT : "hsl(var(--muted-foreground))", background: brand === b ? FORGE_ACCENT + "10" : "transparent" }}>
            {b}
          </button>
        ))}
      </div>
      <div className="w-full h-1.5 rounded-full bg-background overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: FORGE_ACCENT }} />
      </div>
      <p className="text-[10px] text-muted-foreground">{brand} — {pct}% complete ({checked.size}/{CHECKLIST_ITEMS.length})</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {CHECKLIST_ITEMS.map(item => (
          <label key={item} className="flex items-center gap-2 cursor-pointer rounded-lg px-2.5 py-1.5 text-[11px] bg-background border border-border hover:border-foreground/10 transition-colors">
            <input type="checkbox" checked={checked.has(item)} onChange={() => toggle(item)} className="accent-[#FF4D6A] w-3.5 h-3.5" />
            <span className={checked.has(item) ? "text-foreground line-through opacity-60" : "text-foreground"}>{item}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

/* ── Floor Plan Reconciliation ── */
const FloorPlan = () => {
  const [balance, setBalance] = useState("");
  const [items, setItems] = useState<{ vin: string; value: string }[]>([]);
  const [vin, setVin] = useState("");
  const [value, setValue] = useState("");
  const addItem = () => {
    if (!vin || !value) return;
    setItems(prev => [...prev, { vin, value }]);
    setVin(""); setValue("");
  };
  const totalInventory = items.reduce((s, i) => s + (parseFloat(i.value) || 0), 0);
  const bal = parseFloat(balance) || 0;
  const variance = totalInventory - bal;

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5"><Layers size={14} style={{ color: FORGE_ACCENT }} /> Floor Plan Reconciliation</h4>
      <div>
        <label className="text-[10px] text-muted-foreground block mb-1">Floor Plan Balance (NZD)</label>
        <input value={balance} onChange={e => setBalance(e.target.value)} type="number" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground" placeholder="0" />
      </div>
      <div className="flex gap-2">
        <input value={vin} onChange={e => setVin(e.target.value)} className="flex-1 bg-background border border-border rounded-lg px-2 py-1.5 text-[10px] text-foreground" placeholder="VIN / Stock #" />
        <input value={value} onChange={e => setValue(e.target.value)} type="number" className="w-28 bg-background border border-border rounded-lg px-2 py-1.5 text-[10px] text-foreground" placeholder="Value" />
        <button onClick={addItem} className="text-[10px] font-bold px-3 rounded-lg border" style={{ borderColor: FORGE_ACCENT + "30", color: FORGE_ACCENT }}>+</button>
      </div>
      {items.length > 0 && (
        <>
          <div className="space-y-1">
            {items.map((i, idx) => (
              <div key={idx} className="flex justify-between text-[11px] px-2 py-1 rounded bg-background border border-border">
                <span className="text-foreground">{i.vin}</span>
                <span className="text-muted-foreground">${parseFloat(i.value).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 text-[11px]">
            <div className="rounded-lg p-2 bg-background border border-border"><p className="text-muted-foreground">Inventory</p><p className="font-bold text-foreground">${totalInventory.toLocaleString()}</p></div>
            <div className="rounded-lg p-2 bg-background border border-border"><p className="text-muted-foreground">Floor Plan</p><p className="font-bold text-foreground">${bal.toLocaleString()}</p></div>
            <div className="rounded-lg p-2 border" style={{ borderColor: Math.abs(variance) > 0 ? FORGE_ACCENT + "30" : "hsl(var(--border))" }}>
              <p className="text-muted-foreground">Variance</p>
              <p className="font-bold" style={{ color: Math.abs(variance) > 100 ? FORGE_ACCENT : "hsl(var(--foreground))" }}>${variance.toLocaleString()}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

/* ── Warranty Claims Tracker ── */
interface Claim { id: string; ref: string; vehicle: string; amount: string; status: "pending" | "approved" | "rejected"; date: string; notes: string; }
const WarrantyTracker = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [form, setForm] = useState({ ref: "", vehicle: "", amount: "", notes: "" });
  const addClaim = () => {
    if (!form.ref) return;
    setClaims(prev => [...prev, { ...form, id: crypto.randomUUID(), status: "pending", date: new Date().toLocaleDateString("en-NZ") }]);
    setForm({ ref: "", vehicle: "", amount: "", notes: "" });
  };
  const updateStatus = (id: string, status: Claim["status"]) => setClaims(prev => prev.map(c => c.id === id ? { ...c, status } : c));

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5"><Shield size={14} style={{ color: FORGE_ACCENT }} /> Warranty Claims Tracker</h4>
      <div className="grid grid-cols-2 gap-2">
        <input value={form.ref} onChange={e => setForm(p => ({ ...p, ref: e.target.value }))} className="bg-background border border-border rounded-lg px-2 py-1.5 text-[10px] text-foreground" placeholder="Claim ref" />
        <input value={form.vehicle} onChange={e => setForm(p => ({ ...p, vehicle: e.target.value }))} className="bg-background border border-border rounded-lg px-2 py-1.5 text-[10px] text-foreground" placeholder="Vehicle" />
        <input value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} type="number" className="bg-background border border-border rounded-lg px-2 py-1.5 text-[10px] text-foreground" placeholder="Amount NZD" />
        <input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} className="bg-background border border-border rounded-lg px-2 py-1.5 text-[10px] text-foreground" placeholder="Notes" />
      </div>
      <button onClick={addClaim} className="text-[10px] font-bold px-3 py-1.5 rounded-lg border" style={{ borderColor: FORGE_ACCENT + "30", color: FORGE_ACCENT }}>+ Log Claim</button>
      {claims.length > 0 && (
        <div className="space-y-1.5">
          {claims.map(c => (
            <div key={c.id} className="rounded-lg bg-background border border-border px-3 py-2 text-[11px]">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-foreground">{c.ref} — {c.vehicle}</span>
                <span className="text-muted-foreground">{c.date}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">${parseFloat(c.amount || "0").toLocaleString()} · {c.notes}</span>
                <div className="flex gap-1">
                  {(["pending", "approved", "rejected"] as const).map(s => (
                    <button key={s} onClick={() => updateStatus(c.id, s)} className="px-2 py-0.5 rounded-full text-[9px] font-medium border transition-colors"
                      style={{
                        borderColor: c.status === s ? (s === "approved" ? "#00E676" : s === "rejected" ? FORGE_ACCENT : "hsl(var(--border))") : "hsl(var(--border))",
                        color: c.status === s ? (s === "approved" ? "#00E676" : s === "rejected" ? FORGE_ACCENT : "hsl(var(--foreground))") : "hsl(var(--muted-foreground))",
                        background: c.status === s ? (s === "approved" ? "#00E67610" : s === "rejected" ? FORGE_ACCENT + "10" : "transparent") : "transparent",
                      }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ── Main ForgeAudit Component ── */
const ForgeAudit = () => (
  <div className="space-y-4 p-4 max-w-2xl mx-auto">
    <h3 className="text-sm font-bold text-foreground">Dealership Audit Dashboard</h3>
    <GSTMarginCalc />
    <FBTTracker />
    <OEMAudit />
    <FloorPlan />
    <WarrantyTracker />
  </div>
);

export default ForgeAudit;
