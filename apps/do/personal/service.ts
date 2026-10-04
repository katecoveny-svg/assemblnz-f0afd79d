import "server-only";
import { getServiceClient } from "@/lib/supabase/service";
import { runMemoryPurge } from "./memory-maintenance";
import { createClient as createOwnerClient } from "@/lib/supabase/server";
import {
  personalSaveSchema,
  type PersonalSave,
  type Responsibility,
  type PersonalRun,
  type PersonalState,
} from "./contract";

// Callers must verify doOwner() or CRON_SECRET before entering this module.
export function personalWorkerConfigured() {
  return false; // Await durable, versioned OpenAI + TypeSafe background grants.
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
  const taskQuery = ownerDb.from("do_personal_responsibilities").select(
    "id,title,goal,notes,timezone,local_hour,active,consent_until,next_run_at,revision,updated_at",
  ).eq("owner_id", ownerId);
  const [tasks, runs, worker] = await Promise.all([
    taskQuery.order("created_at"),
    ownerDb
      .from("do_personal_runs")
      .select(
        "id,responsibility_id,revision,status,output,evidence,started_at,finished_at",
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
    responsibilities: tasks.data as Responsibility[],
    runs: runs.data as PersonalRun[],
    worker: {
      configured: personalWorkerConfigured(),
      lastSeenAt: worker.data?.last_seen_at ?? null,
    },
  };
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
export async function runPersonal(ownerId?: string, id?: string): Promise<{ claimed: boolean; published: boolean }> {
  if ((id && !ownerId) || ownerId === "") throw new Error("Owner required.");
  // Old grants excluded TypeSafe. Until durable renewed provider grants exist,
  // do not claim work, read saved notes/preferences or dispatch any provider.
  throw new Error("Background preparation needs renewed OpenAI and TypeSafe permission. No provider request started.");
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
