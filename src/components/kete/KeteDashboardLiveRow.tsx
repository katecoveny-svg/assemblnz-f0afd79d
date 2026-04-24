import { useMemo } from "react";
import {
  CloudSun, Fuel, Truck, Ship, ShieldCheck, Scale, HardHat,
  Sprout, Anchor, Activity, BarChart3, BookOpen,
} from "lucide-react";
import LiveDataTiles, {
  loadWeather, loadFuel, loadFleet, loadDriverScore, loadVessels,
  loadMarine, loadConstructionMaterial, loadConsents, loadPasture,
  loadComplianceScans, loadLatestRegChange,
  type LiveTileSpec,
} from "./LiveDataTiles";

/**
 * KeteDashboardLiveRow
 *
 * Drops the same live-data tiles every kete landing page exposes
 * into the corresponding dashboard. Each tile calls the same edge
 * function the agent /chat tools route through (`tool-executor.ts`),
 * so the data the dashboard surfaces is byte-identical to what the
 * agent reasons over in conversation.
 *
 * Curated per kete — only relevant feeds appear.
 */

export type DashboardKete =
  | "manaaki"
  | "waihanga"
  | "auaha"
  | "arataki"
  | "pikau"
  | "hoko"
  | "ako"
  | "toro"
  | "admin"
  | "command";

interface Props {
  kete: DashboardKete;
  /** Optional accent override; falls back to per-kete default. */
  accent?: string;
  /** Render compact eyebrow above the row. Default true. */
  showHeader?: boolean;
  className?: string;
}

const KETE_ACCENT: Record<DashboardKete, string> = {
  manaaki: "#3A7D6E",
  waihanga: "#6B7B8C",
  auaha: "#4AA5A8",
  arataki: "#8B7D6B",
  pikau: "#5B8B7E",
  hoko: "#9B7B7B",
  ako: "#7B9B7B",
  toro: "#7B8B9B",
  admin: "#8E8177",
  command: "#4AA5A8",
};

const KETE_LABEL: Record<DashboardKete, string> = {
  manaaki: "Hospitality",
  waihanga: "Construction",
  auaha: "Creative & Marketing",
  arataki: "Automotive & Fleet",
  pikau: "Freight & Customs",
  hoko: "Retail",
  ako: "Early Childhood",
  toro: "Family",
  admin: "Platform",
  command: "Cross-sector",
};

/** Industry tags for the compliance feed loader (matches `compliance_updates.affected_industries`). */
const KETE_INDUSTRY: Record<DashboardKete, string[]> = {
  manaaki: ["hospitality"],
  waihanga: ["construction"],
  auaha: ["marketing", "creative"],
  arataki: ["automotive", "fleet"],
  pikau: ["freight", "customs", "logistics"],
  hoko: ["retail"],
  ako: ["early_childhood", "education"],
  toro: ["family"],
  admin: ["hospitality", "construction", "automotive", "freight", "retail"],
  command: ["hospitality", "construction", "automotive", "freight", "retail"],
};

