import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const calls = vi.hoisted(() => ({
  owner: vi.fn(),
  token: vi.fn(),
  client: vi.fn(),
  reserve: vi.fn(),
  release: vi.fn(),
  read: vi.fn(),
  rate: vi.fn(),
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
import { DoVoiceAllowanceError } from "@/apps/do/services/voice-allowance";
import { GET, POST } from "./route";
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
    body: JSON.stringify(body),
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
});
afterEach(() => vi.unstubAllEnvs());
describe("DO voice token boundary", () => {
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
    const before = Date.now();
    const response = await POST(
      request({ consent: true, voiceName: "Aoede", mode: "standard" }),
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
    expect(calls.reserve).toHaveBeenCalledWith("test-owner");
    expect(calls.release).not.toHaveBeenCalled();
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
