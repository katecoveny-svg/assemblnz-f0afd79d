import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock('@/apps/do/enquiries/service', () => ({ prepareEnquiryFollowups: vi.fn().mockResolvedValue(0) }));
vi.mock('@/apps/do/personal/memory-maintenance-server', () => ({ maintainPersonalMemory: vi.fn().mockRejectedValue(new Error('Synthetic cleanup outage')) }));
vi.mock("@/apps/do/services/owner", async (original) => ({
  ...(await original<typeof import("@/apps/do/services/owner")>()),
  doOwner: vi.fn(),
}));
vi.mock("@/apps/do/personal/service", () => ({
  PersonalStorageConflict: class extends Error {},
  personalState: vi.fn(),
  savePersonal: vi.fn(),
  mutatePersonal: vi.fn(),
  runPersonal: vi.fn(),
  personalHeartbeat: vi.fn(),
  personalWorkerConfigured: vi.fn().mockReturnValue(true),
  personalWorkerMode: vi.fn().mockReturnValue('worksheet'),
  maintainPersonalResponsibilityStorage: vi.fn().mockResolvedValue({ configured: false }),
  schedulePersonal: vi.fn(),
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
  it("does not save without storage consent", async () => {
    expect(
      (
        await POST(
          request({
            action: "save",
  id: "11111111-1111-4111-8111-111111111111",
            title: "Day",
            goal: "Prepare my checklist",
            notes: "Friday",
            timezone: "Pacific/Auckland",
            localHour: 7,
            consent: false,
            expectedRevision: 0,
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
    expect(runPersonal).toHaveBeenCalledWith(owner.id, id, { note: undefined });
  });
  it("passes a bounded note through as the reason for a manual wake-up", async () => {
    vi.mocked(runPersonal).mockResolvedValue({ claimed: true, published: true });
    expect((await run(request({ id, note: " Focus on the quote " }))).status).toBe(200);
    expect(runPersonal).toHaveBeenCalledWith(owner.id, id, { note: "Focus on the quote" });
    expect((await run(request({ id, note: "x".repeat(501) }))).status).toBe(400);
    expect(runPersonal).toHaveBeenCalledTimes(1);
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
    // A cleanup outage is reported, never allowed to fail the worker tick.
    expect(await response.json()).toEqual({ claimed: 3, published: 3, followupsPrepared: 0, maintenance: { responsibilities: { configured: false }, memory: { configured: true, failed: true } }, personal: { status: 'enabled', mode: 'worksheet' } });
    expect(personalHeartbeat).toHaveBeenCalledOnce();
    expect(runPersonal).toHaveBeenCalledTimes(3);
    vi.unstubAllEnvs();
  });
});

it("saves only the authenticated owner's paused responsibility and returns an honest receipt",async()=>{
 vi.mocked(savePersonal).mockResolvedValue(id);
 const body={action:'save',id:'11111111-1111-4111-8111-111111111111',title:'Synthetic responsibility',goal:'Review fictional notes',notes:'Fictional only',timezone:'Pacific/Auckland',localHour:7,consent:true,expectedRevision:0};
 const response=await POST(request(body));expect(response.status).toBe(200);expect(await response.json()).toEqual({id,saved:true,preparation:'off'});expect(savePersonal).toHaveBeenCalledWith(owner.id,body);
 vi.mocked(doOwner).mockResolvedValue(null);vi.mocked(savePersonal).mockClear();expect((await POST(request(body))).status).toBe(401);expect(savePersonal).not.toHaveBeenCalled();
});

describe("Wake-up schedule boundary", () => {
  it("routes a schedule request to the owner-checked service and returns its receipt", async () => {
    const { POST } = await import("./route");
    const { schedulePersonal } = await import("@/apps/do/personal/service");
    const receipt = { id, revision: 1, cadence: "daily", active: true, consentUntil: "2026-10-20T00:00:00Z", nextRunAt: "2026-10-13T18:00:00Z" };
    vi.mocked(schedulePersonal).mockResolvedValue(receipt as Awaited<ReturnType<typeof schedulePersonal>>);
    const body = { action: "schedule", id, cadence: "daily", localHour: 7, timezone: "Pacific/Auckland", consent: true, expectedRevision: 1 };
    const response = await POST(request(body));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ schedule: receipt });
    expect(schedulePersonal).toHaveBeenCalledWith(owner.id, body);
    expect((await POST(request({ ...body, consent: false }))).status).toBe(400);
    expect((await POST(request({ ...body, cadence: "weekly" }))).status).toBe(400);
    expect(schedulePersonal).toHaveBeenCalledTimes(1);
  });
});
