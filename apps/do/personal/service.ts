import "server-only";
import { getServiceClient } from "@/lib/supabase/service";
import { runMemoryPurge } from "./memory-maintenance";
import { createClient as createOwnerClient } from "@/lib/supabase/server";
import {
  personalSaveSchema,
  personalScheduleReceiptSchema,
  type PersonalSave,
  type PersonalSchedule,
  type PersonalWorkerMode,
  type Responsibility,
  type PersonalRun,
  type PersonalState,
  type WakeTrigger,
} from "./contract";
import { prepareWorksheet } from "./worksheet";

// Callers must verify doOwner() or CRON_SECRET before entering this module.
// Wake-up columns and RPCs exist only once 20261013093000_do_personal_wakeups.sql is applied.
export function personalWakeupsEnabled() {
  return process.env.DO_PERSONAL_WAKEUPS_ENABLED === "true";
}
// 'worksheet' prepares from saved notes alone, with no provider. There is no model
// mode: that still awaits durable, versioned OpenAI + TypeSafe background grants.
export function personalWorkerMode(): PersonalWorkerMode {
  return personalWakeupsEnabled() && process.env.DO_PERSONAL_WORKER_MODE === "worksheet" ? "worksheet" : "off";
}
export function personalWorkerConfigured() {
  return personalWorkerMode() !== "off";
}
export class PersonalStorageConflict extends Error {
  constructor() { super("This responsibility changed. Reopen it before saving; your unsaved notes remain in the editor."); }
}
export async function personalStorageAvailable(ownerId: string) {
  if (!ownerId || process.env.DO_PERSONAL_RESPONSIBILITY_STORAGE_ENABLED !== 'true') return false;
  try {
    const { data, error } = await getServiceClient().rpc('do_personal_storage_ready', { p_owner: ownerId });
    return !error && data === true;
  } catch { return false; }
}
function fail(error: unknown) {
  if (error) throw new Error("Personal DO storage unavailable.");
}
export async function personalState(ownerId: string): Promise<PersonalState> {
  if (!ownerId) throw new Error("Owner required.");
  const db = getServiceClient();
  // Responsibility bodies and run outputs always use the cookie-owner client.
  // Installed expiry RLS remains effective after collection/cleanup flags pause.
  // Existing selected columns work before the proposal is installed; no service fallback.
  const ownerDb = await createOwnerClient();
  const wakeups = personalWakeupsEnabled();
  const taskQuery = ownerDb.from("do_personal_responsibilities").select(
    "id,title,goal,notes,timezone,local_hour,active,consent_until,next_run_at,revision,updated_at" + (wakeups ? ",cadence,weekday,run_once_at" : ""),
  ).eq("owner_id", ownerId);
  const [tasks, runs, worker] = await Promise.all([
    taskQuery.order("created_at"),
    ownerDb
      .from("do_personal_runs")
      .select(
        "id,responsibility_id,revision,status,output,evidence,started_at,finished_at" + (wakeups ? ",trigger,note" : ""),
      )
      .eq("owner_id", ownerId)
      .order("started_at", { ascending: false })
      .limit(40),
    db
      .from("do_personal_worker")
      .select("last_seen_at")
      .eq("id", true)
      .single(),
  ]);
  fail(tasks.error);
  fail(runs.error);
  fail(worker.error);
  return {
    storage: { available: await personalStorageAvailable(ownerId) },
    responsibilities: tasks.data as unknown as Responsibility[],
    runs: runs.data as unknown as PersonalRun[],
    worker: {
      configured: personalWorkerConfigured(),
      mode: personalWorkerMode(),
      lastSeenAt: worker.data?.last_seen_at ?? null,
    },
    wakeups: { enabled: wakeups },
  };
}
// Turning wake-ups on is its own seven-day consent, checked against the reopened revision.
export async function schedulePersonal(ownerId: string, input: PersonalSchedule) {
  if (!ownerId) throw new Error("Owner required.");
  if (!personalWakeupsEnabled()) throw new Error("Wake-ups are not enabled here yet. Your notes are unchanged.");
  const { data, error } = await getServiceClient().rpc("do_personal_schedule", {
    p_owner: ownerId,
    p_id: input.id,
    p_cadence: input.cadence,
    p_weekday: input.weekday ?? null,
    p_hour: input.localHour,
    p_timezone: input.timezone,
    p_run_once_at: input.runOnceAt ?? null,
    p_expected_revision: input.expectedRevision,
  });
  const message = error?.message ?? "";
  if (message.includes("responsibility_conflict")) throw new PersonalStorageConflict();
  if (message.includes("not_found")) throw new Error("That responsibility is no longer available.");
  if (message.includes("wake_window")) throw new Error("Choose a moment within the next seven days of permission.");
  if (message.includes("wake_invalid")) throw new Error("Check the wake-up settings.");
  fail(error);
  const receipt = personalScheduleReceiptSchema.safeParse(data);
  if (!receipt.success) throw new Error("No wake-up change was confirmed. Reopen your workspace before retrying.");
  return receipt.data;
}
export async function savePersonal(ownerId: string, input: PersonalSave) {
  if (!ownerId) throw new Error("Owner required.");
  input = personalSaveSchema.parse(input);
  if (!(await personalStorageAvailable(ownerId)))
    throw new Error("Private responsibility storage is unavailable. No save was confirmed.");
  const { data, error } = await getServiceClient().rpc("do_personal_save_paused", {
    p_owner: ownerId,
    p_id: input.id ?? null,
    p_title: input.title,
    p_goal: input.goal,
    p_notes: input.notes,
    p_timezone: input.timezone,
    p_hour: input.localHour,
    p_expected_revision: input.expectedRevision,
  });
  if (error?.message?.includes("responsibility_conflict")) throw new PersonalStorageConflict();
  if (error?.message?.includes("responsibility_limit"))
    throw new Error(
      "Keep up to five responsibilities. Delete one before adding another.",
    );
  fail(error);
  if (typeof data !== "string" || !/^[a-f0-9-]{36}$/i.test(data)) throw new Error("No save was confirmed. Reopen your workspace before retrying.");
  return data;
}
export async function mutatePersonal(
  ownerId: string,
  action: "pause" | "delete" | "review",
  id: string,
) {
  if (!ownerId) throw new Error("Owner required.");
  const db = getServiceClient();
  if (action === "pause") {
    const { data, error } = await db.rpc("do_personal_pause", {
      p_owner: ownerId,
      p_id: id,
    });
    fail(error);
    return data === true;
  }
  const query =
    action === "delete"
      ? db
          .from("do_personal_responsibilities")
          .delete()
          .eq("owner_id", ownerId)
          .eq("id", id)
          .select("id")
      : db
          .from("do_personal_runs")
          .update({ status: "reviewed" })
          .eq("owner_id", ownerId)
          .eq("id", id)
          .eq("status", "needs_review")
          .select("id");
  const { data, error } = await query;
  fail(error);
  return Boolean(data?.length);
}
export async function runPersonal(ownerId?: string, id?: string, wake?: { note?: string }): Promise<{ claimed: boolean; published: boolean }> {
  if ((id && !ownerId) || ownerId === "") throw new Error("Owner required.");
  // Old grants excluded TypeSafe. Until durable renewed provider grants exist, no
  // model runs. With the worker off, do not claim work or read saved notes either.
  if (personalWorkerMode() !== "worksheet")
    throw new Error("Background preparation is off: the worksheet worker is not enabled here, and model preparation needs renewed OpenAI and TypeSafe permission. No provider request started.");
  const db = getServiceClient();
  const trigger: WakeTrigger = !id ? "scheduled" : wake?.note ? "message" : "manual";
  const { data, error } = await db.rpc("do_personal_claim", { p_owner: ownerId ?? null, p_id: id ?? null, p_trigger: trigger, p_note: wake?.note ?? null });
  fail(error);
  const claimed = Array.isArray(data) ? (data[0] as { run_id?: string; responsibility?: Responsibility & { owner_id?: string } } | undefined) : undefined;
  if (!claimed?.run_id || !claimed.responsibility) return { claimed: false, published: false };
  const r = claimed.responsibility;
  const preparedAt = new Date().toISOString();
  let output = "", failed = false;
  let evidence: Record<string, unknown> = { method: "worksheet", model: null, provider: "none", trigger: r.cadence === "once" && trigger === "scheduled" ? "once" : trigger, note: wake?.note ?? null, notesUpdatedAt: r.updated_at, timezone: r.timezone, preparedAt, externalAction: "none" };
  if (ownerId && r.owner_id !== ownerId) {
    failed = true; evidence = { error: "owner_mismatch" };
  } else {
    try {
      output = prepareWorksheet({ title: r.title, goal: r.goal, notes: r.notes, timezone: r.timezone, now: new Date(preparedAt), trigger: evidence.trigger as WakeTrigger, note: wake?.note ?? null });
    } catch { failed = true; evidence = { ...evidence, error: "worksheet_failed" }; }
  }
  const finish = await db.rpc("do_personal_finish", { p_run: claimed.run_id, p_output: output, p_evidence: evidence, p_failed: failed });
  fail(finish.error);
  return { claimed: true, published: !failed && finish.data === true };
}
export async function personalHeartbeat() {
  const { error } = await getServiceClient()
    .from("do_personal_worker")
    .update({ last_seen_at: new Date().toISOString() })
    .eq("id", true);
  fail(error);
}

// Trusted maintenance caller only. Not registered as a cron or user route.
// Cleanup remains independent of storage enrolment and provider configuration.
export async function maintainPersonalResponsibilityStorage() {
  if (process.env.DO_PERSONAL_RESPONSIBILITY_PURGE_ENABLED !== 'true') return { configured: false as const };
  const db = getServiceClient();
  const outcome = await runMemoryPurge(async limit => {
    const { data, error } = await db.rpc('do_personal_storage_expire_batch', { p_limit: limit }).abortSignal(AbortSignal.timeout(5000));
    if (error || !Number.isInteger(data)) throw new Error('cleanup_unavailable');
    return data as number;
  });
  const {data,error} = await db.rpc('do_personal_storage_record_maintenance', {
    p_status: outcome.status,p_purged:outcome.purged,p_started:outcome.startedAt,
  }).abortSignal(AbortSignal.timeout(2000));
  if(error || data!==true) throw new Error('Responsibility cleanup monitoring unavailable.');
  return {configured:true as const,outcome};
}
