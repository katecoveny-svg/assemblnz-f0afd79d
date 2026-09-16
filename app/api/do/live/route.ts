import { z } from "zod";
import { readDoJson } from "@/apps/do/shared/http";
import { DO_LIVE_AGENTS } from "@/apps/do/shared/live-conversation";
import {
  createLocalDoSession,
  localDoSession,
  snapshotLocalDoSession,
  submitLocalDoText,
  selectLocalDoAgent,
  cancelLocalDoTask,
  interruptLocalDoSpeech,
  disposeLocalDoSession,
  connectLocalDoVoice,
  closeLocalDoVoice,
} from "@/apps/do/shared/live-session-server";
export const runtime = "nodejs";
export const maxDuration = 60;
const input = z
  .object({
    action: z.enum([
      "create",
      "poll",
      "text",
      "agent",
      "cancel",
      "interrupt",
      "voice",
      "stop_voice",
      "close",
    ]),
    token: z
      .string()
      .regex(/^[a-f0-9]{64}$/)
      .optional(),
    agent: z.enum(DO_LIVE_AGENTS).default("assistant"),
    text: z.string().trim().min(1).max(12000).optional(),
    webSearch: z.boolean().default(true),
    correction: z.boolean().default(false),
    taskId: z.string().max(160).optional(),
    sdp: z.string().min(1).max(50000).optional(),
    consent: z.boolean().default(false),
  })
  .strict();
export async function POST(req: Request) {
  const json = (body: unknown, status = 200) =>
    Response.json(body, {
      status,
      headers: {
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  // Personal-key preview only. Production needs authenticated account quotas and
  // a persistent session worker; a serverless instance must never own this map.
  const host = req.headers.get("host") || "";
  const origin = req.headers.get("origin");
  if (
    process.env.NODE_ENV !== "development" ||
    !/^((localhost)|(127\.0\.0\.1)):\d+$/.test(host) ||
    origin !== `http://${host}`
  )
    return json(
      { message: "Live DO is available only in the local connected preview." },
      403,
    );
  const parsed = input.safeParse(await readDoJson(req).catch(() => null));
  if (!parsed.success)
    return json({ message: "Check the conversation request." }, 400);
  const i = parsed.data;
  try {
    if (i.action === "create") {
      if (!i.consent)
        return json(
          { message: "Confirm use of your inputs with OpenAI." },
          400,
        );
      return json({ token: createLocalDoSession(i.agent, i.webSearch) });
    }
    if (!i.token) return json({ message: "Open a conversation first." }, 400);
    const s = localDoSession(i.token);
    if (i.action === "text") {
      if (!i.text) return json({ message: "Add a message." }, 400);
      submitLocalDoText(s, i.text, i.correction);
    }
    if (i.action === "agent") selectLocalDoAgent(s, i.agent);
    if (i.action === "cancel" && i.taskId) cancelLocalDoTask(s, i.taskId);
    if (i.action === "interrupt") interruptLocalDoSpeech(s);
    if (i.action === "stop_voice") closeLocalDoVoice(s);
    if (i.action === "close") disposeLocalDoSession(i.token);
    if (i.action === "voice") {
      if (!i.sdp || !i.consent)
        return json(
          { message: "Confirm microphone use and supply a connection offer." },
          400,
        );
      return json(await connectLocalDoVoice(s, i.sdp));
    }
    return json(snapshotLocalDoSession(s));
  } catch (error) {
    return json(
      {
        message:
          error instanceof Error
            ? error.message
            : "DO could not complete that action.",
      },
      503,
    );
  }
}
