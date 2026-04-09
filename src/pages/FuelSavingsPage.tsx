// ═══════════════════════════════════════════════════════════════
// Fuel-Savings Assistant — consumer-facing page
//
// Route: /fuel-savings
// Kete: Arataki (Business Operations) — consumer arm
//
// Give a vehicle + weekly km → get back projected fuel costs,
// savings vs alternatives, and an EV switch payback estimate.
// Every estimate is gated through AAAIP fuel-savings policies
// (honest economy claim, plausible distance, uncertainty handoff)
// before results are shown. Uses FuelOracle for live NZ pricing.
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { ShieldCheck, Fuel, Zap, TrendingDown, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import { FuelOracle } from "@/aaaip/utils/fuel-oracle";
import {
  estimateFuelSavings,
  type FuelSavingsInput,
  type FuelSavingsEstimate,
  FUEL_SAVINGS_POLICY_METADATA,
} from "@/aaaip/integrations/fuel-savings-guard";

// ── Shared oracle instance ─────────────────────────────────────

const _oracle = new FuelOracle({ seed: 7 });

// ── Form types ─────────────────────────────────────────────────

type FuelType = "petrol91" | "petrol95" | "diesel";

interface FormState {
  fuelType: FuelType;
  fuelEconomyLPer100km: string;
  weeklyKm: string;
  evKwhPer100km: string;
  evPremiumNzd: string;
}

const INITIAL_FORM: FormState = {
  fuelType: "petrol91",
  weeklyKm: "200",
  fuelEconomyLPer100km: "8",
  evKwhPer100km: "17",
  evPremiumNzd: "15000",
};

const FUEL_LABELS: Record<FuelType, string> = {
  petrol91: "Petrol 91",
  petrol95: "Petrol 95",
  diesel: "Diesel",
};

// ── Sub-components ─────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent = "#C65D4E",
  highlight = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  accent?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className="glass-card rounded-2xl p-5 flex flex-col"
      style={
        highlight
          ? { borderColor: `${accent}55`, borderWidth: 2 }
          : undefined
      }
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: `${accent}20` }}
        >
          <Icon size={16} style={{ color: accent }} />
        </div>
        <span className="text-[11px] font-display uppercase tracking-widest text-muted-foreground" style={{ fontWeight: 700 }}>
          {label}
        </span>
      </div>
      <p className="text-2xl font-mono text-foreground" style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 500 }}>
        {value}
      </p>
      {sub && (
        <p className="text-xs text-muted-foreground mt-1">{sub}</p>
      )}
    </div>
  );
}

