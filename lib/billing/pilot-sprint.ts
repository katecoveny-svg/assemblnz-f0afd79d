export const PILOT_SPRINT_EX_GST_NZD = 1_500;
export const NZ_GST_RATE = 0.15;
export const PILOT_SPRINT_GST_NZD = PILOT_SPRINT_EX_GST_NZD * NZ_GST_RATE;
export const PILOT_SPRINT_TOTAL_NZD = PILOT_SPRINT_EX_GST_NZD + PILOT_SPRINT_GST_NZD;
export const PILOT_SPRINT_TOTAL_CENTS = Math.round(PILOT_SPRINT_TOTAL_NZD * 100);

export const PILOT_SPRINT_DESCRIPTION =
  'Founding Pilot: one agreed workflow, built against the customer’s rules and sources over ten working days, with draft-ready outputs and an evidence pack.';
