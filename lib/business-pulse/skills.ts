import type {
  BusinessPulseCashPosition,
  BusinessPulseChecks,
  BusinessPulsePipelineMovement,
  BusinessPulsePriority,
  BusinessPulseWeeklyCommitments,
} from './types';

type SyncedDataRow = {
  provider_code: string | null;
  data_type: string | null;
  data: Record<string, unknown> | null;
  synced_at?: string | null;
};

type IntegrationRow = {
  provider_code: string | null;
  status: string | null;
  metadata?: Record<string, unknown> | null;
};

export type BusinessPulseInputs = {
  integrations: IntegrationRow[];
  syncedData: SyncedDataRow[];
  pilotHealthRows: Array<Record<string, unknown>>;
  threshold: number;
};

function toNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[$,]/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function isConnected(integrations: IntegrationRow[], provider: string): boolean {
  return integrations.some(
    (row) =>
      row.provider_code === provider &&
      ['active', 'connected'].includes(String(row.status ?? '').toLowerCase()),
  );
}

export async function xeroCashPosition(input: BusinessPulseInputs): Promise<BusinessPulseCashPosition> {
  const connected = isConnected(input.integrations, 'xero');
  const xeroRows = input.syncedData.filter((row) => row.provider_code === 'xero');
  const invoiceRows = xeroRows.filter((row) => row.data_type === 'invoices');
  const bankRows = xeroRows.filter((row) => ['bank_balance', 'bank_balances', 'accounts'].includes(String(row.data_type)));

  const bankBalance =
    bankRows.length > 0
      ? bankRows.reduce((sum, row) => {
          const data = row.data ?? {};
          return sum + toNumber(data.balance ?? data.current_balance ?? data.amount);
        }, 0)
      : null;

  let accountsReceivableDue = 0;
  let accountsPayableDue = 0;
  const dueSoonNotes: string[] = [];

  for (const row of invoiceRows) {
    const data = row.data ?? {};
    const amountDue = toNumber(data.amount_due ?? data.AmountDue ?? data.amountDue);
    const type = String(data.type ?? data.Type ?? '').toUpperCase();
    const status = String(data.status ?? data.Status ?? '').toUpperCase();
    if (amountDue <= 0 || ['PAID', 'VOIDED', 'DELETED'].includes(status)) continue;
    if (type === 'ACCPAY') accountsPayableDue += amountDue;
    else accountsReceivableDue += amountDue;
    const contact = String(data.contact_name ?? data.contactName ?? data.contact ?? '').trim();
    if (contact && dueSoonNotes.length < 3) {
      dueSoonNotes.push(`${contact}: NZ$${Math.round(amountDue).toLocaleString('en-NZ')} still open`);
    }
  }

  let stripeNetLast7Days = 0;
  const notes: string[] = [];
  // Only call Stripe when THIS tenant has a connected Stripe integration.
  // Without that gate, a global STRIPE_SECRET_KEY would let every tenant's
  // brief include charges from a Stripe account they don't own — inflating
  // fourteenDayForecast and flipping belowThreshold incorrectly.
  // Even with the gate, true per-tenant scoping requires Stripe Connect
  // (account ids per tenant) or per-tenant API keys; the integration-row
  // gate is the floor while that wiring is in flight.
  const stripeIntegration = input.integrations.find(
    (row) =>
      row.provider_code === 'stripe' &&
      ['active', 'connected'].includes(String(row.status ?? '').toLowerCase()),
  );
  if (stripeIntegration) {
    try {
      if (process.env.STRIPE_SECRET_KEY) {
        const stripeAccountId =
          typeof stripeIntegration.metadata?.stripe_account_id === 'string'
            ? stripeIntegration.metadata.stripe_account_id
            : undefined;
        const { getStripe } = await import('@/lib/stripe/client');
        const stripe = getStripe();
        const since = Math.floor((Date.now() - 7 * 24 * 60 * 60 * 1000) / 1000);
        const charges = await stripe.charges.list(
          { created: { gte: since }, limit: 100 },
          stripeAccountId ? { stripeAccount: stripeAccountId } : undefined,
        );
        stripeNetLast7Days = charges.data.reduce((sum, charge) => {
          const refunded = charge.amount_refunded ?? 0;
          return sum + (charge.amount - refunded) / 100;
        }, 0);
        if (!stripeAccountId) {
          notes.push(
            'Stripe charges read from the global account — wire per-tenant stripe_account_id metadata for correct multi-tenant scoping.',
          );
        }
      } else {
        notes.push('Stripe integration row present but STRIPE_SECRET_KEY is not set; settlement summary deferred.');
      }
    } catch (error) {
      notes.push(`Stripe summary unavailable: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  }

  const fourteenDayForecast =
    bankBalance == null ? null : bankBalance + accountsReceivableDue + stripeNetLast7Days - accountsPayableDue;

  return {
    status: connected || invoiceRows.length > 0 || bankRows.length > 0 ? 'connected' : 'not_connected',
    currency: 'NZD',
    bankBalance,
    accountsReceivableDue,
    accountsPayableDue,
    stripeNetLast7Days,
    fourteenDayForecast,
    threshold: input.threshold,
    belowThreshold: fourteenDayForecast != null && fourteenDayForecast < input.threshold,
    notes: [
      ...dueSoonNotes,
      ...(connected ? [] : ['Xero is not marked connected; using cached rows only if present.']),
      ...notes,
    ],
  };
}

export function stripeSettlementSummary(input: BusinessPulseCashPosition): string {
  if (input.stripeNetLast7Days === 0) {
    return 'No Stripe settlement movement found in the last seven days.';
  }
  return `Stripe net movement last seven days: NZ$${Math.round(input.stripeNetLast7Days).toLocaleString('en-NZ')}.`;
}

export function calendarWeekAhead(input: BusinessPulseInputs): BusinessPulseWeeklyCommitments {
  const connected = isConnected(input.integrations, 'google_calendar') || isConnected(input.integrations, 'google-workspace');
  const calendarMeta = input.integrations.find((row) =>
    ['google_calendar', 'google-workspace'].includes(String(row.provider_code)),
  )?.metadata;
  const events = Array.isArray(calendarMeta?.week_ahead) ? calendarMeta.week_ahead : [];

  return {
    status: connected ? 'connected' : 'not_connected',
    externalMeetings: events
      .filter((event): event is Record<string, unknown> => event !== null && typeof event === 'object')
      .slice(0, 5)
      .map((event) => ({
        title: String(event.title ?? event.summary ?? 'External meeting'),
        startsAt: typeof event.starts_at === 'string' ? event.starts_at : undefined,
        prepNote: String(event.prep_note ?? 'Check agenda and last thread before the meeting.'),
      })),
    blockedWithKate: events
      .filter((event): event is Record<string, unknown> => {
        if (event === null || typeof event !== 'object') return false;
        return /blocked|kate/i.test(String(event.title ?? event.summary ?? ''));
      })
      .slice(0, 3)
      .map((event) => ({
        title: String(event.title ?? event.summary ?? 'Blocked with Kate'),
        startsAt: typeof event.starts_at === 'string' ? event.starts_at : undefined,
      })),
    notes: connected
      ? ['Calendar connector present; using cached connector metadata until full event cache lands.']
      : ['Calendar connector not connected.'],
  };
}

export function pipelineMovement(input: BusinessPulseInputs): BusinessPulsePipelineMovement | null {
  const connected = isConnected(input.integrations, 'hubspot');
  if (!connected) {
    return {
      status: 'not_connected',
      newDeals: 0,
      movedDeals: 0,
      stuckDeals: [],
      notes: ['HubSpot is not connected for this tenant.'],
    };
  }
  const metadata = input.integrations.find((row) => row.provider_code === 'hubspot')?.metadata ?? {};
  const stuck = Array.isArray(metadata.stuck_deals) ? metadata.stuck_deals : [];
  return {
    status: 'connected',
    newDeals: toNumber(metadata.new_deals_7d),
    movedDeals: toNumber(metadata.moved_deals_7d),
    stuckDeals: stuck
      .filter((deal): deal is Record<string, unknown> => deal !== null && typeof deal === 'object')
      .slice(0, 5)
      .map((deal) => ({
        name: String(deal.name ?? 'Unnamed deal'),
        daysStuck: toNumber(deal.days_stuck),
        stage: typeof deal.stage === 'string' ? deal.stage : undefined,
      })),
    notes: ['HubSpot connector present; stale deals are treated as attention items.'],
  };
}

export function pulseSynthesis({
  cash,
  pipeline,
  commitments,
}: {
  cash: BusinessPulseCashPosition;
  pipeline: BusinessPulsePipelineMovement | null;
  commitments: BusinessPulseWeeklyCommitments;
}): BusinessPulsePriority[] {
  const priorities: BusinessPulsePriority[] = [];

  if (cash.belowThreshold) {
    priorities.push({
      source: 'Xero + Stripe',
      thing: `14-day forecast is below the NZ$${cash.threshold.toLocaleString('en-NZ')} threshold.`,
      recommendedAction: 'Review open invoices and stage reminders for the largest overdue customers.',
      approvalRequired: true,
      stagedAction: {
        kind: 'xero_invoice_reminder',
        status: 'staged',
        note: 'Reminder copy must be reviewed before anything leaves Xero or Gmail.',
      },
    });
  } else if (cash.accountsReceivableDue > 0) {
    priorities.push({
      source: 'Xero',
      thing: `Open receivables total NZ$${Math.round(cash.accountsReceivableDue).toLocaleString('en-NZ')}.`,
      recommendedAction: 'Check the top unpaid invoices and decide whether to draft reminders.',
      approvalRequired: true,
      stagedAction: {
        kind: 'gmail_draft',
        status: 'staged',
        note: 'Follow-up emails can be drafted, never sent automatically.',
      },
    });
  }

  const firstStuckDeal = pipeline?.stuckDeals[0];
  if (firstStuckDeal) {
    priorities.push({
      source: 'HubSpot',
      thing: `${firstStuckDeal.name} has been stuck for ${firstStuckDeal.daysStuck} days${firstStuckDeal.stage ? ` in ${firstStuckDeal.stage}` : ''}.`,
      recommendedAction: 'Stage a short follow-up note or move the deal only after review.',
      approvalRequired: true,
      stagedAction: {
        kind: 'gmail_draft',
        status: 'staged',
        note: 'Deal follow-up is draft-only.',
      },
    });
  }

  const firstMeeting = commitments.externalMeetings[0];
  if (firstMeeting) {
    priorities.push({
      source: 'Google Calendar',
      thing: `${firstMeeting.title} needs prep this week.`,
      recommendedAction: firstMeeting.prepNote,
      approvalRequired: false,
      stagedAction: {
        kind: 'none',
        status: 'not_applicable',
        note: 'Read-only prep item.',
      },
    });
  }

  if (priorities.length === 0) {
    priorities.push({
      source: 'Business Pulse',
      thing: 'No urgent cross-connector issue surfaced in the available data.',
      recommendedAction: 'Use the quiet window to review the latest evidence packs and pilot customer health.',
      approvalRequired: false,
      stagedAction: {
        kind: 'none',
        status: 'not_applicable',
        note: 'Read-only synthesis.',
      },
    });
  }

  return priorities.slice(0, 3);
}

export function nzPrivacyAct2020(markdown: string): BusinessPulseChecks['privacy'] {
  const riskyPatterns = [
    /\b\d{2,3}[-\s]?\d{3}[-\s]?\d{3,4}\b/,
    /\b\d{2}\/\d{2}\/\d{4}\b/,
    /\bIRD\s*\d+/i,
  ];
  const flagged = riskyPatterns.some((pattern) => pattern.test(markdown));
  return {
    passed: !flagged,
    notes: flagged
      ? ['Possible third-party personal information detected; review before sharing outside the tenant.']
      : ['No obvious third-party personal identifiers detected in the brief body.'],
  };
}

export function tikangaCompliance(markdown: string): BusinessPulseChecks['tikanga'] {
  const usedKupu = /\b(kupu|Māori|tikanga|whakapapa|whānau|mahi|kete)\b/i.test(markdown);
  const macronDrift = /\b(Maori|whanau|tikanga Maori|kete Maori)\b/.test(markdown);
  return {
    passed: !macronDrift,
    note: macronDrift
      ? 'Macron drift detected; review te reo Māori before delivery.'
      : usedKupu
        ? 'Te reo Māori terms are used as governance language; macrons checked.'
        : 'No kupu Māori used beyond product names.',
  };
}
