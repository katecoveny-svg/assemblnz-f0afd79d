import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const mocked = vi.hoisted(() => ({
  create: vi.fn(() => "a".repeat(64)),
  get: vi.fn(() => ({})),
  snapshot: vi.fn(() => ({ voice: "off" })),
  submit: vi.fn(),
  voice: vi.fn(),
}));
vi.mock("@/apps/do/shared/live-session-server", () => ({
  createLocalDoSession: mocked.create,
  localDoSession: mocked.get,
  snapshotLocalDoSession: mocked.snapshot,
  submitLocalDoText: mocked.submit,
  selectLocalDoAgent: vi.fn(),
  cancelLocalDoTask: vi.fn(),
  interruptLocalDoSpeech: vi.fn(),
  disposeLocalDoSession: vi.fn(),
  connectLocalDoVoice: mocked.voice,
  closeLocalDoVoice: vi.fn(),
}));
import { POST } from "./route";
function request(
  body: unknown,
  origin = "http://127.0.0.1:8790",
  host = "127.0.0.1:8790",
) {
  return new Request("http://127.0.0.1:8790/api/do/live", {
    method: "POST",
    headers: { host, origin, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("NODE_ENV", "development");
});
afterEach(() => vi.unstubAllEnvs());
describe("personal-key live preview boundary", () => {
  it("never exposes the personal key service in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(
      (await POST(request({ action: "create", consent: true }))).status,
    ).toBe(403);
    expect(mocked.create).not.toHaveBeenCalled();
  });
  it("rejects foreign origins and non-loopback hosts", async () => {
    expect(
      (
        await POST(
          request(
            { action: "create", consent: true },
            "https://outside.example",
          ),
        )
      ).status,
    ).toBe(403);
    expect(
      (
        await POST(
          request(
            { action: "create", consent: true },
            "http://outside.example:8790",
            "outside.example:8790",
          ),
        )
      ).status,
    ).toBe(403);
    expect(mocked.create).not.toHaveBeenCalled();
  });
  it("requires explicit input consent before session creation", async () => {
    expect((await POST(request({ action: "create" }))).status).toBe(400);
    expect(mocked.create).not.toHaveBeenCalled();
  });
  it("requires an opaque session handle for task work", async () => {
    expect(
      (await POST(request({ action: "text", text: "hello" }))).status,
    ).toBe(400);
    expect(mocked.submit).not.toHaveBeenCalled();
  });
  it("rejects oversized text before accessing a session", async () => {
    expect(
      (
        await POST(
          request({
            action: "text",
            token: "a".repeat(64),
            text: "x".repeat(12001),
          }),
        )
      ).status,
    ).toBe(400);
    expect(mocked.get).not.toHaveBeenCalled();
  });
  it("does not connect microphone media without explicit consent", async () => {
    expect(
      (
        await POST(
          request({ action: "voice", token: "a".repeat(64), sdp: "offer" }),
        )
      ).status,
    ).toBe(400);
    expect(mocked.voice).not.toHaveBeenCalled();
  });
  it("passes an explicit correction to the task controller", async () => {
    expect(
      (
        await POST(
          request({
            action: "text",
            token: "a".repeat(64),
            text: "Wednesday instead",
            correction: true,
          }),
        )
      ).status,
    ).toBe(200);
    expect(mocked.submit).toHaveBeenCalledWith({}, "Wednesday instead", true);
  });
});
