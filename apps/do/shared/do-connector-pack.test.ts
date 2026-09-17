import { describe, expect, it } from 'vitest';

import * as pack from './do-connector-pack';
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

  it('pins the Sheets component auth prop explicitly', () => {
    expect(actionMapFromPack().add_sheet_row.google_sheets.authProp).toBe('googleSheets');
  });

  it('pins the Stripe component auth prop explicitly', () => {
    expect(actionMapFromPack().retrieve_invoice.stripe.authProp).toBe('app');
  });

  it('retains the complete audited contract in the generated map', () => {
    const expected = [
      ['gmail-create-draft', '0.2.3', 'gmail', 'gmail', 'write'],
      ['microsoft_outlook-create-draft-email', '0.0.35', 'microsoft_outlook', 'microsoftOutlook', 'write'],
      ['google_calendar-list-events', '0.1.1', 'google_calendar', 'googleCalendar', 'read'],
      ['google_calendar-create-event', '1.1.2', 'google_calendar', 'googleCalendar', 'write'],
      ['google_sheets-add-single-row', '3.0.1', 'google_sheets', 'googleSheets', 'write'],
      ['google_drive-get-file-by-id', '0.0.22', 'google_drive', 'googleDrive', 'read'],
      ['slack_v2-send-message', '0.2.4', 'slack_v2', 'slack', 'write'],
      ['hubspot-create-or-update-contact', '1.0.1', 'hubspot', 'hubspot', 'write'],
      ['salesforce_rest_api-create-lead', '0.4.1', 'salesforce_rest_api', 'salesforce', 'write'],
      ['notion-create-page', '1.0.1', 'notion', 'notion', 'write'],
      ['todoist-create-task', '0.0.12', 'todoist', 'todoist', 'write'],
      ['linear_app-create-issue', '0.4.21', 'linear_app', 'linearApp', 'write'],
      ['stripe-retrieve-invoice', '0.1.5', 'stripe', 'app', 'read'],
      ['dropbox-list-file-folders-in-a-folder', '0.0.14', 'dropbox', 'dropbox', 'read'],
    ];
    expect(DO_PIPEDREAM_ACTION_ENTRIES.map(e => [e.componentId, e.version, e.accountApp, e.authProp, e.effect])).toEqual(expected);
    const map = actionMapFromPack();
    for (const entry of DO_PIPEDREAM_ACTION_ENTRIES) {
      expect(map[entry.action][entry.app]).toEqual(entry);
    }
  });

  it('resolves safe new connection apps separately from display aliases', () => {
    expect(pack.connectionApp?.('slack')).toBe('slack_v2');
    expect(pack.connectionApp?.('slack_v2')).toBe('slack_v2');
    expect(pack.connectionApp?.('gmail')).toBe('gmail');
    expect(pack.connectionApp?.('not-a-pack-app')).toBeNull();
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
