import type { FeedEnvelope, FuelPricesPayload } from "../types";

export function LiveFuelBody({ envelope }: { envelope: FeedEnvelope<FuelPricesPayload> }) {
  const p = envelope?.data;
  if (!p) return null;
  if (p.error) {
    return <p className="text-xs text-destructive">{p.error}</p>;
  }
  const prices = p.prices ?? {};
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <FuelTile label="91" value={prices.petrol_91} />
        <FuelTile label="95" value={prices.petrol_95} />
        <FuelTile label="Diesel" value={prices.diesel} />
      </div>
      <p className="text-[10px] text-muted-foreground font-mono">
        {p.region ?? "NZ"} · {p.updated ?? new Date(envelope.generated_at).toLocaleDateString("en-NZ")}
      </p>
    </div>
  );
}

function FuelTile({ label, value }: { label: string; value: number | undefined }) {
  return (
    <div className="rounded-xl bg-muted/30 px-3 py-2 text-center">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="font-display text-lg text-foreground mt-1">
        {value != null ? `$${value.toFixed(2)}` : "—"}
      </p>
    </div>
  );
}
