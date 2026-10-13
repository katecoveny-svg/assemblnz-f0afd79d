import type { Cadence, PersonalRun, Responsibility, WakeTrigger } from "./contract";

export const WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
export const CADENCE_LABELS: Record<Cadence, string> = {
  daily: "Every day",
  weekdays: "Every weekday",
  weekly: "Once a week",
  once: "Once, at a moment I choose",
  manual: "Only when I ask",
};
const hour = (h: number) => `${String(h).padStart(2, "0")}:00`;
export const whenStamp = (iso: string, zone: string) =>
  new Intl.DateTimeFormat("en-NZ", { timeZone: zone, weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }).format(new Date(iso));
const finite = (iso: string | null | undefined) => Boolean(iso) && Number.isFinite(Date.parse(iso as string));

/** One honest line about when DO will wake up for this responsibility. */
export function wakeupSummary(item: Responsibility, now = Date.now()) {
  const cadence = item.cadence ?? "daily";
  const next = finite(item.next_run_at) && Date.parse(item.next_run_at) > now ? `next ${whenStamp(item.next_run_at, item.timezone)}` : null;
  if (!item.active) return { on: false, label: "Wake-ups off", detail: "Saved notes only. Turn wake-ups on to let DO prepare a worksheet." };
  if (Date.parse(item.consent_until) <= now) return { on: false, label: "Wake-up permission expired", detail: "Turn wake-ups on again to renew it for up to seven days." };
  const until = `until ${whenStamp(item.consent_until, item.timezone)}`;
  if (cadence === "manual") return { on: true, label: "Only when you ask", detail: `No scheduled wake-up. Permission ${until}.` };
  if (cadence === "once") return next
    ? { on: true, label: `Once, ${whenStamp(item.next_run_at, item.timezone)}`, detail: `Then nothing further. Permission ${until}.` }
    : { on: true, label: "Woke up once, as planned", detail: `No further wake-up. Ask for one or set a new schedule. Permission ${until}.` };
  const rule = cadence === "weekly" ? `Every ${WEEKDAY_NAMES[item.weekday ?? 0]} at ${hour(item.local_hour)}` : `${CADENCE_LABELS[cadence]} at ${hour(item.local_hour)}`;
  return { on: true, label: `${rule} (${item.timezone})`, detail: `${next ? next[0].toUpperCase() + next.slice(1) : "No wake-up due"}. Permission ${until}.` };
}

export function triggerLabel(run: Pick<PersonalRun, "trigger" | "note">) {
  const labels: Record<WakeTrigger, string> = { scheduled: "Woke up on schedule", once: "Woke up once, as planned", manual: "Woke up because you asked", message: "Woke up for your note" };
  return run.trigger ? labels[run.trigger] : null;
}

/** Form state → schedule request; the server re-validates everything. */
export function scheduleRequest(id: string, expectedRevision: number, form: { cadence: Cadence; weekday: number; localHour: number; timezone: string; runOnceAt: string }) {
  return {
    action: "schedule" as const,
    id,
    cadence: form.cadence,
    ...(form.cadence === "weekly" ? { weekday: form.weekday } : {}),
    localHour: form.localHour,
    timezone: form.timezone,
    ...(form.cadence === "once" ? { runOnceAt: localToIso(form.runOnceAt, form.timezone) } : {}),
    consent: true as const,
    expectedRevision,
  };
}

/** A datetime-local value typed in the owner's zone, as an ISO instant. */
export function localToIso(local: string, timezone: string) {
  const m = local.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!m) return "";
  const guess = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4]), Number(m[5]));
  // Two passes handle the offset change across a daylight-saving boundary.
  let instant = guess;
  for (let i = 0; i < 2; i++) instant = guess - offsetAt(instant, timezone);
  return new Date(instant).toISOString();
}
function offsetAt(instant: number, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-NZ", { timeZone: timezone, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).formatToParts(new Date(instant));
  const get = (type: string) => Number(parts.find(p => p.type === type)?.value);
  return Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute")) - Math.floor(instant / 60000) * 60000;
}
