export type DocumentTotals = { subtotal: number; gst: number; total: number };

/** First NZD-looking amount in a Business Genome service value. */
export function priceFromGenome(value: string): number {
  const match = value.replace(/,/g, '').match(/\$\s*(\d+(?:\.\d{1,2})?)/);
  return match ? Number(match[1]) : 0;
}

export function documentTotals(quantity: number, unitPrice: number, gstRate = 0.15): DocumentTotals {
  const safeQuantity = Number.isFinite(quantity) && quantity > 0 ? quantity : 0;
  const safePrice = Number.isFinite(unitPrice) && unitPrice >= 0 ? unitPrice : 0;
  const subtotal = Math.round(safeQuantity * safePrice * 100) / 100;
  const gst = Math.round(subtotal * gstRate * 100) / 100;
  return { subtotal, gst, total: Math.round((subtotal + gst) * 100) / 100 };
}

export function nzd(value: number): string {
  return new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD' }).format(value);
}
