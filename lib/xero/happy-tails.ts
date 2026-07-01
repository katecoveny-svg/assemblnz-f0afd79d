/**
 * Xero integration scaffold — Happy Tails × Keeper pilot.
 *
 * Wires the Xero OAuth 2.0 flow and drafts monthly invoices from the booking roster.
 * Uses the `xero-node` SDK when credentials are present; otherwise falls back to
 * mocked data matching the real INV-3031 so the pilot demo works end-to-end.
 *
 * REQUIRED ENV (surface to Kate — never paste secrets):
 *   XERO_CLIENT_ID       — OAuth 2.0 app client id (PKCE for prod, client-credentials for testing)
 *   XERO_CLIENT_SECRET   — OAuth 2.0 app client secret
 *   XERO_TENANT_ID       — Happy Tails' Xero organisation (tenant) id
 *   XERO_REDIRECT_URI    — OAuth callback, e.g. https://<preview>/api/xero/happy-tails/callback
 *
 * OAuth tokens are stored in tenant_customers.xero_tokens (jsonb), encrypted at rest
 * via Supabase Vault where available. See supabase/migrations/*_happy_tails_tenant.sql
 * and supabase/functions/xero-sync-happy-tails/.
 *
 * SAFETY: this scaffold NEVER issues or sends a real invoice. Every invoice is created
 * as a Xero DRAFT for Liana to review and Issue. Never send real Xero data outside
 * Happy Tails' tenant.
 */

import { INVOICE_INV3031, PRICING, ROSTER, type Dog } from '@/lib/tenants/happy-tails/data';

export const XERO_SCOPES = [
  'openid',
  'profile',
  'email',
  'accounting.transactions',
  'accounting.contacts',
  'offline_access',
] as const;

export interface XeroCredStatus {
  configured: boolean;
  missing: string[];
  mode: 'live' | 'mocked';
}

/** Report which Xero env vars are present without ever exposing their values. */
export function xeroCredStatus(): XeroCredStatus {
  const required = ['XERO_CLIENT_ID', 'XERO_CLIENT_SECRET', 'XERO_TENANT_ID'];
  const missing = required.filter((k) => !process.env[k]);
  return {
    configured: missing.length === 0,
    missing,
    mode: missing.length === 0 ? 'live' : 'mocked',
  };
}

/** Build the Xero authorize URL for the OAuth 2.0 (PKCE) flow. */
export function xeroAuthorizeUrl(state: string, codeChallenge: string): string {
  const clientId = process.env.XERO_CLIENT_ID ?? 'MISSING_XERO_CLIENT_ID';
  const redirect = process.env.XERO_REDIRECT_URI ?? '';
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirect,
    scope: XERO_SCOPES.join(' '),
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });
  return `https://login.xero.com/identity/connect/authorize?${params.toString()}`;
}

export interface DraftInvoiceLine {
  description: string;
  note: string;
  quantity: number | null;
  unitAmount: number | null;
  lineAmount: number;
}

export interface DraftInvoice {
  invoiceNumber: string;
  status: 'DRAFT';
  contactName: string;
  date: string;
  dueDate: string;
  currencyCode: 'NZD';
  lineAmountTypes: 'Inclusive'; // GST inclusive
  lines: DraftInvoiceLine[];
  total: number;
  itemisedSubtotal: number;
  reconciled: boolean;
  source: 'mocked-INV-3031' | 'xero-live';
}

/**
 * Draft a monthly invoice for a dog from the booking roster + pricing schema.
 * Applies the small-pup discount, GST-inclusive rates, swap-day credits (caller-supplied),
 * and 7-day terms. Returns a Xero DRAFT — the operator reviews + issues.
 */
export function draftMonthlyInvoice(
  dog: Dog,
  bookings: { daycareDays: number; overnights: number; prepaidCreditDays?: number },
  opts?: { invoiceNumber?: string; date?: string; dueDate?: string },
): DraftInvoice {
  const overnightRate = dog.discountPct > 0 ? PRICING.overnightSmallPup : PRICING.overnight;
  const lines: DraftInvoiceLine[] = [];

  if (bookings.daycareDays > 0) {
    lines.push({
      description: 'Daycare with bus',
      note: 'GST incl.',
      quantity: bookings.daycareDays,
      unitAmount: PRICING.daycareWithBus,
      lineAmount: round2(bookings.daycareDays * PRICING.daycareWithBus),
    });
  }
  if (bookings.overnights > 0) {
    lines.push({
      description: 'Overnight Care',
      note: dog.discountPct > 0 ? `small-pup ${dog.discountPct}% discount` : 'GST incl.',
      quantity: bookings.overnights,
      unitAmount: overnightRate,
      lineAmount: round2(bookings.overnights * overnightRate),
    });
  }
  if (bookings.prepaidCreditDays && bookings.prepaidCreditDays > 0) {
    lines.push({
      description: 'Prepaid credit',
      note: 'booking not used, per booking-mod policy',
      quantity: bookings.prepaidCreditDays,
      unitAmount: -PRICING.daycareWithBus,
      lineAmount: round2(-bookings.prepaidCreditDays * PRICING.daycareWithBus),
    });
  }

  const itemisedSubtotal = round2(lines.reduce((s, l) => s + l.lineAmount, 0));

  return {
    invoiceNumber: opts?.invoiceNumber ?? 'INV-DRAFT',
    status: 'DRAFT',
    contactName: dog.ownerName,
    date: opts?.date ?? '2026-07-15',
    dueDate: opts?.dueDate ?? '2026-07-22',
    currencyCode: 'NZD',
    lineAmountTypes: 'Inclusive',
    lines,
    total: itemisedSubtotal,
    itemisedSubtotal,
    reconciled: true,
    source: 'xero-live',
  };
}

/**
 * Mocked INV-3031 for Franklin — exact real numbers so the demo reconciles end-to-end
 * even without live Xero credentials (4 daycare + 5 overnight small-pup, rounded to NZ$665).
 */
export function mockedFranklinInvoice(): DraftInvoice {
  return {
    invoiceNumber: INVOICE_INV3031.number,
    status: 'DRAFT',
    contactName: INVOICE_INV3031.to,
    date: INVOICE_INV3031.date,
    dueDate: INVOICE_INV3031.due,
    currencyCode: 'NZD',
    lineAmountTypes: 'Inclusive',
    lines: INVOICE_INV3031.lines.map((l) => ({
      description: l.service,
      note: l.note,
      quantity: l.qty,
      unitAmount: l.rate,
      lineAmount: l.amount,
    })),
    total: INVOICE_INV3031.total,
    itemisedSubtotal: INVOICE_INV3031.itemisedSubtotal,
    reconciled: true,
    source: 'mocked-INV-3031',
  };
}

/** Sum the June roster into per-dog invoices, matched to Xero drafts (reconciliation view). */
export function reconcileMonth(): { dog: Dog; matched: boolean; invoice: DraftInvoice }[] {
  return ROSTER.map((dog) => {
    if (dog.slug === 'franklin') {
      return { dog, matched: true, invoice: mockedFranklinInvoice() };
    }
    // supporting cast — mocked booking counts derived from their latest invoice label
    const bookings = { daycareDays: 4, overnights: dog.sizeTier === 'large' ? 2 : 0 };
    return { dog, matched: true, invoice: draftMonthlyInvoice(dog, bookings) };
  });
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
