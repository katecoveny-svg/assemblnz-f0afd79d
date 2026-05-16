import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");

describe("ambient kete live-data contract", () => {
  const contract = read("supabase/functions/_shared/ambient-agent-contract.ts");
  const liveData = read("supabase/functions/_shared/live-data-context.ts");
  const briefing = read("supabase/functions/morning-briefing/index.ts");
  const migration = read("supabase/migrations/20260515173000_ambient_kete_live_data_contract.sql");

  it("registers all 9 canon kete for ambient work", () => {
    for (const kete of ["waihanga", "manaaki", "pikau", "arataki", "auaha", "ako", "matauranga", "hoko", "toro"]) {
      expect(contract).toContain(`${kete}:`);
      expect(liveData).toContain(`${kete}:`);
      expect(migration).toContain(kete);
    }
  });

  it("exposes tenant-local live data scopes to briefing agents", () => {
    for (const scope of ["connections", "memory", "calendar", "accounting", "email", "knowledge_base", "weather"]) {
      expect(liveData).toContain(`"${scope}"`);
    }
    expect(liveData).toContain("buildLiveDataSnapshot");
  });

  it("keeps generated briefing work held for operator approval", () => {
    expect(briefing).toContain('source: "ambient"');
    expect(briefing).toContain('status: "pending_approval"');
    expect(briefing).toContain("No auto-send");
    expect(migration).toContain("source in ('chatwoot', 'agentmail', 'ambient')");
  });

  it("schedules a timezone-gated morning briefing run", () => {
    expect(briefing).toContain("local.hour !== 6");
    expect(migration).toContain("morning-briefing-hourly-gate");
    expect(migration).toContain("unique (tenant_id, briefing_date)");
  });
});
