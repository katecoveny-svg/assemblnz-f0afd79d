import "server-only";
import { createHmac } from "node:crypto";
import { getServiceClient } from "@/lib/supabase/service";
import { DO_VOICE_DAILY_SESSIONS } from "@/apps/do/shared/gemini-live";

const slots = Array.from(
  { length: DO_VOICE_DAILY_SESSIONS },
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
export async function readDoVoiceAllowance(ownerId: string) {
  const { count, error } = await getServiceClient()
    .from("agent_chat_sessions")
    .select("id", { count: "exact", head: true })
    .eq("anon_id", identity(ownerId))
    .in("agent_slug", slots);
  if (error) throw new DoVoiceAllowanceError("unavailable");
  return Math.max(0, DO_VOICE_DAILY_SESSIONS - (count ?? 0));
}
/** The deployed unique (anon_id, agent_slug) index arbitrates concurrent server instances. */
export async function reserveDoVoice(ownerId: string) {
  try {
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
