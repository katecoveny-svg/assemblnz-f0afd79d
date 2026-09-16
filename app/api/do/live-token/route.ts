import { GoogleGenAI } from "@google/genai";
import { admitDoRequest, readDoJson } from "@/apps/do/shared/http";
import { chatClientIp, checkChatRateLimit } from "@/lib/agents/chat-rate-limit";
import {
  doOwner,
  privateDoHeaders as headers,
  sameDoOrigin,
} from "@/apps/do/services/owner";
import {
  DoVoiceAllowanceError,
  readDoVoiceAllowance,
  reserveDoVoice,
} from "@/apps/do/services/voice-allowance";
import {
  DO_VOICE_DAILY_SESSIONS,
  DO_VOICE_MODELS,
  DO_VOICE_SECONDS,
  doVoiceConfig,
  doVoiceRequest,
} from "@/apps/do/shared/gemini-live";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const key = () =>
  process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const enabled = () => process.env.DO_GEMINI_LIVE_ENABLED === "true";

export async function GET() {
  const owner = await doOwner();
  return Response.json(
    {
      enabled: enabled(),
      configured: Boolean(key()),
      signedIn: Boolean(owner),
      remaining: owner
        ? await readDoVoiceAllowance(owner.id).catch(() => null)
        : null,
      dailyLimit: DO_VOICE_DAILY_SESSIONS,
      sessionSeconds: DO_VOICE_SECONDS,
      model: DO_VOICE_MODELS.standard,
    },
    { headers },
  );
}
export function OPTIONS(request: Request) {
  return new Response(null, {
    status: sameDoOrigin(request) ? 204 : 403,
    headers,
  });
}
export async function POST(request: Request) {
  const json = (body: unknown, status: number) =>
    Response.json(body, { status, headers });
  if (!sameDoOrigin(request))
    return json({ error: "Open DO to start voice." }, 403);
  const owner = await doOwner();
  if (!owner)
    return json(
      { error: "Sign in to your own assembl account to use voice." },
      401,
    );
  if (!enabled() || !key())
    return json({ error: "Live voice is not available here yet." }, 503);
  const parsed = doVoiceRequest.safeParse(
    await readDoJson(request).catch(() => null),
  );
  if (!parsed.success)
    return json({ error: "Choose a voice and confirm microphone use." }, 400);
  const ip = chatClientIp(request.headers);
  if (
    !admitDoRequest(ip) ||
    !(await checkChatRateLimit(ip, "do-gemini-live-token")).allowed
  )
    return json(
      { error: "Please wait before starting another voice session." },
      429,
    );

  let reservation: Awaited<ReturnType<typeof reserveDoVoice>> | undefined;
  try {
    reservation = await reserveDoVoice(owner.id);
    const { mode, voiceName } = parsed.data;
    const model = DO_VOICE_MODELS[mode];
    const config = doVoiceConfig(mode, voiceName);
    // Google rejects subsequent messages after expiry; this is not just a UI timer.
    const expiresAt = new Date(
      Date.now() + DO_VOICE_SECONDS * 1000,
    ).toISOString();
    const ai = new GoogleGenAI({
      apiKey: key()!,
      httpOptions: { apiVersion: "v1beta" },
    });
    const token = await ai.authTokens.create({
      config: {
        uses: 1,
        expireTime: expiresAt,
        newSessionExpireTime: new Date(Date.now() + 60_000).toISOString(),
        liveConnectConstraints: { model, config },
        abortSignal: AbortSignal.any([
          request.signal,
          AbortSignal.timeout(10_000),
        ]),
      },
    });
    if (!token.name) throw new Error("incomplete_token");
    // Never log or persist the temporary token. It is used only by this browser session.
    return json(
      {
        token: token.name,
        model,
        mode,
        voiceName,
        config,
        expiresAt,
        sessionSeconds: DO_VOICE_SECONDS,
      },
      200,
    );
  } catch (error) {
    if (reservation) await reservation.release().catch(() => {});
    if (error instanceof DoVoiceAllowanceError)
      return json(
        { error: error.message },
        error.code === "exhausted" ? 429 : 503,
      );
    const status =
      error && typeof error === "object" && "status" in error
        ? Number(error.status)
        : 0;
    // Keep upstream content and credentials out of browser responses and logs.
    console.error(
      "[DO voice] token request failed",
      Number.isFinite(status) ? status : 0,
    );
    return json(
      {
        error:
          status === 429
            ? "The voice provider is at its limit. assembl needs to check its Google quota or billing before trying again."
          : "The voice service could not connect. Please try again later.",
      },
      502,
    );
  }
}
