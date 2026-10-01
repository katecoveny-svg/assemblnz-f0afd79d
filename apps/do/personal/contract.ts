import { z } from "zod";

export const PERSONAL_BOUNDARY =
  "Uses only the notes you saved. No inbox, calendar, bank or browser was checked. Nothing was sent, booked or changed outside DO.";
export const personalSaveSchema = z
  .object({
    action: z.literal("save"),
    id: z.string().uuid().optional(),
    title: z.string().trim().min(1).max(100),
    goal: z.string().trim().min(10).max(1500),
    notes: z.string().trim().min(1).max(10000),
    timezone: z
      .string()
      .max(80)
      .refine((value) => {
        try {
          new Intl.DateTimeFormat("en", { timeZone: value });
          return true;
        } catch {
          return false;
        }
      }, "Choose a valid time zone."),
    localHour: z.number().int().min(0).max(23),
    consent: z.literal(true),
  })
  .strict();
export const personalMutationSchema = z.union([
  personalSaveSchema,
  z
    .object({
      action: z.enum(["pause", "delete", "review"]),
      id: z.string().uuid(),
    })
    .strict(),
]);
export type PersonalSave = z.infer<typeof personalSaveSchema>;
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
};
export type PersonalState = {
  responsibilities: Responsibility[];
  runs: PersonalRun[];
  worker: { configured: boolean; lastSeenAt: string | null };
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
