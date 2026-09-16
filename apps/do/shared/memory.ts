/** Device-local, explicitly saved notes. Profile boundaries are not authentication. */
export const MEMORY_KINDS = [
  "personal",
  "business",
  "child",
  "client",
] as const;
export type MemoryKind = (typeof MEMORY_KINDS)[number];
export type MemoryNote = { id: string; text: string };
export type MemoryProfile = {
  id: string;
  name: string;
  kind: MemoryKind;
  enabled: boolean;
  notes: MemoryNote[];
};
export type MemoryStore = { version: 1; profiles: MemoryProfile[] };
export const DO_MEMORY_KEY = "assembl-do-approved-memory-v1";
export function readMemory(raw: string | null): MemoryStore {
  const empty: MemoryStore = { version: 1, profiles: [] };
  try {
    const data = JSON.parse(raw || "null");
    if (data?.version !== 1 || !Array.isArray(data.profiles)) return empty;
    const ids = new Set<string>();
    const profiles: MemoryProfile[] = [];
    for (const p of data.profiles.slice(0, 20)) {
      if (
        !p ||
        typeof p.id !== "string" ||
        p.id.length > 100 ||
        ids.has(p.id) ||
        typeof p.name !== "string" ||
        !MEMORY_KINDS.includes(p.kind) ||
        !Array.isArray(p.notes)
      )
        continue;
      ids.add(p.id);
      const noteIds = new Set<string>();
      const notes: MemoryNote[] = [];
      for (const n of p.notes.slice(0, 30)) {
        if (
          !n ||
          typeof n.id !== "string" ||
          n.id.length > 100 ||
          noteIds.has(n.id) ||
          typeof n.text !== "string" ||
          !n.text.trim()
        )
          continue;
        noteIds.add(n.id);
        notes.push({ id: n.id, text: n.text.trim().slice(0, 1000) });
      }
      profiles.push({
        id: p.id,
        name: p.name.trim().slice(0, 60) || "DO profile",
        kind: p.kind,
        enabled: p.enabled === true,
        notes,
      });
    }
    return { version: 1, profiles };
  } catch {
    return empty;
  }
}
export function memoryContext(store: MemoryStore, profileId: string): string {
  const p = store.profiles.find((p) => p.id === profileId);
  if (!p?.enabled || !p.notes.length) return "";
  return `Saved context I chose to share for this message (${p.kind} DO):\n${p.notes.map((n) => `- ${n.text}`).join("\n")}`;
}
export function deleteMemoryNote(
  store: MemoryStore,
  profileId: string,
  noteId: string,
): MemoryStore {
  return {
    ...store,
    profiles: store.profiles.map((p) =>
      p.id === profileId
        ? { ...p, notes: p.notes.filter((n) => n.id !== noteId) }
        : p,
    ),
  };
}
