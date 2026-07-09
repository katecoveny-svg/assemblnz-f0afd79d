/**
 * Fred OS tab keys — shared between the server page and the client dashboard.
 * Kept out of `'use client'` modules so Next can evaluate them during build.
 */

export const FRED_TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'leads', label: 'Leads' },
  { key: 'dogs', label: 'Dogs' },
  { key: 'programmes', label: 'Programmes' },
  { key: 'notes', label: 'Notes engine' },
  { key: 'course', label: 'Course' },
  { key: 'support', label: 'Support' },
  { key: 'hiring', label: 'Hiring' },
] as const;

export type FredTabKey = (typeof FRED_TABS)[number]['key'];
