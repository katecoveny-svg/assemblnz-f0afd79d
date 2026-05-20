export function formatNZD(
  amount: number,
  opts: { decimals?: number; suffix?: string; signal?: 'gain' | 'loss' } = {},
): string {
  const decimals = opts.decimals ?? 0;
  const sign = opts.signal === 'gain' && amount > 0 ? '+' : opts.signal === 'loss' && amount > 0 ? '-' : '';
  const value = new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency: 'NZD',
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(Math.abs(amount));
  return `${sign}${value}${opts.suffix ? ` ${opts.suffix}` : ''}`;
}

export function formatPct(value: number, decimals = 0): string {
  return `${new Intl.NumberFormat('en-NZ', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(value)} %`;
}

export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat('en-NZ', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(value);
}
