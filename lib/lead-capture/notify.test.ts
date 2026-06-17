import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { notifyLead } from "./notify";

const URL = "https://proj.supabase.co";
const KEY = "pub-key-123";

describe("notifyLead", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = URL;
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = KEY;
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("posts to the send-contact-email edge function with all fields in the body", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({ success: true }) });
    vi.stubGlobal("fetch", fetchMock);

    const ok = await notifyLead({
      formName: "Trust Centre — security pack request",
      name: "Dana Procurement",
      email: "dana@council.govt.nz",
      fields: { org: "Big Council", role: "Procurement", ndaSigned: true },
      sourceUrl: "https://assembl.co.nz/trust",
      ip: "203.0.113.7",
    });

    expect(ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${URL}/functions/v1/send-contact-email`);
    expect(init.headers.authorization).toBe(`Bearer ${KEY}`);
    expect(init.headers.apikey).toBe(KEY);

    const body = JSON.parse(init.body);
    // Subject line in the edge fn becomes "New Assembl Contact: <name>".
    expect(body.name).toBe("Trust Centre — security pack request");
    // Reply-to is the lead when we have their email.
    expect(body.email).toBe("dana@council.govt.nz");
    // Every field is rendered into the message body.
    expect(body.message).toContain("Form: Trust Centre — security pack request");
    expect(body.message).toContain("org: Big Council");
    expect(body.message).toContain("role: Procurement");
    expect(body.message).toContain("ndaSigned: true");
    expect(body.message).toContain("Source page: https://assembl.co.nz/trust");
    expect(body.message).toContain("IP: 203.0.113.7");
  });

  it("falls back to the assembl inbox as reply-to when the form has no email", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({ success: true }) });
    vi.stubGlobal("fetch", fetchMock);

    await notifyLead({ formName: "Electrify — PDF request" });
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.email).toBe("assembl@assembl.co.nz");
  });

  it("is fail-soft: returns false (never throws) when the edge function errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => ({ error: "boom" }) }),
    );
    await expect(notifyLead({ formName: "Contact form", email: "a@b.co" })).resolves.toBe(false);
  });

  it("is fail-soft: returns false when fetch throws", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));
    await expect(notifyLead({ formName: "Contact form" })).resolves.toBe(false);
  });

  it("returns false when Supabase env is missing", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    await expect(notifyLead({ formName: "Contact form" })).resolves.toBe(false);
  });
});
