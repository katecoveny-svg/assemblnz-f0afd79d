import { describe, expect, it } from "vitest";
import { acceptDoShare, consumeDoShare, DO_SHARE_INTAKE_KEY, doShareText, readDoShareForWorkspace } from "./share-intake";
const item = { id: "00000000-0000-4000-8000-000000000001", title: "A notice", text: "Fictional school notice", url: "https://example.org/", receivedAt: 10000000 };
function store(value: string | null) {
  const map = new Map<string, string>();
  if (value) map.set(DO_SHARE_INTAKE_KEY, value);
  return { getItem: (key: string) => map.get(key) ?? null, setItem: (key: string, value: string) => { map.set(key, value); }, removeItem: (key: string) => { map.delete(key); } };
}
describe("private tab-scoped share handoff", () => {
  it("consumes one item once, without fetching its link", () => {
    const storage = store(JSON.stringify(item));
    expect(consumeDoShare(storage, item.receivedAt)).toEqual(item);
    expect(consumeDoShare(storage, item.receivedAt)).toBeNull();
    expect(doShareText(item)).toContain("not opened or checked");
  });
  it.each(["invalid", JSON.stringify({ ...item, receivedAt: 1 }), JSON.stringify({ ...item, receivedAt: 90000000 }), JSON.stringify({ ...item, url: "javascript:alert(1)" })])("discards malformed, expired, future and unsafe data", raw => {
    const storage = store(raw);
    expect(consumeDoShare(storage, item.receivedAt)).toBeNull();
    expect(storage.getItem(DO_SHARE_INTAKE_KEY)).toBeNull();
  });
  it("storage failures leave unrelated workspace usable", () => {
    expect(consumeDoShare({ getItem: () => { throw new Error("blocked"); }, removeItem: () => {} })).toBeNull();
  });
  it("keeps pending external shares through guest sign-in until explicitly accepted", () => {
    const storage = store(JSON.stringify(item));
    expect(readDoShareForWorkspace(storage, "guest", item.receivedAt)?.text).toBe(item.text);
    const owner = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
    expect(readDoShareForWorkspace(storage, owner, item.receivedAt)?.workspace).toBe(owner);
    expect(storage.getItem(DO_SHARE_INTAKE_KEY)).not.toBeNull();
    acceptDoShare(storage, "different-item");
    expect(storage.getItem(DO_SHARE_INTAKE_KEY)).not.toBeNull();
    acceptDoShare(storage, item.id);
    expect(storage.getItem(DO_SHARE_INTAKE_KEY)).toBeNull();
  });
  it.each(["guest", "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"])("does not transfer a prior owner's pending share to %s", scope => {
    const storage = store(JSON.stringify({ ...item, workspace: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" }));
    expect(readDoShareForWorkspace(storage, scope, item.receivedAt)).toBeNull();
    expect(storage.getItem(DO_SHARE_INTAKE_KEY)).toBeNull();
  });
});
