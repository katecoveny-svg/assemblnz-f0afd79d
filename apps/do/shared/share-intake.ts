import { z } from "zod";

export const DO_SHARE_INTAKE_KEY = "assembl:do:share-intake:v1";
export const DO_SHARE_INTAKE_SECONDS = 30 * 60;
export const doShareIntakeSchema = z.object({
  id: z.string().uuid(),
  title: z.string().max(160),
  text: z.string().max(10000),
  url: z.string().max(2000).refine(value => {
    if (!value) return true;
    try { const url = new URL(value); return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password; }
    catch { return false; }
  }).transform(value => {
    if (!value) return "";
    const url = new URL(value);
    url.search = "";
    url.hash = "";
    return url.toString();
  }),
  receivedAt: z.number().int().nonnegative(),
  workspace: z.union([z.string().uuid(), z.literal("guest")]).optional(),
}).strict()
  .refine(value => Boolean(value.text.trim() || value.url), "Share some text or a web link.")
  .refine(value => value.text.trim().length + (value.url ? value.url.length + 40 : 0) <= 12000, "Keep the combined text and link under 12,000 characters.");
export type DoShareIntake = z.infer<typeof doShareIntakeSchema>;

/** Consume only after signed-in intake is ready. Never fetch a shared URL. */
export function consumeDoShare(storage: Pick<Storage, "getItem" | "removeItem">, now = Date.now()): DoShareIntake | null {
  try {
    const raw = storage.getItem(DO_SHARE_INTAKE_KEY);
    if (!raw) return null;
    storage.removeItem(DO_SHARE_INTAKE_KEY);
    if (raw.length > 20_000) return null;
    const parsed = doShareIntakeSchema.safeParse(JSON.parse(raw));
    if (!parsed.success || now - parsed.data.receivedAt > DO_SHARE_INTAKE_SECONDS * 1000 || parsed.data.receivedAt > now + 60_000) return null;
    return parsed.data;
  } catch { return null; }
}

export function doShareText(item: DoShareIntake) {
  return [item.text.trim(), item.url ? `Shared link (not opened or checked): ${item.url}` : ""].filter(Boolean).join("\n\n");
}

/** Retain a pending share through sign-in, but never transfer an account-bound share. */
export function readDoShareForWorkspace(storage: Pick<Storage, "getItem" | "setItem" | "removeItem">, workspace: string, now = Date.now()): DoShareIntake | null {
  try {
    const raw = storage.getItem(DO_SHARE_INTAKE_KEY);
    if (!raw) return null;
    const parsed = raw.length <= 20_000 ? doShareIntakeSchema.safeParse(JSON.parse(raw)) : null;
    if (!parsed?.success || now - parsed.data.receivedAt > DO_SHARE_INTAKE_SECONDS * 1000 || parsed.data.receivedAt > now + 60_000) { storage.removeItem(DO_SHARE_INTAKE_KEY); return null; }
    const item = parsed.data;
    if (item.workspace && item.workspace !== "guest" && item.workspace !== workspace) { storage.removeItem(DO_SHARE_INTAKE_KEY); return null; }
    const bound = doShareIntakeSchema.parse({ ...item, workspace });
    storage.setItem(DO_SHARE_INTAKE_KEY, JSON.stringify(bound));
    return bound;
  } catch { return null; }
}

export function acceptDoShare(storage: Pick<Storage, "getItem" | "removeItem">, id: string) {
  try {
    const raw = storage.getItem(DO_SHARE_INTAKE_KEY);
    if (raw && JSON.parse(raw).id === id) storage.removeItem(DO_SHARE_INTAKE_KEY);
  } catch { /* No stored handoff to accept. */ }
}
