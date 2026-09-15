import { describe, it, expect } from "vitest";
import {
  readMemory,
  memoryContext,
  deleteMemoryNote,
  type MemoryStore,
} from "./memory";
const fixture: MemoryStore = {
  version: 1,
  profiles: [
    {
      id: "personal",
      name: "Sample personal",
      kind: "personal",
      enabled: true,
      notes: [{ id: "one", text: "Prefer short lists." }],
    },
    {
      id: "client",
      name: "Sample client",
      kind: "client",
      enabled: true,
      notes: [{ id: "two", text: "Use the approved project glossary." }],
    },
  ],
};
describe("explicit device-local memory", () => {
  it("persists approved notes without mixing profiles", () => {
    const restored = readMemory(JSON.stringify(fixture));
    expect(memoryContext(restored, "personal")).toContain("short lists");
    expect(memoryContext(restored, "personal")).not.toContain("glossary");
    expect(memoryContext(restored, "unknown")).toBe("");
  });
  it("deletion survives reload and removes future context", () => {
    const next = deleteMemoryNote(fixture, "personal", "one");
    const restored = readMemory(JSON.stringify(next));
    expect(memoryContext(restored, "personal")).toBe("");
    expect(memoryContext(restored, "client")).toContain("glossary");
    expect(fixture.profiles[0].notes).toHaveLength(1);
  });
  it("disabling a profile excludes it without deleting its saved notes", () => {
    const restored = readMemory(
      JSON.stringify({
        ...fixture,
        profiles: fixture.profiles.map((p) => ({ ...p, enabled: false })),
      }),
    );
    expect(memoryContext(restored, "personal")).toBe("");
    expect(restored.profiles[0].notes).toHaveLength(1);
  });
  it("rejects malformed storage and unknown kinds, without enabling memory by coercion", () => {
    expect(readMemory("{broken").profiles).toEqual([]);
    expect(
      readMemory(JSON.stringify({ version: 2, profiles: fixture.profiles }))
        .profiles,
    ).toEqual([]);
    expect(
      readMemory(
        JSON.stringify({
          version: 1,
          profiles: [{ ...fixture.profiles[0], kind: "unknown" }],
        }),
      ).profiles,
    ).toEqual([]);
    expect(
      memoryContext(
        readMemory(
          JSON.stringify({
            version: 1,
            profiles: [{ ...fixture.profiles[0], enabled: "true" }],
          }),
        ),
        "personal",
      ),
    ).toBe("");
  });
});
