/**
 * Household solar outlook for New Zealand, deterministic and versioned. Every figure is an
 * estimate from stated assumptions, labelled as such. It tells a person whether solar is worth
 * a quote and roughly what to expect; it is not a quote, a design, or financial advice. Reruns
 * with the same inputs and the same SOLAR_ASSUMPTIONS_VERSION give the same answer.
 */
export const SOLAR_ASSUMPTIONS_VERSION = '2026-10-14.a';
export const SOLAR_ASSUMPTIONS = {
  /** Residential retail price per kWh including GST, used to turn spend into usage when kWh is unknown. */
  retailPerKwh: 0.34,
  /** Fixed daily charges and GST mean roughly this share of a bill is not usage. */
  nonUsageShare: 0.22,
  /** Annual generation per installed kW by region, kWh. Conservative mid-range figures. */
  yieldPerKw: {
    Northland: 1350, Auckland: 1300, Waikato: 1250, 'Bay of Plenty': 1350, Gisborne: 1350, 'Hawkes Bay': 1350, Taranaki: 1250, 'Manawatu-Whanganui': 1250,
    Wellington: 1250, Tasman: 1400, Nelson: 1400, Marlborough: 1400, 'West Coast': 1100, Canterbury: 1300, Otago: 1200, Southland: 1100,
  } as Record<string, number>,
  defaultYieldPerKw: 1250,
  /** Installed cost per kW, NZD including GST, residential systems of 3 to 8 kW without a battery. */
  costPerKw: { low: 2000, high: 2800 },
  /** Share of generation a household uses itself without a battery, by daytime presence. */
  selfConsumption: { low: 0.3, high: 0.5 },
  /** Export credit per kWh paid by retailers for surplus. */
  exportPerKwh: { low: 0.08, high: 0.17 },
  /** Size the system to cover this share of annual use; larger systems mostly export at the low rate. */
  coverTarget: 0.6,
  minKw: 3, maxKw: 8,
  batteryNote: 'A battery adds roughly NZ$8,000 to NZ$14,000 and lifts self-use; it usually lengthens payback unless the retailer offers time-of-use or export incentives.',
} as const;

export type SolarInput = {
  /** Monthly electricity spend in cents, NZD. */
  monthlyCents: number;
  region?: string | null;
  /** Annual kWh when known from bills; otherwise estimated from spend. */
  annualKwh?: number | null;
};
export type SolarOutlook = {
  version: string;
  annualKwh: number;
  kwhSource: 'bills' | 'estimated-from-spend';
  systemKw: number;
  annualGenerationKwh: number;
  capex: { low: number; high: number };
  annualSaving: { low: number; high: number };
  paybackYears: { low: number; high: number } | null;
  worthAQuote: boolean;
  reasons: string[];
  assumptions: string[];
};
const round = (value: number, places = 0) => Math.round(value * 10 ** places) / 10 ** places;

export function solarOutlook(input: SolarInput): SolarOutlook {
  const a = SOLAR_ASSUMPTIONS;
  const monthly = Math.max(0, input.monthlyCents) / 100;
  const annualKwh = input.annualKwh && input.annualKwh > 0 ? round(input.annualKwh) : round(monthly * 12 * (1 - a.nonUsageShare) / a.retailPerKwh);
  const kwhSource: SolarOutlook['kwhSource'] = input.annualKwh && input.annualKwh > 0 ? 'bills' : 'estimated-from-spend';
  const yieldPerKw = (input.region && a.yieldPerKw[input.region]) || a.defaultYieldPerKw;
  const systemKw = round(Math.min(a.maxKw, Math.max(a.minKw, annualKwh * a.coverTarget / yieldPerKw)), 1);
  const annualGenerationKwh = round(systemKw * yieldPerKw);
  const capex = { low: round(systemKw * a.costPerKw.low), high: round(systemKw * a.costPerKw.high) };
  const saving = (selfShare: number, exportRate: number) => {
    const selfUsed = Math.min(annualGenerationKwh * selfShare, annualKwh);
    const exported = annualGenerationKwh - selfUsed;
    return round(selfUsed * a.retailPerKwh + exported * exportRate);
  };
  const annualSaving = { low: saving(a.selfConsumption.low, a.exportPerKwh.low), high: saving(a.selfConsumption.high, a.exportPerKwh.high) };
  const paybackYears = annualSaving.low > 0 ? { low: round(capex.low / annualSaving.high, 1), high: round(capex.high / annualSaving.low, 1) } : null;
  const worthAQuote = annualKwh >= 3000 && paybackYears !== null && paybackYears.low <= 10;
  const reasons = [
    annualKwh < 3000 ? 'Use under about 3,000 kWh a year usually means a small system exports most of what it makes at the low rate.' : 'Use above 3,000 kWh a year gives a system enough daytime load to pay for itself.',
    'Payback depends most on how much is used at home during the day. Hot-water timers, EV charging and daytime appliances push it down.',
    'A north-facing, unshaded roof matters more than the panel brand. Shade or a south-facing roof needs a site check before any figure holds.',
  ];
  const assumptions = [
    `Retail price NZ$${a.retailPerKwh.toFixed(2)}/kWh; ${Math.round(a.nonUsageShare * 100)}% of spend treated as fixed charges when usage is estimated.`,
    `Generation ${yieldPerKw} kWh per installed kW a year${input.region && a.yieldPerKw[input.region] ? ` for ${input.region}` : ' (national default)'}.`,
    `Installed cost NZ$${a.costPerKw.low.toLocaleString('en-NZ')} to NZ$${a.costPerKw.high.toLocaleString('en-NZ')} per kW, no battery.`,
    `Self-use ${Math.round(a.selfConsumption.low * 100)}% to ${Math.round(a.selfConsumption.high * 100)}%; export credit NZ$${a.exportPerKwh.low.toFixed(2)} to NZ$${a.exportPerKwh.high.toFixed(2)}/kWh.`,
    a.batteryNote,
  ];
  return { version: SOLAR_ASSUMPTIONS_VERSION, annualKwh, kwhSource, systemKw, annualGenerationKwh, capex, annualSaving, paybackYears, worthAQuote, reasons, assumptions };
}

/** Ways to make solar cost less to do. Public programmes to verify at the source, never promised. */
export const SOLAR_COST_PATHS = [
  { title: 'Bank green loans', note: 'ANZ, ASB, BNZ, Westpac and Kiwibank have offered low or zero-interest home loan top-ups for solar and batteries, usually capped around NZ$40,000 to NZ$80,000 over a few years. Terms change; check the bank page before relying on one.', url: 'https://www.genless.govt.nz/for-everyone/at-home/solar/' },
  { title: 'Gen Less and EECA guidance', note: 'The government energy agency explains sizing, quotes, consents and what to ask an installer. Use it to check any quote.', url: 'https://www.genless.govt.nz/for-everyone/at-home/solar/' },
  { title: 'Three quotes, one spec', note: 'Ask each installer for the same system size, panel and inverter class, export setup and warranty, so the prices compare. SEANZ-member installers follow a code of conduct.', url: 'https://www.seanz.org.nz/' },
  { title: 'Retailer solar plans', note: 'Export rates differ widely between retailers, and some pay more for peak-time export. The plan can matter as much as the panels.', url: 'https://www.powerswitch.org.nz/' },
] as const;
