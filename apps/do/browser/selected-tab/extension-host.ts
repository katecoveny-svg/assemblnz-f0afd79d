import { SelectedTabReader, type Evidence, type Selection, type Status } from './reader';
import { selectedText, workspaceOwner, documentUrl } from './dom';
export type Tab = { id: number; windowId: number; url?: string };
export type Identity = { tabId: number; documentId: string; url: string };
export interface BrowserPort {
  active(): Promise<Tab | null>;
  identify(tabId: number): Promise<Identity>;
  owner(workspace: Identity): Promise<string | null>;
  read(target: Identity, format?: 'text' | 'image'): Promise<unknown>;
  show(status: Status): void;
}
export type TextEvidence = Evidence<{ text?: string; image?: string }>;
const workspaceUrl = (url: string) => { try { const u = new URL(url); return u.origin === 'https://www.assembl.co.nz' && ['/do', '/do/widget', '/do/personal'].includes(u.pathname) && !u.username && !u.password; } catch { return false; } };
/** Selected DOM text is a generic bounded adapter, not a retailer/account integration. */
export class SelectedTabExtension {
  private workspace: Identity | null = null;
  private ownerId: string | null = null;
  private target: Identity | null = null;
  private reader: SelectedTabReader<{ text?: string; image?: string }>;
  private generation = 0;
  private evidence: TextEvidence | null = null;
  private port: BrowserPort;
  constructor(port: BrowserPort, now = Date.now, format: 'text' | 'image' = 'text') {
    this.port = port;
    this.reader = new SelectedTabReader<{ text?: string; image?: string }>({ selected: () => this.selection(), show: status => port.show(status) }, [{
      id: format === 'text' ? 'visible-selected-text.v1' : 'visible-page-image.v1',
      supports: url => Boolean(this.target && url.href === this.target.url && ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password),
      read: async (binding, signal) => {
        if (!this.target || signal.aborted || this.target.tabId !== binding.tabId || this.target.documentId !== binding.documentId) throw new Error('Changed selection');
        return port.read(this.target, format);
      },
      decode: raw => {
        if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('Unavailable');
        const value = raw as Record<string, unknown>;
        if (format === 'image') {
          if (Object.keys(value).sort().join(',') !== 'completeness,image' || value.completeness !== 'partial' || typeof value.image !== 'string' || !/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(value.image) || value.image.length > 4_000_000) throw new Error('Unavailable');
          return { data: { image: value.image }, completeness: 'partial' };
        }
        if (Object.keys(value).sort().join(',') !== 'completeness,text' || value.completeness !== 'partial' || typeof value.text !== 'string' || !value.text.trim() || value.text.length > 6000) throw new Error('Unavailable');
        return { data: { text: value.text }, completeness: 'partial' };
      },
    }], now);
  }
  private async selection(): Promise<Selection | null> {
    const generation = this.generation, target = this.target, workspace = this.workspace, owner = this.ownerId;
    if (!target || !workspace || !owner) return null;
    const active = await this.port.active();
    if (!active || active.id !== target.tabId) return null;
    const actual = await this.port.identify(active.id);
    const verified = await this.port.owner(workspace);
    if (generation !== this.generation || actual.documentId !== target.documentId || actual.url !== target.url || verified !== owner) return null;
    return { owner, ...actual, origin: new URL(actual.url).origin };
  }
  /** Only the native action event may call this. Panel messages cannot activate grants. */
  async toolbar(tab: Tab) {
    this.invalidate(); const generation = this.generation;
    const active = await this.port.active();
    if (!active || active.id !== tab.id || active.windowId !== tab.windowId) throw new Error('Select the tab again.');
    const identity = await this.port.identify(tab.id);
    if (generation !== this.generation) return;
    if (workspaceUrl(identity.url)) {
      const owner = await this.port.owner(identity);
      if (!owner || generation !== this.generation) throw new Error('Sign in to DO first.');
      this.workspace = identity; this.ownerId = owner;
      this.port.show({ state: 'unavailable', message: 'DO account connected. Select text on a page, then click the DO toolbar there.' }); return;
    }
    if (!this.workspace) throw new Error('First click the DO toolbar on your signed-in DO workspace.');
    this.target = identity;
    await this.reader.activateFromToolbar();
  }
  invalidate(tabId?: number) {
    if (tabId !== undefined && this.workspace?.tabId !== tabId && this.target?.tabId !== tabId) return;
    this.generation++; this.evidence = null; this.target = null;
    if (tabId !== undefined && this.workspace?.tabId === tabId) { this.workspace = null; this.ownerId = null; }
    this.reader.cancel();
  }
  async capture() { this.evidence = await this.reader.read(); return structuredClone(this.evidence); }
  async attach(): Promise<TextEvidence> {
    const evidence = this.evidence;
    const selected = await this.selection();
    if (!evidence || !selected || this.reader.status().state !== 'ready' || JSON.stringify(evidence.binding) !== JSON.stringify({ owner: selected.owner, tabId: selected.tabId, documentId: selected.documentId, origin: selected.origin })) throw new Error('Capture expired or changed. Capture again.');
    this.evidence = null; return structuredClone(evidence);
  }
}
export { selectedText, workspaceOwner, documentUrl };
