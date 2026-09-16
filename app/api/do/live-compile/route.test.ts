import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
const calls = vi.hoisted(() => ({ owner: vi.fn() }));
vi.mock("@/apps/do/services/owner", async (original) => ({
  ...(await original<object>()),
  doOwner: calls.owner,
}));
vi.mock("@/lib/agents/chat-rate-limit", () => ({
  chatClientIp: () => crypto.randomUUID(),
  checkChatRateLimit: async () => ({ allowed: true }),
}));
import { POST } from "./route";
const request = (origin = "https://www.assembl.co.nz") =>
  new Request("https://www.assembl.co.nz/api/do/live-compile", {
    method: "POST",
    headers: { Origin: origin, "Content-Type": "application/json" },
    body: JSON.stringify({
      brief: "Prepare a polite reply to a meeting invitation.",
      connector: "hook-later",
    }),
  });
beforeEach(() => {
  calls.owner.mockResolvedValue({ id: "owner" });
  vi.stubEnv("DO_GEMINI_LIVE_ENABLED", "true");
});
afterEach(() => vi.unstubAllEnvs());
describe("Voice brief preparation", () => {
  it("rejects requests from another origin or without an account", async () => {
    expect((await POST(request("https://foreign.example"))).status).toBe(403);
    calls.owner.mockResolvedValueOnce(null);
    expect((await POST(request())).status).toBe(401);
  });
  it("prepares a private inactive contract for review", async () => {
    const result = await POST(request());
    expect(result.status).toBe(200);
    expect(await result.json()).toMatchObject({
      active: false,
      approvalPolicy: "prepare-only",
      spec: { brief: "Prepare a polite reply to a meeting invitation." },
    });
    expect(result.headers.get("Cache-Control")).toBe("private, no-store");
  });
});
