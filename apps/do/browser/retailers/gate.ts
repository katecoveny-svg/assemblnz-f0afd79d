/** Release gate is source-controlled, not a page/env/model toggle. Native authority,
 * retailer DOM mapping, site-access review and durable claims are NOT validated. */
export const WOOLWORTHS_LIVE_ENABLED = false;
export const WOOLWORTHS_BLOCKERS = [
  'installed_extension_permissions_unverified', 'native_tab_identity_unverified',
  'extension_owned_read_grant_unverified', 'retailer_dom_mapping_unverified',
  'account_store_cart_binding_unverified', 'durable_claims_unconfigured',
  'personal_pilot_site_access_review_pending',
] as const;
export function requireWoolworthsRelease() {
  if (!WOOLWORTHS_LIVE_ENABLED) throw new Error('Woolworths cart execution is disabled pending native and site validation.');
}
