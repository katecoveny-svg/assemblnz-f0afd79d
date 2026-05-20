import { formatNZD, formatNumber, formatPct } from './currency';

export type ToolLink = {
  slug: string;
  eyebrow: 'CALCULATOR' | 'DIAGNOSTIC';
  title: string;
  description: string;
  timeToRun: string;
  href: string;
};

export const aratakiTools: ToolLink[] = [
  {
    slug: 'missed-service-call-revenue',
    eyebrow: 'CALCULATOR',
    title: 'Missed Service Call Revenue',
    description: 'Estimate the service revenue lost when workshop calls drift to voicemail.',
    timeToRun: '90 seconds',
    href: '/kete/arataki/tools/missed-service-call-revenue',
  },
  {
    slug: 'lead-response-leakage',
    eyebrow: 'CALCULATOR',
    title: 'Lead Response Leakage',
    description: 'Show the gross-profit gap between slow lead handling and five-minute response.',
    timeToRun: '90 seconds',
    href: '/kete/arataki/tools/lead-response-leakage',
  },
  {
    slug: 'first-service-retention',
    eyebrow: 'CALCULATOR',
    title: 'First-Service Retention',
    description: 'Put a lifetime-value number on customers who miss their first scheduled service.',
    timeToRun: '2 minutes',
    href: '/kete/arataki/tools/first-service-retention',
  },
  {
    slug: 'declined-work-recovery',
    eyebrow: 'CALCULATOR',
    title: 'Declined Work Recovery',
    description: 'Calculate the annual upside from structured follow-up on declined workshop quotes.',
    timeToRun: '90 seconds',
    href: '/kete/arataki/tools/declined-work-recovery',
  },
  {
    slug: 'service-lane-trade-in',
    eyebrow: 'CALCULATOR',
    title: 'Service Lane Trade-In',
    description: 'Estimate additional sales gross profit from matching service visitors to sales timing.',
    timeToRun: '2 minutes',
    href: '/kete/arataki/tools/service-lane-trade-in',
  },
  {
    slug: 'fleet-uptime',
    eyebrow: 'CALCULATOR',
    title: 'Fleet Uptime',
    description: 'Quantify how much downtime reduction is worth to commercial fleet customers.',
    timeToRun: '90 seconds',
    href: '/kete/arataki/tools/fleet-uptime',
  },
  {
    slug: 'workflow-roi',
    eyebrow: 'CALCULATOR',
    title: 'Workflow ROI',
    description: 'Model payback for any assembl workflow before a dealer commits.',
    timeToRun: '90 seconds',
    href: '/kete/arataki/tools/workflow-roi',
  },
  {
    slug: 'nz-listing-compliance-checker',
    eyebrow: 'CALCULATOR',
    title: 'NZ Listing Compliance Checker',
    description: 'Check whether a public vehicle listing is ready, warning-only, or blocked.',
    timeToRun: '3 minutes',
    href: '/kete/arataki/tools/nz-listing-compliance-checker',
  },
  {
    slug: 'diagnostic',
    eyebrow: 'DIAGNOSTIC',
    title: 'Dealer Operations Diagnostic',
    description: 'Twenty questions across service, workshop, retention, lead response, F&I, and compliance.',
    timeToRun: '3 minutes',
    href: '/kete/arataki/diagnostic',
  },
];

export type BreakdownRow = { label: string; value: string };

export function missedServiceCallRevenue(input: {
  bookingsPerMonth: number;
  revenuePerService: number;
  voicemailPct: number;
  voicemailConversionPct: number;
}) {
  const callsPerMonth = input.bookingsPerMonth / 0.65;
  const callsToVoicemail = callsPerMonth * (input.voicemailPct / 100);
  const voicemailsNotBooking = callsToVoicemail * (1 - input.voicemailConversionPct / 100);
  const missedRevenuePerMonth = voicemailsNotBooking * input.revenuePerService;
  const missedRevenuePerYear = missedRevenuePerMonth * 12;
  return {
    headline: formatNZD(missedRevenuePerYear, { suffix: '/ year' }),
    rows: [
      { label: 'Calls per month go to voicemail', value: formatNumber(callsToVoicemail) },
      { label: 'Of those never book', value: formatNumber(voicemailsNotBooking) },
      { label: 'Each missed booking', value: formatNZD(input.revenuePerService) },
      { label: 'Annual impact', value: formatNZD(missedRevenuePerYear) },
    ],
  };
}

