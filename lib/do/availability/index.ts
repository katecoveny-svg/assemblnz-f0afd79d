export * from './contracts';
export * from './search';
export * from './preparation';
export * from './adapters';

/** Always reachable independently of search and provider setup. No diagnosis,
 * reassurance about waiting, active monitoring or promise to call anyone.
 * Phone details are intentionally not copied without fresh source verification.
 */
export const appointmentHelpBoundary = {
  message: 'This helps with appointment administration. It does not assess symptoms or whether it is safe to wait. For emergency help or advice about which health service to use, open the official NZ guidance now.',
  label: 'Which health service should I use?',
  url: 'https://www.healthnz.govt.nz/hospitals-services/which-health-service-should-i-use',
  externalAction: 'none' as const,
};
