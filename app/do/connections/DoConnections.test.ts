import { createElement, type ComponentProps } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ConnectionsView, DoConnections } from './DoConnections';
import { DO_CAPABILITY_CATALOGUE } from '@/apps/do/shared/capability-catalogue';
import type { State } from './connections-state';

const linkedState: State = {
  signedIn: true,
  configured: true,
  availability: { gmail: true, google_calendar: true, slack: true },
  accountsAvailable: true,
  accounts: [{ app: 'gmail', label: 'Gmail', healthy: true }, { app: 'google_calendar', label: 'Google Calendar', healthy: true }],
  capabilities: [...DO_CAPABILITY_CATALOGUE],
};

function renderConnections(state: State | null, busy = '', overrides: Partial<ComponentProps<typeof ConnectionsView>> = {}) {
  return renderToStaticMarkup(createElement(ConnectionsView, {
    state, mcp: null, busy, message: '', hubToolkitId: '', hubLabel: '', hubMessage: '',
    setHubToolkitId: () => {}, setHubLabel: () => {}, refresh: () => {}, connect: () => {}, attachHubToolkit: () => {},
    ...overrides,
  }));
}

describe('account connection truth', () => {
  it('requires sign-in before showing or acting on any personal connection', () => {
    const html = renderConnections({ ...linkedState, signedIn: false });
    expect(html.includes('Connected / unverified')).toBe(false);
    expect(html.includes('/login?redirect=%2Fdo%2Fconnections')).toBe(true);
    expect(html).toMatch(/<button type="button" disabled="">Sign in · Gmail<\/button>/);
  });
  it('does not leave a failed account request looking like an ongoing check', () => {
    const html = renderConnections(null, '', { message: 'Connections could not be checked. Please try again.' });
    expect(html.includes('Checking available capabilities')).toBe(false);
    expect(html.includes('Account status unavailable')).toBe(true);
    expect(html.includes('role="alert"')).toBe(true);
    expect(html.includes('Open DO sign-in')).toBe(false);
  });
  it('contains an optional technical failure inside the disclosure, leaving connection actions available', () => {
    const html = renderConnections(linkedState, '', { technicalError: 'Technical details could not be checked.' });
    expect(html.includes('Technical details could not be checked.')).toBe(true);
    expect(html.indexOf('Technical connection details')).toBeLessThan(html.indexOf('Technical details could not be checked.'));
    expect(html).toMatch(/<button type="button">Connect Slack<\/button>/);
    expect(html.includes('Loading MCP gateway')).toBe(false);
  });
  it('shows unknown rather than connected or disconnected when the account check failed', () => {
    const html = renderConnections({ ...linkedState, accountsAvailable: false });
    expect(html.includes('Connection status unknown')).toBe(true);
    expect(html.includes('Your connected accounts could not be checked. Their status is currently unknown.')).toBe(true);
    expect(html.includes('Connected / unverified')).toBe(false);
    expect(html.includes('Connect Gmail')).toBe(false);
    expect(html.includes('Reconnect Gmail')).toBe(false);
  });
  it('shows the signed-in account and a linked grant without claiming a verified tool call', () => {
    const html = renderConnections(linkedState);
    expect(html).toContain('Signed in to your DO account');
    expect(html).toContain('Connected / unverified');
    expect(html).toContain('Account linked. No tool call has been verified here.');
    expect(html).toContain('Read with task consent');
    expect(html).toContain('Approval required before changes');
    expect(html).not.toContain('CheckCircle');
    expect(html.indexOf('Read chosen email')).toBeLessThan(html.indexOf('Technical connection details'));
  });
});

describe('Connections reading order', () => {
  it('leads with personal tools and keeps infrastructure in a closed native disclosure', () => {
    const html = renderToStaticMarkup(createElement(DoConnections));
    expect(html).toContain('Connect the tools you use.');
    expect(html).toContain('Your tools');
    expect(html).toMatch(/<details[^>]*><summary[^>]*>Technical connection details/);
    expect(html).not.toMatch(/<details[^>]*\bopen/);
    expect(html.indexOf('Your tools')).toBeLessThan(html.indexOf('Technical connection details'));
    const mainIntro = html.slice(html.indexOf('<main'), html.indexOf('Technical connection details'));
    expect(mainIntro).not.toMatch(/Pipedream|Composio|Zapier|MCP|✦|Four layers/);
    expect(mainIntro).toContain('Linking an account does not grant permission to read private information or make changes.');
  });
});
