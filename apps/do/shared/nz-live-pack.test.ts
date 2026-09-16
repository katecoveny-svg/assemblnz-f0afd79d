import { describe, expect, it } from 'vitest';

import {
  NZ_LIVE_TOOLS,
  NZ_LIVE_TOOLKIT,
  NZ_LIVE_NAMED_TOOLKITS,
  resolveNzLiveToolStatus,
  resolveNzLiveToolStatusWithEdgeHint,
  nzLiveAllowlistEntries,
  toolsForNamedToolkit,
} from './nz-live-pack';

describe('NZ Live pack', () => {
  it('names the NZ Live toolkit and eight named product toolkits', () => {
    expect(NZ_LIVE_TOOLKIT.id).toBe('nz_live');
    expect(NZ_LIVE_NAMED_TOOLKITS.map((k) => k.label)).toEqual([
      'Travel NZ',
      'Civic Watch',
      'SME Compliance',
      'Household Floor NZ',
      'Property NZ',
      'Hazard NZ',
      'Energy & Cost',
      'Media Pulse',
    ]);
    expect(NZ_LIVE_TOOLKIT.groceryNote).toMatch(/browser-seat/i);
  });

  it('covers shipped + P0 + P1 tool ids', () => {
    const ids = NZ_LIVE_TOOLS.map((t) => t.toolId);
    for (const must of [
      'at_bus_positions',
      'waka_kotahi_traffic',
      'waka_kotahi_cameras',
      'civil_defence_alerthub',
      'geonet_cap',
      'metservice_cap',
      'hazard_cap_bundle',
      'metlink_transit',
      'metro_chch_transit',
      'ea_emi_icp',
      'linz_wfs_parcels',
      'schools_directory',
      'stats_nz_portal',
      'nzbn_search',
      'pco_legislation',
    ]) {
      expect(ids).toContain(must);
    }
  });

  it('marks Waka and Hazard CAP feeds live; city parity and P1 as stubs', () => {
    expect(resolveNzLiveToolStatus(NZ_LIVE_TOOLS.find((t) => t.toolId === 'waka_kotahi_traffic')!)).toBe('live');
    expect(resolveNzLiveToolStatus(NZ_LIVE_TOOLS.find((t) => t.toolId === 'civil_defence_alerthub')!)).toBe('live');
    expect(resolveNzLiveToolStatus(NZ_LIVE_TOOLS.find((t) => t.toolId === 'metlink_transit')!)).toBe('stub');
    expect(resolveNzLiveToolStatus(NZ_LIVE_TOOLS.find((t) => t.toolId === 'ea_emi_icp')!)).toBe('stub');
    expect(resolveNzLiveToolStatus(NZ_LIVE_TOOLS.find((t) => t.toolId === 'linz_wfs_parcels')!)).toBe('stub');
    expect(resolveNzLiveToolStatus(NZ_LIVE_TOOLS.find((t) => t.toolId === 'metservice_alerts')!)).toBe('stub');
  });

  it('keeps NZBN as honest needs_key without inventing a key', () => {
    expect(resolveNzLiveToolStatus(NZ_LIVE_TOOLS.find((t) => t.toolId === 'nzbn_search')!)).toBe('needs_key');
  });

  it('groups Hazard NZ CAP tools together', () => {
    const hazard = toolsForNamedToolkit('hazard_nz').map((t) => t.toolId);
    expect(hazard).toEqual(expect.arrayContaining([
      'civil_defence_alerthub',
      'geonet_cap',
      'metservice_cap',
      'hazard_cap_bundle',
      'geonet_quakes',
    ]));
  });

  it('scopes PCO to the single supabase_edge PCO_API_KEY path', () => {
    const pco = NZ_LIVE_TOOLS.find((t) => t.toolId === 'pco_legislation')!;
    expect(pco.envKeys).toEqual(['PCO_API_KEY']);
    expect(pco.secretScope).toBe('supabase_edge');
    expect(resolveNzLiveToolStatusWithEdgeHint(pco, { pco_legislation: true })).toBe('live');
  });

  it('exports allowlist entries without secrets or supermarket claims', () => {
    const entries = nzLiveAllowlistEntries();
    expect(entries.every((e) => e.provider === 'nz_live')).toBe(true);
    expect(JSON.stringify(entries)).not.toMatch(/client_secret|access_token|sk-[a-z0-9]|Bearer [A-Za-z0-9]|PCO_API_KEY=\S+|countdown|new world|pak.?n.?save/i);
  });
});
