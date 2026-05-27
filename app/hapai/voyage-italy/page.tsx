import type { Metadata } from 'next';
import { VoyageItalyTrip, type VoyagePayload } from '@/components/voyage/VoyageItalyTrip';

// Public template route for /hapai/voyage-italy.
//
// This page is intentionally a GENERIC SAMPLE — it never reads from
// `voyage_shared_trips`. Kate + Adrian's real trip lives at
// /hapai/voyage-italy/v/[slug] and is only reachable with the secret slug.
//
// PR #317 ("urgent takedown") removed a previous public surface that leaked
// real trip data. This route is the replacement: a generic shareable
// template demonstrating the tool, with a CTA back into voyage-in-chat.

export const metadata: Metadata = {
  title: 'voyage italy template · assembl',
  description:
    'A sample multi-city Italy itinerary with a voice translator and cost splitter. Talk to voyage in chat to draft your own.',
  robots: { index: true, follow: true },
};

const GENERIC_VOYAGE_TEMPLATE: VoyagePayload = {
  title: 'Italia · sample 7-stop loop',
  travellers: [
    { id: 'a', name: 'Traveller A' },
    { id: 'b', name: 'Traveller B' },
  ],
  departDate: 'TBD',
  departFrom: 'AKL',
  tripStartDate: 'Day 1',
  tripEndDate: 'Day 14',
  totalNights: 14,
  budget: {
    currency: 'NZD',
    accommodationNzd: 4500,
    flightsNzd: 9700,
    estimatedTotalNzd: 16000,
  },
  stops: [
    {
      id: 'milan',
      label: 'Milan',
      order: 1,
      checkIn: 'Day 1',
      checkOut: 'Day 4',
      nights: 3,
      hotel: { name: 'Sample hotel — Milan central' },
      highlights: ['Duomo', 'Navigli', 'Day trip Como'],
    },
    {
      id: 'lake-garda',
      label: 'Lake Garda',
      order: 2,
      checkIn: 'Day 4',
      checkOut: 'Day 6',
      nights: 2,
      hotel: { name: 'Sample hotel — Lake Garda lakefront' },
      highlights: ['Monte Baldo', 'Verona'],
      driveFromPrevious: { from: 'Milan', approxHours: '1.5–2' },
    },
    {
      id: 'florence',
      label: 'Florence',
      order: 3,
      checkIn: 'Day 6',
      checkOut: 'Day 8',
      nights: 2,
      hotel: { name: 'Sample hotel — Florence old town' },
      highlights: ['Uffizi', 'David'],
      driveFromPrevious: { from: 'Lake Garda', approxHours: '3' },
    },
    {
      id: 'tuscany',
      label: 'Tuscany',
      order: 4,
      checkIn: 'Day 8',
      checkOut: 'Day 10',
      nights: 2,
      hotel: { name: 'Sample hotel — Chianti farmhouse' },
      highlights: ['Chianti', 'Siena', "Val d'Orcia"],
      driveFromPrevious: { from: 'Florence', approxHours: '1–1.5' },
    },
    {
      id: 'rome',
      label: 'Rome',
      order: 5,
      checkIn: 'Day 10',
      checkOut: 'Day 12',
      nights: 2,
      hotel: { name: 'Sample hotel — Rome historic centre' },
      highlights: ['Colosseum', 'Vatican'],
    },
    {
      id: 'amalfi',
      label: 'Amalfi Coast',
      order: 6,
      checkIn: 'Day 12',
      checkOut: 'Day 14',
      nights: 2,
      hotel: { name: 'Sample hotel — Amalfi seafront' },
      highlights: ['Capri', 'Positano', 'Path of the Gods'],
    },
    {
      id: 'rome-fly',
      label: 'Rome (depart)',
      order: 7,
      checkIn: 'Day 14',
      checkOut: 'Day 15',
      nights: 1,
      hotel: { name: 'Sample hotel — near Fiumicino' },
      highlights: ['Final night before flight home'],
    },
  ],
  sampleActivities: [
    {
      stopId: 'milan',
      label: 'Arrive Malpensa',
      note: 'Malpensa Express to Centrale (~50min, ~€13). Taxi ~€100.',
      category: 'logistics',
    },
    {
      stopId: 'milan',
      label: 'Duomo Rooftop Terraces',
      note: 'Book elevator, sunset views',
      category: 'ticket',
      costEur: 22,
    },
  ],
  costSplitterPreferences: {
    currency: 'EUR',
    homeCurrency: 'NZD',
    categories: ['food', 'transport', 'lodging', 'tickets', 'shopping', 'other'],
  },
};

export default function VoyageItalyTemplatePage() {
  return (
    <VoyageItalyTrip
      payload={GENERIC_VOYAGE_TEMPLATE}
      storageScope="demo"
      isTemplate
    />
  );
}