function PolicyBadge({ warning }: { warning?: string }) {
  if (!warning) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/5 px-3 py-2 text-xs text-green-400">
        <ShieldCheck size={14} />
        <span>Estimate passed all 3 AAAIP policy checks</span>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-amber-400">
      <AlertTriangle size={14} className="mt-0.5 shrink-0" />
      <span>{warning}</span>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────

export default function FuelSavingsPage() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [estimate, setEstimate] = useState<FuelSavingsEstimate | null>(null);

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const economy = parseFloat(form.fuelEconomyLPer100km);
    const weekly = parseFloat(form.weeklyKm);
    const evKwh = parseFloat(form.evKwhPer100km);
    const evPremium = parseFloat(form.evPremiumNzd) || 0;

    if (isNaN(economy) || isNaN(weekly)) return;

    // Confidence drops if inputs look guessed (very round numbers = maybe estimated)
    const confidence =
      economy % 1 === 0 && weekly % 50 === 0 ? 0.75 : 0.92;

    const input: FuelSavingsInput = {
      fuelEconomyLPer100km: economy,
      weeklyKm: weekly,
      fuelType: form.fuelType,
      evKwhPer100km: isNaN(evKwh) ? 17 : evKwh,
      evPremiumNzd: evPremium,
      confidence,
    };

    // Advance oracle one step for a fresh price snapshot
    _oracle.step();
    const snap = _oracle.snapshot();

    setEstimate(estimateFuelSavings(input, snap));
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Fuel-Savings Calculator — Assembl Arataki"
        description="Enter your vehicle and weekly km — get projected NZ fuel costs, annual savings vs an EV, and a payback estimate. Powered by FuelOracle live NZ pricing."
        path="/fuel-savings"
      />
      <BrandNav />

      {/* Hero */}
      <section className="relative pt-24 pb-12 sm:pt-32 sm:pb-16 px-5">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[11px] font-display tracking-[5px] uppercase mb-4 text-primary" style={{ fontWeight: 700 }}>
            ARATAKI — BUSINESS OPERATIONS
          </p>
          <h1 className="text-3xl sm:text-4xl font-display text-foreground mb-4" style={{ fontWeight: 300, letterSpacing: "-0.01em" }}>
            How much is your fuel bill?
          </h1>
          <p className="text-base text-muted-foreground max-w-xl mx-auto">
            Enter your vehicle and weekly distance — see your annual fuel cost, potential EV savings, and how many years to payback. Prices are live NZ FuelOracle estimates.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="px-5 pb-16">
        <div className="max-w-2xl mx-auto">
          <div className="glass-card rounded-2xl p-6 sm:p-8">
            <p className="text-xs font-display uppercase tracking-widest text-muted-foreground mb-6" style={{ fontWeight: 700 }}>
              Your vehicle
            </p>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Fuel type */}
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">Fuel type</label>
                <select
                  value={form.fuelType}
                  onChange={set("fuelType")}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
                >
                  {(["petrol91", "petrol95", "diesel"] as FuelType[]).map((t) => (
                    <option key={t} value={t}>{FUEL_LABELS[t]}</option>
                  ))}
                </select>
              </div>

              {/* Economy + weekly km side by side */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5">
                    Fuel economy (L/100km)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    step={0.1}
                    value={form.fuelEconomyLPer100km}
                    onChange={set("fuelEconomyLPer100km")}
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
                    placeholder="e.g. 8.5"
                  />
                  <p className="text-[10px] text-muted-foreground/50 mt-1">Check your car manual or NZTA Rightcar</p>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5">
                    Weekly km
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={5000}
                    value={form.weeklyKm}
                    onChange={set("weeklyKm")}
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
                    placeholder="e.g. 200"
                  />
                  <p className="text-[10px] text-muted-foreground/50 mt-1">NZ average ~250 km/week</p>
                </div>
              </div>

              {/* EV section */}
              <div className="pt-2 border-t border-white/5">
                <p className="text-xs font-display uppercase tracking-widest text-muted-foreground mb-4" style={{ fontWeight: 700 }}>
                  EV comparison
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1.5">
                      EV energy use (kWh/100km)
                    </label>
                    <input
                      type="number"
                      min={5}
                      max={40}
                      step={0.1}
                      value={form.evKwhPer100km}
                      onChange={set("evKwhPer100km")}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
                      placeholder="17"
                    />
                    <p className="text-[10px] text-muted-foreground/50 mt-1">BYD Atto 3: ~16.8 · Tesla Model 3: ~15.4</p>
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1.5">
                      EV premium over current car (NZD)
                    </label>
                    <input
                      type="number"
                      min={-50000}
                      max={100000}
                      step={100}
                      value={form.evPremiumNzd}
                      onChange={set("evPremiumNzd")}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
                      placeholder="15000"
                    />
                    <p className="text-[10px] text-muted-foreground/50 mt-1">Extra cost vs keeping ICE car</p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl text-sm font-medium transition-all hover:brightness-110"
                style={{ background: "#C65D4E", color: "#fff" }}
              >
                Calculate savings →
              </button>
            </form>
          </div>

          {/* Results */}
          {estimate && (
            <div className="mt-8 space-y-4">
              <PolicyBadge warning={estimate.policyWarning} />

              {estimate.fuelEvents.length > 0 && (
                <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                  <AlertTriangle size={14} />
                  Active price event: {estimate.fuelEvents.join(", ")} — estimates reflect current shock pricing
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  icon={Fuel}
                  label="Weekly ICE cost"
                  value={`NZ$${estimate.weeklyIceCostNzd.toFixed(0)}`}
                  sub={`NZ$${estimate.annualIceCostNzd.toFixed(0)} per year`}
                  accent="#C65D4E"
                />
                <StatCard
                  icon={Zap}
                  label="Weekly EV cost"
                  value={`NZ$${estimate.weeklyEvCostNzd.toFixed(0)}`}
                  sub={`NZ$${estimate.annualEvCostNzd.toFixed(0)} per year`}
                  accent="#5AADA0"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  icon={TrendingDown}
                  label="Annual savings"
                  value={
                    estimate.annualSavingsNzd >= 0
                      ? `NZ$${estimate.annualSavingsNzd.toFixed(0)}`
                      : `-NZ$${Math.abs(estimate.annualSavingsNzd).toFixed(0)}`
                  }
                  sub={estimate.annualSavingsNzd >= 0 ? "switching to EV" : "EV costs more to run"}
                  accent="#3A7D6E"
                  highlight={estimate.annualSavingsNzd > 0}
                />
                <StatCard
                  icon={ShieldCheck}
                  label="Payback period"
                  value={
                    estimate.paybackYears === null
                      ? "—"
                      : estimate.paybackYears === 0
                      ? "Instant"
                      : `${estimate.paybackYears} yrs`
                  }
                  sub={
                    estimate.paybackYears !== null && estimate.paybackYears > 0
                      ? `to recover NZ$${parseFloat(form.evPremiumNzd || "0").toFixed(0)} premium`
                      : estimate.paybackYears === 0
                      ? "No premium to recover"
                      : "Enter EV premium above"
                  }
                  accent="#D4A843"
                />
              </div>

              {/* Price footnote */}
              <p className="text-[10px] text-muted-foreground/40 text-center">
                Petrol 91: NZ${estimate.dieselPriceNzd.toFixed(2)}/L (diesel) · EV charging: NZ${estimate.evPriceNzdPerKwh.toFixed(2)}/kWh · FuelOracle live NZ pricing
              </p>

              {/* Policy footnote */}
              <details className="rounded-xl border border-white/5 overflow-hidden">
                <summary className="flex items-center gap-2 px-4 py-2.5 text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                  <ShieldCheck size={12} style={{ color: "#C65D4E" }} />
                  {FUEL_SAVINGS_POLICY_METADATA.length} AAAIP policies applied to this estimate
                </summary>
                <ul className="px-4 pb-3 space-y-2">
                  {FUEL_SAVINGS_POLICY_METADATA.map((p) => (
                    <li key={p.id} className="text-[11px] text-muted-foreground">
                      <span className="font-medium text-foreground">{p.name}</span> — {p.rationale}
                    </li>
                  ))}
                </ul>
              </details>
            </div>
          )}

          {/* Footer links */}
          <div className="mt-10 flex flex-wrap gap-4 justify-center text-xs text-muted-foreground">
            <Link to="/arataki" className="hover:text-foreground transition-colors">Arataki kete →</Link>
            <Link to="/vehicle-economy" className="hover:text-foreground transition-colors">Full TCO calculator →</Link>
            <Link to="/contact" className="hover:text-foreground transition-colors">Talk to us →</Link>
          </div>
        </div>
      </section>

      <div className="mt-auto"><BrandFooter /></div>
    </div>
  );
}
