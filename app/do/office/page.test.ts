import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ owner: vi.fn(), jobs: vi.fn(), legacy: vi.fn() }));
vi.mock('@/apps/do/services/owner', () => ({ doOwner: mocks.owner }));
vi.mock('@/apps/do/services/office-jobs', () => ({ listOwnerBuilderJobs: mocks.jobs }));
vi.mock('@/apps/do/shared/store', () => ({ listAgents: mocks.legacy }));
vi.mock('@/components/do/DoTaskPanel', () => ({ DoTaskPanel: () => null }));
vi.mock('@/components/do/DoTaskStrip', () => ({ DoTaskStrip: () => null }));
vi.mock('./DoOfficeSpatial', () => ({ DoOfficeSpatial: () => null }));
vi.mock('./TaskDoHandoffBanner', () => ({ TaskDoHandoffBanner: () => null }));
import Page from './page';

beforeEach(() => { mocks.owner.mockReset().mockResolvedValue(null); mocks.jobs.mockReset().mockResolvedValue([]); mocks.legacy.mockReset().mockResolvedValue([]); });
describe('Office owner projection', () => {
  it('never reads the unowned retired store into a public Office', async () => {
    renderToStaticMarkup(await Page());
    expect(mocks.legacy).not.toHaveBeenCalled();
    expect(mocks.jobs).not.toHaveBeenCalled();
  });
  it('shows unavailable storage rather than an empty successful workspace', async () => {
    mocks.owner.mockResolvedValue({id:'owner-a'}); mocks.jobs.mockRejectedValue(new Error('database unavailable'));
    const html=renderToStaticMarkup(await Page());
    expect(html).toContain('Office storage is unavailable');
    expect(html).not.toContain('Demo agents remain local');
    expect(mocks.jobs).toHaveBeenCalledWith('owner-a');
    expect(mocks.legacy).not.toHaveBeenCalled();
  });
});
