import { describe, expect, it } from "vitest";
import { personalRunRequestSchema, personalScheduleSchema, type Responsibility } from "./contract";
import { localToIso, scheduleRequest, triggerLabel, wakeupSummary } from "./wakeups";

const now = Date.parse("2026-10-13T08:00:00Z");
const item: Responsibility = { id: "11111111-1111-4111-8111-111111111111", title: "Prepare my day", goal: "A brief", notes: "Notes", timezone: "Pacific/Auckland", local_hour: 7, active: true, consent_until: "2026-10-20T08:00:00Z", next_run_at: "2026-10-13T18:00:00Z", revision: 1, updated_at: "2026-10-13T00:00:00Z", cadence: "weekdays", weekday: null, run_once_at: null };

describe("wakeupSummary", () => {
  it("describes recurring, weekly, once, manual, paused and expired wake-ups honestly", () => {
    expect(wakeupSummary(item, now)).toMatchObject({ on: true, label: "Every weekday at 07:00 (Pacific/Auckland)" });
    expect(wakeupSummary(item, now).detail).toMatch(/^Next Wed,? 14 Oct,? 7:00 am\. Permission until/);
    expect(wakeupSummary({ ...item, cadence: "weekly", weekday: 5 }, now).label).toBe("Every Friday at 07:00 (Pacific/Auckland)");
    expect(wakeupSummary({ ...item, cadence: "once", next_run_at: "2026-10-15T03:00:00Z" }, now).label).toMatch(/^Once, Thu,? 15 Oct,? 4:00 pm$/);
    expect(wakeupSummary({ ...item, cadence: "once", next_run_at: "infinity" }, now).label).toBe("Woke up once, as planned");
    expect(wakeupSummary({ ...item, cadence: "manual", next_run_at: "infinity" }, now)).toMatchObject({ on: true, label: "Only when you ask" });
    expect(wakeupSummary({ ...item, active: false }, now)).toMatchObject({ on: false, label: "Wake-ups off" });
    expect(wakeupSummary({ ...item, consent_until: "2026-10-13T07:59:00Z" }, now)).toMatchObject({ on: false, label: "Wake-up permission expired" });
  });
  it("treats a legacy row without cadence as daily", () => {
    const { cadence: _c, weekday: _w, run_once_at: _r, ...legacy } = item;
    expect(wakeupSummary(legacy, now).label).toBe("Every day at 07:00 (Pacific/Auckland)");
  });
});

describe("schedule contract", () => {
  const base = { action: "schedule" as const, id: item.id, localHour: 7, timezone: "Pacific/Auckland", consent: true as const, expectedRevision: 1 };
  it("ties weekday to weekly and a moment to once", () => {
    expect(personalScheduleSchema.safeParse({ ...base, cadence: "daily" }).success).toBe(true);
    expect(personalScheduleSchema.safeParse({ ...base, cadence: "weekly" }).success).toBe(false);
    expect(personalScheduleSchema.safeParse({ ...base, cadence: "weekly", weekday: 3 }).success).toBe(true);
    expect(personalScheduleSchema.safeParse({ ...base, cadence: "daily", weekday: 3 }).success).toBe(false);
    expect(personalScheduleSchema.safeParse({ ...base, cadence: "once" }).success).toBe(false);
    expect(personalScheduleSchema.safeParse({ ...base, cadence: "once", runOnceAt: "2026-10-15T03:00:00Z" }).success).toBe(true);
    expect(personalScheduleSchema.safeParse({ ...base, cadence: "daily", consent: false }).success).toBe(false);
    expect(personalScheduleSchema.safeParse({ ...base, cadence: "daily", expectedRevision: 0 }).success).toBe(false);
  });
  it("builds a request from the form and converts the owner's local moment", () => {
    expect(scheduleRequest(item.id, 2, { cadence: "weekly", weekday: 5, localHour: 8, timezone: "Pacific/Auckland", runOnceAt: "" })).toEqual({ action: "schedule", id: item.id, cadence: "weekly", weekday: 5, localHour: 8, timezone: "Pacific/Auckland", consent: true, expectedRevision: 2 });
    expect(scheduleRequest(item.id, 2, { cadence: "once", weekday: 0, localHour: 8, timezone: "Pacific/Auckland", runOnceAt: "2026-10-15T16:00" })).toMatchObject({ cadence: "once", runOnceAt: "2026-10-15T03:00:00.000Z" });
    expect(personalScheduleSchema.safeParse(scheduleRequest(item.id, 2, { cadence: "once", weekday: 0, localHour: 8, timezone: "Pacific/Auckland", runOnceAt: "2026-10-15T16:00" })).success).toBe(true);
  });
  it("converts local moments on both sides of NZ daylight saving", () => {
    expect(localToIso("2026-09-26T07:00", "Pacific/Auckland")).toBe("2026-09-25T19:00:00.000Z");
    expect(localToIso("2026-09-27T07:00", "Pacific/Auckland")).toBe("2026-09-26T18:00:00.000Z");
    expect(localToIso("nonsense", "Pacific/Auckland")).toBe("");
  });
  it("accepts a bounded note with a run request", () => {
    expect(personalRunRequestSchema.safeParse({ id: item.id }).success).toBe(true);
    expect(personalRunRequestSchema.safeParse({ id: item.id, note: " Focus on the quote " }).data?.note).toBe("Focus on the quote");
    expect(personalRunRequestSchema.safeParse({ id: item.id, note: "x".repeat(501) }).success).toBe(false);
  });
  it("labels why DO woke up", () => {
    expect(triggerLabel({ trigger: "message", note: "Quote" })).toBe("Woke up for your note");
    expect(triggerLabel({})).toBeNull();
  });
});