export function leadResponseLeakage(input: {
  enquiries: number;
  gpPerSale: number;
  currentPct5Min: number;
  targetPct5Min: number;
}) {
  const currentFast = input.enquiries * (input.currentPct5Min / 100);
  const currentSlow = input.enquiries * (1 - input.currentPct5Min / 100);
  const targetFast = input.enquiries * (input.targetPct5Min / 100);
  const targetSlow = input.enquiries * (1 - input.targetPct5Min / 100);
  const currentConversions = currentFast * 0.21 + currentSlow * 0.04;
  const targetConversions = targetFast * 0.21 + targetSlow * 0.04;
  const additionalSalesPerMonth = Math.max(0, targetConversions - currentConversions);
  const additionalGpPerYear = additionalSalesPerMonth * input.gpPerSale * 12;
  return {
    headline: formatNZD(additionalGpPerYear, { suffix: '/ year' }),
    rows: [
      { label: 'Current monthly conversions', value: `${formatNumber(currentConversions, 1)} cars` },
      { label: `At ${formatPct(input.targetPct5Min)} within 5 minutes`, value: `${formatNumber(targetConversions, 1)} cars` },
      { label: 'Additional sales', value: `${formatNumber(additionalSalesPerMonth, 1)} / month` },
      { label: 'Annual gross-profit uplift', value: formatNZD(additionalGpPerYear) },
    ],
  };
}

export function firstServiceRetention(input: {
  salesPerYear: number;
  currentRetention: number;
  lifetimeRevenue: number;
  targetRetention: number;
}) {
  const currentRetained = input.salesPerYear * (input.currentRetention / 100);
  const currentLost = input.salesPerYear - currentRetained;
  const targetRetained = input.salesPerYear * (input.targetRetention / 100);
  const additionalRetained = Math.max(0, targetRetained - currentRetained);
  const lifetimeValueRecovered = additionalRetained * input.lifetimeRevenue;
  return {
    headline: formatNZD(lifetimeValueRecovered),
    rows: [
      { label: 'Current first-service retention', value: formatPct(input.currentRetention) },
      { label: 'Customers lost per cohort', value: formatNumber(currentLost) },
      { label: 'Lifetime value of each lost customer', value: formatNZD(input.lifetimeRevenue) },
      { label: `If lifted to ${formatPct(input.targetRetention)}`, value: `${formatNumber(additionalRetained)} recovered customers` },
      { label: 'Lifetime value recovered', value: formatNZD(lifetimeValueRecovered) },
    ],
  };
}

export function declinedWorkRecovery(input: {
  declinedQuotes: number;
  ticketValue: number;
  currentFollowup: number;
  targetFollowup: number;
  recoveryConversion: number;
}) {
  const currentFollowedUp = input.declinedQuotes * (input.currentFollowup / 100);
  const currentRecovered = currentFollowedUp * (input.recoveryConversion / 100);
  const targetFollowedUp = input.declinedQuotes * (input.targetFollowup / 100);
  const targetRecovered = targetFollowedUp * (input.recoveryConversion / 100);
  const additionalRecoveredPerMonth = Math.max(0, targetRecovered - currentRecovered);
  const additionalRevenuePerYear = additionalRecoveredPerMonth * input.ticketValue * 12;
  return {
    headline: formatNZD(additionalRevenuePerYear, { suffix: '/ year' }),
    rows: [
      { label: 'Declined quotes per month', value: formatNumber(input.declinedQuotes) },
      { label: 'Currently followed up', value: `${formatPct(input.currentFollowup)} = ${formatNumber(currentFollowedUp)}` },
      { label: `At ${formatPct(input.targetFollowup)} follow-up`, value: `${formatNumber(targetFollowedUp)} jobs in pipeline` },
      { label: 'Additional recovered jobs', value: `${formatNumber(additionalRecoveredPerMonth, 1)} / month` },
      { label: 'Annual recovery', value: formatNZD(additionalRevenuePerYear) },
    ],
  };
}

export function serviceLaneTradeIn(input: {
  serviced: number;
  windowPct: number;
  currentIdentification: number;
  targetIdentification: number;
  salesConversion: number;
  gpPerSale: number;
}) {
  const inWindow = input.serviced * (input.windowPct / 100);
  const currentIdentified = inWindow * (input.currentIdentification / 100);
  const targetIdentified = inWindow * (input.targetIdentification / 100);
  const additionalIdentified = Math.max(0, targetIdentified - currentIdentified);
  const additionalSalesPerMonth = additionalIdentified * (input.salesConversion / 100);
  const additionalGpPerYear = additionalSalesPerMonth * input.gpPerSale * 12;
  return {
    headline: formatNZD(additionalGpPerYear, { suffix: '/ year' }),
    rows: [
      { label: 'Customers in trade-up window', value: `${formatNumber(inWindow)} / month` },
      { label: 'Currently identified', value: formatNumber(currentIdentified) },
      { label: 'Target identified', value: formatNumber(targetIdentified) },
      { label: 'Additional sales', value: `${formatNumber(additionalSalesPerMonth, 1)} / month` },
      { label: 'Annual gross-profit uplift', value: formatNZD(additionalGpPerYear) },
    ],
  };
}

