"use strict";
var DoSelectedTab = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // apps/do/browser/selected-tab/extension-host.ts
  var extension_host_exports = {};
  __export(extension_host_exports, {
    SelectedTabExtension: () => SelectedTabExtension,
    documentUrl: () => documentUrl,
    selectedText: () => selectedText,
    workspaceOwner: () => workspaceOwner
  });

  // apps/do/browser/selected-tab/reader.ts
  var LIFETIME = 6e4;
  var same = (a, b) => a.owner === b.owner && a.tabId === b.tabId && a.documentId === b.documentId && a.origin === b.origin;
  function valid(s) {
    if (!s || !s.owner || s.owner === "guest" || !Number.isSafeInteger(s.tabId) || s.tabId < 1 || !s.documentId) return false;
    try {
      const u = new URL(s.url);
      return ["http:", "https:"].includes(u.protocol) && !u.username && !u.password && u.origin === s.origin;
    } catch {
      return false;
    }
  }
  var SelectedTabReader = class {
    host;
    adapters;
    now;
    grant = null;
    generation = 0;
    timer;
    view = { state: "unavailable", message: "Activate DO from the selected tab toolbar." };
    constructor(host, adapters, now = Date.now) {
      this.host = host;
      this.adapters = [...adapters];
      this.now = now;
    }
    publish(status) {
      this.view = Object.freeze({ ...status });
      try {
        this.host.show(this.view);
      } catch {
        this.clear();
        this.view = { state: "unavailable", message: "Visible companion status unavailable." };
        throw new Error("Visible companion status unavailable.");
      }
    }
    clear() {
      this.generation++;
      this.grant?.abort.abort();
      this.grant = null;
      clearTimeout(this.timer);
      this.timer = void 0;
    }
    cancel() {
      this.clear();
      this.publish({ state: "cancelled", message: "Selected-tab access cancelled." });
    }
    /** Call immediately on selection, navigation, owner change, tab close or UI close. */
    invalidate() {
      this.cancel();
    }
    status() {
      if (this.grant && this.now() >= this.grant.expiresAt) this.expire();
      return { ...this.view };
    }
    expire() {
      this.clear();
      this.publish({ state: "expired", message: "Selected-tab access expired. Activate again." });
    }
    /** Wire ONLY to browser-owned toolbar event, never a boolean in page RPC. */
    async activateFromToolbar() {
      this.clear();
      this.publish({ state: "unavailable", message: "Checking selected-tab support." });
      const generation = this.generation;
      try {
        const selected = await this.host.selected();
        if (generation !== this.generation) return this.status();
        if (!valid(selected)) throw new Error("Unavailable");
        const matches = this.adapters.filter((a) => a.supports(new URL(selected.url)));
        if (matches.length !== 1) throw new Error("Unavailable");
        const { owner, tabId, documentId, origin } = selected;
        const binding = Object.freeze({ owner, tabId, documentId, origin });
        const final = await this.host.selected();
        if (generation !== this.generation) return this.status();
        if (!valid(final) || !same(binding, final) || final.url !== selected.url) throw new Error("Unavailable");
        this.grant = { binding, url: selected.url, adapter: matches[0], expiresAt: this.now() + LIFETIME, abort: new AbortController(), busy: false };
        this.timer = setTimeout(() => this.expire(), LIFETIME);
        this.publish({ state: "ready", message: "Read-only selected-tab access active.", source: origin, expiresAt: this.grant.expiresAt });
      } catch {
        if (generation === this.generation) {
          this.clear();
          this.publish({ state: "unavailable", message: "Selected site or identity unavailable. No page was read." });
        }
      }
      return this.status();
    }
    async guard(g) {
      if (this.grant !== g || g.abort.signal.aborted) throw new Error("Selected-tab access unavailable.");
      if (this.now() >= g.expiresAt) {
        this.expire();
        throw new Error("Selected-tab access expired.");
      }
      const selected = await this.host.selected();
      if (this.grant !== g || g.abort.signal.aborted) throw new Error("Selected-tab access cancelled.");
      if (this.now() >= g.expiresAt) {
        this.expire();
        throw new Error("Selected-tab access expired.");
      }
      if (!valid(selected) || !same(g.binding, selected) || selected.url !== g.url) {
        this.cancel();
        throw new Error("Selected-tab identity changed.");
      }
    }
    async read() {
      const g = this.grant;
      if (!g || g.busy) throw new Error("Activate the selected tab; only one read may run.");
      g.busy = true;
      try {
        await this.guard(g);
        this.publish({ state: "reading", message: "Reading reviewed fields from this tab.", source: g.binding.origin, expiresAt: g.expiresAt });
        await this.guard(g);
        const raw = await g.adapter.read(g.binding, g.abort.signal);
        await this.guard(g);
        const decoded = g.adapter.decode(raw);
        if (!["complete", "partial"].includes(decoded.completeness)) throw new Error("Invalid evidence completeness.");
        const data = structuredClone(decoded.data);
        await this.guard(g);
        const evidence = {
          protocol: "do.selected-tab.read.v1",
          adapter: g.adapter.id,
          binding: { ...g.binding },
          // Origin only: paths, query, fragment and userinfo may contain private tokens.
          source: g.binding.origin,
          observedAt: this.now(),
          completeness: decoded.completeness,
          trust: "untrusted_page_data",
          data
        };
        this.publish({ state: "ready", message: "Read-only evidence ready; page content is untrusted.", source: g.binding.origin, expiresAt: g.expiresAt });
        if (this.grant !== g) throw new Error("Selected-tab access cancelled.");
        return evidence;
      } catch {
        if (this.grant === g) {
          this.clear();
          this.publish({ state: "unavailable", message: "Read unavailable. Activate again." });
        }
        throw new Error("Selected-tab read unavailable; no evidence released.");
      } finally {
        g.busy = false;
      }
    }
  };

  // apps/do/browser/selected-tab/dom.ts
  function selectedText() {
    const blocked = 'input,textarea,select,[contenteditable],[role="textbox"],[data-private],[data-do-private],script,style,iframe,canvas,[hidden],[aria-hidden="true"]';
    if (document.contentType !== "text/html" || document.activeElement?.closest(blocked)) throw new Error("Selected text unavailable.");
    const selection = window.getSelection();
    if (!selection || selection.rangeCount !== 1 || selection.isCollapsed) throw new Error("Select ordinary visible text first.");
    const range = selection.getRangeAt(0);
    const root = range.commonAncestorContainer.nodeType === Node.TEXT_NODE ? range.commonAncestorContainer.parentElement : range.commonAncestorContainer;
    if (!root || root.closest(blocked) || root.ownerDocument !== document) throw new Error("Unsupported selection.");
    for (const element of document.querySelectorAll(blocked)) if (range.intersectsNode(element)) throw new Error("Selection touches a private or unsupported area.");
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let result = "", count = 0;
    const read = (node) => {
      if (++count > 5e3) throw new Error("Selection too complex.");
      if (!range.intersectsNode(node)) return;
      const parent = node.parentElement;
      if (!parent || parent.closest(blocked)) throw new Error("Unsupported selection.");
      for (let element = parent; element; element = element.parentElement) {
        const style = getComputedStyle(element);
        if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0) throw new Error("Hidden text unavailable.");
      }
      const bounds = parent.getBoundingClientRect();
      if (bounds.bottom <= 0 || bounds.right <= 0 || bounds.top >= innerHeight || bounds.left >= innerWidth) throw new Error("Offscreen text unavailable.");
      const text = node.textContent ?? "";
      result += text.slice(node === range.startContainer ? range.startOffset : 0, node === range.endContainer ? range.endOffset : text.length);
      if (result.length > 6e3) throw new Error("Select at most 6,000 characters.");
    };
    if (range.commonAncestorContainer.nodeType === Node.TEXT_NODE) read(range.commonAncestorContainer);
    else {
      let node;
      while (node = walker.nextNode()) read(node);
    }
    if (!result.trim()) throw new Error("No ordinary visible text selected.");
    return { text: result.trim(), completeness: "partial" };
  }
  async function workspaceOwner() {
    if (location.origin !== "https://www.assembl.co.nz") return null;
    try {
      const response = await fetch("/api/do/session", { credentials: "same-origin", cache: "no-store", signal: AbortSignal.timeout(5e3) });
      const value = await response.json();
      return response.ok && typeof value.workspaceKey === "string" && /^[a-f0-9-]{36}$/i.test(value.workspaceKey) ? value.workspaceKey : null;
    } catch {
      return null;
    }
  }
  function documentUrl() {
    return location.href;
  }

  // apps/do/browser/selected-tab/extension-host.ts
  var workspaceUrl = (url) => {
    try {
      const u = new URL(url);
      return u.origin === "https://www.assembl.co.nz" && ["/do", "/do/widget", "/do/personal"].includes(u.pathname) && !u.username && !u.password;
    } catch {
      return false;
    }
  };
  var SelectedTabExtension = class {
    workspace = null;
    ownerId = null;
    target = null;
    reader;
    generation = 0;
    evidence = null;
    port;
    constructor(port, now = Date.now, format = "text") {
      this.port = port;
      this.reader = new SelectedTabReader({ selected: () => this.selection(), show: (status) => port.show(status) }, [{
        id: format === "text" ? "visible-selected-text.v1" : "visible-page-image.v1",
        supports: (url) => Boolean(this.target && url.href === this.target.url && ["https:", "http:"].includes(url.protocol) && !url.username && !url.password),
        read: async (binding, signal) => {
          if (!this.target || signal.aborted || this.target.tabId !== binding.tabId || this.target.documentId !== binding.documentId) throw new Error("Changed selection");
          return port.read(this.target, format);
        },
        decode: (raw) => {
          if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("Unavailable");
          const value = raw;
          if (format === "image") {
            if (Object.keys(value).sort().join(",") !== "completeness,image" || value.completeness !== "partial" || typeof value.image !== "string" || !/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(value.image) || value.image.length > 4e6) throw new Error("Unavailable");
            return { data: { image: value.image }, completeness: "partial" };
          }
          if (Object.keys(value).sort().join(",") !== "completeness,text" || value.completeness !== "partial" || typeof value.text !== "string" || !value.text.trim() || value.text.length > 6e3) throw new Error("Unavailable");
          return { data: { text: value.text }, completeness: "partial" };
        }
      }], now);
    }
    async selection() {
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
    async toolbar(tab) {
      this.invalidate();
      const generation = this.generation;
      const active = await this.port.active();
      if (!active || active.id !== tab.id || active.windowId !== tab.windowId) throw new Error("Select the tab again.");
      const identity = await this.port.identify(tab.id);
      if (generation !== this.generation) return;
      if (workspaceUrl(identity.url)) {
        const owner = await this.port.owner(identity);
        if (!owner || generation !== this.generation) throw new Error("Sign in to DO first.");
        this.workspace = identity;
        this.ownerId = owner;
        this.port.show({ state: "unavailable", message: "DO account connected. Select text on a page, then click the DO toolbar there." });
        return;
      }
      if (!this.workspace) throw new Error("First click the DO toolbar on your signed-in DO workspace.");
      this.target = identity;
      await this.reader.activateFromToolbar();
    }
    invalidate(tabId) {
      if (tabId !== void 0 && this.workspace?.tabId !== tabId && this.target?.tabId !== tabId) return;
      this.generation++;
      this.evidence = null;
      this.target = null;
      if (tabId !== void 0 && this.workspace?.tabId === tabId) {
        this.workspace = null;
        this.ownerId = null;
      }
      this.reader.cancel();
    }
    async capture() {
      this.evidence = await this.reader.read();
      return structuredClone(this.evidence);
    }
    async attach() {
      const evidence = this.evidence;
      const selected = await this.selection();
      if (!evidence || !selected || this.reader.status().state !== "ready" || JSON.stringify(evidence.binding) !== JSON.stringify({ owner: selected.owner, tabId: selected.tabId, documentId: selected.documentId, origin: selected.origin })) throw new Error("Capture expired or changed. Capture again.");
      this.evidence = null;
      return structuredClone(evidence);
    }
  };
  return __toCommonJS(extension_host_exports);
})();
