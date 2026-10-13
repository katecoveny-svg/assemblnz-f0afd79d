import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
vi.mock('../personal/PersonalDo', () => ({ PersonalDo: () => null }));
vi.mock('./HouseholdFloorClient', () => ({ HouseholdFloorClient: () => null }));
import Page, { metadata } from './page';
import { PersonalDo } from '../personal/PersonalDo';
import { HouseholdFloorClient } from './HouseholdFloorClient';

describe('household route compatibility', () => {
  it('opens the existing DO workspace with household context', async () => {
    const result = await Page({});
    expect(result.type).toBe(PersonalDo);
    expect(result.props.context).toBe('household');
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
  it.each([{ view: 'sample' }, { install: 'public' }, { install: 'owner-private' }, { install: 'private' }])('preserves explicit sample/install links %j', async params => {
    const result = await Page({ searchParams: Promise.resolve(params) });
    expect(result.type).toBe(HouseholdFloorClient);
    expect(result.props.initialPrivate).toBe(params.install === 'owner-private' || params.install === 'private');
  });
  it('returns both legacy connector sign-in paths to the sample workspace', async () => {
    const source = readFileSync('app/do/household/HouseholdFloorClient.tsx', 'utf8');
    const loginLinks = source.match(/\/login\?redirect=[^'"\s]+/g) ?? [];
    expect(loginLinks).toHaveLength(2);
    for (const loginLink of loginLinks) {
      const returnPath = new URL(loginLink, 'https://example.test').searchParams.get('redirect');
      const destination = new URL(returnPath!, 'https://example.test');
      expect(destination.pathname).toBe('/do/household');
      const result = await Page({ searchParams: Promise.resolve(Object.fromEntries(destination.searchParams)) });
      expect(result.type).toBe(HouseholdFloorClient);
      expect(result.props.initialPrivate).toBe(false);
    }
  });
  it('does not treat unknown views as permission to install a sample', async () => {
    const result = await Page({ searchParams: Promise.resolve({ view: 'unknown' }) });
    expect(result.type).toBe(PersonalDo);
  });
});
