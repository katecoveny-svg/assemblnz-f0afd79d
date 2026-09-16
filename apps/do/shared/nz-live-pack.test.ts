import { describe, expect, it } from 'vitest';

import {
  NZ_LIVE_TOOLS,
  NZ_LIVE_TOOLKIT,
  resolveNzLiveToolStatus,
  nzLiveAllowlistEntries,
} from './nz-live-pack';

describe('NZ Live pack', () => {
  it('names the NZ Live toolkit and covers Kate’s basics', () => {
    expect(NZ_LIVE_TOOLKIT.id).toBe('nz_live');
    const ids = NZ_LIVE_TOOLS.map((t) => t.toolId);
    for (const must of [
      'at_bus_positions',
      'nz_weather_forecast',
      'nzbn_search',
      'waka_kotahi_traffic',
      'geonet_quakes',
      'parliament_bills',
      'nz_fuel_prices',
    ]) {
      expect(ids).toContain(must);
    }
  });

  it('keeps Waka Kotahi and MetService alerts as stubs', () => {
    expect(resolveNzLiveToolStatus(NZ_LIVE_TOOLS.find((t) => t.toolId === 'waka_kotahi_traffic')!)).toBe('stub');
    expect(resolveNzLiveToolStatus(NZ_LIVE_TOOLS.find((t) => t.toolId === 'metservice_alerts')!)).toBe('stub');
  });

  it('marks keyless GeoNet and Open-Meteo weather as live', () => {
    expect(resolveNzLiveToolStatus(NZ_LIVE_TOOLS.find((t) => t.toolId === 'geonet_quakes')!)).toBe('live');
    expect(resolveNzLiveToolStatus(NZ_LIVE_TOOLS.find((t) => t.toolId === 'nz_weather_forecast')!)).toBe('live');
  });

  it('exports allowlist entries without secrets', () => {
    const entries = nzLiveAllowlistEntries();
    expect(entries.every((e) => e.provider === 'nz_live')).toBe(true);
    expect(JSON.stringify(entries)).not.toMatch(/client_secret|access_token|sk-[a-z0-9]|Bearer [A-Za-z0-9]/i);
  });
});
