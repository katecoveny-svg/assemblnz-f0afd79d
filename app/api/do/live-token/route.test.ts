import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const calls = vi.hoisted(() => ({
  owner: vi.fn(),
  token: vi.fn(),
  client: vi.fn(),
  reserve: vi.fn(),
  release: vi.fn(),
  read: vi.fn(),
  rate: vi.fn(),
  profile: vi.fn(),
}));
vi.mock("@google/genai", () => ({
  GoogleGenAI: class {
    authTokens = { create: calls.token };
    constructor(options: unknown) {
      calls.client(options);
    }
  },
}));
vi.mock("@/apps/do/services/owner", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  doOwner: calls.owner,
}));
vi.mock("@/apps/do/services/voice-allowance", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  reserveDoVoice: calls.reserve,
  readDoVoiceAllowance: calls.read,
}));
vi.mock("@/lib/agents/chat-rate-limit", () => ({
  chatClientIp: (h: Headers) => h.get("x-test-ip"),
  checkChatRateLimit: calls.rate,
}));
vi.mock("@/apps/do/personal/profile-service", () => ({ getPersonalDoProfile: calls.profile }));
import { DEFAULT_PERSONAL_DO_PROFILE } from "@/apps/do/personal/profile";
import { DoVoiceAllowanceError } from "@/apps/do/services/voice-allowance";
import { GET, POST } from "./route";
import { voiceRevision } from "@/apps/do/services/voice-preference";
let sequence = 0;
function request(
  body: unknown = { consent: true },
  origin = "https://www.assembl.co.nz",
) {
  return new Request("https://www.assembl.co.nz/api/do/live-token", {
    method: "POST",
    headers: {
      Origin: origin,
      "Content-Type": "application/json",
      "x-test-ip": `voice-${sequence++}`,
    },
    body: JSON.stringify({ voiceRevision: voiceRevision("test-owner", DEFAULT_PERSONAL_DO_PROFILE), ...(body as object) }),
  });
}
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("DO_GEMINI_LIVE_ENABLED", "true");
  vi.stubEnv("GEMINI_API_KEY", "test-server-key");
  calls.owner.mockResolvedValue({ id: "test-owner" });
  calls.read.mockResolvedValue(3);
  calls.reserve.mockResolvedValue({ release: calls.release });
  calls.release.mockResolvedValue(undefined);
  calls.token.mockResolvedValue({ name: "auth_tokens/temporary-test-token" });
  calls.rate.mockResolvedValue({ allowed: true });
  calls.profile.mockResolvedValue({ profile: { ...DEFAULT_PERSONAL_DO_PROFILE }, saved: false });
});
afterEach(() => vi.unstubAllEnvs());
describe("DO voice token boundary", () => {
  it("reports the configured reserved-time budget without minting or expanding a token", async () => {
    vi.stubEnv("DO_VOICE_DAILY_SECONDS", "1200");
    expect(await (await GET()).json()).toMatchObject({ dailyLimit: 4, dailyReservedSecondsLimit: 1200, sessionSeconds: 300, usageBasis: "reserved_connection_seconds" });
    expect(calls.read).toHaveBeenCalledWith("test-owner", { dailySeconds: 1200, dailySessions: 4, sessionSeconds: 300 });
    expect(calls.token).not.toHaveBeenCalled();
  });
  it("fails closed for invalid operator budgets before quota or provider calls", async () => {
    vi.stubEnv("DO_VOICE_DAILY_SECONDS", "unlimited");
    expect((await GET()).status).toBe(503);
    expect((await POST(request())).status).toBe(503);
    expect(calls.read).not.toHaveBeenCalled();
    expect(calls.reserve).not.toHaveBeenCalled();
    expect(calls.token).not.toHaveBeenCalled();
  });

  it("reports readiness without minting a token or exposing the provider key", async () => {
    const response = await GET();
    const body = await response.json();
    expect(body).toMatchObject({
      enabled: true,
      configured: true,
      signedIn: true,
      remaining: 3,
      model: "gemini-3.8-live",
    });
    expect(JSON.stringify(body)).not.toContain("test-server-key");
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(calls.token).not.toHaveBeenCalled();
    expect(calls.reserve).not.toHaveBeenCalled();
    expect(calls.profile).toHaveBeenCalledWith("test-owner");
  });
  it("rejects cross-origin, anonymous and unconsented requests before usage", async () => {
    expect(
      (await POST(request({ consent: true }, "https://foreign.example")))
        .status,
    ).toBe(403);
    calls.owner.mockResolvedValueOnce(null);
    expect((await POST(request())).status).toBe(401);
    for (const body of [
      {},
      { consent: false },
      { consent: true, model: "unrestricted-model" },
      { consent: true, mode: "unknown" },
      { consent: true, voiceName: "unknown" },
      { consent: true, includeProfile: true },
      { consent: true, includeProfile: true, ownerId: "other-owner", profileUpdatedAt: null },
      { consent: true, includeProfile: true, profileUpdatedAt: null, profile: { displayName: "Forged" } },
    ])
      expect((await POST(request(body))).status).toBe(400);
    expect(calls.reserve).not.toHaveBeenCalled();
    expect(calls.token).not.toHaveBeenCalled();
  });
  it("keeps the disabled and flood gates ahead of quota and provider access", async () => {
    vi.stubEnv("DO_GEMINI_LIVE_ENABLED", "false");
    expect((await POST(request())).status).toBe(503);
    vi.stubEnv("DO_GEMINI_LIVE_ENABLED", "true");
    calls.rate.mockResolvedValueOnce({ allowed: false });
    expect((await POST(request())).status).toBe(429);
    expect(calls.reserve).not.toHaveBeenCalled();
    expect(calls.token).not.toHaveBeenCalled();
  });
  it("issues one short-lived session locked to the chosen voice and model", async () => {
    const selected = { ...DEFAULT_PERSONAL_DO_PROFILE, voiceName: "Aoede" as const };
    calls.profile.mockResolvedValue({ profile: selected, saved: true });
    const before = Date.now();
    const response = await POST(
      request({ consent: true, voiceName: "Aoede", voiceRevision: voiceRevision("test-owner", selected), mode: "standard" }),
    );
    const body = await response.json();
    expect(response.status).toBe(200);
    const { config } = calls.token.mock.calls[0][0];
    expect(calls.client).toHaveBeenCalledWith({
      apiKey: "test-server-key",
      httpOptions: { apiVersion: "v1beta" },
    });
    expect(config.uses).toBe(1);
    expect(Date.parse(config.expireTime) - before).toBeGreaterThanOrEqual(
      300_000,
    );
    expect(Date.parse(config.expireTime) - before).toBeLessThan(302_000);
    expect(Date.parse(config.newSessionExpireTime) - before).toBeLessThan(
      62_000,
    );
    expect(config.abortSignal).toBeInstanceOf(AbortSignal);
    expect(config.liveConnectConstraints).toEqual({
      model: "gemini-3.8-live",
      config: body.config,
    });
    expect(body.config.thinkingConfig).toBeUndefined();
    expect(
      body.config.speechConfig.voiceConfig.prebuiltVoiceConfig.voiceName,
    ).toBe("Aoede");
    expect(calls.reserve).toHaveBeenCalledWith("test-owner", { dailySeconds: 900, dailySessions: 3, sessionSeconds: 300 });
    expect(calls.release).not.toHaveBeenCalled();
    expect(calls.profile).toHaveBeenCalledWith("test-owner");
  });
  it("locks only the authenticated owner's consented profile into the server token", async () => {
    const profile = { ...DEFAULT_PERSONAL_DO_PROFILE, displayName: "Moss", voiceName: "Aoede" as const, preferences: "Please use short lists", updatedAt: "2026-09-30T03:00:00.000Z" };
    calls.profile.mockResolvedValueOnce({ profile, saved: true });
    const response = await POST(request({ consent: true, includeProfile: true, profileUpdatedAt: profile.updatedAt, voiceName: "Aoede", voiceRevision: voiceRevision("test-owner", profile) }));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(calls.profile).toHaveBeenCalledWith("test-owner");
    expect(body.displayName).toBe("Moss");
    expect(body.voiceName).toBe("Aoede");
    const constrained = calls.token.mock.calls[0][0].config.liveConnectConstraints.config;
    expect(constrained).toEqual(body.config);
    expect(constrained.systemInstruction).toContain("Moss");
    expect(constrained.systemInstruction).toContain("Please use short lists");
    expect(constrained.systemInstruction).toContain("No sending, booking, purchases");
  });
  it("rejects an unreviewed profile revision and missing profile storage before usage", async () => {
    calls.profile.mockResolvedValueOnce({ profile: { ...DEFAULT_PERSONAL_DO_PROFILE, updatedAt: "2026-09-30T03:00:00.000Z" }, saved: true });
    expect((await POST(request({ consent: true, includeProfile: true, profileUpdatedAt: null }))).status).toBe(409);
    calls.profile.mockRejectedValueOnce(new Error("private storage detail"));
    const failed = await POST(request({ consent: true, includeProfile: true, profileUpdatedAt: null }));
    expect(failed.status).toBe(503);
    expect(await failed.text()).not.toContain("private storage detail");
    expect(calls.reserve).not.toHaveBeenCalled();
    expect(calls.token).not.toHaveBeenCalled();
  });
  it("does not contact Google for an already cancelled call", async () => {
    const abort = new AbortController();
    abort.abort();
    const cancelled = new Request(request(), { signal: abort.signal });
    expect((await POST(cancelled)).status).toBe(499);
    expect(calls.token).not.toHaveBeenCalled();
    expect(calls.reserve).not.toHaveBeenCalled();
  });
  it("releases a reservation if cancellation happens while it is being acquired", async () => {
    const abort = new AbortController();
    calls.reserve.mockImplementationOnce(async () => { abort.abort(); return { release: calls.release }; });
    expect((await POST(new Request(request(), { signal: abort.signal }))).status).toBe(499);
    expect(calls.release).toHaveBeenCalledOnce();
    expect(calls.token).not.toHaveBeenCalled();
  });
  it("does not return a late token for a cancelled call", async () => {
    const abort = new AbortController();
    calls.token.mockImplementationOnce(async () => {
      abort.abort();
      return { name: "auth_tokens/late-private-token" };
    });
    const response = await POST(new Request(request(), { signal: abort.signal }));
    expect(response.status).toBe(499);
    expect(await response.text()).not.toContain("late-private-token");
    expect(calls.release).toHaveBeenCalledOnce();
  });
  it("fails closed on allowance failure and releases a failed provider attempt without leaking detail", async () => {
    calls.reserve.mockRejectedValueOnce(new DoVoiceAllowanceError("exhausted"));
    expect((await POST(request())).status).toBe(429);
    expect(calls.token).not.toHaveBeenCalled();
    calls.reserve.mockRejectedValueOnce(
      new DoVoiceAllowanceError("unavailable"),
    );
    expect((await POST(request())).status).toBe(503);
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    calls.token.mockRejectedValueOnce({
      status: 429,
      message: "private billing detail with test-server-key",
    });
    const response = await POST(request());
    expect(response.status).toBe(502);
    expect(await response.text()).not.toContain("test-server-key");
    expect(calls.release).toHaveBeenCalledOnce();
    expect(JSON.stringify(log.mock.calls)).not.toContain("private billing");
    log.mockRestore();
  });
});


