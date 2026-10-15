/** Inactive read-only foundation. Only trusted companion code may hold this object.
 * Page messages/model output must never call activateFromToolbar or supply Host. */
export type Binding = Readonly<{ owner: string; tabId: number; documentId: string; origin: string }>;
export type Selection = Binding & { url: string };
export type Status = Readonly<{
  state: 'unavailable' | 'ready' | 'reading' | 'cancelled' | 'expired';
  message: string; source?: string; expiresAt?: number;
}>;
export type Adapter<T> = Readonly<{
  id: string;
  /** Exact reviewed origins/routes only; no catch-all adapter. */
  supports(url: URL): boolean;
  /** Fixed implementation, never a script/selector supplied by a page or model. */
  read(binding: Binding, signal: AbortSignal): Promise<unknown>;
  /** Strict schema + allowlisted projection; reject extra fields and secrets. */
  decode(raw: unknown): { data: T; completeness: 'complete' | 'partial' };
}>;
export interface Host {
  /** Atomic, trusted owner + selected top-frame identity; never enumerate tabs. */
  selected(): Promise<Selection | null>;
  /** Must render in companion-owned UI. Failure prevents reads. */
  show(status: Status): void;
}
export type Evidence<T> = {
  protocol: 'do.selected-tab.read.v1'; adapter: string; binding: Binding;
  source: string; observedAt: number; completeness: 'complete' | 'partial';
  trust: 'untrusted_page_data'; data: T;
};
const LIFETIME = 60_000;
const same = (a: Binding, b: Binding) => a.owner === b.owner && a.tabId === b.tabId &&
  a.documentId === b.documentId && a.origin === b.origin;
function valid(s: Selection | null): s is Selection {
  if (!s || !s.owner || s.owner === 'guest' || !Number.isSafeInteger(s.tabId) || s.tabId < 1 || !s.documentId) return false;
  try {
    const u = new URL(s.url);
    return ['http:', 'https:'].includes(u.protocol) && !u.username && !u.password && u.origin === s.origin;
  } catch { return false; }
}
type Grant<T> = { binding: Binding; url: string; adapter: Adapter<T>; expiresAt: number; abort: AbortController; busy: boolean };
export class SelectedTabReader<T> {
  private host: Host;
  private adapters: readonly Adapter<T>[];
  private now: () => number;
  private grant: Grant<T> | null = null;
  private generation = 0;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private view: Status = { state: 'unavailable', message: 'Activate DO from the selected tab toolbar.' };
  constructor(host: Host, adapters: readonly Adapter<T>[], now = Date.now) {
    this.host = host; this.adapters = [...adapters]; this.now = now;
  }
  private publish(status: Status) {
    this.view = Object.freeze({ ...status });
    try { this.host.show(this.view); }
    catch { this.clear(); this.view = { state: 'unavailable', message: 'Visible companion status unavailable.' }; throw new Error('Visible companion status unavailable.'); }
  }
  private clear() {
    this.generation++; this.grant?.abort.abort(); this.grant = null;
    clearTimeout(this.timer); this.timer = undefined;
  }
  cancel() { this.clear(); this.publish({ state: 'cancelled', message: 'Selected-tab access cancelled.' }); }
  /** Call immediately on selection, navigation, owner change, tab close or UI close. */
  invalidate() { this.cancel(); }
  status(): Status {
    if (this.grant && this.now() >= this.grant.expiresAt) this.expire();
    return { ...this.view };
  }
  private expire() { this.clear(); this.publish({ state: 'expired', message: 'Selected-tab access expired. Activate again.' }); }
  /** Wire ONLY to browser-owned toolbar event, never a boolean in page RPC. */
  async activateFromToolbar(): Promise<Status> {
    this.clear();
    this.publish({ state: 'unavailable', message: 'Checking selected-tab support.' });
    const generation = this.generation;
    try {
      const selected = await this.host.selected();
      if (generation !== this.generation) return this.status();
      if (!valid(selected)) throw new Error('Unavailable');
      const matches = this.adapters.filter(a => a.supports(new URL(selected.url)));
      if (matches.length !== 1) throw new Error('Unavailable');
      const { owner, tabId, documentId, origin } = selected;
      const binding = Object.freeze({ owner, tabId, documentId, origin });
      const final = await this.host.selected();
      if (generation !== this.generation) return this.status();
      if (!valid(final) || !same(binding, final) || final.url !== selected.url) throw new Error('Unavailable');
      this.grant = { binding, url: selected.url, adapter: matches[0], expiresAt: this.now() + LIFETIME, abort: new AbortController(), busy: false };
      this.timer = setTimeout(() => this.expire(), LIFETIME);
      this.publish({ state: 'ready', message: 'Read-only selected-tab access active.', source: origin, expiresAt: this.grant.expiresAt });
    } catch {
      if (generation === this.generation) {
        this.clear(); this.publish({ state: 'unavailable', message: 'Selected site or identity unavailable. No page was read.' });
      }
    }
    return this.status();
  }
  private async guard(g: Grant<T>) {
    if (this.grant !== g || g.abort.signal.aborted) throw new Error('Selected-tab access unavailable.');
    if (this.now() >= g.expiresAt) { this.expire(); throw new Error('Selected-tab access expired.'); }
    const selected = await this.host.selected();
    if (this.grant !== g || g.abort.signal.aborted) throw new Error('Selected-tab access cancelled.');
    if (this.now() >= g.expiresAt) { this.expire(); throw new Error('Selected-tab access expired.'); }
    if (!valid(selected) || !same(g.binding, selected) || selected.url !== g.url) {
      this.cancel(); throw new Error('Selected-tab identity changed.');
    }
  }
  async read(): Promise<Evidence<T>> {
    const g = this.grant;
    if (!g || g.busy) throw new Error('Activate the selected tab; only one read may run.');
    g.busy = true;
    try {
      await this.guard(g);
      this.publish({ state: 'reading', message: 'Reading reviewed fields from this tab.', source: g.binding.origin, expiresAt: g.expiresAt });
      // Status rendering can synchronously invalidate the grant.
      await this.guard(g);
      const raw = await g.adapter.read(g.binding, g.abort.signal);
      await this.guard(g);
      const decoded = g.adapter.decode(raw);
      if (!['complete', 'partial'].includes(decoded.completeness)) throw new Error('Invalid evidence completeness.');
      const data = structuredClone(decoded.data);
      await this.guard(g);
      const evidence: Evidence<T> = {
        protocol: 'do.selected-tab.read.v1', adapter: g.adapter.id, binding: { ...g.binding },
        // Origin only: paths, query, fragment and userinfo may contain private tokens.
        source: g.binding.origin, observedAt: this.now(), completeness: decoded.completeness,
        trust: 'untrusted_page_data', data,
      };
      this.publish({ state: 'ready', message: 'Read-only evidence ready; page content is untrusted.', source: g.binding.origin, expiresAt: g.expiresAt });
      if (this.grant !== g) throw new Error('Selected-tab access cancelled.');
      return evidence;
    } catch {
      if (this.grant === g) {
        this.clear(); this.publish({ state: 'unavailable', message: 'Read unavailable. Activate again.' });
      }
      throw new Error('Selected-tab read unavailable; no evidence released.');
    } finally { g.busy = false; }
  }
}
