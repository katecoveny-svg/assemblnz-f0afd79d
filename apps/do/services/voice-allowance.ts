import "server-only";
import { createHmac } from "node:crypto";
import { getServiceClient } from "@/lib/supabase/service";
import { readDoVoicePolicy, type DoVoicePolicy } from "./voice-policy";

// Read every supported slot so lowering a budget cannot hide earlier reservations.
const allSlots = Array.from({ length: 288 }, (_, i) => `do-voice-${i + 1}`);
const slotsFor = (policy: DoVoicePolicy) => Array.from(
  { length: policy.dailySessions },
  (_, i) => `do-voice-${i + 1}`,
);
export class DoVoiceAllowanceError extends Error {
  constructor(public code: "exhausted" | "unavailable") {
    super(
      code === "exhausted"
        ? "Your daily voice sessions are used. They reset at midnight in New Zealand."
        : "Your voice allowance could not be checked. Please try again later.",
    );
  }
}
function identity(ownerId: string, now = new Date()) {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret || !ownerId) throw new DoVoiceAllowanceError("unavailable");
  const day = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Pacific/Auckland",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  return (
    "do-voice:" +
    createHmac("sha256", secret).update(`${ownerId}:${day}`).digest("hex")
  );
}
export async function readDoVoiceAllowance(ownerId: string, policy = readDoVoicePolicy()) {
  const db = getServiceClient();
  const anonId = identity(ownerId);
  const countSlots = (slots: string[]) => db.from("agent_chat_sessions")
    .select("id", { count: "exact", head: true }).eq("anon_id", anonId).in("agent_slug", slots);
  const [all, eligible] = await Promise.all([countSlots(allSlots), countSlots(slotsFor(policy))]);
  if (all.error || eligible.error) throw new DoVoiceAllowanceError("unavailable");
  // A reduced policy must not create new holes beneath previously used high slots.
  // Stop admissions for the day in that case; concurrent inserts still share one
  // fixed set of unique slots. Policy changes must be consistent across instances.
  if ((all.count ?? 0) > (eligible.count ?? 0)) return 0;
  return Math.max(0, policy.dailySessions - (all.count ?? 0));
}
/** The deployed unique (anon_id, agent_slug) index arbitrates concurrent server instances. */
export async function reserveDoVoice(ownerId: string, policy = readDoVoicePolicy()) {
  const slots = slotsFor(policy);
  try {
    if (await readDoVoiceAllowance(ownerId, policy) === 0) throw new DoVoiceAllowanceError("exhausted");
    const db = getServiceClient();
    const anonId = identity(ownerId);
    for (const slot of slots) {
      const id = crypto.randomUUID();
      const { error } = await db
        .from("agent_chat_sessions")
        .insert({
          id,
          anon_id: anonId,
          agent_slug: slot,
          free_message_count: 1,
        });
      if (!error)
        return {
          release: async () => {
            const result = await db
              .from("agent_chat_sessions")
              .delete()
              .eq("id", id)
              .eq("anon_id", anonId);
            if (result.error) throw new DoVoiceAllowanceError("unavailable");
          },
        };
      if (error.code !== "23505")
        throw new DoVoiceAllowanceError("unavailable");
    }
    throw new DoVoiceAllowanceError("exhausted");
  } catch (error) {
    throw error instanceof DoVoiceAllowanceError
      ? error
      : new DoVoiceAllowanceError("unavailable");
  }
}
