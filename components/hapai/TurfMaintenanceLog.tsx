"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import {
  todayNzDate,
  type ChemicalApplication,
  type HazardInspection,
  type SurfaceType,
  type TurfMaintenanceChecks,
} from "@/lib/turf-audit";

function newId() {
  return crypto.randomUUID();
}

type ChemRow = ChemicalApplication & { id: string };

const emptyChecks: TurfMaintenanceChecks = {
  mowedThisWeek: false,
  mowingHeightMm: undefined,
  irrigationRunning: false,
  lineMarkingFresh: false,
  lineMarkingDate: "",
  changingRoomsClean: false,
  firstAidStocked: false,
  volunteerInductionLog: false,
  ppeStocked: false,
};

const SURFACE_OPTIONS: Array<{ value: SurfaceType; label: string }> = [
  { value: "natural_turf", label: "Natural turf" },
  { value: "artificial_turf", label: "Artificial turf" },
  { value: "hybrid", label: "Hybrid surface" },
  { value: "grass_field", label: "Grass field" },
  { value: "asphalt", label: "Asphalt court" },
];

export function TurfMaintenanceLog() {
  const router = useRouter();
  const [clubName, setClubName] = useState("");
  const [groundName, setGroundName] = useState("");
  const [surfaceType, setSurfaceType] = useState<SurfaceType | "">("");
  const [recordedDate, setRecordedDate] = useState(todayNzDate());
  const [recordedBy, setRecordedBy] = useState("");
  const [checks, setChecks] = useState<TurfMaintenanceChecks>(emptyChecks);
  const [chemicals, setChemicals] = useState<ChemRow[]>([]);
  const [hazardInspectedOn, setHazardInspectedOn] = useState("");
  const [hazardInspectedBy, setHazardInspectedBy] = useState("");
  const [hazardList, setHazardList] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(
    () =>
      clubName.trim() &&
      groundName.trim() &&
      surfaceType &&
      recordedBy.trim() &&
      recordedDate &&
      !submitting,
    [clubName, groundName, surfaceType, recordedBy, recordedDate, submitting],
  );

  async function submit() {
    setError("");
    setSubmitting(true);
    const hazardInspection: HazardInspection | null =
      hazardInspectedOn && hazardInspectedBy
        ? {
            inspectedOn: hazardInspectedOn,
            inspectedBy: hazardInspectedBy,
            hazards: hazardList
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean),
          }
        : null;
    try {
      const response = await fetch("/api/hapai/turf-maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clubName,
          groundName,
          surfaceType,
          recordedDate,
          recordedBy,
          weeklyChecks: checks,
          chemicalApplications: chemicals.map(({ id, ...rest }) => rest),
          hazardInspection,
          notes,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not save the record.");
      router.push(`/hapai/turf-maintenance/results/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the record.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_16%_0%,rgba(106,138,111,0.14),transparent_42%),radial-gradient(ellipse_at_80%_10%,rgba(43,107,87,0.12),transparent_40%),var(--assembl-paper)] px-6 py-12 text-[#23211F] md:px-12 md:py-16">
      <div className="mx-auto max-w-[1120px]">
        <Link
          href="/hapai"
          className="mb-8 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[#6B6661] hover:text-[#2B6B57]"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> HAPAI library
        </Link>
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <header>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#2B6B57]">
              HAPAI · turf maintenance log
            </p>
            <h1 className="mt-4 max-w-3xl font-display text-[clamp(3.2rem,7vw,6rem)] font-light leading-[0.9]">
              A pitch that’s ready to play. A record you can file.
            </h1>
            <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-[#2A2825]">
              A free tool for NZ sports clubs, school grounds, and community
              trusts. Weekly mowing, irrigation, line marking, hazard walk,
              chemical sprays — log in 30 seconds, file with confidence.
            </p>
            <div className="mt-8 rounded-[14px] border border-[rgba(43,107,87,0.22)] bg-white/64 p-5 text-sm leading-relaxed text-[#2A2825]">
              <p className="font-medium text-[#23211F]">
                Compliance posture
              </p>
              <p className="mt-2">
                Mapped to HSWA 2015 volunteer duties, HSNO 1996 chemical
                spray records, Sport NZ field standards, and Building Act
                2004 sanitary facility requirements. Failed checks come
                with named corrective actions.
              </p>
            </div>
          </header>

          <section className="rounded-[14px] border border-[rgba(35,33,31,0.10)] bg-white/78 p-5 shadow-[0_24px_80px_rgba(35,33,31,0.08)] backdrop-blur md:p-7">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Club / school name">
                <input
                  value={clubName}
                  onChange={(e) => setClubName(e.target.value)}
                  className={inputClass}
                  placeholder="Harbour Rangers FC"
                />
              </Field>
              <Field label="Ground / field name">
                <input
                  value={groundName}
                  onChange={(e) => setGroundName(e.target.value)}
                  className={inputClass}
                  placeholder="Main pitch"
                />
              </Field>
              <Field label="Surface type">
                <select
                  value={surfaceType}
                  onChange={(e) => setSurfaceType(e.target.value as SurfaceType)}
                  className={inputClass}
                >
                  <option value="">Choose one</option>
                  {SURFACE_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Date">
                <input
                  type="date"
                  value={recordedDate}
                  onChange={(e) => setRecordedDate(e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Recorded by">
                <input
                  value={recordedBy}
                  onChange={(e) => setRecordedBy(e.target.value)}
                  className={inputClass}
                  placeholder="Grounds manager / volunteer name"
                />
              </Field>
            </div>

            <fieldset className="mt-7">
              <legend className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#6B6661]">
                Weekly checks
              </legend>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <CheckBox
                  label="Mowed this week"
                  checked={checks.mowedThisWeek}
                  onChange={(v) => setChecks((c) => ({ ...c, mowedThisWeek: v }))}
                />
                <CheckBox
                  label="Irrigation running"
                  checked={checks.irrigationRunning}
                  onChange={(v) => setChecks((c) => ({ ...c, irrigationRunning: v }))}
                />
                <CheckBox
                  label="Line marking fresh"
                  checked={checks.lineMarkingFresh}
                  onChange={(v) => setChecks((c) => ({ ...c, lineMarkingFresh: v }))}
                />
                <CheckBox
                  label="Changing rooms clean"
                  checked={checks.changingRoomsClean}
                  onChange={(v) =>
                    setChecks((c) => ({ ...c, changingRoomsClean: v }))
                  }
                />
                <CheckBox
                  label="First-aid kit stocked"
                  checked={checks.firstAidStocked}
                  onChange={(v) => setChecks((c) => ({ ...c, firstAidStocked: v }))}
                />
                <CheckBox
                  label="Volunteer induction logged"
                  checked={checks.volunteerInductionLog}
                  onChange={(v) =>
                    setChecks((c) => ({ ...c, volunteerInductionLog: v }))
                  }
                />
                <CheckBox
                  label="PPE stocked (gloves, eye protection)"
                  checked={checks.ppeStocked}
                  onChange={(v) => setChecks((c) => ({ ...c, ppeStocked: v }))}
                />
              </div>
            </fieldset>

            <section className="mt-7">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl font-normal text-[#23211F]">
                    Chemical applications
                  </h2>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#6B6661]">
                    Herbicide, fertiliser, line-marking paint — HSNO record
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setChemicals((rows) => [
                      ...rows,
                      {
                        id: newId(),
                        product: "",
                        appliedOn: todayNzDate(),
                        appliedBy: "",
                        appliedTo: "",
                        notes: "",
                      },
                    ])
                  }
                  className="inline-flex h-9 items-center gap-2 rounded-full border border-[rgba(35,33,31,0.14)] px-3 text-sm"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden /> Add
                </button>
              </div>
              <div className="mt-3 grid gap-3">
                {chemicals.map((row) => (
                  <div
                    key={row.id}
                    className="grid gap-2 rounded-[10px] border border-[rgba(35,33,31,0.10)] bg-[#F7F4EE] p-3 md:grid-cols-2"
                  >
                    <input
                      value={row.product}
                      onChange={(e) =>
                        setChemicals((rows) =>
                          rows.map((r) =>
                            r.id === row.id ? { ...r, product: e.target.value } : r,
                          ),
                        )
                      }
                      placeholder="Product (e.g. Roundup ProBio)"
                      className={inputClass}
                    />
                    <input
                      type="date"
                      value={row.appliedOn}
                      onChange={(e) =>
                        setChemicals((rows) =>
                          rows.map((r) =>
                            r.id === row.id ? { ...r, appliedOn: e.target.value } : r,
                          ),
                        )
                      }
                      className={inputClass}
                    />
                    <input
                      value={row.appliedBy}
                      onChange={(e) =>
                        setChemicals((rows) =>
                          rows.map((r) =>
                            r.id === row.id ? { ...r, appliedBy: e.target.value } : r,
                          ),
                        )
                      }
                      placeholder="Approved Handler name"
                      className={inputClass}
                    />
                    <input
                      value={row.appliedTo}
                      onChange={(e) =>
                        setChemicals((rows) =>
                          rows.map((r) =>
                            r.id === row.id ? { ...r, appliedTo: e.target.value } : r,
                          ),
                        )
                      }
                      placeholder="Applied to (e.g. perimeter)"
                      className={inputClass}
                    />
                    <textarea
                      value={row.notes ?? ""}
                      onChange={(e) =>
                        setChemicals((rows) =>
                          rows.map((r) =>
                            r.id === row.id ? { ...r, notes: e.target.value } : r,
                          ),
                        )
                      }
                      placeholder="Notes — wind, signage, pre-application checks"
                      className={`${inputClass} min-h-[72px] md:col-span-2`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setChemicals((rows) => rows.filter((r) => r.id !== row.id))
                      }
                      className="mt-1 inline-flex h-9 items-center justify-center gap-1 self-start rounded-full border border-[rgba(35,33,31,0.14)] px-3 text-xs text-[#6B6661] md:col-span-2"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden /> Remove
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-7">
              <h2 className="font-display text-2xl font-normal text-[#23211F]">
                Hazard inspection
              </h2>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#6B6661]">
                Walk-around log under HSWA 2015
              </p>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <Field label="Inspected on">
                  <input
                    type="date"
                    value={hazardInspectedOn}
                    onChange={(e) => setHazardInspectedOn(e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Inspected by">
                  <input
                    value={hazardInspectedBy}
                    onChange={(e) => setHazardInspectedBy(e.target.value)}
                    placeholder="Volunteer / staff name"
                    className={inputClass}
                  />
                </Field>
              </div>
              <Field label="Hazards found (one per line)">
                <textarea
                  value={hazardList}
                  onChange={(e) => setHazardList(e.target.value)}
                  placeholder={"Goalpost padding loose\nTrip hazard at southeast corner\nBroken bench"}
                  className={`${inputClass} min-h-[96px] py-3`}
                />
              </Field>
            </section>

            <Field label="Notes">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Weather, attendance, equipment issues, corrective actions taken..."
                className={`${inputClass} min-h-[96px] py-3`}
              />
            </Field>

            {error && (
              <p className="mt-4 rounded-[10px] border border-[#B42828]/25 bg-[#FCEDED] px-4 py-3 text-sm text-[#7A1F1F]">
                {error}
              </p>
            )}
            <button
              type="button"
              disabled={!canSubmit}
              onClick={submit}
              className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-[#2B6B57] px-6 text-sm font-medium text-white transition hover:bg-[#245746] disabled:cursor-not-allowed disabled:bg-[#C8C2BC]"
            >
              {submitting ? "Saving record..." : "Create turf maintenance record"}
            </button>
          </section>
        </div>
      </div>
    </main>
  );
}

const inputClass =
  "mt-2 h-11 w-full rounded-[10px] border border-[rgba(35,33,31,0.12)] bg-[#F7F4EE] px-3 text-sm text-[#23211F] outline-none transition focus:border-[#2B6B57] focus:bg-white";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="mt-5 block first:mt-0">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#6B6661]">
        {label}
      </span>
      {children}
    </label>
  );
}

function CheckBox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-[10px] border border-[rgba(35,33,31,0.10)] bg-[#F7F4EE] px-3 py-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded"
      />
      {label}
    </label>
  );
}
