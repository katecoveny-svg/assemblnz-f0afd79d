import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("@/apps/do/services/owner", async (original) => ({
  ...(await original<typeof import("@/apps/do/services/owner")>()), doOwner: vi.fn(),
}));
vi.mock("@/apps/do/personal/profile-service", () => ({ getPersonalDoProfile: vi.fn(), savePersonalDoProfile: vi.fn(), deletePersonalDoProfile: vi.fn() }));
import { doOwner } from "@/apps/do/services/owner";
import { deletePersonalDoProfile, getPersonalDoProfile, savePersonalDoProfile } from "@/apps/do/personal/profile-service";
import { DEFAULT_PERSONAL_DO_PROFILE } from "@/apps/do/personal/profile";
import { DELETE, GET, POST } from "./route";

const owner = { id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", externalId: "do:user:a" };
const { updatedAt: _updatedAt, ...editable } = DEFAULT_PERSONAL_DO_PROFILE;
const payload = { ...editable, consent: true };
const request = (body: unknown, origin: string | null = "https://www.assembl.co.nz") => new Request("https://www.assembl.co.nz/api/do/personal/profile", {
  method: "POST", headers: { ...(origin ? { origin } : {}), "Content-Type": "application/json" }, body: JSON.stringify(body),
});
beforeEach(() => { vi.clearAllMocks(); vi.mocked(doOwner).mockResolvedValue(owner); });

describe("Personal DO profile HTTP boundaries", () => {
  it("requires a verified owner before reading or saving", async () => {
    vi.mocked(doOwner).mockResolvedValue(null);
    expect((await GET()).status).toBe(401);
    expect((await POST(request(payload))).status).toBe(401);
    expect(getPersonalDoProfile).not.toHaveBeenCalled();
    expect(savePersonalDoProfile).not.toHaveBeenCalled();
  });

  it("rejects missing and cross-origin mutation before accessing storage", async () => {
    for (const origin of [null, "https://other.example"]) {
      const response = await POST(request(payload, origin));
      expect(response.status).toBe(403);
      expect(response.headers.get("cache-control")).toBe("private, no-store");
    }
    expect(savePersonalDoProfile).not.toHaveBeenCalled();
    expect(doOwner).not.toHaveBeenCalled();
  });

  it("returns unsaved defaults only when storage confirms the row is absent", async () => {
    vi.mocked(getPersonalDoProfile).mockResolvedValue({ profile: DEFAULT_PERSONAL_DO_PROFILE, saved: false });
    const response = await GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ profile: DEFAULT_PERSONAL_DO_PROFILE, saved: false });
    expect(getPersonalDoProfile).toHaveBeenCalledWith(owner.id);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(response.headers.get("vary")).toBe("Cookie");
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
  });

  it("rejects unconsented, unknown, owner and server timestamp fields", async () => {
    for (const patch of [{ consent: false }, { consent: undefined }, { ownerId: "other" }, { updatedAt: "2026-09-30T00:00:00Z" }, { action: "send" }, { voiceName: "invented" }]) {
      expect((await POST(request({ ...payload, ...patch }))).status).toBe(400);
    }
    expect(savePersonalDoProfile).not.toHaveBeenCalled();
  });

  it("binds a saved profile to the verified owner and returns the stored timestamp", async () => {
    const profile = { ...DEFAULT_PERSONAL_DO_PROFILE, displayName: "Orbit", updatedAt: "2026-09-30T00:00:00.000Z" };
    vi.mocked(savePersonalDoProfile).mockResolvedValue(profile);
    const response = await POST(request({ ...payload, displayName: " Orbit " }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ profile, saved: true });
    expect(savePersonalDoProfile).toHaveBeenCalledWith(owner.id, { ...payload, displayName: "Orbit" });
  });

  it("rejects malformed, wrong-content-type and oversized requests", async () => {
    const base = "https://www.assembl.co.nz/api/do/personal/profile";
    for (const init of [
      { headers: { origin: "https://www.assembl.co.nz", "content-type": "application/json" }, body: "{" },
      { headers: { origin: "https://www.assembl.co.nz", "content-type": "text/plain" }, body: JSON.stringify(payload) },
      { headers: { origin: "https://www.assembl.co.nz", "content-type": "application/json" }, body: JSON.stringify({ ...payload, preferences: "x".repeat(16_001) }) },
    ]) expect((await POST(new Request(base, { method: "POST", ...init }))).status).toBe(400);
    expect(savePersonalDoProfile).not.toHaveBeenCalled();
  });

  it("reports storage failure honestly without leaking config or claiming saved defaults", async () => {
    vi.mocked(getPersonalDoProfile).mockRejectedValue(new Error("missing table; key=private"));
    vi.mocked(savePersonalDoProfile).mockRejectedValue(new Error("internal database detail"));
    for (const response of [await GET(), await POST(request(payload))]) {
      expect(response.status).toBe(503);
      const body = await response.json();
      expect(body).not.toHaveProperty("saved");
      expect(body).not.toHaveProperty("profile");
      expect(JSON.stringify(body)).not.toContain("private");
      expect(response.headers.get("cache-control")).toBe("private, no-store");
    }
  });

  it("requires same-origin and verified owner for forgetting preferences", async () => {
    expect((await DELETE(request({}, "https://other.example"))).status).toBe(403);
    vi.mocked(doOwner).mockResolvedValue(null);
    expect((await DELETE(request({}))).status).toBe(401);
    expect(deletePersonalDoProfile).not.toHaveBeenCalled();
  });

  it("forgets only the verified owner's preferences and reports failures", async () => {
    vi.mocked(deletePersonalDoProfile).mockResolvedValue({ profile: DEFAULT_PERSONAL_DO_PROFILE, saved: false });
    const response = await DELETE(request({ ownerId: "ignored-other-user" }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ profile: DEFAULT_PERSONAL_DO_PROFILE, saved: false });
    expect(deletePersonalDoProfile).toHaveBeenCalledWith(owner.id);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    vi.mocked(deletePersonalDoProfile).mockRejectedValue(new Error("storage missing"));
    const failure = await DELETE(request({}));
    expect(failure.status).toBe(503);
    expect(await failure.json()).not.toHaveProperty("saved");
  });
});
