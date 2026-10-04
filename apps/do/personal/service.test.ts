import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("@/lib/supabase/service", () => ({ getServiceClient: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
vi.mock("@/apps/do/shared/preparation-server", () => ({ getDoAvailability: vi.fn(), prepareDoDraft: vi.fn() }));
vi.mock("./profile-service", () => ({ getPersonalDoProfile: vi.fn() }));
import { getServiceClient } from "@/lib/supabase/service";
import { createClient as createOwnerClient } from "@/lib/supabase/server";
import { getDoAvailability, prepareDoDraft } from "@/apps/do/shared/preparation-server";
import { getPersonalDoProfile } from "./profile-service";
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
