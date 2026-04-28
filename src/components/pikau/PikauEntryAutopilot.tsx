import { useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { AlertTriangle, CheckCircle2, ClipboardList, FileWarning, Sparkles } from "lucide-react";

import DashboardGlassCard from "@/components/kete/DashboardGlassCard";
import { buildPikauEntryPlan, type PikauEntryDocumentType, type PikauEntryInput } from "@/lib/pikau/pikauEntryPlanner";

const ACCENT = "#5AADA0";
const POUNAMU = "#1F4D47";
const INK = "#0F2A26";
const MUTED = "#7A8B82";
const INPUT_BG = "rgba(255,255,255,0.72)";
const BORDER = "rgba(31,77,71,0.12)";

const DOCUMENT_OPTIONS: { value: PikauEntryDocumentType; label: string }[] = [
  { value: "commercial_invoice", label: "Commercial invoice" },
  { value: "packing_list", label: "Packing list" },
  { value: "bill_of_lading", label: "Bill of lading" },
  { value: "air_waybill", label: "Air waybill" },
  { value: "certificate_of_origin", label: "Certificate of origin" },
  { value: "dangerous_goods_declaration", label: "Dangerous goods declaration" },
  { value: "mpi_certificate", label: "MPI certificate" },
  { value: "fumigation_certificate", label: "Fumigation / ISPM 15" },
];

const initialState: PikauEntryInput = {
  shipmentRef: "AKL-ITA-2026-041",
  importerName: "Harbourline Brokers",
  description: "Imported packaged pasta sauces for retail sale",
  hsCode: "2103.20",
  originCountry: "IT",
  incoterm: "CIF",
  customsValueNzd: 18400,
  freightNzd: 0,
  insuranceNzd: 0,
  packages: 128,
  grossWeightKg: 2140,
  documentTypes: ["commercial_invoice", "bill_of_lading", "packing_list"],
  hasImporterClientCode: true,
  claimPreference: false,
  hasFoodForSale: true,
  hasWoodPackaging: true,
  hasDangerousGoods: false,
  intendedUseCode: "",
};

type ToggleFieldKey =
  | "hasImporterClientCode"
  | "claimPreference"
  | "hasFoodForSale"
  | "hasWoodPackaging"
  | "hasDangerousGoods";

const TOGGLE_FIELDS: { key: ToggleFieldKey; label: string }[] = [
  { key: "hasImporterClientCode", label: "Importer client code on file" },
  { key: "claimPreference", label: "Claim preferential tariff" },
  { key: "hasFoodForSale", label: "Food or beverage for sale" },
  { key: "hasWoodPackaging", label: "Wood packaging present" },
  { key: "hasDangerousGoods", label: "Dangerous goods" },
];

const inputClass = "rounded-lg px-3 py-2 text-sm focus:outline-none";
const inputStyle: CSSProperties = {
  background: INPUT_BG,
  border: `1px solid ${BORDER}`,
  color: INK,
  fontFamily: "'Inter', sans-serif",
};

export default function PikauEntryAutopilot() {
  const [form, setForm] = useState<PikauEntryInput>(initialState);
  const plan = useMemo(() => buildPikauEntryPlan(form), [form]);

  const toggleDocument = (doc: PikauEntryDocumentType) => {
    setForm((current) => ({
      ...current,
      documentTypes: current.documentTypes.includes(doc)
        ? current.documentTypes.filter((item) => item !== doc)
        : [...current.documentTypes, doc],
    }));
  };

  return (
    <DashboardGlassCard accentColor={ACCENT} glow className="p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.18em]" style={{ background: `${ACCENT}18`, color: POUNAMU }}>
            <Sparkles size={12} />
            Best Next Implementation
          </div>
          <h3 className="text-[28px] leading-none" style={{ color: INK, fontFamily: "'Cormorant Garamond', serif" }}>
            Entry Autopilot for Customs & Freight
          </h3>
          <p className="mt-2 text-sm leading-6" style={{ color: MUTED, fontFamily: "'Inter', sans-serif" }}>
            This is the highest-value near-term agent pattern for brokers: ingest the shipment pack, draft the entry facts, and hand the human broker an exception queue instead of a blank form.
          </p>
        </div>

        <div className="grid w-full max-w-[360px] grid-cols-2 gap-3">
          <MetricCard label="Readiness" value={`${plan.readinessScore}%`} tone={plan.status === "ready_for_broker_review" ? "good" : "warn"} />
          <MetricCard label="Status" value={labelForStatus(plan.status)} tone={plan.status === "hold_for_compliance" ? "danger" : "good"} />
          <MetricCard label="Duty est." value={`NZ$${plan.estimatedDutyNzd.toLocaleString()}`} tone="neutral" />
          <MetricCard label="GST est." value={`NZ$${plan.estimatedGstNzd.toLocaleString()}`} tone="neutral" />
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[1.1fr,0.9fr]">
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Shipment ref">
              <input value={form.shipmentRef ?? ""} onChange={(e) => setForm((c) => ({ ...c, shipmentRef: e.target.value }))} className={inputClass} style={inputStyle} />
            </Field>
            <Field label="Importer">
              <input value={form.importerName} onChange={(e) => setForm((c) => ({ ...c, importerName: e.target.value }))} className={inputClass} style={inputStyle} />
            </Field>
            <Field label="Goods description" wide>
              <input value={form.description} onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))} className={inputClass} style={inputStyle} />
            </Field>
            <Field label="HS code">
              <input value={form.hsCode ?? ""} onChange={(e) => setForm((c) => ({ ...c, hsCode: e.target.value }))} className={inputClass} style={inputStyle} />
            </Field>
            <Field label="Origin">
              <input value={form.originCountry ?? ""} onChange={(e) => setForm((c) => ({ ...c, originCountry: e.target.value.toUpperCase() }))} className={inputClass} style={inputStyle} maxLength={2} />
            </Field>
            <Field label="Incoterm">
              <select value={form.incoterm} onChange={(e) => setForm((c) => ({ ...c, incoterm: e.target.value as PikauEntryInput["incoterm"] }))} className={inputClass} style={inputStyle}>
                {["EXW", "FCA", "FOB", "CFR", "CIF", "CPT", "CIP", "DAP", "DPU", "DDP"].map((term) => (
                  <option key={term} value={term}>{term}</option>
                ))}
              </select>
            </Field>
            <Field label="Customs value (NZD)">
              <input type="number" value={form.customsValueNzd} onChange={(e) => setForm((c) => ({ ...c, customsValueNzd: Number(e.target.value) || 0 }))} className={inputClass} style={inputStyle} />
            </Field>
            <Field label="Freight (NZD)">
              <input type="number" value={form.freightNzd} onChange={(e) => setForm((c) => ({ ...c, freightNzd: Number(e.target.value) || 0 }))} className={inputClass} style={inputStyle} />
            </Field>
            <Field label="Insurance (NZD)">
              <input type="number" value={form.insuranceNzd} onChange={(e) => setForm((c) => ({ ...c, insuranceNzd: Number(e.target.value) || 0 }))} className={inputClass} style={inputStyle} />
            </Field>
            <Field label="Intended use code">
              <input value={form.intendedUseCode ?? ""} onChange={(e) => setForm((c) => ({ ...c, intendedUseCode: e.target.value.toUpperCase() }))} className={inputClass} style={inputStyle} maxLength={2} placeholder="HC" />
            </Field>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {TOGGLE_FIELDS.map((item) => (
              <label
                key={item.key}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm"
                style={{ background: `${ACCENT}10`, border: `1px solid ${BORDER}`, color: INK, fontFamily: "'Inter', sans-serif" }}
              >
                <input
                  type="checkbox"
                  checked={Boolean(form[item.key as keyof PikauEntryInput])}
                  onChange={(e) => setForm((c) => ({ ...c, [item.key]: e.target.checked }))}
                  style={{ accentColor: ACCENT }}
                />
                {item.label}
              </label>
            ))}
          </div>

          <div>
            <div className="mb-2 text-[10px] uppercase tracking-[0.18em]" style={{ color: MUTED, fontFamily: "'Inter', sans-serif" }}>
              Documents in bundle
            </div>
            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
              {DOCUMENT_OPTIONS.map((option) => {
                const active = form.documentTypes.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleDocument(option.value)}
                    className="rounded-xl px-3 py-3 text-left text-sm transition-colors"
                    style={{
                      background: active ? `${ACCENT}20` : "rgba(255,255,255,0.55)",
                      border: `1px solid ${active ? `${ACCENT}66` : BORDER}`,
                      color: active ? INK : MUTED,
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <StatusPanel title="Draft Summary" icon={ClipboardList}>
            <p className="text-sm leading-6" style={{ color: INK, fontFamily: "'Inter', sans-serif" }}>{plan.summary}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm" style={{ color: MUTED, fontFamily: "'Inter', sans-serif" }}>
              <div>Duty rate: <span style={{ color: INK }}>{plan.dutyRatePercent}%</span></div>
              <div>Border charges: <span style={{ color: INK }}>NZ${plan.estimatedTotalBorderChargesNzd.toLocaleString()}</span></div>
            </div>
          </StatusPanel>

          <StatusPanel title="Required Documents" icon={CheckCircle2}>
            <div className="flex flex-wrap gap-2">
              {plan.requiredDocuments.map((doc) => {
                const missing = plan.missingDocuments.includes(doc);
                return (
                  <span
                    key={doc}
                    className="rounded-full px-2.5 py-1 text-[11px] uppercase tracking-[0.16em]"
                    style={{
                      background: missing ? "rgba(200,90,84,0.12)" : `${ACCENT}18`,
                      color: missing ? "#C85A54" : POUNAMU,
                    }}
                  >
                    {doc.replaceAll("_", " ")}
                  </span>
                );
              })}
            </div>
          </StatusPanel>

          <StatusPanel title={`Blockers ${plan.blockers.length ? `(${plan.blockers.length})` : ""}`} icon={FileWarning}>
            <IssueList items={plan.blockers} emptyLabel="No hard blockers. This pack is ready for broker review." tone="danger" />
          </StatusPanel>

          <StatusPanel title={`Warnings ${plan.warnings.length ? `(${plan.warnings.length})` : ""}`} icon={AlertTriangle}>
            <IssueList items={plan.warnings} emptyLabel="No warning-level issues detected." tone="warn" />
          </StatusPanel>

          <StatusPanel title="Next Actions" icon={Sparkles}>
            <ol className="space-y-2 pl-5 text-sm" style={{ color: INK, fontFamily: "'Inter', sans-serif" }}>
              {plan.nextActions.map((action) => (
                <li key={action}>{action}</li>
              ))}
            </ol>
          </StatusPanel>
        </div>
      </div>
    </DashboardGlassCard>
  );
}

function Field({
  label,
  wide,
  children,
}: {
  label: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <label className={wide ? "md:col-span-2" : ""}>
      <div className="mb-1 text-[10px] uppercase tracking-[0.18em]" style={{ color: MUTED, fontFamily: "'Inter', sans-serif" }}>
        {label}
      </div>
      {children}
    </label>
  );
}

function MetricCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "good" | "warn" | "danger" | "neutral";
}) {
  const toneStyles = {
    good: { bg: `${ACCENT}18`, fg: POUNAMU },
    warn: { bg: "rgba(217,188,122,0.16)", fg: "#896B2A" },
    danger: { bg: "rgba(200,90,84,0.12)", fg: "#B14A46" },
    neutral: { bg: "rgba(255,255,255,0.55)", fg: INK },
  }[tone];

  return (
    <div className="rounded-2xl px-4 py-3" style={{ background: toneStyles.bg, border: `1px solid ${BORDER}` }}>
      <div className="text-[10px] uppercase tracking-[0.16em]" style={{ color: MUTED, fontFamily: "'Inter', sans-serif" }}>
        {label}
      </div>
      <div className="mt-1 text-lg" style={{ color: toneStyles.fg, fontFamily: "'Cormorant Garamond', serif" }}>
        {value}
      </div>
    </div>
  );
}

