import { WOOLWORTHS_BLOCKERS } from './retailers/gate';
/** One truthful capability projection for web, voice, Mac, PWA and extension. */
export function browserActionCapability() {
  return {
    protocol: 'do.cart.v1',
    state: 'unavailable',
    implementation: 'gated_retailer_adapter',
    liveBlockers: WOOLWORTHS_BLOCKERS,
    retailer: 'woolworths_nz',
    canObserve: false,
    canMutateCart: false,
    canCheckout: false,
    connection: 'not_paired',
    persistence: 'not_configured',
    reason: 'Browser shopping is not connected. You can prepare a shopping list.',
    phoneRequirement: 'Phone commands require an approved paired browser to be online.',
  } as const;
}
