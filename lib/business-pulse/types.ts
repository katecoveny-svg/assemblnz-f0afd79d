import type { SupabaseClient } from '@supabase/supabase-js';

export type BusinessPulsePriority = {
  source: string;
  thing: string;
  recommendedAction: string;
  approvalRequired: boolean;
  stagedAction?: {
    kind: 'gmail_draft' | 'xero_invoice_reminder' | 'calendar_reschedule' | 'none';
    status: 'staged' | 'not_applicable';
    note: string;
  };
};

export type BusinessPulseCashPosition = {
  status: 'connected' | 'not_connected' | 'error';
  currency: 'NZD';
  bankBalance: number | null;
  accountsReceivableDue: number;
  accountsPayableDue: number;
  stripeNetLast7Days: number;
  fourteenDayForecast: number | null;
  threshold: number;
  belowThreshold: boolean;
  notes: string[];
};

export type BusinessPulsePipelineMovement = {
  status: 'connected' | 'not_connected';
  newDeals: number;
  movedDeals: number;
  stuckDeals: Array<{ name: string; daysStuck: number; stage?: string }>;
  notes: string[];
};

export type BusinessPulseWeeklyCommitments = {
  status: 'connected' | 'not_connected';
  externalMeetings: Array<{ title: string; startsAt?: string; prepNote: string }>;
  blockedWithKate: Array<{ title: string; startsAt?: string }>;
  notes: string[];
};

export type BusinessPulsePilotHealth = {
  status: 'available' | 'not_configured';
  customers: Array<{
    name: string;
    lastActiveAt: string | null;
    errorsLast7Days: number;
    billingStatus: string | null;
  }>;
  notes: string[];
};

export type BusinessPulseChecks = {
  privacy: {
    passed: boolean;
    notes: string[];
  };
  tikanga: {
    passed: boolean;
    note: string;
  };
};

export type BusinessPulseBrief = {
  id?: string;
  orgId: string;
  orgSlug: string;
  orgName: string;
  briefDate: string;
  drivePath: string;
  markdown: string;
  threeThings: BusinessPulsePriority[];
  cashPosition: BusinessPulseCashPosition;
  pipelineMovement: BusinessPulsePipelineMovement | null;
  weeklyCommitments: BusinessPulseWeeklyCommitments;
  pilotHealth: BusinessPulsePilotHealth;
  checks: BusinessPulseChecks;
  sourceStatus: Record<string, 'connected' | 'not_connected' | 'error'>;
  createdAt?: string;
};

export type BusinessPulseContext = {
  supabase: SupabaseClient;
  tenantId: string;
  actorUserId?: string | null;
  asOf?: Date;
  manual?: boolean;
};
