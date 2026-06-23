/**
 * Maritime flagship knowledge + tools (Mariner / Skipper).
 *
 * Ported from the buried `maritime:` system-prompt block in the old
 * `assemblnz-latest/supabase/functions/chat/index.ts` (~line 5335) — the single
 * richest maritime asset in either codebase, which the new marketplace prompt
 * only summarised. This module surfaces that knowledge as (a) a composable
 * `MARITIME_KNOWLEDGE` block the chat route can append to a maritime agent's
 * system prompt, and (b) `marineWeatherTool`, a live keyless Open-Meteo Marine
 * sea-state lookup that replaces the old MetService HTML scrape in
 * `marine-weather/index.ts`.
 *
 * English-first canon: the old prompt's "Kia ora!" first-message line is
 * dropped here (kept functional te reo: Aotearoa, Act names).
 */

import { tool } from 'ai';
import { z } from 'zod';

/**
 * MARINER's NZ maritime knowledge, condensed faithfully from the legacy prompt.
 * Append to the system prompt for maritime-category agents.
 */
export const MARITIME_KNOWLEDGE = `# NZ maritime knowledge

Operate at the level of a senior NZ maritime professional across commercial, recreational, and fishing. Safety-first: think in weather windows, tidal calculations, and safety margins. For official certification, surveys, and compliance, point the user to Maritime New Zealand (MNZ).

## Maritime Rules (Parts 20–91)
- Part 20 Registration (NZ Ship Register: ships >24m or carrying passengers) · Part 21 Safe Ship Management · Part 22 Health & Safety (vessels as workplaces under HSWA 2015) · Part 23 Operating limits (coastal / restricted coastal / enclosed / inshore) · Part 24 Safety equipment by vessel type · Part 25 Design & construction · Part 31 Crewing & watchkeeping · Part 40 Survey requirements · Part 80 Marine protection (pollution, ballast water) · Part 91 Navigation safety (collision regs, lookout, lights/shapes).
- The modern commercial framework is MOSS (Maritime Operator Safety System), the successor to the older SSM/SSMS. Commercial vessels need a maritime transport operator certificate + plan, MNZ-approved surveyor, and a survey cycle (initial → annual/biennial → 4–5-yearly renewal).

## Skipper qualifications
- Recreational: Day Skipper (recommended for all boaters), Boatmaster, VHF radio operator.
- Commercial: Skipper Restricted Limits (SRL, ~200 sea days), Skipper Coastal/Offshore (SCO, ~360 days), Master grades, marine engineering ratings, STCW for international voyages.
- Sea time: log every voyage (date, vessel, port-to-port, conditions, hours), verified by owner/master.

## Vessel survey & maintenance
- Safety-equipment expiry: flares 3 years, EPIRB battery 5–6 years, liferaft service annual, fire extinguishers per schedule, antifoul typically annual in NZ waters.
- Hull: osmosis checks (fibreglass), corrosion (steel/aluminium). Track engine hours and service intervals.

## Fishing quota (QMS)
- Individual Transferable Quota (ITQ) → Annual Catch Entitlement (ACE). Key species incl. Snapper (SNA), Hoki (HOK), Rock Lobster (CRA), Pāua (PAU), Tarakihi. 10 Fisheries Management Areas. Deemed value penalties for catch over ACE. Recreational daily bag limits vary by species/area (check MPI).

## Marine weather & bar safety
- MetService marine forecasts; Beaufort scale, swell height/period/direction, sea state. Compute a weather window from vessel type, size, and crew experience.
- NZ bar crossings are dangerous in wind-against-tide: give specific care for Hokianga, Raglan, Greymouth, Westport, Kaipara.

## Coastguard & emergencies
- Emergency: VHF Channel 16; *STAR (#7827) from mobile; 111 (Police Maritime). Log trips with Coastguard (free). Training: Day Skipper, Boatmaster, VHF, first aid.

## NZ legislation
Maritime Transport Act 1994, Maritime Rules (Parts 20–91), Health and Safety at Work Act 2015, Fisheries Act 1996, Resource Management Act 1991 (coastal permits), Marine Mammals Protection Act 1978, Hauraki Gulf Marine Park Act 2000.`;

/** A handful of NZ marine locations so the model can resolve names → lat/lng. */
const NZ_MARINE_POINTS: Record<string, { lat: number; lng: number }> = {
  'hauraki gulf': { lat: -36.6, lng: 175.1 },
  auckland: { lat: -36.84, lng: 174.77 },
  'bay of islands': { lat: -35.22, lng: 174.12 },
  wellington: { lat: -41.29, lng: 174.78 },
  'cook strait': { lat: -41.3, lng: 174.4 },
  'marlborough sounds': { lat: -41.1, lng: 174.0 },
  tauranga: { lat: -37.66, lng: 176.21 },
  napier: { lat: -39.49, lng: 176.92 },
  lyttelton: { lat: -43.6, lng: 172.72 },
  otago: { lat: -45.78, lng: 170.73 },
  fiordland: { lat: -45.4, lng: 167.0 },
};

/**
 * Live marine sea-state via Open-Meteo Marine (keyless). Ported from the intent
 * of `marine-weather/index.ts` but using the JSON API instead of scraping the
 * MetService HTML, so it's robust enough to ship without a fallback constant.
 */
export const marineWeatherTool = tool({
  description:
    'Get live NZ marine conditions (wave height, wave period, wind-wave height) for a coastal location. Use for trip planning, bar-crossing risk, and weather-window questions.',
  inputSchema: z.object({
    location: z
      .string()
      .describe('NZ coastal place, e.g. "Hauraki Gulf", "Cook Strait", "Bay of Islands"'),
  }),
  execute: async ({ location }) => {
    const key = location.trim().toLowerCase();
    const point =
      NZ_MARINE_POINTS[key] ??
      Object.entries(NZ_MARINE_POINTS).find(([name]) => key.includes(name))?.[1];
    if (!point) {
      return {
        status: 'unknown_location',
        note: `No coordinates on file for "${location}". Ask the user for the nearest of: ${Object.keys(NZ_MARINE_POINTS).join(', ')}.`,
      };
    }
    try {
      const url =
        `https://marine-api.open-meteo.com/v1/marine?latitude=${point.lat}&longitude=${point.lng}` +
        `&current=wave_height,wave_period,wind_wave_height,swell_wave_height,swell_wave_period&timezone=Pacific%2FAuckland`;
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) return { status: 'source_error', note: `Open-Meteo Marine returned HTTP ${res.status}.` };
      const data = (await res.json()) as { current?: Record<string, number>; current_units?: Record<string, string> };
      return {
        status: 'ok',
        location,
        source: 'Open-Meteo Marine (live)',
        current: data.current ?? {},
        units: data.current_units ?? {},
        note: 'Cross-check against the MetService marine forecast before any passage; this is current sea-state only, not a full forecast.',
      };
    } catch {
      return { status: 'source_error', note: 'Could not reach the live marine source — advise the user to check the MetService marine forecast directly.' };
    }
  },
});
