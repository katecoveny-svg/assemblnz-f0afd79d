import { describe, expect, it } from 'vitest';
import {
  PILOT_SPRINT_EX_GST_NZD,
  PILOT_SPRINT_GST_NZD,
  PILOT_SPRINT_TOTAL_CENTS,
  PILOT_SPRINT_TOTAL_NZD,
} from '../pilot-sprint';

describe('Pilot Sprint price', () => {
  it('adds NZ GST to the locked pilot price', () => {
    expect(PILOT_SPRINT_EX_GST_NZD).toBe(1500);
    expect(PILOT_SPRINT_GST_NZD).toBe(225);
    expect(PILOT_SPRINT_TOTAL_NZD).toBe(1725);
    expect(PILOT_SPRINT_TOTAL_CENTS).toBe(172500);
  });
});
