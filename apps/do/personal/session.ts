/** Client auth events invalidate data only; the server remains the owner authority. */
export function shouldRevalidatePersonalOwner(event: string, verifiedScope: string | null, hintedScope: string) {
  if (verifiedScope !== null) return verifiedScope !== hintedScope;
  return event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED";
}

export function replacePersonalLoad(previous: AbortController | null) {
  previous?.abort();
  return new AbortController();
}
