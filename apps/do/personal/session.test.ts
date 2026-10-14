import { describe, expect, it } from "vitest";
import { replacePersonalLoad, shouldRevalidatePersonalOwner } from "./session";
describe("Personal DO auth transition guard", () => {
  it("invalidates real account changes while initial/replacement loads are pending", () => {
    expect(shouldRevalidatePersonalOwner("SIGNED_OUT", null, "guest")).toBe(true);
    expect(shouldRevalidatePersonalOwner("SIGNED_IN", null, "owner-b")).toBe(true);
    expect(shouldRevalidatePersonalOwner("USER_UPDATED", null, "owner-b")).toBe(true);
    expect(shouldRevalidatePersonalOwner("INITIAL_SESSION", null, "owner-a")).toBe(false);
    expect(shouldRevalidatePersonalOwner("SIGNED_IN", "owner-a", "owner-a")).toBe(false);
    expect(shouldRevalidatePersonalOwner("SIGNED_IN", "owner-a", "owner-b")).toBe(true);
  });
  it("ignores a delayed previous-owner GET after an auth transition", async () => {
    let finish!: (value: string) => void;
    const first = replacePersonalLoad(null);
    const delayedGet = new Promise<string>(resolve => { finish = resolve; });
    let visibleOwner: string | null = null;
    const pending = delayedGet.then(owner => { if (!first.signal.aborted) visibleOwner = owner; });
    expect(shouldRevalidatePersonalOwner("SIGNED_IN", null, "owner-b")).toBe(true);
    const second = replacePersonalLoad(first);
    finish("owner-a");
    await pending;
    expect(first.signal.aborted).toBe(true);
    expect(visibleOwner).toBeNull();
    expect(second.signal.aborted).toBe(false);
  });
});
