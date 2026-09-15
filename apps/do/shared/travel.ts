import { z } from "zod";
export function safeTravelLink(value: string) {
  try {
    const u = new URL(value);
    return u.protocol === "https:" && !u.username && !u.password ? u.href : "";
  } catch {
    return "";
  }
}
export const tripSchema = z
  .object({
    version: z.literal(1),
    id: z.string().uuid(),
    title: z.string().max(120),
    destination: z.string().max(160),
    dates: z.string().max(120),
    budget: z.string().max(120),
    travellers: z.string().max(160),
    preferences: z.string().max(2000),
    summary: z.string().max(32000),
    days: z
      .array(
        z.object({
          id: z.string().uuid(),
          title: z.string().max(160),
          notes: z.string().max(4000),
          place: z.string().max(240),
          bookingLink: z.string().max(1500).transform(safeTravelLink),
        }),
      )
      .max(31),
    packing: z
      .array(
        z.object({
          id: z.string().uuid(),
          text: z.string().max(240),
          packed: z.boolean(),
        }),
      )
      .max(80),
    updatedAt: z.string().datetime(),
  })
  .strict();
export type DoTrip = z.infer<typeof tripSchema>;
export function newDoTrip(): DoTrip {
  return {
    version: 1,
    id: crypto.randomUUID(),
    title: "My next trip",
    destination: "",
    dates: "",
    budget: "",
    travellers: "",
    preferences: "",
    summary: "",
    days: [],
    packing: [],
    updatedAt: new Date().toISOString(),
  };
}
export function travelRevisionBrief(trip: DoTrip) {
  return `Help revise this draft trip. Confirm any missing dates, currency or traveller details before researching. Preserve existing constraints and distinguish suggestions from confirmed bookings. Nothing has been booked.\n${JSON.stringify({ destination: trip.destination, dates: trip.dates, budget: trip.budget, travellers: trip.travellers, preferences: trip.preferences, summary: trip.summary.slice(0, 5000), days: trip.days.map(({ title, notes }) => ({ title, notes })), packing: trip.packing.map((p) => p.text) }).slice(0, 10000)}`;
}
