import { retailerSnapshot, type RetailerCartPort, type RetailerSnapshot } from './woolworths';
import { requireWoolworthsRelease } from './gate';
/** Compiled retailer mapping only. Never accepted from page messages or a model.
 * A real Woolworths mapping must be verified before enabling its factory. */
export interface RetailerDOMBindings {
  read(doc: Document): RetailerSnapshot;
  quantityControl(doc: Document, sku: string): { input: HTMLInputElement; button: HTMLButtonElement };
}
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
function build(doc: Document, origin: string, bindings: RetailerDOMBindings, assertNativeAuthority: () => Promise<void>): RetailerCartPort {
  function documentGuard() {
    if (doc.location.origin !== origin || /\/(checkout|payment|login|register|account)(\/|$)/i.test(doc.location.pathname)) throw new Error('Unsupported document');
  }
  function snapshot() { documentGuard(); return retailerSnapshot.parse(bindings.read(doc)); }
  return {
    async readProductCartFields() { await assertNativeAuthority(); return snapshot(); },
    async compareAndSetQuantity(command) {
      await assertNativeAuthority(); // Native host verifies selected document/grant at effect time.
      const s = snapshot();
      const p = s.products.find(p => p.sku === command.product.sku);
      const expected = retailerSnapshot.shape.products.element.parse(command.product);
      if (!same(s.scope, command.scope) || s.revision !== command.expectedRevision || !same(s.context, command.context) || !same(p, expected) || !p?.available || !Number.isInteger(command.targetQuantity) || command.targetQuantity <= p.quantity || command.targetQuantity > 20) throw new Error('Review changed before DOM effect');
      const { input, button } = bindings.quantityControl(doc, p.sku);
      // Only a statically mapped quantity control. Never submit a form or checkout.
      if (input.ownerDocument !== doc || button.ownerDocument !== doc || !input.isConnected || !button.isConnected || input.disabled || input.readOnly || input.type !== 'number' || button.disabled || button.type !== 'button' || (input.max !== '' && command.targetQuantity > Number(input.max))) throw new Error('Quantity control unavailable');
      input.value = String(command.targetQuantity);
      const EventType = doc.defaultView!.Event;
      input.dispatchEvent(new EventType('input', { bubbles: true }));
      input.dispatchEvent(new EventType('change', { bubbles: true }));
      // Input events can rerender or navigate. Do not click a stale/changed control.
      const afterInput = snapshot();
      const { observedAt: _beforeTime, ...beforeFacts } = s;
      const { observedAt: _afterTime, ...afterFacts } = afterInput;
      const resolved = bindings.quantityControl(doc, p.sku);
      if (resolved.input !== input || resolved.button !== button || input.ownerDocument !== doc || button.ownerDocument !== doc || !input.isConnected || !button.isConnected || input.disabled || input.readOnly || input.type !== 'number' || (input.max !== '' && (!Number.isFinite(Number(input.max)) || command.targetQuantity > Number(input.max))) || button.disabled || button.type !== 'button' || input.value !== String(command.targetQuantity) || !same(afterFacts, beforeFacts)) throw new Error('Cart or controls changed during quantity entry');
      button.click(); // Exactly one fixed mapped action. No retry; runtime performs readback.
    },
  };
}
export function createRetailerFixtureDOMPort(doc: Document, bindings: RetailerDOMBindings, authority: () => Promise<void>): RetailerCartPort {
  if (doc.location.origin !== 'http://127.0.0.1:4198') throw new Error('Fixture DOM only');
  return build(doc, 'http://127.0.0.1:4198', bindings, authority);
}
export function createWoolworthsDOMPort(doc: Document, bindings: RetailerDOMBindings, authority: () => Promise<void>): RetailerCartPort {
  requireWoolworthsRelease();
  return build(doc, 'https://www.woolworths.co.nz', bindings, authority);
}
