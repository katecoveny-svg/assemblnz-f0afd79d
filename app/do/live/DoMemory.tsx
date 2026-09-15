"use client";
import { useState } from "react";
import {
  DO_MEMORY_KEY,
  MEMORY_KINDS,
  readMemory,
  memoryContext,
  deleteMemoryNote,
  type MemoryStore,
  type MemoryKind,
} from "@/apps/do/shared/memory";
export default function DoMemory({
  onUse,
}: {
  onUse: (text: string) => boolean;
}) {
  const [store, setStore] = useState<MemoryStore>({ version: 1, profiles: [] });
  const [selected, setSelected] = useState("");
  const [ready, setReady] = useState(false);
  const [name, setName] = useState("");
  const [kind, setKind] = useState<MemoryKind>("personal");
  const [text, setText] = useState("");
  const [editing, setEditing] = useState("");
  const [notice, setNotice] = useState("");
  function load() {
    try {
      setStore(readMemory(localStorage.getItem(DO_MEMORY_KEY)));
      setReady(true);
    } catch {
      setNotice("Device storage is unavailable. Memory cannot be saved here.");
    }
  }
  function save(next: MemoryStore) {
    try {
      localStorage.setItem(DO_MEMORY_KEY, JSON.stringify(next));
      setStore(next);
      setNotice("Saved on this device.");
      return true;
    } catch {
      setNotice("Could not save. Your previous memory has been kept.");
      return false;
    }
  }
  const profile = store.profiles.find((p) => p.id === selected);
  return (
    <details
      className="do-memory"
      onToggle={(e) => {
        if (e.currentTarget.open) load();
      }}
    >
      <summary>Memory you control · this device</summary>
      <p>
        Save only context you want to keep. Each profile has separate notes.
        These profiles do not protect against another person using this browser;
        they are not authenticated accounts.
      </p>
      <label>
        Choose a profile
        <select
          value={selected}
          onChange={(e) => {
            setSelected(e.target.value);
            setText("");
            setEditing("");
          }}
        >
          <option value="">Choose a profile</option>
          {store.profiles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} · {p.kind}
            </option>
          ))}
        </select>
      </label>
      <div className="do-memory-create">
        <label>
          New profile name
          <input
            value={name}
            maxLength={60}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label>
          Context type
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as MemoryKind)}
          >
            {MEMORY_KINDS.map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
        </label>
        <button
          disabled={!ready || !name.trim() || store.profiles.length >= 20}
          onClick={() => {
            const id = crypto.randomUUID();
            if (
              save({
                ...store,
                profiles: [
                  ...store.profiles,
                  { id, name: name.trim(), kind, enabled: false, notes: [] },
                ],
              })
            ) {
              setSelected(id);
              setName("");
              setText("");
              setEditing("");
            }
          }}
        >
          Create profile
        </button>
      </div>
      {profile && (
        <section aria-label="Selected profile memory">
          <label>
            <input
              type="checkbox"
              checked={profile.enabled}
              onChange={(e) =>
                save({
                  ...store,
                  profiles: store.profiles.map((p) =>
                    p.id === selected ? { ...p, enabled: e.target.checked } : p,
                  ),
                })
              }
            />
            Allow me to add this profile’s notes to a message
          </label>
          <p>
            Nothing is collected automatically. For child profiles, use learning
            preferences rather than identifying or sensitive details.
          </p>
          {profile.notes.map((n) => (
            <article key={n.id}>
              <p>{n.text}</p>
              <button
                onClick={() => {
                  setEditing(n.id);
                  setText(n.text);
                }}
              >
                Edit note
              </button>
              <button
                onClick={() => {
                  if (
                    save(deleteMemoryNote(store, selected, n.id)) &&
                    editing === n.id
                  ) {
                    setEditing("");
                    setText("");
                  }
                }}
              >
                Delete note
              </button>
            </article>
          ))}
          <label>
            {editing ? "Edit saved note" : "Note to remember"}
            <textarea
              value={text}
              maxLength={1000}
              onChange={(e) => setText(e.target.value)}
              rows={3}
            />
          </label>
          <button
            disabled={!text.trim() || (!editing && profile.notes.length >= 30)}
            onClick={() => {
              const notes = editing
                ? profile.notes.map((n) =>
                    n.id === editing ? { ...n, text: text.trim() } : n,
                  )
                : [
                    ...profile.notes,
                    { id: crypto.randomUUID(), text: text.trim() },
                  ];
              if (
                save({
                  ...store,
                  profiles: store.profiles.map((p) =>
                    p.id === selected ? { ...p, notes } : p,
                  ),
                })
              ) {
                setText("");
                setEditing("");
              }
            }}
          >
            {editing ? "Save edited note" : "Save this note"}
          </button>
          <button
            disabled={!memoryContext(store, selected)}
            onClick={() => {
              if (onUse(memoryContext(store, selected)))
                setNotice(
                  "Added to the message draft for your review. It has not been sent.",
                );
              else
                setNotice(
                  "Open a conversation first and leave enough room in the message. No notes were added.",
                );
            }}
          >
            Add notes to next message
          </button>
          <button
            onClick={() => {
              if (
                save({
                  ...store,
                  profiles: store.profiles.filter((p) => p.id !== selected),
                })
              ) {
                setSelected("");
                setText("");
                setEditing("");
              }
            }}
          >
            Delete profile and notes
          </button>
          <p>
            Disabling or deleting prevents future use here. It does not remove
            text already copied into a message or sent to a provider. Remove it
            from the draft, or close the conversation to clear the current
            session.
          </p>
        </section>
      )}
      {notice && <p role="status">{notice}</p>}
    </details>
  );
}
