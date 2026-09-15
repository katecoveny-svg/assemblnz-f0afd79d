import { z } from "zod";
/** Draft configuration only; importing this module never schedules work. */
export const doWatchPlanSchema = z
  .object({
    id: z.string().min(1).max(100),
    name: z.string().trim().min(1).max(80),
    query: z.string().trim().min(3).max(1000),
    source: z.enum(["public_web_search", "connected_source"]),
    sourceConnectionId: z.string().max(100).optional(),
    everyHours: z.number().int().min(1).max(168),
    notification: z.enum(["meaningful_changes", "silent"]),
    delivery: z.enum(["in_app", "email"]),
    state: z.enum(["draft", "paused"]),
  })
  .strict()
  .superRefine((plan, ctx) => {
    if (plan.source === "connected_source" && !plan.sourceConnectionId)
      ctx.addIssue({
        code: "custom",
        path: ["sourceConnectionId"],
        message: "Choose an authorised source connection.",
      });
  });
export type DoWatchPlan = z.infer<typeof doWatchPlanSchema>;
export type WatchFinding = {
  id: string;
  url: string;
  title: string;
  summary: string;
};
/** Compare stable, source-provided IDs. Ordering and retrieval time are not changes. */
export function changedWatchFindings(
  previous: WatchFinding[],
  current: WatchFinding[],
): WatchFinding[] {
  const before = new Map(
    previous.map((f) => [f.id, JSON.stringify([f.url, f.title, f.summary])]),
  );
  const seen = new Set<string>();
  return current.filter((f) => {
    if (seen.has(f.id)) return false;
    seen.add(f.id);
    return before.get(f.id) !== JSON.stringify([f.url, f.title, f.summary]);
  });
}
export function watchActivationBlockers() {
  return [
    "Authenticated owner and tenant permission checks",
    "Persistent watch and run records with retention controls",
    "Authorised source adapter and access limits",
    "Server scheduler, idempotent claim and retry handling",
    "Configured notification delivery, consent and cancellation",
  ] as const;
}
