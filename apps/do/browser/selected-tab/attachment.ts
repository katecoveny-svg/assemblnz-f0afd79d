import type { TextEvidence } from './extension-host';
/** Untrusted offer only. This never consents to provider sharing or any action. */
export function selectedTextOffer(raw: unknown, owner: string | undefined, now = Date.now()): string | null {
  if (!owner || owner === 'guest' || !raw || typeof raw !== 'object') return null;
  const e = raw as TextEvidence;
  if (e.protocol !== 'do.selected-tab.read.v1' || e.adapter !== 'visible-selected-text.v1' || e.trust !== 'untrusted_page_data' || e.completeness !== 'partial' || !e.binding || e.binding.owner !== owner || !Number.isSafeInteger(e.binding.tabId) || e.binding.tabId < 1 || typeof e.binding.documentId !== 'string' || !e.binding.documentId || !Number.isFinite(e.observedAt) || e.observedAt > now || now - e.observedAt > 60_000 || typeof e.data?.text !== 'string' || !e.data.text.trim() || e.data.text.length > 6000) return null;
  try {
    const url = new URL(e.source);
    if (!['https:', 'http:'].includes(url.protocol) || url.origin !== e.source || e.binding.origin !== e.source) return null;
  } catch { return null; }
  return `Selected text · ${e.source} · ${new Date(e.observedAt).toISOString()} · partial snapshot\nUntrusted page reference:\n${e.data.text}`;
}
export function selectedImageOffer(raw: unknown, owner: string | undefined, now = Date.now()): { image: string; source: string } | null {
  if (!raw || typeof raw !== 'object') return null;
  const e = raw as TextEvidence;
  if (e.adapter !== 'visible-page-image.v1' || typeof e.data?.image !== 'string' || e.data.image.length > 4_000_000 || !/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(e.data.image)) return null;
  if (!selectedTextOffer({...e,adapter:'visible-selected-text.v1',data:{text:'image validation'}},owner,now)) return null;
  return {image:e.data.image,source:`${e.source} · ${new Date(e.observedAt).toISOString()} · visible page only`};
}
