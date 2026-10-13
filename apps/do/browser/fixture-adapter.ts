import { cartObservation, type BrowserScope } from './contract';
import type { CartAdapter } from './executor';

/** Controlled localhost DOM only. Not a retailer selector map or an extension
 * content script. No generic click, evaluate, navigation, submit or credential API. */
export function fixtureCartAdapter(doc: Document, scope: BrowserScope): CartAdapter {
  function root() {
    if (doc.location.origin !== 'http://127.0.0.1:4198' || doc.location.pathname !== '/cart-fixture.html') throw new Error('Fixture origin required');
    const node = doc.querySelector<HTMLElement>('[data-do-cart-fixture]');
    if (!node || node.dataset.document !== scope.documentId || Number(node.dataset.navigation) !== scope.navigationRevision) throw new Error('Document changed');
    return node;
  }
  async function observe() {
    const node = root();
    return cartObservation.parse({ scope, revision: node.dataset.revision, observedAt: Date.now(), currency: 'NZD',
      items: [...node.querySelectorAll<HTMLElement>('[data-product]')].map(row => ({
        productId: row.dataset.product, name: row.querySelector('[data-name]')?.textContent,
        unitPriceCents: Number(row.dataset.price), available: row.dataset.available === 'true',
        quantity: Number(row.querySelector<HTMLOutputElement>('output')?.value),
      })),
    });
  }
  return { mode: 'controlled_fixture', observe, async setQuantity(expectedScope, expectedRevision, productId, quantity) {
    const node = root();
    if (JSON.stringify(expectedScope) !== JSON.stringify(scope) || node.dataset.revision !== expectedRevision || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) throw new Error('Scope or cart changed');
    const rows = [...node.querySelectorAll<HTMLElement>('[data-product]')].filter(row => row.dataset.product === productId);
    if (rows.length !== 1 || rows[0].dataset.available !== 'true') throw new Error('Product unavailable');
    const input = rows[0].querySelector<HTMLInputElement>('input[type="number"]');
    const button = rows[0].querySelector<HTMLButtonElement>('button[data-set-quantity]');
    if (!input || !button || button.disabled) throw new Error('Cart control unavailable');
    input.value = String(quantity);
    button.click(); // fixed control on controlled fixture; never model-provided code
  } };
}
