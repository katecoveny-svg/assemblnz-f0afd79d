import "server-only";
import { getServiceClient } from "@/lib/supabase/service";
import { createClient as createOwnerClient } from "@/lib/supabase/server";
import {
  getDoAvailability,
  prepareDoDraft,
} from "@/apps/do/shared/preparation-server";
import {
  PERSONAL_BOUNDARY,
  personalSaveSchema,
  type PersonalSave,
  type Responsibility,
  type PersonalRun,
  type PersonalState,
} from "./contract";
import { getPersonalDoProfile } from "./profile-service";
import { formatPersonalDoStyle } from "./profile";

// Callers must verify doOwner() or CRON_SECRET before entering this module.
export function personalWorkerConfigured() {
  return Boolean(
    process.env.CRON_SECRET && getDoAvailability().preparation === "configured",
  );
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
export async function runPersonal(ownerId?: string, id?: string) {
  if ((id && !ownerId) || ownerId === "") throw new Error("Owner required.");
  if (!personalWorkerConfigured())
    throw new Error("Cloud preparation is unavailable.");
  const db = getServiceClient();
  const { data, error } = await db.rpc("do_personal_claim", {
    p_owner: ownerId ?? null,
    p_id: id ?? null,
  });
  fail(error);
  const claim = data?.[0] as
    | { run_id: string; responsibility: Responsibility & { owner_id: string } }
    | undefined;
  if (!claim) return { claimed: false, published: false };
  const item = claim.responsibility;
  if (!item.owner_id || (ownerId && item.owner_id !== ownerId) || (id && item.id !== id))
    throw new Error("Claim ownership mismatch.");
  // Preferences are optional: an older installation without the additive
  // profile table must still prepare already-consented responsibilities.
  // Only a successfully loaded, explicitly saved profile is sent to a provider.
  let communicationStyle: string | undefined;
  let profileUpdatedAt: string | null = null;
  try {
    const state = await getPersonalDoProfile(item.owner_id);
    if (state.saved) {
      communicationStyle = formatPersonalDoStyle(state.profile);
      profileUpdatedAt = state.profile.updatedAt;
    }
  } catch {
    // Preserve the original draft path; profile UI reports its own storage error.
  }
  // Recheck revocation immediately before data leaves the server. An in-flight
  // provider request cannot be recalled; finish() also rejects stale results.
  const { data: current, error: lookupError } = await db
    .from("do_personal_responsibilities")
    .select("active,revision,consent_until")
    .eq("id", item.id)
    .eq("owner_id", item.owner_id)
    .maybeSingle();
  if (
    lookupError ||
    !current?.active ||
    current.revision !== item.revision ||
    Date.parse(current.consent_until) <= Date.now()
  )
    return { claimed: true, published: false };
  try {
    const now = new Date().toISOString();
    const draft = await prepareDoDraft({
      task: "plan",
      source: item.notes,
      sourceTitle: item.title,
      sourceUrl: "",
      consent: true,
      brief:
        `Ongoing responsibility: ${item.goal}\nCheck time: ${now}; user time zone: ${item.timezone}. Notes last saved: ${item.updated_at}. Prepare today's useful work from these saved notes. Separate established facts, suggested next steps, drafts to review, and missing or stale information. Do not assume previous tasks were completed. Do not claim you checked live accounts. ${PERSONAL_BOUNDARY}`.slice(
          0,
          2000,
        ),
    }, undefined, communicationStyle);
    const { data: published, error: finishError } = await db.rpc(
      "do_personal_finish",
      {
        p_run: claim.run_id,
        p_output: draft.text,
        p_evidence: {
          ...draft.evidence,
          boundary: PERSONAL_BOUNDARY,
          notesUpdatedAt: item.updated_at,
          revision: item.revision,
          permissionExpiresAt: item.consent_until,
          profileUpdatedAt,
        },
        p_failed: false,
      },
    );
    fail(finishError);
    return { claimed: true, published: published === true };
  } catch {
    const { error: finishError } = await db.rpc("do_personal_finish", {
      p_run: claim.run_id,
      p_output: null,
      p_evidence: { error: "preparation_failed", boundary: PERSONAL_BOUNDARY },
      p_failed: true,
    });
    fail(finishError);
    return { claimed: true, published: false };
  }
}
export async function personalHeartbeat() {
  const { error } = await getServiceClient()
    .from("do_personal_worker")
    .update({ last_seen_at: new Date().toISOString() })
    .eq("id", true);
  fail(error);
}
