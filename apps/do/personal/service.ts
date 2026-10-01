import "server-only";
import { getServiceClient } from "@/lib/supabase/service";
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
function fail(error: unknown) {
  if (error) throw new Error("Personal DO storage unavailable.");
}
export async function personalState(ownerId: string): Promise<PersonalState> {
  if (!ownerId) throw new Error("Owner required.");
  const db = getServiceClient();
  // Run outputs use the authenticated cookie client so DB expiry RLS remains effective
  // after the provider-memory collection flag is paused. Service role bypasses RLS.
  const ownerDb = await createOwnerClient();
  const [tasks, runs, worker] = await Promise.all([
    db
      .from("do_personal_responsibilities")
      .select(
        "id,title,goal,notes,timezone,local_hour,active,consent_until,next_run_at,revision,updated_at",
      )
      .eq("owner_id", ownerId)
      .order("created_at"),
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
  if (!personalWorkerConfigured())
    throw new Error(
      "Cloud preparation is not configured. Your notes have not been saved.",
    );
  const { data, error } = await getServiceClient().rpc("do_personal_save", {
    p_owner: ownerId,
    p_id: input.id ?? null,
    p_title: input.title,
    p_goal: input.goal,
    p_notes: input.notes,
    p_timezone: input.timezone,
    p_hour: input.localHour,
  });
  if (error?.message?.includes("responsibility_limit"))
    throw new Error(
      "Keep up to five responsibilities. Delete one before adding another.",
    );
  fail(error);
  return data as string;
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
