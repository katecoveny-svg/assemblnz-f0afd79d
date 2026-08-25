"use client";

import { useMemo, useState } from "react";
import { FileCheck2, Plus, ShieldCheck, Ship, Trash2 } from "lucide-react";
import { HapaiToolShell } from "@/components/hapai/HapaiToolShell";
import { ToolLeadCapture } from "@/components/hapai/ToolLeadCapture";
import {
  buildCustomsEntryDraft,
  formatMoney,
  TARIFF_PLACEHOLDER,
  type CustomsEntryInput,
  type Incoterm,
} from "@/lib/hapai/customs-entry";

const INCOTERMS: Incoterm[] = ["EXW", "FOB", "CFR", "CIF", "FCA", "CPT", "CIP", "DAP", "DDP", "other"];

type LineState = {
  description: string;
  quantity: string;
  unitValue: string;
  countryOfOrigin: string;
};

const emptyLine: LineState = { description: "", quantity: "", unitValue: "", countryOfOrigin: "" };

const TRUST_BADGES = ["Draft only", "Never lodges to TSW", "Broker stays in control"] as const;

export function CustomsEntryTool() {
  const [supplierName, setSupplierName] = useState("");
  const [supplierCountry, setSupplierCountry] = useState("");
  const [importerName, setImporterName] = useState("");
  const [importerClientCode, setImporterClientCode] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [currency, setCurrency] = useState("NZD");
  const [incoterm, setIncoterm] = useState<Incoterm>("FOB");
  const [freight, setFreight] = useState("");
  const [insurance, setInsurance] = useState("");
  const [lines, setLines] = useState<LineState[]>([{ ...emptyLine }]);
  const [submitted, setSubmitted] = useState(false);

  const input: CustomsEntryInput = useMemo(
    () => ({
      supplierName,
      supplierCountry,
      importerName,
      importerClientCode,
      invoiceNumber,
      invoiceDate,
      currency,
      incoterm,
      freightNzd: Number(freight) || 0,
      insuranceNzd: Number(insurance) || 0,
      lines: lines.map((line) => ({
        description: line.description,
        quantity: Number(line.quantity) || 0,
        unitValue: Number(line.unitValue) || 0,
        countryOfOrigin: line.countryOfOrigin,
      })),
    }),
    [
      supplierName,
      supplierCountry,
      importerName,
      importerClientCode,
      invoiceNumber,
      invoiceDate,
      currency,
      incoterm,
      freight,
      insurance,
      lines,
    ],
  );

  const draft = useMemo(() => buildCustomsEntryDraft(input), [input]);
  const hasLines = draft.lines.length > 0;

  function updateLine(index: number, patch: Partial<LineState>) {
    setLines((current) => current.map((line, i) => (i === index ? { ...line, ...patch } : line)));
  }

  function addLine() {
    setLines((current) => [...current, { ...emptyLine }]);
  }

  function removeLine(index: number) {
    setLines((current) => (current.length <= 1 ? current : current.filter((_, i) => i !== index)));
  }

  return (
    <HapaiToolShell
      kicker="SPARK · Pīkau · freight & customs"
      title="Customs entry drafter"
      description="Paste the fields from a commercial invoice and get back a structured customs entry draft your broker can check and file. It never invents an HS code and never lodges — your broker confirms classification and files it."
      toolPath="/hapai/customs-entry"
      shareTitle="Customs entry drafter — a free assembl SPARK tool"
      shareText="Turn your invoice into a structured customs entry draft your broker can file. Draft only — never lodges to TSW."
      posture="Draft only. It structures your invoice into entry fields, never invents an HS code, and never lodges to TSW. Your licensed broker confirms classification and files the entry."
      highlights={[
        { title: "Draft only", body: "Output is a working draft for your broker — assembl never files it.", icon: <FileCheck2 className="h-5 w-5" aria-hidden /> },
        { title: "Never lodges to TSW", body: "There is no submission path. Nothing leaves for Customs from here.", icon: <ShieldCheck className="h-5 w-5" aria-hidden /> },
        { title: "Broker stays in control", body: "Every tariff line reads ‘to be classified’. The broker confirms the HS code.", icon: <Ship className="h-5 w-5" aria-hidden /> },
      ]}
    >
      <div className="grid gap-6 p-5 md:p-7 lg:grid-cols-[1fr_1fr]">
        {/* ── FORM ─────────────────────────────────────────────── */}
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setSubmitted(true);
          }}
          className="rounded-[10px] border border-[rgba(35,33,31,0.10)] bg-white/70 p-5"
        >
          <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-[#3f7373]">Commercial invoice</p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Supplier / consignor">
              <input className={inputClass} value={supplierName} onChange={(e) => setSupplierName(e.target.value)} placeholder="Acme Co., Ltd" />
            </Field>
            <Field label="Supplier country">
              <input className={inputClass} value={supplierCountry} onChange={(e) => setSupplierCountry(e.target.value)} placeholder="China" />
            </Field>
            <Field label="Importer / consignee">
              <input className={inputClass} value={importerName} onChange={(e) => setImporterName(e.target.value)} placeholder="Your NZ business Ltd" />
            </Field>
            <Field label="Importer client code (optional)">
              <input className={inputClass} value={importerClientCode} onChange={(e) => setImporterClientCode(e.target.value)} placeholder="ABC123" />
            </Field>
            <Field label="Invoice number">
              <input className={inputClass} value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} placeholder="INV-00421" />
            </Field>
            <Field label="Invoice date">
              <input className={inputClass} type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
            </Field>
            <Field label="Currency">
              <input className={inputClass} value={currency} onChange={(e) => setCurrency(e.target.value.toUpperCase())} maxLength={3} placeholder="USD" />
            </Field>
            <Field label="Incoterm">
              <select className={inputClass} value={incoterm} onChange={(e) => setIncoterm(e.target.value as Incoterm)}>
                {INCOTERMS.map((term) => (
                  <option key={term} value={term}>
                    {term}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Freight (NZ$)">
              <input className={inputClass} type="number" min={0} step="0.01" value={freight} onChange={(e) => setFreight(e.target.value)} placeholder="0" />
            </Field>
            <Field label="Insurance (NZ$)">
              <input className={inputClass} type="number" min={0} step="0.01" value={insurance} onChange={(e) => setInsurance(e.target.value)} placeholder="0" />
            </Field>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-[#3f7373]">Line items</p>
            <button type="button" onClick={addLine} className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(58,125,110,0.3)] px-3 py-1.5 font-mono text-[12px] uppercase tracking-[0.12em] text-[#3f7373] transition hover:bg-[#3f7373]/8">
              <Plus className="h-3.5 w-3.5" aria-hidden /> Add line
            </button>
          </div>

          <div className="mt-3 space-y-3">
            {lines.map((line, index) => (
              <div key={index} className="rounded-[10px] border border-[rgba(35,33,31,0.1)] bg-[#f7f9f8] p-3">
                <div className="flex items-start gap-2">
                  <input
                    className={inputClass}
                    value={line.description}
                    onChange={(e) => updateLine(index, { description: e.target.value })}
                    placeholder="Goods description"
                  />
                  {lines.length > 1 ? (
                    <button type="button" onClick={() => removeLine(index)} aria-label="Remove line" className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] text-[#6B6661] transition hover:text-[#9A3412]">
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  ) : null}
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  <input className={inputClass} type="number" min={0} step="1" value={line.quantity} onChange={(e) => updateLine(index, { quantity: e.target.value })} placeholder="Qty" />
                  <input className={inputClass} type="number" min={0} step="0.01" value={line.unitValue} onChange={(e) => updateLine(index, { unitValue: e.target.value })} placeholder="Unit value" />
                  <input className={inputClass} value={line.countryOfOrigin} onChange={(e) => updateLine(index, { countryOfOrigin: e.target.value })} placeholder="Origin" />
                </div>
              </div>
            ))}
          </div>

          <button type="submit" className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[10px] bg-[#3f7373] px-5 text-sm font-medium text-[#ffffff] transition hover:bg-[#2E6657]">
            <FileCheck2 className="h-4 w-4" aria-hidden /> Build the draft
          </button>
        </form>

        {/* ── RESULT ───────────────────────────────────────────── */}
        <div className="rounded-[10px] border border-[rgba(35,33,31,0.1)] bg-white/78 p-5">
          <div className="flex flex-wrap items-center gap-2">
            {TRUST_BADGES.map((badge) => (
              <span key={badge} className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(58,56,50,0.24)] bg-[#eef4f4] px-3 py-1 font-mono text-[12px] uppercase tracking-[0.12em] text-[#313c42]">
                <ShieldCheck className="h-3 w-3" aria-hidden /> {badge}
              </span>
            ))}
          </div>

          {!hasLines ? (
            <p className="mt-6 text-sm leading-relaxed text-[#5A5550]">
              Add at least one line item, then build the draft. Every tariff line will read “{TARIFF_PLACEHOLDER}” — classification is your broker’s call.
            </p>
          ) : (
            <div className="mt-5">
              <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-[#3f7373]">Customs entry draft</p>

              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <Meta label="Supplier" value={`${draft.header.supplierName} · ${draft.header.supplierCountry}`} />
                <Meta label="Importer" value={draft.header.importerName} />
                <Meta label="Invoice" value={`${draft.header.invoiceNumber} · ${draft.header.invoiceDate}`} />
                <Meta label="Terms" value={`${draft.header.incoterm} · ${draft.header.currency}`} />
              </dl>

              <div className="mt-4 overflow-x-auto rounded-[8px] border border-[rgba(35,33,31,0.08)]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#f7f9f8] text-[#5A5550]">
                    <tr>
                      <th className="p-2">Description</th>
                      <th className="p-2 text-right">Qty</th>
                      <th className="p-2 text-right">Line value</th>
                      <th className="p-2">Tariff line</th>
                    </tr>
                  </thead>
                  <tbody>
                    {draft.lines.map((line, index) => (
                      <tr key={index} className="border-t border-[rgba(35,33,31,0.06)] align-top">
                        <td className="p-2">{line.description}</td>
                        <td className="p-2 text-right tabular-nums">{line.quantity}</td>
                        <td className="p-2 text-right tabular-nums">{formatMoney(line.lineValue, draft.header.currency)}</td>
                        <td className="p-2 text-[#9A3412]">{line.tariffLine}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <Meta label="Goods value" value={formatMoney(draft.goodsValue, draft.header.currency)} />
                <Meta label="Freight" value={formatMoney(draft.freightNzd, "NZD")} />
                <Meta label="Insurance" value={formatMoney(draft.insuranceNzd, "NZD")} />
                <Meta label="Customs value (CIF)" value={formatMoney(draft.customsValue, "NZD")} strong />
                <Meta label="Indicative GST (15%)" value={`${formatMoney(draft.indicativeGst, "NZD")} — broker confirms`} />
              </dl>

              <div className="mt-4 rounded-[8px] border border-[rgba(58,125,110,0.22)] bg-[#E7F1ED] p-3">
                <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-[#3f7373]">Before your broker lodges</p>
                <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-[#3D4250]">
                  {draft.brokerChecklist.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span aria-hidden className="text-[#3f7373]">▢</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 space-y-1.5 text-[12px] leading-relaxed text-[#6B6661]">
                {draft.notes.map((note) => (
                  <p key={note}>{note}</p>
                ))}
              </div>

              {submitted ? (
                <div className="mt-5">
                  <ToolLeadCapture
                    toolSlug="customs-entry"
                    title="Email me this draft"
                    blurb="Optional. We’ll send a copy of this customs entry draft. It stays draft-only and the tool works either way."
                    payload={{
                      invoiceNumber: draft.header.invoiceNumber,
                      supplier: draft.header.supplierName,
                      customsValue: draft.customsValue,
                      lineCount: draft.lines.length,
                      assumptionsVersion: draft.assumptionsVersion,
                    }}
                  />
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </HapaiToolShell>
  );
}

const inputClass =
  "h-10 w-full rounded-[8px] border border-[rgba(35,33,31,0.12)] bg-white px-3 text-sm text-[#313c42] outline-none transition focus:border-[#3f7373]";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="font-mono text-[12px] uppercase tracking-[0.16em] text-[#6B6661]">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function Meta({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div>
      <dt className="font-mono text-[12px] uppercase tracking-[0.14em] text-[#6B6661]">{label}</dt>
      <dd className={["mt-0.5", strong ? "font-medium text-[#313c42]" : "text-[#313c42]"].join(" ")}>{value}</dd>
    </div>
  );
}
