/** Owned by the mounted page only. No URL, storage, provider or execution consent. */
export type ShoppingVoiceDraft = { owner: string; text: string };
export function reviewShoppingHandoff(owner: string | null, verifiedOwner: string | null, current: ShoppingVoiceDraft | null, text: string): ShoppingVoiceDraft | null {
  if (!owner || owner !== verifiedOwner || current || !text.trim() || text.length > 6000) return null;
  return { owner, text: text.trim() };
}
