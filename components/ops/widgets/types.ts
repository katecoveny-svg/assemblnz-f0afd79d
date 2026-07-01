/**
 * Shared widget prop types. Kept in one place so brand teams can reuse them
 * across custom widgets without re-deriving shapes.
 */

export type RosterRow = {
  id: string;
  name: string;
  role: string;
  shift: string; // e.g. "07:00 – 15:00"
  hours: number;
  cost: number; // NZD
  demo?: boolean;
};

export type CRMCustomer = {
  id: string;
  name: string;
  stage: 'lead' | 'active' | 'lapsed' | 'vip';
  lastSeen: string; // ISO date
  demo?: boolean;
};

export type CommsDraft = {
  id: string;
  channel: 'sms' | 'email';
  audience: string;
  tone: string;
  preview: string;
  demo?: boolean;
};

export type FinanceTile = {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
};

export type ComplianceItem = {
  id: string;
  date: string; // ISO day
  label: string;
  severity: 'info' | 'warn' | 'critical';
  demo?: boolean;
};

export type UpcomingEvent = {
  id: string;
  name: string;
  when: string; // ISO datetime
  capacity: number;
  reserved: number;
  demo?: boolean;
};

export type LoyaltyState = {
  points: number;
  tier: string;
  nextTierAt: number;
  demo?: boolean;
};

export type ManaReceipt = {
  id: string;
  at: string; // ISO datetime
  kind: string;
  note: string;
  evidence?: string[];
};