function StatusPanel({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Sparkles;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.58)", border: `1px solid ${BORDER}` }}>
      <div className="mb-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em]" style={{ color: MUTED, fontFamily: "'Inter', sans-serif" }}>
        <Icon size={13} style={{ color: ACCENT }} />
        {title}
      </div>
      {children}
    </div>
  );
}

function IssueList({
  items,
  emptyLabel,
  tone,
}: {
  items: { code: string; title: string; detail: string }[];
  emptyLabel: string;
  tone: "danger" | "warn";
}) {
  if (items.length === 0) {
    return <p className="text-sm" style={{ color: MUTED, fontFamily: "'Inter', sans-serif" }}>{emptyLabel}</p>;
  }

  const accent = tone === "danger" ? "#C85A54" : "#B48433";

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.code} className="rounded-xl px-3 py-3" style={{ background: `${accent}10`, border: `1px solid ${accent}22` }}>
          <div className="text-sm" style={{ color: INK, fontFamily: "'Inter', sans-serif" }}>{item.title}</div>
          <div className="mt-1 text-sm leading-6" style={{ color: MUTED, fontFamily: "'Inter', sans-serif" }}>{item.detail}</div>
        </div>
      ))}
    </div>
  );
}

function labelForStatus(status: ReturnType<typeof buildPikauEntryPlan>["status"]): string {
  switch (status) {
    case "ready_for_broker_review":
      return "Broker review";
    case "missing_information":
      return "Needs docs";
    default:
      return "On hold";
  }
}
