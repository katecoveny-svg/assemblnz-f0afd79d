export type ReviewedBrowserDraft = { owner: string; text: string; id: string };
/** One pending draft per verified workspace. Synchronous admission prevents two
 * UI events replacing a review before React has rendered the first one. No tools,
 * microphone, provider sharing or external authority are acquired here. */
export function reviewBrowserHandoff(
  owner: string | null, verifiedOwner: string | null,
  current: ReviewedBrowserDraft | null, text: string,
): ReviewedBrowserDraft | null {
  if (!owner || owner === 'guest' || owner !== verifiedOwner || current ||
      !text.trim() || text.length > 6000) return null;
  return { owner, text: text.trim(), id: crypto.randomUUID() };
}
