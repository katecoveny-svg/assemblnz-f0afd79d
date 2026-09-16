import { describe, expect, it } from 'vitest';

import { CONNECTABLE_DO_APPS } from './capability-catalogue';
import {
  DO_CONNECTOR_PACK,
  DO_PIPEDREAM_ACTION_ENTRIES,
  actionMapFromPack,
  householdFloorConnectorRequirements,
  matchesPackApp,
  packAppSlugs,
} from './do-connector-pack';

describe('DO connector pack', () => {
  it('ships must-have apps for Assembl DOs', () => {
    const slugs = packAppSlugs();
    for (const must of ['gmail', 'google_calendar', 'google_sheets', 'google_drive', 'slack', 'hubspot']) {
      expect(slugs).toContain(must);
      expect(CONNECTABLE_DO_APPS.has(must)).toBe(true);
    }
  });

  it('maps real Pipedream component ids for the pack actions', () => {
    const map = actionMapFromPack();
    expect(map.create_email_draft?.gmail?.componentId).toBe('gmail-create-draft');
    expect(map.list_calendar_events?.google_calendar?.componentId).toBe('google_calendar-list-events');
    expect(map.add_sheet_row?.google_sheets?.componentId).toBe('google_sheets-add-single-row');
    expect(map.post_slack_message?.slack?.componentId).toBe('slack_v2-send-message');
    expect(map.create_lead?.hubspot?.componentId).toBe('hubspot-create-or-update-contact');
    expect(DO_PIPEDREAM_ACTION_ENTRIES.length).toBeGreaterThanOrEqual(10);
    expect(JSON.stringify(DO_PIPEDREAM_ACTION_ENTRIES)).not.toMatch(/client_secret|access_token/i);
  });

  it('treats slack_v2 accounts as slack for Connect matching', () => {
    expect(matchesPackApp('slack_v2', 'slack')).toBe(true);
    expect(matchesPackApp('gmail', 'gmail')).toBe(true);
    expect(matchesPackApp('hubspot', 'gmail')).toBe(false);
  });

  it('keeps Household Floor connectors optional and scrubbed', () => {
    const publicReqs = householdFloorConnectorRequirements('public_template');
    expect(publicReqs.map((row) => row.app)).toEqual(['gmail', 'google_calendar']);
    expect(publicReqs.every((row) => row.required === false)).toBe(true);
    expect(DO_CONNECTOR_PACK.find((app) => app.slug === 'gmail')?.safety).toMatch(/Drafts only/i);
  });

  it('marks Slack / CRM / Sheets / Notion / tasks as approval-required', () => {
    for (const entry of DO_PIPEDREAM_ACTION_ENTRIES) {
      if (['post_slack_message', 'create_lead', 'add_sheet_row', 'create_notion_page', 'create_task'].includes(entry.action)) {
        expect(entry.approvalRequired).toBe(true);
      }
      if (entry.action === 'create_email_draft') {
        expect(entry.approvalRequired).toBe(false);
      }
    }
  });
});
