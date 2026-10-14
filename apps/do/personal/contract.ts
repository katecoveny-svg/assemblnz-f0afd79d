import { z } from "zod";

export const PERSONAL_BOUNDARY =
  "Uses only the notes you saved. No inbox, calendar, bank or browser was checked. Nothing was sent, booked or changed outside DO.";
const timezoneSchema = z
  .string()
  .max(80)
  .refine((value) => {
    try {
      new Intl.DateTimeFormat("en", { timeZone: value });
      return true;
    } catch {
      return false;
    }
  }, "Choose a valid time zone.");
export const personalSaveSchema = z
  .object({
    action: z.literal("save"),
    id: z.string().uuid(),
    title: z.string().trim().min(1).max(100),
    goal: z.string().trim().min(10).max(1500),
    notes: z.string().trim().min(1).max(10000),
    timezone: timezoneSchema,
    localHour: z.number().int().min(0).max(23),
    consent: z.literal(true),
    expectedRevision: z.number().int().min(0).max(1999999999),
  })
  .strict().refine(input => Boolean(input.id), "Reload the responsibility before saving.");
// Wake-ups are a separate, bounded consent from saving notes.
export const CADENCES = ["daily", "weekdays", "weekly", "once", "manual"] as const;
export type Cadence = (typeof CADENCES)[number];
export const personalScheduleSchema = z
  .object({
    action: z.literal("schedule"),
    id: z.string().uuid(),
    cadence: z.enum(CADENCES),
    weekday: z.number().int().min(0).max(6).optional(),
    localHour: z.number().int().min(0).max(23),
    timezone: timezoneSchema,
    runOnceAt: z.string().datetime({ offset: true }).optional(),
    consent: z.literal(true),
    expectedRevision: z.number().int().min(1).max(1999999999),
  })
  .strict()
  .refine(input => (input.cadence === "weekly") === (input.weekday !== undefined), "Weekly wake-ups need a weekday.")
  .refine(input => (input.cadence === "once") === (input.runOnceAt !== undefined), "A one-off wake-up needs a moment.");
export const personalMutationSchema = z.union([
  personalSaveSchema,
  personalScheduleSchema,
  z
    .object({
      action: z.enum(["pause", "delete", "review"]),
      id: z.string().uuid(),
    })
    .strict(),
]);
export const personalRunRequestSchema = z.object({ id: z.string().uuid(), note: z.string().trim().min(1).max(500).optional() }).strict();
export const personalScheduleReceiptSchema = z.object({
  id: z.string().uuid(), revision: z.number().int(), cadence: z.enum(CADENCES), active: z.literal(true),
  consentUntil: z.string(), nextRunAt: z.string(),
}).strict();
export type PersonalSave = z.infer<typeof personalSaveSchema>;
export type PersonalSchedule = z.infer<typeof personalScheduleSchema>;
export type WakeTrigger = "scheduled" | "once" | "manual" | "message";
export type Responsibility = {
  id: string;
  title: string;
  goal: string;
  notes: string;
  timezone: string;
  local_hour: number;
  active: boolean;
  consent_until: string;
  next_run_at: string;
  revision: number;
  updated_at: string;
  // Present only when wake-ups are enabled on the deployment.
  cadence?: Cadence;
  weekday?: number | null;
  run_once_at?: string | null;
};
export type PersonalRun = {
  id: string;
  responsibility_id: string;
  revision: number;
  status: "running" | "needs_review" | "reviewed" | "failed" | "cancelled";
  output: string | null;
  evidence: Record<string, unknown>;
  started_at: string;
  finished_at: string | null;
  trigger?: WakeTrigger;
  note?: string | null;
};
export type PersonalWorkerMode = "off" | "worksheet";
export type PersonalState = {
  responsibilities: Responsibility[];
  runs: PersonalRun[];
  storage?: { available: boolean };
  worker: { configured: boolean; lastSeenAt: string | null; mode?: PersonalWorkerMode };
  wakeups?: { enabled: boolean };
};
export const PERSONAL_STARTERS = [
  {
    title: "Prepare my day",
    goal: "Prepare a short daily brief from my notes: what matters today, deadlines, things waiting on someone else, and the next useful step.",
  },
  {
    title: "Keep family admin moving",
    goal: "Keep track of the school notices, plans and errands I save. Prepare a practical checklist and flag missing dates or conflicting plans.",
  },
  {
    title: "Stay on top of loose ends",
    goal: "Review my ongoing work and unanswered questions. Prepare follow-up drafts and tell me which decisions need my attention.",
  },
] as const;
export function responsibilityStatus(item: Responsibility, now = Date.now(), providerPermissionReady = true) {
  if (!item.active) return "Paused";
  if (Date.parse(item.consent_until) <= now) return "Permission expired";
  return providerPermissionReady ? "Scheduled" : "Permission renewal needed";
}

export const personalStorageReceiptSchema = z.object({ id: z.string().uuid(), saved: z.literal(true), preparation: z.literal("off") }).strict();
