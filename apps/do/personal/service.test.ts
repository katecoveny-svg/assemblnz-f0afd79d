import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("@/lib/supabase/service", () => ({ getServiceClient: vi.fn() }));
vi.mock("@/apps/do/shared/preparation-server", () => ({ getDoAvailability: vi.fn(), prepareDoDraft: vi.fn() }));
vi.mock("./profile-service", () => ({ getPersonalDoProfile: vi.fn() }));
import { getServiceClient } from "@/lib/supabase/service";
import { getDoAvailability, prepareDoDraft } from "@/apps/do/shared/preparation-server";
import { getPersonalDoProfile } from "./profile-service";
import { DEFAULT_PERSONAL_DO_PROFILE, formatPersonalDoStyle } from "./profile";
import { runPersonal } from "./service";

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

describe("Personal DO draft personalisation", () => {
  it("adds saved style separately without truncating notes or increasing permissions", async () => {
    expect(await runPersonal(owner, id)).toEqual({ claimed: true, published: true });
    expect(getPersonalDoProfile).toHaveBeenCalledWith(owner);
    expect(prepareDoDraft).toHaveBeenCalledWith(expect.objectContaining({ source: item.notes, consent: true }), undefined, formatPersonalDoStyle(profile));
    expect(db.rpc).toHaveBeenCalledWith("do_personal_finish", expect.objectContaining({ p_evidence: expect.objectContaining({ profileUpdatedAt: profile.updatedAt, revision: 1, permissionExpiresAt: item.consent_until }) }));
  });

  it("does not send unsaved defaults as personal profile data", async () => {
    vi.mocked(getPersonalDoProfile).mockResolvedValue({ profile: DEFAULT_PERSONAL_DO_PROFILE, saved: false });
    await runPersonal(owner, id);
    expect(prepareDoDraft).toHaveBeenCalledWith(expect.any(Object), undefined, undefined);
  });

  it("keeps existing responsibilities working when profile storage is absent", async () => {
    vi.mocked(getPersonalDoProfile).mockRejectedValue(new Error("table missing"));
    expect(await runPersonal(owner, id)).toEqual({ claimed: true, published: true });
    expect(prepareDoDraft).toHaveBeenCalledWith(expect.any(Object), undefined, undefined);
    expect(db.rpc).toHaveBeenCalledWith("do_personal_finish", expect.objectContaining({ p_evidence: expect.objectContaining({ profileUpdatedAt: null }) }));
  });

  it("rechecks responsibility permission after loading the profile and before provider use", async () => {
    query.maybeSingle.mockResolvedValue({ data: { ...item, active: false }, error: null });
    expect(await runPersonal(owner, id)).toEqual({ claimed: true, published: false });
    expect(getPersonalDoProfile).toHaveBeenCalledOnce();
    expect(vi.mocked(getPersonalDoProfile).mock.invocationCallOrder[0]).toBeLessThan(query.maybeSingle.mock.invocationCallOrder[0]);
    expect(prepareDoDraft).not.toHaveBeenCalled();
  });

  it("does not read preferences or call a provider without a claimed responsibility", async () => {
    db.rpc.mockResolvedValue({ data: [], error: null });
    expect(await runPersonal(owner, id)).toEqual({ claimed: false, published: false });
    expect(getPersonalDoProfile).not.toHaveBeenCalled();
    expect(prepareDoDraft).not.toHaveBeenCalled();
  });
});
