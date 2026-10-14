import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("@/lib/supabase/service", () => ({ getServiceClient: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
vi.mock("@/apps/do/shared/preparation-server", () => ({ getDoAvailability: vi.fn(), prepareDoDraft: vi.fn() }));
vi.mock("./profile-service", () => ({ getPersonalDoProfile: vi.fn() }));
vi.mock("@/lib/bills/provider-prices", () => ({ getPriceBook: vi.fn() }));
import { getServiceClient } from "@/lib/supabase/service";
import { createClient as createOwnerClient } from "@/lib/supabase/server";
import { getDoAvailability, prepareDoDraft } from "@/apps/do/shared/preparation-server";
import { getPersonalDoProfile } from "./profile-service";
import { getPriceBook } from "@/lib/bills/provider-prices";
import { DEFAULT_PERSONAL_DO_PROFILE } from "./profile";
import { runPersonal, personalState, personalWorkerConfigured } from "./service";

const owner = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const id = "11111111-1111-4111-8111-111111111111";
const run = "22222222-2222-4222-8222-222222222222";
const item = { id, owner_id: owner, title: "Prepare my day", goal: "Prepare my checklist", notes: "A proposal is due Friday.", timezone: "Pacific/Auckland", updated_at: "2026-09-30T00:00:00Z", revision: 1, active: true, consent_until: "2099-01-01T00:00:00Z" };
const db = { rpc: vi.fn(), from: vi.fn() };
const query = { select: vi.fn(), eq: vi.fn(), maybeSingle: vi.fn() };
const profile = { ...DEFAULT_PERSONAL_DO_PROFILE, displayName: "Orbit", preferences: "Use shorter paragraphs.", updatedAt: "2026-09-30T00:00:00Z" };

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("CRON_SECRET", "test-only");
  vi.mocked(getServiceClient).mockReturnValue(db as unknown as ReturnType<typeof getServiceClient>);
  vi.mocked(getDoAvailability).mockReturnValue({ preparation: "configured" } as ReturnType<typeof getDoAvailability>);
  vi.mocked(getPersonalDoProfile).mockResolvedValue({ profile, saved: true });
  vi.mocked(prepareDoDraft).mockResolvedValue({ text: "A draft", evidence: { method: "model" } } as Awaited<ReturnType<typeof prepareDoDraft>>);
  db.rpc.mockImplementation(async (name: string) => name === "do_personal_claim" ? { data: [{ run_id: run, responsibility: item }], error: null } : { data: true, error: null });
  db.from.mockReturnValue(query); query.select.mockReturnValue(query); query.eq.mockReturnValue(query);
  query.maybeSingle.mockResolvedValue({ data: item, error: null });
});
afterEach(() => vi.unstubAllEnvs());

describe("Background provider permission renewal", () => {
  it.each([
    ['active old permission', item],
    ['expired old permission', { ...item, consent_until: '2000-01-01T00:00:00Z' }],
    ['revoked old permission', { ...item, active: false }],
    ['changed notes revision', { ...item, revision: 2 }],
    ['missing optional profile', item],
    ['different claimed owner', { ...item, owner_id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb' }],
  ])('never transmits under %s without a renewed stored provider grant', async (_name, responsibility) => {
    db.rpc.mockResolvedValue({ data: [{ run_id: run, responsibility }], error: null });
    await expect(runPersonal(owner, id)).rejects.toThrow('renewed OpenAI and TypeSafe permission');
    expect(db.rpc).not.toHaveBeenCalled();
    expect(db.from).not.toHaveBeenCalled();
    expect(getServiceClient).not.toHaveBeenCalled();
    expect(getPersonalDoProfile).not.toHaveBeenCalled();
    expect(prepareDoDraft).not.toHaveBeenCalled();
  });
  it('rejects an ownerless targeted run before storage access', async () => {
    await expect(runPersonal(undefined,id)).rejects.toThrow('Owner required');
    expect(db.rpc).not.toHaveBeenCalled(); expect(prepareDoDraft).not.toHaveBeenCalled();
  });
});
it("reads run output through cookie-owner RLS even when provider memory is disabled", async () => {
 vi.stubEnv('DO_PROVIDER_MEMORY_ENABLED','false');
 const serviceQuery={select:vi.fn().mockReturnThis(),eq:vi.fn().mockReturnThis(),order:vi.fn().mockResolvedValue({data:[],error:null}),single:vi.fn().mockResolvedValue({data:{last_seen_at:null},error:null})};
 const ownerQuery={select:vi.fn().mockReturnThis(),eq:vi.fn().mockReturnThis(),order:vi.fn().mockReturnThis(),limit:vi.fn().mockResolvedValue({data:[],error:null})};
 const ownerDb={from:vi.fn().mockImplementation(name=>name==='do_personal_responsibilities'?serviceQuery:ownerQuery)};
 db.from.mockReturnValue(serviceQuery);
 vi.mocked(createOwnerClient).mockResolvedValue(ownerDb as unknown as Awaited<ReturnType<typeof createOwnerClient>>);
 const state=await personalState(owner);
 expect(state.runs).toEqual([]);
 expect(state.worker.configured).toBe(false);
 expect(ownerDb.from).toHaveBeenCalledWith('do_personal_runs');
 expect(ownerDb.from).toHaveBeenCalledWith('do_personal_responsibilities');
 expect(db.from).not.toHaveBeenCalledWith('do_personal_responsibilities');
 expect(ownerQuery.eq).toHaveBeenCalledWith('owner_id',owner);
 expect(db.from).not.toHaveBeenCalledWith('do_personal_runs');
});

it("keeps the background worker disabled even with provider configuration present", () => {
 expect(personalWorkerConfigured()).toBe(false);
 expect(db.rpc).not.toHaveBeenCalled();
 expect(db.from).not.toHaveBeenCalled();
 expect(prepareDoDraft).not.toHaveBeenCalled();
});
it("does not fall back to service-role output reads when the cookie client fails", async () => {
 vi.mocked(createOwnerClient).mockRejectedValue(new Error("Fictional unavailable session"));
 await expect(personalState(owner)).rejects.toThrow("Fictional unavailable session");
 expect(db.from).not.toHaveBeenCalled();
});

describe("Worksheet wake-ups (no provider)", () => {
  const on = () => { vi.stubEnv("DO_PERSONAL_WAKEUPS_ENABLED", "true"); vi.stubEnv("DO_PERSONAL_WORKER_MODE", "worksheet"); };
  it("stays off unless both the wake-up migration flag and the worksheet mode are set", async () => {
    vi.stubEnv("DO_PERSONAL_WORKER_MODE", "worksheet");
    expect(personalWorkerConfigured()).toBe(false);
    await expect(runPersonal(owner, id)).rejects.toThrow("renewed OpenAI and TypeSafe permission");
    vi.stubEnv("DO_PERSONAL_WAKEUPS_ENABLED", "true"); vi.stubEnv("DO_PERSONAL_WORKER_MODE", "model");
    expect(personalWorkerConfigured()).toBe(false);
    expect(db.rpc).not.toHaveBeenCalled();
  });
  it("claims with the reason, prepares a worksheet from the saved notes only and publishes it for review", async () => {
    on();
    const result = await runPersonal(owner, id, { note: "Focus on the proposal" });
    expect(result).toEqual({ claimed: true, published: true });
    expect(db.rpc).toHaveBeenNthCalledWith(1, "do_personal_claim", { p_owner: owner, p_id: id, p_trigger: "message", p_note: "Focus on the proposal" });
    const [name, args] = db.rpc.mock.calls[1] as [string, { p_run: string; p_output: string; p_evidence: Record<string, unknown>; p_failed: boolean }];
    expect(name).toBe("do_personal_finish");
    expect(args.p_run).toBe(run); expect(args.p_failed).toBe(false);
    expect(args.p_output).toContain("DO woke up for your note");
    expect(args.p_output).toContain("A proposal is due Friday.");
    expect(args.p_evidence).toMatchObject({ method: "worksheet", model: null, provider: "none", trigger: "message", note: "Focus on the proposal", notesUpdatedAt: item.updated_at, externalAction: "none" });
    expect(prepareDoDraft).not.toHaveBeenCalled(); expect(getPersonalDoProfile).not.toHaveBeenCalled(); expect(db.from).not.toHaveBeenCalled();
  });
  it("compares a watched bill against the price book instead of the notes worksheet, still with no model", async () => {
    on();
    const watched = { ...item, title: "Watch my electricity", goal: "Watch my electricity with Example Power. I pay about NZD 224.50 a month, last paid 2026-09-05. Each month, check whether a current public offer would cost less.", notes: "Do not switch, cancel or contact anyone." };
    db.rpc.mockImplementation(async (name: string) => name === "do_personal_claim" ? { data: [{ run_id: run, responsibility: watched }], error: null } : { data: true, error: null });
    vi.mocked(getPriceBook).mockResolvedValue({ live: true, lastVerified: "2026-10-11T16:00:02.229+00:00", plans: [
      { id: "p1", category: "electricity", provider: "Fixture Energy", planName: "Flat", monthlyCost: 150, features: ["No fixed term"], eligibilityNotes: null, sourceUrl: "https://fixture.example/plans", sourceHost: "fixture.example", lastVerified: "2026-10-11T16:00:02.229+00:00", trustTier: "A", status: "active" },
      { id: "p2", category: "broadband", provider: "Other", planName: "Fibre", monthlyCost: 79, features: [], eligibilityNotes: null, sourceUrl: "https://other.example", sourceHost: "other.example", lastVerified: "2026-10-11T16:00:02.229+00:00", trustTier: "A", status: "active" },
    ] });
    expect(await runPersonal()).toEqual({ claimed: true, published: true });
    const [, args] = db.rpc.mock.calls[1] as [string, { p_output: string; p_evidence: Record<string, unknown>; p_failed: boolean }];
    expect(args.p_failed).toBe(false);
    expect(args.p_output).toContain("Watching your electricity with Example Power");
    expect(args.p_output).toContain("Fixture Energy · Flat");
    expect(args.p_output).toContain("source fixture.example");
    expect(args.p_output).not.toContain("Other · Fibre");
    expect(args.p_output).toContain("Nothing was switched, cancelled or sent.");
    expect(args.p_evidence).toMatchObject({ method: "bills-watch", model: null, provider: "none", externalAction: "none", priceBook: { live: true, offers: 1 } });
    expect(prepareDoDraft).not.toHaveBeenCalled();
  });
  it("runs the scheduled worker without an owner and reports nothing claimed when nothing is due", async () => {
    on();
    db.rpc.mockResolvedValue({ data: [], error: null });
    expect(await runPersonal()).toEqual({ claimed: false, published: false });
    expect(db.rpc).toHaveBeenCalledWith("do_personal_claim", { p_owner: null, p_id: null, p_trigger: "scheduled", p_note: null });
    expect(db.rpc).toHaveBeenCalledTimes(1);
  });
  it("fails the run instead of preparing when the claimed row is another owner's", async () => {
    on();
    db.rpc.mockImplementation(async (name: string) => name === "do_personal_claim" ? { data: [{ run_id: run, responsibility: { ...item, owner_id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb" } }], error: null } : { data: true, error: null });
    expect(await runPersonal(owner, id)).toEqual({ claimed: true, published: false });
    expect(db.rpc.mock.calls[1]).toEqual(["do_personal_finish", { p_run: run, p_output: "", p_evidence: { error: "owner_mismatch" }, p_failed: true }]);
  });
  it("does not report a draft when finish declines (paused, expired or edited meanwhile)", async () => {
    on();
    db.rpc.mockImplementation(async (name: string) => name === "do_personal_claim" ? { data: [{ run_id: run, responsibility: item }], error: null } : { data: false, error: null });
    expect(await runPersonal(owner, id)).toEqual({ claimed: true, published: false });
  });
  it("schedules through the owner-checked RPC and surfaces conflicts", async () => {
    vi.stubEnv("DO_PERSONAL_WAKEUPS_ENABLED", "true");
    const { schedulePersonal, PersonalStorageConflict } = await import("./service");
    const input = { action: "schedule" as const, id, cadence: "weekly" as const, weekday: 5, localHour: 7, timezone: "Pacific/Auckland", consent: true as const, expectedRevision: 1 };
    db.rpc.mockResolvedValue({ data: { id, revision: 1, cadence: "weekly", active: true, consentUntil: "2026-10-20T00:00:00Z", nextRunAt: "2026-10-15T18:00:00Z" }, error: null });
    expect(await schedulePersonal(owner, input)).toMatchObject({ cadence: "weekly", nextRunAt: "2026-10-15T18:00:00Z" });
    expect(db.rpc).toHaveBeenCalledWith("do_personal_schedule", { p_owner: owner, p_id: id, p_cadence: "weekly", p_weekday: 5, p_hour: 7, p_timezone: "Pacific/Auckland", p_run_once_at: null, p_expected_revision: 1 });
    db.rpc.mockResolvedValue({ data: null, error: { message: "responsibility_conflict" } });
    await expect(schedulePersonal(owner, input)).rejects.toBeInstanceOf(PersonalStorageConflict);
    db.rpc.mockResolvedValue({ data: { id }, error: null });
    await expect(schedulePersonal(owner, input)).rejects.toThrow("No wake-up change was confirmed");
    vi.stubEnv("DO_PERSONAL_WAKEUPS_ENABLED", "false");
    await expect(schedulePersonal(owner, input)).rejects.toThrow("not enabled");
  });
});