describe("saved voice across surfaces", () => {
  it("uses Kore for an account without a saved profile", async () => {
    const readiness = await (await GET()).json();
    expect(readiness.voiceName).toBe("Kore");
    const result = await POST(request({ consent: true, voiceRevision: readiness.voiceRevision }));
    expect((await result.json()).voiceName).toBe("Kore");
  });
  it("rejects an owner change even when both owners use the default", async () => {
    const readiness = await (await GET()).json();
    calls.owner.mockResolvedValue({ id: "other-owner" });
    expect((await POST(request({ consent: true, voiceRevision: readiness.voiceRevision }))).status).toBe(409);
    expect(calls.profile).toHaveBeenLastCalledWith("other-owner");
    expect(calls.token).not.toHaveBeenCalled();
    expect(calls.reserve).not.toHaveBeenCalled();
  });
  it("requires a fresh review after saving; the next call uses the saved male voice without sharing style", async () => {
    const old = await (await GET()).json();
    calls.profile.mockResolvedValue({ profile: { ...DEFAULT_PERSONAL_DO_PROFILE, voiceName: "Puck", preferences: "Private style", updatedAt: "2026-10-13T01:00:00Z" }, saved: true });
    expect((await POST(request({ consent: true, voiceRevision: old.voiceRevision }))).status).toBe(409);
    const next = await (await GET()).json();
    const response = await POST(request({ consent: true, voiceName: next.voiceName, voiceRevision: next.voiceRevision }));
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.voiceName).toBe("Puck");
    expect(body.config.systemInstruction).not.toContain("Private style");
    expect(body.config.systemInstruction).toContain("Speak natural New Zealand English");
    expect(body.config.tools).toHaveLength(1);
    expect((await POST(request({ consent: true, voiceName: "Charon", voiceRevision: next.voiceRevision }))).status).toBe(409);
  });
  it("does not fall back silently when saved preferences cannot be read", async () => {
    calls.profile.mockRejectedValue(new Error("unavailable"));
    expect(await (await GET()).json()).toMatchObject({ voiceName: null, voiceRevision: null });
    expect((await POST(request())).status).toBe(503);
    expect(calls.token).not.toHaveBeenCalled();
  });
});
