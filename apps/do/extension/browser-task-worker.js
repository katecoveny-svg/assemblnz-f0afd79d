'use strict';
importScripts('browser-task-core.js');
(() => {
  const { ConnectionBroker, isWorkspaceUrl, isFixtureUrl } = globalThis.DoTaskConnection;
  const one = results => { if (results.length !== 1 || !results[0].documentId) throw new Error('Tab document unavailable.'); return results[0]; };
  const target = tab => ({ tabId: tab.tabId, documentIds: [tab.documentId] });
  async function identify(tabId) {
    const tab = await chrome.tabs.get(tabId);
    const row = one(await chrome.scripting.executeScript({ target: { tabId }, func: () => location.href }));
    if (row.result !== tab.url) throw new Error('Tab moved.');
    return { tabId, documentId: row.documentId, url: row.result };
  }
  async function current(tab) {
    try { const actual = await chrome.tabs.get(tab.tabId); if (actual.url !== tab.url) return false;
      const row = one(await chrome.scripting.executeScript({ target: target(tab), func: () => location.href }));
      return row.documentId === tab.documentId && row.result === tab.url;
    } catch { return false; }
  }
  async function owner(workspace) {
    if (!isWorkspaceUrl(workspace.url)) return null;
    const row = one(await chrome.scripting.executeScript({ target: target(workspace), func: async () => {
      // Isolated-world code: no page-provided identity, cookie/token extraction or DOM capture.
      try { const r = await fetch('/api/do/session', { credentials: 'same-origin', cache: 'no-store', signal: AbortSignal.timeout(5000) });
        const data = await r.json(); return r.ok && typeof data.workspaceKey === 'string' && /^[0-9a-f-]{36}$/i.test(data.workspaceKey) ? data.workspaceKey : null;
      } catch { return null; }
    } }));
    return row.documentId === workspace.documentId ? row.result : null;
  }
  function readProducts(scope) {
    if (location.href !== 'http://127.0.0.1:4198/cart-fixture.html') throw new Error('Unsupported site.');
    const root = document.querySelector('[data-do-cart-fixture]');
    if (!root) throw new Error('Fixture unavailable.');
    return { scope, revision: root.dataset.revision, observedAt: Date.now(), currency: 'NZD', items: [...root.querySelectorAll('[data-product]')].map(row => ({ productId: row.dataset.product, name: row.querySelector('[data-name]')?.textContent, unitPriceCents: Number(row.dataset.price), available: row.dataset.available === 'true', quantity: Number(row.querySelector('output')?.value) })) };
  }
  function editProduct(revision, productId, quantity) {
    if (location.href !== 'http://127.0.0.1:4198/cart-fixture.html') throw new Error('Unsupported site.');
    const root = document.querySelector('[data-do-cart-fixture]');
    if (!root || root.dataset.revision !== revision || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) throw new Error('Review changed.');
    const rows = [...root.querySelectorAll('[data-product]')].filter(row => row.dataset.product === productId);
    if (rows.length !== 1 || rows[0].dataset.available !== 'true') throw new Error('Product changed.');
    const input = rows[0].querySelector('input[type="number"]');
    const button = rows[0].querySelector('button[data-set-quantity]');
    if (!input || !button || button.disabled) throw new Error('Control unavailable.');
    input.value = String(quantity); button.click();
  }
  const broker = new ConnectionBroker({ owner, current, adapter: (tab, scope) => ({ mode: 'controlled_fixture',
    observe: async () => one(await chrome.scripting.executeScript({ target: target(tab), func: readProducts, args: [scope] })).result,
    setQuantity: async (_scope, revision, id, quantity) => { await chrome.scripting.executeScript({ target: target(tab), func: editProduct, args: [revision, id, quantity] }); },
  }) });
  const trusted = sender => sender.id === chrome.runtime.id && sender.url === chrome.runtime.getURL('browser-connection.html');
  async function handle(message, sender) {
    if (message.type === 'do:browser-page') {
      if (sender.id !== chrome.runtime.id || !sender.tab?.id || !sender.documentId || !isWorkspaceUrl(sender.url || '')) throw new Error('Personal DO tab required.');
      return broker.command({ tabId: sender.tab.id, documentId: sender.documentId, url: sender.url }, message.command);
    }
    if (!trusted(sender)) throw new Error('Use the companion connection controls.');
    if (message.action === 'inspect') {
      const [selected] = await chrome.tabs.query({ active: true, currentWindow: true });
      const tabs = await chrome.tabs.query({ currentWindow: true });
      const selectionIssue = !selected ? 'No selected browser tab was returned.'
        : !selected.url ? 'Tab access is unavailable. Select the fictional cart and click the DO toolbar icon again.'
        : !isFixtureUrl(selected.url) ? 'The selected tab is not the exact supported fictional cart URL.' : null;
      return { selected: selected && isFixtureUrl(selected.url || '') ? { id: selected.id, url: selected.url } : null, selectionIssue,
        workspaces: tabs.filter(tab => isWorkspaceUrl(tab.url || '')).map(tab => ({ id: tab.id, url: tab.url })), connection: await broker.companionStatus() };
    }
    if (message.action === 'connect') {
      const [active] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!Number.isInteger(message.workspaceId) || !active?.id || active.id !== message.targetId || !isFixtureUrl(active.url || '')) throw new Error('Select the supported storefront tab first.');
      const workspaceTab = await chrome.tabs.get(message.workspaceId);
      if (!isWorkspaceUrl(workspaceTab.url || '')) throw new Error('Open Personal DO in this browser first.');
      const storefront = await identify(active.id), workspace = await identify(workspaceTab.id);
      await broker.connect(storefront, workspace);
      try { await chrome.scripting.executeScript({ target: target(workspace), files: ['browser-task-relay.js'] }); }
      catch (error) { broker.revoke(); throw error; }
      return broker.snapshot();
    }
    if (message.action === 'allow-read') return broker.allowReadInCompanion(message.connectionId);
    if (message.action === 'approve') return broker.approveInCompanion(message.connectionId, message.digest);
    if (message.action === 'cancel') { broker.revoke(); return broker.snapshot(); }
    if (message.action === 'status') return broker.companionStatus();
    throw new Error('Unsupported companion command.');
  }
  chrome.runtime.onMessage.addListener((message, sender, reply) => {
    if (!['do:browser-page', 'do:browser-companion'].includes(message?.type)) return false;
    handle(message, sender).then(data => reply({ ok: true, data })).catch(error => reply({ ok: false, error: error instanceof Error ? error.message : 'Connection unavailable.' }));
    return true;
  });
  chrome.tabs.onUpdated.addListener((id, change) => { if (change.url || change.status === 'loading') broker.revokeTab(id); });
  chrome.tabs.onRemoved.addListener(id => broker.revokeTab(id));
})();
