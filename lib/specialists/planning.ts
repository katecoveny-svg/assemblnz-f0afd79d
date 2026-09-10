export type VillageCosts = { entry: number; weekly: number; years: number; dmf: number; other: number };
export function villageCosts(input: VillageCosts) {
  const values = Object.values(input);
  if (values.some(v => !Number.isFinite(v) || v < 0) || input.dmf > 100 || input.years > 50) return null;
  const managementFee = input.entry * input.dmf / 100;
  const runningFees = input.weekly * 52 * input.years;
  return { managementFee, runningFees, illustrativeCost: managementFee + runningFees + input.other, capitalBeforeOtherExitAdjustments: input.entry - managementFee };
}
export function downloadText(name: string, text: string, type = 'text/plain;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([text], { type })); const a = document.createElement('a');
  a.href = url; a.download = name; a.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