export function fleetUptime(input: {
  fleetSize: number;
  downtimeHours: number;
  costPerHour: number;
  reductionPct: number;
}) {
  const currentTotalCost = input.fleetSize * input.downtimeHours * input.costPerHour;
  const targetDowntime = input.downtimeHours * (1 - input.reductionPct / 100);
  const targetTotalCost = input.fleetSize * targetDowntime * input.costPerHour;
  const savingsPerYear = Math.max(0, currentTotalCost - targetTotalCost);
  return {
    headline: formatNZD(savingsPerYear, { suffix: '/ year' }),
    rows: [
      { label: 'Current downtime cost', value: formatNZD(currentTotalCost) },
      { label: 'Target downtime per vehicle', value: `${formatNumber(targetDowntime)} hours` },
      { label: 'Target downtime cost', value: formatNZD(targetTotalCost) },
      { label: 'Annual uptime saving', value: formatNZD(savingsPerYear) },
    ],
  };
}

export function workflowRoi(input: {
  hoursPerWeek: number;
  hourlyCost: number;
  additionalRevenue: number;
  evalMonths: number;
  assemblMonthly: number;
}) {
  const hoursSavedPerYear = input.hoursPerWeek * 52;
  const labourValue = hoursSavedPerYear * input.hourlyCost;
  const revenueUnlocked = input.additionalRevenue * 12;
  const totalValuePerYear = labourValue + revenueUnlocked;
  const totalCostPerYear = input.assemblMonthly * 12;
  const netValue = totalValuePerYear - totalCostPerYear;
  const roiMultiple = totalCostPerYear > 0 ? totalValuePerYear / totalCostPerYear : 0;
  const monthlyValue = totalValuePerYear / 12;
  const monthsToPayback = monthlyValue > 0 ? input.assemblMonthly / monthlyValue : 0;
  return {
    headline: `${formatNumber(roiMultiple, 1)}x ROI`,
    rows: [
      { label: 'Hours saved annually', value: formatNumber(hoursSavedPerYear) },
      { label: 'Labour value', value: formatNZD(labourValue) },
      { label: 'Revenue unlocked', value: formatNZD(revenueUnlocked) },
      { label: 'Total value', value: formatNZD(totalValuePerYear, { suffix: '/ year' }) },
      { label: 'assembl cost', value: formatNZD(totalCostPerYear, { suffix: '/ year' }) },
      { label: 'Net value', value: formatNZD(netValue) },
      { label: 'Payback period', value: `${formatNumber(monthsToPayback, 1)} months` },
    ],
  };
}

export type ListingStatus = 'pass' | 'warning' | 'fail';

export function listingCompliance(input: {
  odometerKm: number;
  wofStatus: 'current' | 'expires-soon' | 'expired';
  registrationStatus: 'current' | 'expired';
  writtenOffHistory: boolean;
  ppsrNotClear: boolean;
  cinAttached: boolean;
  accurateDescription: boolean;
  actualVehiclePhoto: boolean;
  mileageConsistent: boolean;
  importedVehicle: boolean;
  importSpecDisclosed: boolean;
}) {
  const issues: Array<{ status: ListingStatus; check: string; cite: string }> = [];
  if (!input.cinAttached) issues.push({ status: 'fail', check: 'Consumer Information Notice missing', cite: 'Motor Vehicle Sales Act 2003 s47' });
  if (!input.accurateDescription) issues.push({ status: 'fail', check: 'Vehicle description is not confirmed accurate', cite: 'Fair Trading Act 1986' });
  if (!input.mileageConsistent) issues.push({ status: 'fail', check: 'Mileage does not match available history', cite: 'Fair Trading Act 1986' });
  if (input.ppsrNotClear) issues.push({ status: 'fail', check: 'PPSR/security interest is not clear', cite: 'PPSR Act 1999' });
  if (input.wofStatus === 'expired') issues.push({ status: 'fail', check: 'WoF is expired', cite: 'Consumer Guarantees Act 1993 s6' });
  if (input.registrationStatus === 'expired') issues.push({ status: 'warning', check: 'Registration is expired and must be disclosed clearly', cite: 'Fair Trading Act 1986' });
  if (input.wofStatus === 'expires-soon') issues.push({ status: 'warning', check: 'WoF expires within 30 days', cite: 'Fair Trading Act 1986' });
  if (input.writtenOffHistory) issues.push({ status: 'warning', check: 'Written-off history must be disclosed plainly', cite: 'Fair Trading Act 1986' });
  if (!input.actualVehiclePhoto) issues.push({ status: 'warning', check: 'Listing should use photos of the actual vehicle', cite: 'Fair Trading Act 1986' });
  if (input.importedVehicle && !input.importSpecDisclosed) issues.push({ status: 'warning', check: 'Imported vehicle original specification not disclosed', cite: 'Fair Trading Act 1986' });

  const status: ListingStatus = issues.some((item) => item.status === 'fail')
    ? 'fail'
    : issues.some((item) => item.status === 'warning')
      ? 'warning'
      : 'pass';
  return {
    status,
    headline: status === 'pass' ? 'Pass' : status === 'warning' ? 'Pass with warnings' : 'Fail',
    rows: issues.length
      ? issues.map((item) => ({ label: item.check, value: item.cite }))
      : [{ label: 'Listing checks', value: 'No blocking issues found' }],
  };
}
