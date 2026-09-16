import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
type Row = { id: string; anon_id: string; agent_slug: string };
const db = vi.hoisted(() => ({ rows: new Map<string, Row>(), fail: false }));
vi.mock("@/lib/supabase/service", () => ({
  getServiceClient: () => ({
    from: () => ({
      insert: async (row: Row) => {
        if (db.fail) return { error: { code: "db_unavailable" } };
        const key = `${row.anon_id}:${row.agent_slug}`;
        if (db.rows.has(key)) return { error: { code: "23505" } };
        db.rows.set(key, row);
        return { error: null };
      },
      select: () => ({
        eq: (_key: string, anonId: string) => ({
          in: async (_key: string, slots: string[]) => ({
            count: [...db.rows.values()].filter(
              (r) => r.anon_id === anonId && slots.includes(r.agent_slug),
            ).length,
            error: db.fail ? { code: "offline" } : null,
          }),
        }),
      }),
      delete: () => ({
        eq: (_key: string, id: string) => ({
          eq: async (_key: string, anonId: string) => {
            if (db.fail) return { error: { code: "offline" } };
            for (const [key, row] of db.rows)
              if (row.id === id && row.anon_id === anonId) db.rows.delete(key);
            return { error: null };
          },
        }),
      }),
    }),
  }),
}));
import { readDoVoiceAllowance, reserveDoVoice } from "./voice-allowance";
beforeEach(() => {
  db.rows.clear();
  db.fail = false;
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-hmac-secret");
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-09-16T11:59:59Z"));
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});
describe("Persistent DO voice quota", () => {
  it("arbitrates concurrent reservations through unique slots and isolates users", async () => {
    const results = await Promise.allSettled(
      Array.from({ length: 8 }, () => reserveDoVoice("alice")),
    );
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(3);
    expect(await readDoVoiceAllowance("alice")).toBe(0);
    expect(await readDoVoiceAllowance("bob")).toBe(3);
    expect(JSON.stringify([...db.rows.values()])).not.toContain("alice");
  });
  it("releases only its own reservation and resets at New Zealand midnight", async () => {
    const alice = await reserveDoVoice("alice");
    await reserveDoVoice("bob");
    await alice.release();
    expect(await readDoVoiceAllowance("alice")).toBe(3);
    expect(await readDoVoiceAllowance("bob")).toBe(2);
    await reserveDoVoice("alice");
    expect(await readDoVoiceAllowance("alice")).toBe(2);
    vi.setSystemTime(new Date("2026-09-16T12:00:00Z"));
    expect(await readDoVoiceAllowance("alice")).toBe(3);
  });
  it("refuses reservations when the persistent store or identity secret is missing", async () => {
    db.fail = true;
    await expect(reserveDoVoice("alice")).rejects.toMatchObject({
      code: "unavailable",
    });
    await expect(readDoVoiceAllowance("alice")).rejects.toMatchObject({
      code: "unavailable",
    });
    db.fail = false;
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
    await expect(reserveDoVoice("alice")).rejects.toMatchObject({
      code: "unavailable",
    });
    expect(db.rows.size).toBe(0);
  });
});
