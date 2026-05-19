"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Camera, Plus, Trash2 } from "lucide-react";
import { todayNzDate, type CleaningChecks, type CookingReading, type TempReading } from "@/lib/food-audit";

type Row = { id: string; label: string; tempC: string };
type CookRow = { id: string; dish: string; tempC: string; cookedToTime: string };

function newId() {
  return crypto.randomUUID();
}

const emptyCleaning: CleaningChecks = {
  surfacesSanitised: false,
  floorsMopped: false,
  chillersWiped: false,
  handwashStationsStocked: false,
};

export function FoodTempLog({ context = "hapai" }: { context?: "hapai" | "manaaki" }) {
  const router = useRouter();
  const [venueName, setVenueName] = useState("");
  const [recordedDate, setRecordedDate] = useState(todayNzDate());
  const [recordedBy, setRecordedBy] = useState("");
  const [fridges, setFridges] = useState<Row[]>([{ id: newId(), label: "Main fridge", tempC: "" }]);
  const [freezers, setFreezers] = useState<Row[]>([{ id: newId(), label: "Main freezer", tempC: "" }]);
  const [hotHolds, setHotHolds] = useState<Row[]>([]);
  const [cooking, setCooking] = useState<CookRow[]>([]);
  const [cleaning, setCleaning] = useState<CleaningChecks>(emptyCleaning);
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const copy = context === "manaaki"
    ? {
        backHref: "/kete/manaaki",
        backLabel: "Manaaki",
        eyebrow: "Manaaki · food safety record",
        h1: "Daily temperatures. Audit record ready.",
        body: "Record fridge, freezer, hot-hold, cooking, and cleaning checks in 30 seconds. Manaaki flags what needs corrective action before the record is filed.",
      }
    : {
        backHref: "/hapai",
        backLabel: "HAPAI library",
        eyebrow: "HAPAI · food temperature log",
        h1: "Food safety record in 30 seconds.",
        body: "A free hospitality tool for daily temperature and cleaning records mapped to Food Act 2014 Food Control Plan expectations.",
      };

  const canSubmit = venueName.trim() && recordedBy.trim() && recordedDate && !submitting;

  const photoLabel = useMemo(() => {
    if (photos.length === 0) return "Optional: upload thermometer or prep-area photos";
    return `${photos.length} photo${photos.length === 1 ? "" : "s"} attached for this record`;
  }, [photos.length]);

  async function handlePhoto(file?: File) {
    setError("");
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      setError("Please upload an image under 8MB.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPhotos((current) => [...current, String(reader.result ?? "")].slice(0, 4));
    reader.readAsDataURL(file);
  }

  async function submit() {
    setError("");
    setSubmitting(true);
    try {
      const response = await fetch("/api/hapai/food-temp-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          venueName,
          recordedDate,
          recordedBy,
          fridgeTemps: rowsToTemps(fridges),
          freezerTemps: rowsToTemps(freezers),
          hotHoldTemps: rowsToTemps(hotHolds),
          cookingTemps: cookingToTemps(cooking),
          cleaningChecks: cleaning,
          notes,
          photos,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not save the record.");
      router.push(`/hapai/food-temp-log/results/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the record.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_16%_0%,rgba(172,88,56,0.14),transparent_42%),radial-gradient(ellipse_at_80%_10%,rgba(212,168,83,0.14),transparent_40%),var(--assembl-paper)] px-6 py-12 text-[#23211F] md:px-12 md:py-16">
      <div className="mx-auto max-w-[1120px]">
        <Link href={copy.backHref} className="mb-8 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[#6B6661] hover:text-[#AC5838]">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> {copy.backLabel}
        </Link>
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <header>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#AC5838]">{copy.eyebrow}</p>
            <h1 className="mt-4 max-w-3xl font-display text-[clamp(3.2rem,7vw,6rem)] font-light leading-[0.9]">{copy.h1}</h1>
            <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-[#2A2825]">{copy.body}</p>
            <div className="mt-8 rounded-[14px] border border-[rgba(172,88,56,0.22)] bg-white/64 p-5 text-sm leading-relaxed text-[#2A2825]">
              <p className="font-medium text-[#23211F]">Food Act 2014 record posture</p>
              <p className="mt-2">This tool creates a review-ready daily record. Failed readings are flagged with corrective actions so the Duty Manager can file the record against the venue Food Control Plan.</p>
            </div>
          </header>

          <section className="rounded-[14px] border border-[rgba(35,33,31,0.10)] bg-white/78 p-5 shadow-[0_24px_80px_rgba(35,33,31,0.08)] backdrop-blur md:p-7">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Venue name">
                <input value={venueName} onChange={(event) => setVenueName(event.target.value)} className={inputClass} placeholder="Harbour Room" />
              </Field>
              <Field label="Date">
                <input type="date" value={recordedDate} onChange={(event) => setRecordedDate(event.target.value)} className={inputClass} />
              </Field>
              <Field label="Recorded by">
                <input value={recordedBy} onChange={(event) => setRecordedBy(event.target.value)} className={inputClass} placeholder="Duty Manager name" />
              </Field>
            </div>

            <ReadingRows title="Fridge temps" target="Target ≤4°C" rows={fridges} setRows={setFridges} defaultLabel="Fridge" />
            <ReadingRows title="Freezer temps" target="Target ≤-18°C" rows={freezers} setRows={setFreezers} defaultLabel="Freezer" />
            <ReadingRows title="Hot-hold temps" target="Target ≥60°C" rows={hotHolds} setRows={setHotHolds} defaultLabel="Hot-hold unit" />
            <CookingRows rows={cooking} setRows={setCooking} />

            <fieldset className="mt-7">
              <legend className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#6B6661]">Cleaning checks</legend>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <CheckBox label="Surfaces sanitised" checked={cleaning.surfacesSanitised} onChange={(value) => setCleaning((current) => ({ ...current, surfacesSanitised: value }))} />
                <CheckBox label="Floors mopped" checked={cleaning.floorsMopped} onChange={(value) => setCleaning((current) => ({ ...current, floorsMopped: value }))} />
                <CheckBox label="Chillers wiped" checked={cleaning.chillersWiped} onChange={(value) => setCleaning((current) => ({ ...current, chillersWiped: value }))} />
                <CheckBox label="Handwash stations stocked" checked={cleaning.handwashStationsStocked} onChange={(value) => setCleaning((current) => ({ ...current, handwashStationsStocked: value }))} />
              </div>
            </fieldset>

            <Field label="Notes">
              <textarea value={notes} onChange={(event) => setNotes(event.target.value)} className={`${inputClass} min-h-[96px] py-3`} placeholder="Incidents, deliveries, equipment issues, corrective actions..." />
            </Field>

            <label className="mt-5 block">
              <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.22em] text-[#6B6661]">{photoLabel}</span>
              <input type="file" accept="image/*" onChange={(event) => handlePhoto(event.target.files?.[0])} className="sr-only" id="food-temp-photo" />
              <span className="flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-[12px] border border-dashed border-[rgba(35,33,31,0.22)] bg-[#F7F4EE] p-5 text-center">
                <Camera className="h-8 w-8 text-[#AC5838]" aria-hidden />
                <span className="mt-2 text-sm text-[#5A5550]">Tap to attach a photo</span>
              </span>
            </label>
            {photos.length > 0 && (
              <div className="mt-3 flex gap-2 overflow-x-auto">
                {photos.map((photo, index) => (
                  <div key={photo.slice(0, 40)} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[10px] border border-[rgba(35,33,31,0.10)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo} alt={`Attached food safety photo ${index + 1}`} className="h-full w-full object-cover" />
                    <button type="button" onClick={() => setPhotos((current) => current.filter((_, i) => i !== index))} className="absolute right-1 top-1 rounded-full bg-white/90 px-1 text-xs">×</button>
                  </div>
                ))}
              </div>
            )}

            {error && <p className="mt-4 rounded-[10px] border border-[#B42828]/25 bg-[#FCEDED] px-4 py-3 text-sm text-[#7A1F1F]">{error}</p>}
            <button type="button" disabled={!canSubmit} onClick={submit} className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-[#AC5838] px-6 text-sm font-medium text-white transition hover:bg-[#8E432B] disabled:cursor-not-allowed disabled:bg-[#C8C2BC]">
              {submitting ? "Saving record..." : "Create food safety record"}
            </button>
          </section>
        </div>
      </div>
    </main>
  );
}

function rowsToTemps(rows: Row[]): TempReading[] {
  return rows
    .map((row) => ({ label: row.label.trim(), tempC: Number(row.tempC) }))
    .filter((row) => row.label && Number.isFinite(row.tempC));
}

function cookingToTemps(rows: CookRow[]): CookingReading[] {
  return rows
    .map((row) => ({ dish: row.dish.trim(), tempC: Number(row.tempC), cookedToTime: row.cookedToTime }))
    .filter((row) => row.dish && Number.isFinite(row.tempC));
}

const inputClass = "mt-2 h-11 w-full rounded-[10px] border border-[rgba(35,33,31,0.12)] bg-[#F7F4EE] px-3 text-sm text-[#23211F] outline-none transition focus:border-[#AC5838] focus:bg-white";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="mt-5 block first:mt-0">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#6B6661]">{label}</span>
      {children}
    </label>
  );
}

function ReadingRows({ title, target, rows, setRows, defaultLabel }: { title: string; target: string; rows: Row[]; setRows: (rows: Row[]) => void; defaultLabel: string }) {
  return (
    <section className="mt-7">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-normal text-[#23211F]">{title}</h2>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#6B6661]">{target}</p>
        </div>
        <button type="button" onClick={() => setRows([...rows, { id: newId(), label: `${defaultLabel} ${rows.length + 1}`, tempC: "" }])} className="inline-flex h-9 items-center gap-2 rounded-full border border-[rgba(35,33,31,0.14)] px-3 text-sm">
          <Plus className="h-3.5 w-3.5" aria-hidden /> Add
        </button>
      </div>
      <div className="mt-3 grid gap-2">
        {rows.map((row) => (
          <div key={row.id} className="grid grid-cols-[1fr_110px_auto] gap-2">
            <input value={row.label} onChange={(event) => setRows(rows.map((item) => item.id === row.id ? { ...item, label: event.target.value } : item))} className={inputClass} />
            <input type="number" step="0.1" value={row.tempC} onChange={(event) => setRows(rows.map((item) => item.id === row.id ? { ...item, tempC: event.target.value } : item))} className={inputClass} placeholder="°C" />
            <button type="button" onClick={() => setRows(rows.filter((item) => item.id !== row.id))} className="mt-2 inline-flex h-11 w-11 items-center justify-center rounded-[10px] border border-[rgba(35,33,31,0.12)] text-[#6B6661]" aria-label={`Remove ${row.label}`}>
              <Trash2 className="h-4 w-4" aria-hidden />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function CookingRows({ rows, setRows }: { rows: CookRow[]; setRows: (rows: CookRow[]) => void }) {
  return (
    <section className="mt-7">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-normal text-[#23211F]">Cooking final temps</h2>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#6B6661]">Optional · target ≥75°C for 30 sec</p>
        </div>
        <button type="button" onClick={() => setRows([...rows, { id: newId(), dish: "", tempC: "", cookedToTime: "" }])} className="inline-flex h-9 items-center gap-2 rounded-full border border-[rgba(35,33,31,0.14)] px-3 text-sm">
          <Plus className="h-3.5 w-3.5" aria-hidden /> Add
        </button>
      </div>
      <div className="mt-3 grid gap-2">
        {rows.map((row) => (
          <div key={row.id} className="grid gap-2 md:grid-cols-[1fr_110px_150px_auto]">
            <input value={row.dish} onChange={(event) => setRows(rows.map((item) => item.id === row.id ? { ...item, dish: event.target.value } : item))} className={inputClass} placeholder="Dish" />
            <input type="number" step="0.1" value={row.tempC} onChange={(event) => setRows(rows.map((item) => item.id === row.id ? { ...item, tempC: event.target.value } : item))} className={inputClass} placeholder="°C" />
            <input type="time" value={row.cookedToTime} onChange={(event) => setRows(rows.map((item) => item.id === row.id ? { ...item, cookedToTime: event.target.value } : item))} className={inputClass} />
            <button type="button" onClick={() => setRows(rows.filter((item) => item.id !== row.id))} className="mt-2 inline-flex h-11 w-11 items-center justify-center rounded-[10px] border border-[rgba(35,33,31,0.12)] text-[#6B6661]" aria-label="Remove cooking temperature">
              <Trash2 className="h-4 w-4" aria-hidden />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function CheckBox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-[10px] border border-[rgba(35,33,31,0.10)] bg-[#F7F4EE] px-3 py-2 text-sm">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="rounded" />
      {label}
    </label>
  );
}
