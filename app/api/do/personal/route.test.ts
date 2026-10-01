import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock('@/apps/do/enquiries/service', () => ({ prepareEnquiryFollowups: vi.fn().mockResolvedValue(0) }));
vi.mock("@/apps/do/services/owner", async (original) => ({
  ...(await original<typeof import("@/apps/do/services/owner")>()),
  doOwner: vi.fn(),
}));
vi.mock("@/apps/do/personal/service", () => ({
  personalState: vi.fn(),
  savePersonal: vi.fn(),
  mutatePersonal: vi.fn(),
  runPersonal: vi.fn(),
  personalHeartbeat: vi.fn(),
  personalWorkerConfigured: vi.fn().mockReturnValue(true),
}));
import { doOwner } from "@/apps/do/services/owner";
import {
  personalState,
  savePersonal,
  mutatePersonal,
  runPersonal,
  personalHeartbeat,
} from "@/apps/do/personal/service";
import { GET, POST } from "./route";
import { POST as run } from "./run/route";
import { GET as cron } from "./cron/route";
const id = "11111111-1111-4111-8111-111111111111";
const owner = {
  id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  externalId: "do:user:a",
};
const request = (body: unknown, origin = "https://www.assembl.co.nz") =>
  new Request("https://www.assembl.co.nz/api/do/personal", {
    method: "POST",
    headers: { origin, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(doOwner).mockResolvedValue(owner);
});
describe("Personal DO HTTP boundaries", () => {
  it("requires an owner before reading private data", async () => {
    vi.mocked(doOwner).mockResolvedValue(null);
    const response = await GET();
    expect(response.status).toBe(401);
    expect((await response.json()).workspaceKey).toBe("guest");
    expect(personalState).not.toHaveBeenCalled();
  });
  it("rejects cross-origin mutation and never calls storage", async () => {
    expect(
      (await POST(request({ action: "pause", id }, "https://other.example")))
        .status,
    ).toBe(403);
    expect(mutatePersonal).not.toHaveBeenCalled();
  });
  it("passes the verified owner, not an arbitrary body identity", async () => {
    vi.mocked(mutatePersonal).mockResolvedValue(true);
    expect((await POST(request({ action: "pause", id }))).status).toBe(200);
    expect(mutatePersonal).toHaveBeenCalledWith(owner.id, "pause", id);
    expect(
      (await POST(request({ action: "pause", id, ownerId: "other" }))).status,
    ).toBe(400);
  });
  it("does not save without provider consent", async () => {
    expect(
      (
        await POST(
          request({
            action: "save",
            title: "Day",
            goal: "Prepare my checklist",
            notes: "Friday",
            timezone: "Pacific/Auckland",
            localHour: 7,
            consent: false,
          }),
        )
      ).status,
    ).toBe(400);
    expect(savePersonal).not.toHaveBeenCalled();
  });
  it("marks private responses non-cacheable and surfaces storage failure", async () => {
    vi.mocked(personalState).mockRejectedValue(new Error("missing table"));
    const response = await GET();
    expect(response.status).toBe(503);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect((await response.json()).workspaceKey).toBe(owner.id);
  });
  it("identifies the verified workspace independently of the client", async () => {
    vi.mocked(personalState).mockResolvedValue({ responsibilities: [], runs: [], worker: { configured: false, lastSeenAt: null } });
    const response = await GET();
    expect((await response.json()).workspaceKey).toBe(owner.id);
  });
  it("manual preparation uses the verified owner and does not bypass quota", async () => {
    vi.mocked(runPersonal).mockResolvedValue({
      claimed: false,
      published: false,
    });
    expect((await run(request({ id }))).status).toBe(409);
    expect(runPersonal).toHaveBeenCalledWith(owner.id, id);
  });
  it("rejects unset and wrong cron secrets before starting work", async () => {
    vi.stubEnv("CRON_SECRET", "");
    expect(
      (
        await cron(
          new Request("https://www.assembl.co.nz/api/do/personal/cron", {
            headers: { authorization: "Bearer " },
          }),
        )
      ).status,
    ).toBe(401);
    vi.stubEnv("CRON_SECRET", "test-secret");
    expect(
      (
        await cron(
          new Request("https://www.assembl.co.nz/api/do/personal/cron"),
        )
      ).status,
    ).toBe(401);
    expect(runPersonal).not.toHaveBeenCalled();
    vi.unstubAllEnvs();
  });
  it("bounds each enabled worker cron invocation to three claims", async () => {
    vi.stubEnv("CRON_SECRET", "test-secret");
    vi.mocked(runPersonal).mockResolvedValue({
      claimed: true,
      published: true,
    });
    const response = await cron(
      new Request("https://www.assembl.co.nz/api/do/personal/cron", {
        headers: { authorization: "Bearer test-secret" },
      }),
    );
    expect(await response.json()).toEqual({ claimed: 3, published: 3, followupsPrepared: 0, personal: { status: 'enabled' } });
    expect(personalHeartbeat).toHaveBeenCalledOnce();
    expect(runPersonal).toHaveBeenCalledTimes(3);
    vi.unstubAllEnvs();
  });
});
