/**
 * Happy Tails Daycare OS tab keys — shared between the server page and the
 * client dashboard. Keep this file free of 'use client' so App Router pages
 * can import tab constants at build time.
 */

export const HT_OS_TABS = [
  { key: 'week', label: "Liana's Week" },
  { key: 'landing', label: 'Landing hub' },
  { key: 'leads', label: 'Enrolment triage' },
  { key: 'dogs', label: 'Dog CRM' },
  { key: 'journey', label: 'Care journey' },
  { key: 'packs', label: 'Welcome studio' },
  { key: 'social', label: 'Social studio' },
  { key: 'support', label: 'Owner support' },
  { key: 'time', label: 'Time cockpit' },
  { key: 'hiring', label: 'Hiring OS' },
  { key: 'agents', label: 'Agent mesh' },
] as const;

export type HtOsTab = (typeof HT_OS_TABS)[number]['key'];
