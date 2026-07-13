/**
 * Sam OS tab keys — shared between the server page and the client dashboard.
 */

export const FRED_TABS = [
  { key: 'week', label: 'Today' },
  { key: 'brief', label: 'Morning brief' },
  { key: 'genome', label: 'Business Genome' },
  { key: 'work', label: 'Work & proof' },
  { key: 'connections', label: 'Connections' },
  { key: 'landing', label: 'Landing hub' },
  { key: 'leads', label: 'Lead triage' },
  { key: 'dogs', label: 'Training CRM' },
  { key: 'programmes', label: 'Programme OS' },
  { key: 'notes', label: 'Session scribe' },
  { key: 'course', label: 'Course studio' },
  { key: 'social', label: 'Social studio' },
  { key: 'support', label: 'Support' },
  { key: 'time', label: 'Time cockpit' },
  { key: 'hiring', label: 'Hiring OS' },
  { key: 'agents', label: 'Agent mesh' },
] as const;

export type FredTabKey = (typeof FRED_TABS)[number]['key'];