function tilesFor(kete: DashboardKete): LiveTileSpec[] {
  switch (kete) {
    case "manaaki":
      return [
        { label: "Auckland venue", source: "Open-Meteo · NZ", icon: CloudSun,
          load: () => loadWeather("Auckland", -36.85, 174.76) },
        { label: "Latest regulation", source: "Compliance scanner", icon: Scale,
          load: () => loadLatestRegChange(KETE_INDUSTRY.manaaki) },
        { label: "Sources synced today", source: "NZ governance brain", icon: ShieldCheck,
          load: loadComplianceScans },
      ];
    case "waihanga":
      return [
        { label: "Auckland site", source: "Open-Meteo · NZ", icon: CloudSun,
          load: () => loadWeather("Auckland", -36.85, 174.76) },
        { label: "Consents YTD", source: "Stats NZ · MBIE", icon: HardHat,
          load: loadConsents },
        { label: "Concrete · 25 MPa", source: "MBIE materials", icon: BarChart3,
          load: () => loadConstructionMaterial("Concrete - Ready Mix (25 MPa)") },
      ];
    case "auaha":
      return [
        { label: "Latest regulation", source: "Privacy / Fair Trading", icon: Scale,
          load: () => loadLatestRegChange(KETE_INDUSTRY.auaha) },
        { label: "Sources synced today", source: "NZ governance brain", icon: ShieldCheck,
          load: loadComplianceScans },
        { label: "Wellington weather", source: "Open-Meteo · NZ", icon: CloudSun,
          load: () => loadWeather("Wellington", -41.29, 174.78) },
      ];
    case "arataki":
      return [
        { label: "Fleet status", source: "Telematics · live", icon: Truck, load: loadFleet },
        { label: "Driver scores", source: "Telematics · live", icon: Activity, load: loadDriverScore },
        { label: "NZ fuel", source: "MBIE weekly monitor", icon: Fuel, load: loadFuel },
      ];
    case "pikau":
      return [
        { label: "Vessels tracked", source: "AISStream · live", icon: Ship,
          load: () => loadVessels("Hauraki Gulf") },
        { label: "Marine forecast", source: "MetService", icon: Anchor,
          load: () => loadMarine("auckland", "Hauraki Gulf") },
        { label: "NZ fuel", source: "MBIE weekly monitor", icon: Fuel, load: loadFuel },
      ];
    case "hoko":
      return [
        { label: "Auckland weather", source: "Open-Meteo · NZ", icon: CloudSun,
          load: () => loadWeather("Auckland", -36.85, 174.76) },
        { label: "Latest regulation", source: "Fair Trading · Privacy", icon: Scale,
          load: () => loadLatestRegChange(KETE_INDUSTRY.hoko) },
        { label: "Sources synced today", source: "NZ governance brain", icon: ShieldCheck,
          load: loadComplianceScans },
      ];
    case "ako":
      return [
        { label: "Auckland weather", source: "Open-Meteo · NZ", icon: CloudSun,
          load: () => loadWeather("Auckland", -36.85, 174.76) },
        { label: "Latest regulation", source: "MoE · Education Council", icon: BookOpen,
          load: () => loadLatestRegChange(KETE_INDUSTRY.ako) },
        { label: "Sources synced today", source: "NZ governance brain", icon: ShieldCheck,
          load: loadComplianceScans },
      ];
    case "toro":
      return [
        { label: "Auckland weather", source: "Open-Meteo · NZ", icon: CloudSun,
          load: () => loadWeather("Auckland", -36.85, 174.76) },
        { label: "Pasture NDVI", source: "Sentinel-2 · agri", icon: Sprout, load: loadPasture },
        { label: "NZ fuel", source: "MBIE weekly monitor", icon: Fuel, load: loadFuel },
      ];
    case "command":
    case "admin":
      return [
        { label: "Sources synced today", source: "NZ governance brain", icon: ShieldCheck,
          load: loadComplianceScans },
        { label: "Latest regulation", source: "Cross-sector", icon: Scale,
          load: () => loadLatestRegChange(KETE_INDUSTRY.admin) },
        { label: "NZ fuel", source: "MBIE weekly monitor", icon: Fuel, load: loadFuel },
      ];
  }
}

export default function KeteDashboardLiveRow({
  kete, accent, showHeader = true, className,
}: Props) {
  const tiles = useMemo(() => tilesFor(kete), [kete]);
  const colour = accent ?? KETE_ACCENT[kete];

  return (
    <section className={className} aria-label={`${KETE_LABEL[kete]} live signals`}>
      {showHeader && (
        <div className="flex items-baseline justify-between mb-3 max-w-3xl mx-auto">
          <h2
            className="text-[11px] uppercase tracking-[0.22em]"
            style={{ color: colour, fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
          >
            Live signals · {KETE_LABEL[kete]}
          </h2>
          <span
            className="text-[10px]"
            style={{ color: "rgba(111,97,88,0.55)", fontFamily: "'Inter', sans-serif" }}
          >
            Same data the agents read
          </span>
        </div>
      )}
      <LiveDataTiles tiles={tiles} accent={colour} refreshMs={60_000} />
    </section>
  );
}
