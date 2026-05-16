import type { BusinessPulseBrief } from './types';

function money(value: number | null | undefined): string {
  if (value == null) return 'n/a';
  return `NZ$${Math.round(value).toLocaleString('en-NZ')}`;
}

export function businessPulseDrivePath(orgSlug: string, briefDate: string): string {
  return `Assembl-Drive/${orgSlug}/business-pulse/${briefDate}-pulse.md`;
}

export function renderBusinessPulseMarkdown(brief: Omit<BusinessPulseBrief, 'markdown'>): string {
  const lines: string[] = [
    `# Business Pulse — ${brief.orgName}`,
    '',
    `**Date:** ${brief.briefDate}`,
    `**Path:** ${brief.drivePath}`,
    '',
    '## Three things that need you today',
    '',
    ...brief.threeThings.flatMap((item, index) => [
      `${index + 1}. **${item.source}:** ${item.thing}`,
      `   - Next action: ${item.recommendedAction}`,
      `   - Approval: ${item.approvalRequired ? 'required before any outbound action' : 'read-only'}`,
    ]),
    '',
    '## Cash position',
    '',
    `- Current bank balance: ${money(brief.cashPosition.bankBalance)}`,
    `- Accounts receivable due: ${money(brief.cashPosition.accountsReceivableDue)}`,
    `- Accounts payable due: ${money(brief.cashPosition.accountsPayableDue)}`,
    `- Stripe net movement, last seven days: ${money(brief.cashPosition.stripeNetLast7Days)}`,
    `- 14-day forecast: ${money(brief.cashPosition.fourteenDayForecast)}`,
    `- Threshold: ${money(brief.cashPosition.threshold)}`,
    `- Status: ${brief.cashPosition.belowThreshold ? 'below threshold' : 'inside threshold'}`,
    '',
  ];

  if (brief.pipelineMovement) {
    lines.push(
      '## Pipeline movement',
      '',
      `- Status: ${brief.pipelineMovement.status}`,
      `- New deals: ${brief.pipelineMovement.newDeals}`,
      `- Moved deals: ${brief.pipelineMovement.movedDeals}`,
      `- Stuck deals: ${
        brief.pipelineMovement.stuckDeals.length > 0
          ? brief.pipelineMovement.stuckDeals
              .map((deal) => `${deal.name} (${deal.daysStuck} days)`)
              .join(', ')
          : 'none surfaced'
      }`,
      '',
    );
  }

  lines.push(
    "## This week's commitments",
    '',
    brief.weeklyCommitments.externalMeetings.length > 0
      ? brief.weeklyCommitments.externalMeetings
          .map((event) => `- ${event.title}${event.startsAt ? ` — ${event.startsAt}` : ''}: ${event.prepNote}`)
          .join('\n')
      : '- No calendar commitments surfaced from connected data.',
    '',
    '## Pilot customer health',
    '',
    brief.pilotHealth.customers.length > 0
      ? brief.pilotHealth.customers
          .map(
            (customer) =>
              `- ${customer.name}: last active ${customer.lastActiveAt ?? 'unknown'}, ${customer.errorsLast7Days} errors last seven days, billing ${customer.billingStatus ?? 'unknown'}`,
          )
          .join('\n')
      : '- No pilot health rows configured.',
    '',
    '## Tikanga check',
    '',
    `- ${brief.checks.tikanga.note}`,
    `- Privacy Act 2020 check: ${brief.checks.privacy.passed ? 'passed' : 'review required'}`,
    '',
    '## Source status',
    '',
    ...Object.entries(brief.sourceStatus).map(([source, status]) => `- ${source}: ${status}`),
    '',
    '> Read-only synthesis. Any send, post, pay, reschedule, or data-changing action must be staged for named human approval.',
  );

  return lines.join('\n');
}
