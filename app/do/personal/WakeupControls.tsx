"use client";
import { useState, type FormEvent } from "react";
import { ArrowUpRight, Clock3 } from "lucide-react";
import { CADENCES, type Cadence, type Responsibility } from "@/apps/do/personal/contract";
import { CADENCE_LABELS, WEEKDAY_NAMES, scheduleRequest, wakeupSummary } from "@/apps/do/personal/wakeups";
import styles from "./personal.module.css";

type Props = {
  item: Responsibility;
  now: number;
  busy: boolean;
  workerReady: boolean;
  onSchedule: (payload: ReturnType<typeof scheduleRequest>) => Promise<boolean>;
  onWake: (note?: string) => Promise<boolean>;
};

function formFrom(item: Responsibility) {
  return {
    cadence: (item.cadence ?? "daily") as Cadence,
    weekday: item.weekday ?? 1,
    localHour: item.local_hour,
    timezone: item.timezone,
    runOnceAt: "",
  };
}

/** Wake-up schedule and "wake DO now" controls for one responsibility. Server re-validates everything. */
export function WakeupControls({ item, now, busy, workerReady, onSchedule, onWake }: Props) {
  const summary = wakeupSummary(item, now);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(() => formFrom(item));
  const [consent, setConsent] = useState(false);
  // The saved schedule changed underneath an open form (notes edited, another device): restart from what is saved
  // so consent is only ever given to the hour and zone the owner can see.
  const saved = JSON.stringify([item.id, item.revision, item.title, item.goal, item.notes, item.cadence, item.weekday, item.local_hour, item.timezone, item.active, item.consent_until, item.next_run_at, item.run_once_at, summary.on, workerReady]);
  const [seenSaved, setSeenSaved] = useState(saved);
  if (saved !== seenSaved) {
    setSeenSaved(saved);
    setForm(formFrom(item));
    setConsent(false);
  }
  const [note, setNote] = useState("");
  const canWake = workerReady && summary.on && !busy;
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!consent) return;
    if (await onSchedule(scheduleRequest(item.id, item.revision, form))) { setOpen(false); setConsent(false); }
  }
  return (
    <div className={styles.wakeups} data-wakeups={summary.on ? "on" : "off"}>
      <p className={styles.wakeupLine}>
        <Clock3 size={15} aria-hidden="true" />
        <span><strong>{summary.label}</strong> {summary.detail}</span>
      </p>
      <div className={styles.actions}>
        <button type="button" disabled={busy} aria-expanded={open} onClick={() => setOpen(v => !v)}>
          {summary.on ? "Change wake-ups" : "Turn wake-ups on"}
        </button>
        <button type="button" disabled={!canWake} aria-label={`Wake DO now for ${item.title}`} onClick={() => void onWake()}>
          Wake DO now <ArrowUpRight size={15} />
        </button>
      </div>
      {!workerReady && <p className={styles.wakeupNote}>The wake-up worker is not running here yet, so schedules are saved but nothing is prepared. Nothing is sent to a model either way.</p>}
      {open && (
        <form className={styles.wakeupForm} onSubmit={submit} aria-label={`Wake-ups for ${item.title}`}>
          <label>
            How often
            <select value={form.cadence} onChange={e => { setForm({ ...form, cadence: e.target.value as Cadence }); setConsent(false); }}>
              {CADENCES.map(c => <option key={c} value={c}>{CADENCE_LABELS[c]}</option>)}
            </select>
          </label>
          {form.cadence === "weekly" && (
            <label>
              Which day
              <select value={form.weekday} onChange={e => { setForm({ ...form, weekday: Number(e.target.value) }); setConsent(false); }}>
                {WEEKDAY_NAMES.map((name, i) => <option key={name} value={i}>{name}</option>)}
              </select>
            </label>
          )}
          {(form.cadence === "daily" || form.cadence === "weekdays" || form.cadence === "weekly") && (
            <label>
              At what hour
              <select value={form.localHour} onChange={e => { setForm({ ...form, localHour: Number(e.target.value) }); setConsent(false); }}>
                {Array.from({ length: 24 }, (_, i) => <option key={i} value={i}>{String(i).padStart(2, "0")}:00</option>)}
              </select>
            </label>
          )}
          {form.cadence === "once" && (
            <label>
              When (your local time)
              <input type="datetime-local" required value={form.runOnceAt} onChange={e => { setForm({ ...form, runOnceAt: e.target.value }); setConsent(false); }} />
            </label>
          )}
          <label>
            Time zone
            <input required value={form.timezone} onChange={e => { setForm({ ...form, timezone: e.target.value }); setConsent(false); }} />
          </label>
          <label className={styles.consent}>
            <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} />
            <span>
              Let DO wake up on this schedule for up to seven days and prepare a worksheet from these saved notes only. No model, inbox, calendar or browser is used. Nothing is sent, booked or changed. Editing the notes, pausing, or the seven days ending turns wake-ups off again.
            </span>
          </label>
          <div className={styles.actions}>
            <button type="submit" className={styles.save} disabled={!consent || busy}>{summary.on ? "Update wake-ups" : "Turn wake-ups on"} <ArrowUpRight size={16} /></button>
            <button type="button" disabled={busy} onClick={() => { setOpen(false); setConsent(false); }}>Cancel</button>
          </div>
        </form>
      )}
      {summary.on && (
        <form className={styles.wakeupNoteForm} onSubmit={event => { event.preventDefault(); if (note.trim()) void onWake(note.trim()).then(ok => { if (ok) setNote(""); }); }}>
          <label>
            Wake DO with a note
            <input maxLength={500} value={note} disabled={!workerReady || busy} onChange={e => setNote(e.target.value)} placeholder="Focus on the quote from Sam" />
          </label>
          <button type="submit" disabled={!canWake || !note.trim()}>Send the note</button>
        </form>
      )}
    </div>
  );
}
