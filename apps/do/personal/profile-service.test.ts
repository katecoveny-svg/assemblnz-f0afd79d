import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("@/lib/supabase/service", () => ({ getServiceClient: vi.fn() }));
import { getServiceClient } from "@/lib/supabase/service";
import { DEFAULT_PERSONAL_DO_PROFILE, type PersonalDoProfileSave } from "./profile";
import { deletePersonalDoProfile, getPersonalDoProfile, savePersonalDoProfile } from "./profile-service";

const owner = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const { updatedAt: _updatedAt, ...editable } = DEFAULT_PERSONAL_DO_PROFILE;
const input = { ...editable, consent: true as const };
const row = {
  display_name: "Orbit", avatar: "orbit", tone: "direct", response_length: "brief", initiative: "on_request", preferences: "Use short paragraphs.", voice_name: "Aoede", onboarding_completed: true, updated_at: "2026-09-30T00:00:00.000Z",
};
const db = { from: vi.fn() };
const query = { select: vi.fn(), eq: vi.fn(), maybeSingle: vi.fn(), upsert: vi.fn(), single: vi.fn(), delete: vi.fn() };

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(getServiceClient).mockReturnValue(db as unknown as ReturnType<typeof getServiceClient>);
  db.from.mockReturnValue(query);
  query.select.mockReturnValue(query);
  query.eq.mockReturnValue(query);
  query.upsert.mockReturnValue(query);
  query.delete.mockReturnValue(query);
  query.maybeSingle.mockResolvedValue({ data: row, error: null });
  query.single.mockResolvedValue({ data: row, error: null });
});

describe("Personal DO profile persistence", () => {
  it("reads only the supplied verified owner's profile and projects safe columns", async () => {
    const state = await getPersonalDoProfile(owner);
    expect(db.from).toHaveBeenCalledWith("do_personal_profiles");
    expect(query.eq).toHaveBeenCalledWith("owner_id", owner);
    expect(state).toEqual({ saved: true, profile: { displayName: "Orbit", avatar: "orbit", tone: "direct", responseLength: "brief", initiative: "on_request", preferences: "Use short paragraphs.", voiceName: "Aoede", onboardingCompleted: true, updatedAt: row.updated_at } });
    expect(state.profile).not.toHaveProperty("owner_id");
  });

  it("returns fresh unsaved defaults for a confirmed absent row", async () => {
    query.maybeSingle.mockResolvedValue({ data: null, error: null });
    const state = await getPersonalDoProfile(owner);
    expect(state).toEqual({ profile: DEFAULT_PERSONAL_DO_PROFILE, saved: false });
    state.profile.displayName = "Local edit";
    expect(DEFAULT_PERSONAL_DO_PROFILE.displayName).toBe("DO");
  });

  it("fails honestly for missing storage, malformed data or missing timestamp", async () => {
    for (const result of [{ data: null, error: { code: "42P01" } }, { data: { ...row, avatar: "invalid" }, error: null }, { data: { ...row, updated_at: null }, error: null }]) {
      query.maybeSingle.mockResolvedValue(result);
      await expect(getPersonalDoProfile(owner)).rejects.toThrow("preferences are unavailable");
    }
    vi.mocked(getServiceClient).mockImplementation(() => { throw new Error("private configuration details"); });
    await expect(getPersonalDoProfile(owner)).rejects.toThrow("preferences are unavailable");
    await expect(savePersonalDoProfile(owner, input)).rejects.toThrow("preferences are unavailable");
  });

  it("upserts one row for the verified owner and records current consent and timestamp", async () => {
    const saved = await savePersonalDoProfile(owner, input);
    expect(query.upsert).toHaveBeenCalledWith({
      owner_id: owner, display_name: "DO", avatar: "bloom", tone: "warm", response_length: "balanced", initiative: "gentle", preferences: "", voice_name: "Kore", onboarding_completed: false,
      consented_at: expect.any(String), consent_version: 1, updated_at: expect.any(String),
    }, { onConflict: "owner_id" });
    const data = query.upsert.mock.calls[0][0];
    expect(data.consented_at).toBe(data.updated_at);
    expect(Number.isNaN(Date.parse(data.updated_at))).toBe(false);
    expect(saved.updatedAt).toBe(row.updated_at);
  });

  it("cannot write without consent, with forged owner/timestamp, or without an owner", async () => {
    for (const patch of [{ consent: false }, { owner_id: "other" }, { updatedAt: "forged" }]) {
      await expect(savePersonalDoProfile(owner, { ...input, ...patch } as PersonalDoProfileSave)).rejects.toThrow();
    }
    await expect(savePersonalDoProfile("", input)).rejects.toThrow();
    await expect(getPersonalDoProfile("")).rejects.toThrow();
    await expect(deletePersonalDoProfile("")).rejects.toThrow();
    expect(db.from).not.toHaveBeenCalled();
  });

  it("does not claim a save succeeded when the database fails or returns no row", async () => {
    for (const result of [{ data: null, error: { code: "42P01" } }, { data: null, error: null }]) {
      query.single.mockResolvedValue(result);
      await expect(savePersonalDoProfile(owner, input)).rejects.toThrow("preferences are unavailable");
    }
  });

  it("deletes only the owner's profile and returns unsaved defaults", async () => {
    query.eq.mockResolvedValue({ error: null });
    expect(await deletePersonalDoProfile(owner)).toEqual({ profile: DEFAULT_PERSONAL_DO_PROFILE, saved: false });
    expect(db.from).toHaveBeenCalledExactlyOnceWith("do_personal_profiles");
    expect(query.delete).toHaveBeenCalledOnce();
    expect(query.eq).toHaveBeenCalledExactlyOnceWith("owner_id", owner);
    query.eq.mockResolvedValue({ error: { code: "42P01" } });
    await expect(deletePersonalDoProfile(owner)).rejects.toThrow("preferences are unavailable");
  });
});
