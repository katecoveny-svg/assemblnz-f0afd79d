import { useState, useMemo, useCallback } from "react";

// ─── SAMPLE TRIP DATA (agent would populate this dynamically) ────────
const SAMPLE_TRIP = {
  name: "Your Trip",
  travelers: ["Traveler 1", "Traveler 2"],
  currency: "NZD",
  exchangeRate: 1.85, // EUR→local
  departureDate: "2026-06-15",
  returnDate: "2026-06-30",
  destinations: [
    {
      id: "dest-1",
      name: "Barcelona",
      color: "#C2185B",
      dates: "15–18 Jun",
      nights: 3,
      lat: 41.3874,
      lng: 2.1686,
    },
    {
      id: "dest-2",
      name: "Provence",
      color: "#7B1FA2",
      dates: "18–21 Jun",
      nights: 3,
      lat: 43.9493,
      lng: 4.8055,
    },
    {
      id: "dest-3",
      name: "Swiss Alps",
      color: "#1565C0",
      dates: "21–25 Jun",
      nights: 4,
      lat: 46.8182,
      lng: 8.2275,
    },
    {
      id: "dest-4",
      name: "Vienna",
      color: "#E65100",
      dates: "25–28 Jun",
      nights: 3,
      lat: 48.2082,
      lng: 16.3738,
    },
    {
      id: "dest-5",
      name: "Prague",
      color: "#2E7D32",
      dates: "28–30 Jun",
      nights: 2,
      lat: 50.0755,
      lng: 14.4378,
    },
  ],
  days: [
    {
      date: "2026-06-15",
      weekday: "Mon",
      title: "Arrive Barcelona",
      dest: "Barcelona",
      stay: "Hotel Arts Barcelona",
      activities: [
        { id: "a1", name: "Las Ramblas & Gothic Quarter walk", cost: 0, type: "free", booked: true, urgent: false, link: "", note: "Arrive early afternoon, explore on foot" },
        { id: "a2", name: "Tapas dinner at Cal Pep", cost: 65, type: "food", booked: false, urgent: false, link: "https://calpep.com", note: "Book 2 weeks ahead — counter seats only" },
      ],
    },
    {
      date: "2026-06-16",
      weekday: "Tue",
      title: "Gaudí & Beaches",
      dest: "Barcelona",
      stay: "Hotel Arts Barcelona",
      activities: [
        { id: "a3", name: "Sagrada Familia (timed entry)", cost: 26, type: "ticket", booked: false, urgent: true, link: "https://sagradafamilia.org", note: "⚠ Book ASAP — sells out 3+ weeks ahead in June" },
        { id: "a4", name: "Park Güell", cost: 10, type: "ticket", booked: false, urgent: true, link: "https://parkguell.barcelona", note: "⚠ Timed entry required — book online" },
        { id: "a5", name: "Barceloneta Beach", cost: 0, type: "free", booked: true, note: "" },
        { id: "a6", name: "Rooftop cocktails at Hotel Ohla", cost: 35, type: "food", booked: false, link: "", note: "Views over Gothic Quarter" },
      ],
    },
    {
      date: "2026-06-17",
      weekday: "Wed",
      title: "Art & Markets",
      dest: "Barcelona",
      stay: "Hotel Arts Barcelona",
      activities: [
        { id: "a7", name: "La Boqueria Market breakfast", cost: 15, type: "food", booked: true, note: "Go before 10am to beat crowds" },
        { id: "a8", name: "Picasso Museum", cost: 12, type: "ticket", booked: false, link: "https://museupicasso.bcn.cat", note: "Free first Sunday — but we're here Wed" },
        { id: "a9", name: "Cooking class — Catalan paella", cost: 75, type: "experience", booked: false, urgent: true, link: "", note: "⚠ Small group, book early" },
      ],
    },
    {
      date: "2026-06-18",
      weekday: "Thu",
      title: "Travel to Provence",
      dest: "Provence",
      stay: "Mas de la Rose",
      activities: [
        { id: "a10", name: "Train Barcelona → Avignon TGV", cost: 65, type: "transport", booked: false, urgent: true, link: "https://sncf.com", note: "⚠ Book early for best fares — ~4hrs" },
        { id: "a11", name: "Explore Avignon old town", cost: 0, type: "free", booked: true, note: "Palais des Papes visible from bridge" },
        { id: "a12", name: "Dinner at countryside bistro", cost: 50, type: "food", booked: false, note: "Ask hotel for recommendation" },
      ],
    },
    {
      date: "2026-06-19",
      weekday: "Fri",
      title: "Lavender & Villages",
      dest: "Provence",
      stay: "Mas de la Rose",
      activities: [
        { id: "a13", name: "Lavender field tour (Sénanque)", cost: 0, type: "free", booked: true, note: "Peak bloom mid-June to mid-July" },
        { id: "a14", name: "Gordes village visit", cost: 0, type: "free", booked: true, note: "One of France's most beautiful villages" },
        { id: "a15", name: "Wine tasting in Châteauneuf-du-Pape", cost: 30, type: "experience", booked: false, link: "", note: "Walk-ins usually fine" },
        { id: "a16", name: "Sunset picnic at Les Baux", cost: 20, type: "experience", booked: true, note: "Bring supplies from morning market" },
      ],
    },
    {
      date: "2026-06-20",
      weekday: "Sat",
      title: "Markets & Relaxation",
      dest: "Provence",
      stay: "Mas de la Rose",
      activities: [
        { id: "a17", name: "L'Isle-sur-la-Sorgue antique market", cost: 0, type: "free", booked: true, note: "Sunday market is largest, Sat is quieter" },
        { id: "a18", name: "Kayak on the Sorgue river", cost: 25, type: "experience", booked: false, note: "Crystal-clear water, easy paddle" },
        { id: "a19", name: "Pool afternoon at accommodation", cost: 0, type: "free", booked: true, note: "" },
      ],
    },
    {
      date: "2026-06-21",
      weekday: "Sun",
      title: "Travel to Swiss Alps",
      dest: "Swiss Alps",
      stay: "Hotel Bellevue Wengen",
      activities: [
        { id: "a20", name: "Drive Provence → Geneva → Lauterbrunnen", cost: 40, type: "transport", booked: false, note: "~6hrs with stops — scenic route via Lake Geneva" },
        { id: "a21", name: "Arrive Lauterbrunnen valley", cost: 0, type: "free", booked: true, note: "Car-free Wengen — take cable car up" },
      ],
    },
    {
      date: "2026-06-22",
      weekday: "Mon",
      title: "Jungfrau Region",
      dest: "Swiss Alps",
      stay: "Hotel Bellevue Wengen",
      activities: [
        { id: "a22", name: "Jungfraujoch — Top of Europe", cost: 195, type: "ticket", booked: false, urgent: true, link: "https://jungfrau.ch", note: "⚠ Book online for discount — CHF 195pp" },
        { id: "a23", name: "Grindelwald First cliff walk", cost: 60, type: "ticket", booked: false, link: "", note: "Glass platform over the valley" },
        { id: "a24", name: "Fondue dinner", cost: 45, type: "food", booked: false, note: "" },
      ],
    },
    {
      date: "2026-06-23",
      weekday: "Tue",
      title: "Hiking Day",
      dest: "Swiss Alps",
      stay: "Hotel Bellevue Wengen",
      activities: [
        { id: "a25", name: "Männlichen to Kleine Scheidegg hike", cost: 0, type: "free", booked: true, note: "Classic 2hr trail — Eiger views whole way" },
        { id: "a26", name: "Lunch at Kleine Scheidegg", cost: 35, type: "food", booked: false, note: "Restaurant with Eiger north face views" },
      ],
    },
    {
      date: "2026-06-24",
      weekday: "Wed",
      title: "Lake & Valley",
      dest: "Swiss Alps",
      stay: "Hotel Bellevue Wengen",
      activities: [
        { id: "a27", name: "Boat cruise Lake Thun", cost: 40, type: "experience", booked: false, note: "Swiss Pass gives 50% off" },
        { id: "a28", name: "Spiez Castle visit", cost: 10, type: "ticket", booked: false, note: "Medieval castle on the lakefront" },
        { id: "a29", name: "Evening in Interlaken", cost: 30, type: "food", booked: false, note: "" },
      ],
    },
    {
      date: "2026-06-25",
      weekday: "Thu",
      title: "Travel to Vienna",
      dest: "Vienna",
      stay: "Hotel Sacher Wien",
      activities: [
        { id: "a30", name: "Train Interlaken → Zurich → Vienna", cost: 120, type: "transport", booked: false, urgent: true, link: "https://oebb.at", note: "⚠ Book Austrian ÖBB for best price — ~8hrs scenic" },
        { id: "a31", name: "Evening stroll Ringstrasse", cost: 0, type: "free", booked: true, note: "Lit up at night — walk from Opera to Parliament" },
      ],
    },
    {
      date: "2026-06-26",
      weekday: "Fri",
      title: "Imperial Vienna",
      dest: "Vienna",
      stay: "Hotel Sacher Wien",
      activities: [
        { id: "a32", name: "Schönbrunn Palace", cost: 22, type: "ticket", booked: false, link: "https://schoenbrunn.at", note: "Grand Tour ticket — allow 3 hours" },
        { id: "a33", name: "Original Sacher-Torte at Hotel Sacher", cost: 15, type: "food", booked: true, note: "The only real one!" },
        { id: "a34", name: "Vienna State Opera standing tickets", cost: 5, type: "ticket", booked: false, note: "€3–5 for standing — queue 2hrs before" },
      ],
    },
    {
      date: "2026-06-27",
      weekday: "Sat",
      title: "Art & Coffee Culture",
      dest: "Vienna",
      stay: "Hotel Sacher Wien",
      activities: [
        { id: "a35", name: "Belvedere (Klimt's The Kiss)", cost: 16, type: "ticket", booked: false, link: "https://belvedere.at", note: "Upper Belvedere for the Klimt gallery" },
        { id: "a36", name: "Café Central — Vienna coffee ritual", cost: 12, type: "food", booked: true, note: "Go before 10am to skip the queue" },
        { id: "a37", name: "Naschmarkt food stalls", cost: 20, type: "food", booked: true, note: "Saturday market is the big one" },
        { id: "a38", name: "Heuriger wine tavern in Grinzing", cost: 30, type: "experience", booked: false, note: "Traditional Vienna wine villages" },
      ],
    },
    {
      date: "2026-06-28",
      weekday: "Sun",
      title: "Travel to Prague",
      dest: "Prague",
      stay: "Hotel Josef",
      activities: [
        { id: "a39", name: "Train Vienna → Prague", cost: 25, type: "transport", booked: false, link: "https://cd.cz", note: "RegioJet or ÖBB — ~4hrs, stunning scenery" },
        { id: "a40", name: "Charles Bridge at sunset", cost: 0, type: "free", booked: true, note: "Walk from Old Town Square across" },
        { id: "a41", name: "Dinner in Malá Strana", cost: 35, type: "food", booked: false, note: "" },
      ],
    },
    {
      date: "2026-06-29",
      weekday: "Mon",
      title: "Prague Full Day",
      dest: "Prague",
      stay: "Hotel Josef",
      activities: [
        { id: "a42", name: "Prague Castle complex", cost: 15, type: "ticket", booked: false, link: "https://hrad.cz", note: "Circuit B ticket covers highlights" },
        { id: "a43", name: "Jewish Quarter walking tour", cost: 20, type: "experience", booked: false, note: "Synagogues + Old Cemetery" },
        { id: "a44", name: "Craft beer tasting", cost: 18, type: "experience", booked: false, note: "Czech Republic = best beer in Europe" },
        { id: "a45", name: "Black light theatre show", cost: 25, type: "ticket", booked: false, link: "", note: "Uniquely Prague experience" },
      ],
    },
    {
      date: "2026-06-30",
      weekday: "Tue",
      title: "Departure Day",
      dest: "Prague",
      stay: "—",
      activities: [
        { id: "a46", name: "Morning pastry at Café Savoy", cost: 10, type: "food", booked: true, note: "Last breakfast — don't miss the trdelník" },
        { id: "a47", name: "Transfer to Prague airport", cost: 25, type: "transport", booked: false, note: "AE bus or Bolt — allow 90min before flight" },
      ],
    },
  ],
  accommodation: [
    {
      dest: "Barcelona",
      checkIn: "2026-06-15",
      checkOut: "2026-06-18",
      nights: 3,
      status: "confirmed",
      options: [
        { name: "Hotel Arts Barcelona", tier: "luxury", pricePerNight: 450, localPrice: 245, stars: 5, perks: ["Beachfront", "Infinity pool", "Ritz-Carlton service"], booked: true },
        { name: "Casa Bonay", tier: "mid", pricePerNight: 240, localPrice: 130, stars: 4, perks: ["Rooftop bar", "Design hotel", "Eixample location"] },
        { name: "Generator Barcelona", tier: "budget", pricePerNight: 110, localPrice: 60, stars: 3, perks: ["Private rooms available", "Rooftop terrace", "Social vibe"] },
      ],
    },
    {
      dest: "Provence",
      checkIn: "2026-06-18",
      checkOut: "2026-06-21",
      nights: 3,
      status: "needed",
      options: [
        { name: "Mas de la Rose", tier: "mid", pricePerNight: 290, localPrice: 157, stars: 4, perks: ["Pool with lavender views", "Country house charm", "Near Gordes"] },
        { name: "La Bastide de Gordes", tier: "luxury", pricePerNight: 680, localPrice: 367, stars: 5, perks: ["Hilltop village setting", "Sisley spa", "Michelin dining"] },
        { name: "Airbnb stone farmhouse", tier: "budget", pricePerNight: 150, localPrice: 81, stars: 0, perks: ["Full kitchen", "Private garden", "Authentic experience"] },
      ],
    },
    {
      dest: "Swiss Alps",
      checkIn: "2026-06-21",
      checkOut: "2026-06-25",
      nights: 4,
      status: "needed",
      options: [
        { name: "Hotel Bellevue Wengen", tier: "mid", pricePerNight: 330, localPrice: 178, stars: 4, perks: ["Jungfrau views", "Car-free village", "Half-board available"] },
        { name: "Victoria Jungfrau Grand", tier: "luxury", pricePerNight: 620, localPrice: 335, stars: 5, perks: ["Grand dame hotel", "ESPA spa", "Interlaken central"] },
        { name: "Mountain Hostel Gimmelwald", tier: "budget", pricePerNight: 85, localPrice: 46, stars: 2, perks: ["Jaw-dropping views", "Backpacker vibe", "Cliff-edge location"] },
      ],
    },
    {
      dest: "Vienna",
      checkIn: "2026-06-25",
      checkOut: "2026-06-28",
      nights: 3,
      status: "needed",
      options: [
        { name: "Hotel Sacher Wien", tier: "luxury", pricePerNight: 520, localPrice: 281, stars: 5, perks: ["The original Sacher-Torte", "Opera house location", "Imperial grandeur"] },
        { name: "Hotel Topazz", tier: "mid", pricePerNight: 210, localPrice: 114, stars: 4, perks: ["Design hotel", "Oval windows", "Schwedenplatz location"] },
        { name: "Wombat's City Hostel", tier: "budget", pricePerNight: 95, localPrice: 51, stars: 3, perks: ["Naschmarkt location", "Private rooms", "Bar & events"] },
      ],
    },
    {
      dest: "Prague",
      checkIn: "2026-06-28",
      checkOut: "2026-06-30",
      nights: 2,
      status: "needed",
      options: [
        { name: "Hotel Josef", tier: "mid", pricePerNight: 180, localPrice: 97, stars: 4, perks: ["Eva Jiřičná design", "Old Town location", "Rooftop terrace"] },
        { name: "Augustine Prague", tier: "luxury", pricePerNight: 410, localPrice: 222, stars: 5, perks: ["13th-century monastery", "St. Thomas brewery bar", "Malá Strana location"] },
        { name: "Hostel One Home", tier: "budget", pricePerNight: 70, localPrice: 38, stars: 3, perks: ["Family dinners included", "Walking tours", "Central location"] },
      ],
    },
  ],
  packingCategories: [
    {
      id: "clothes",
      label: "Clothes",
      items: [
        "Lightweight summer layers × 5",
        "Smart evening outfit",
        "Comfortable walking shoes",
        "Sandals",
        "Light jacket / cardigan",
        "Swimwear × 2",
        "Rain jacket",
        "Hiking shoes",
        "Sun hat",
      ],
    },
    {
      id: "documents",
      label: "Documents",
      items: [
        "Passport (check expiry!)",
        "Flight confirmations",
        "Travel insurance",
        "Driving licence",
        "Hotel bookings (offline copy)",
        "Pre-booked tickets (printed)",
        "Credit cards (notify bank!)",
        "Travel cash",
        "Emergency contacts",
      ],
    },
    {
      id: "essentials",
      label: "Essentials",
      items: [
        "Phone charger + adapter",
        "Power bank",
        "Sunscreen SPF50",
        "Sunglasses",
        "Day pack / foldable bag",
        "Water bottle",
        "Medications / first aid",
        "Travel pillow",
      ],
    },
    {
      id: "tech",
      label: "Tech",
      items: [
        "Phone",
        "Camera + charger",
        "Earbuds / headphones",
        "Laptop (optional)",
        "eSIM / roaming plan",
      ],
    },
  ],
};

// ─── ICONS (inline SVGs to avoid dependencies) ──────────────────────
const Icon = ({ d, size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
);
const Icons = {
  home: (p) => <Icon {...p} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9zM9 22V12h6v10" />,
  calendar: (p) => <Icon {...p} d="M16 2v4M8 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" />,
  bed: (p) => <Icon {...p} d="M2 4v16M2 8h18a2 2 0 012 2v10M2 17h20M6 8v9" />,
  wallet: (p) => <Icon {...p} d="M20 12V8H6a2 2 0 010-4h12v4M4 6v12a2 2 0 002 2h14v-4" />,
  check: (p) => <Icon {...p} d="M20 6L9 17l-5-5" />,
  alert: (p) => <Icon {...p} d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />,
  bag: (p) => <Icon {...p} d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />,
  note: (p) => <Icon {...p} d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8" />,
  plus: (p) => <Icon {...p} d="M12 5v14M5 12h14" />,
  trash: (p) => <Icon {...p} d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />,
  ext: (p) => <Icon {...p} d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />,
  chevDown: (p) => <Icon {...p} d="M6 9l6 6 6-6" />,
  chevUp: (p) => <Icon {...p} d="M18 15l-6-6-6 6" />,
  plane: (p) => <Icon {...p} d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />,
  star: (p) => <Icon {...p} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />,
  map: (p) => <Icon {...p} d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4zM8 2v16M16 6v16" />,
  menu: (p) => <Icon {...p} d="M4 6h16M4 12h16M4 18h16" />,
  x: (p) => <Icon {...p} d="M18 6L6 18M6 6l12 12" />,
  receipt: (p) => <Icon {...p} d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1zM16 8H8M16 12H8M12 16H8" />,
};

// ─── HELPERS ─────────────────────────────────────────────────────────
const TYPE_COLORS = {
  free: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", label: "Free" },
  ticket: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", label: "Ticket" },
  food: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", label: "Dining" },
  experience: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", label: "Experience" },
  transport: { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-300", label: "Transport" },
};

const TIER_COLORS = {
  budget: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", label: "Budget" },
  mid: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", label: "Mid-range" },
  luxury: { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200", label: "Luxury" },
};

const daysUntil = (dateStr) => {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.floor(diff / 86400000));
};

// ─── MAIN APP ────────────────────────────────────────────────────────
export default function TripPlanner() {
  const trip = SAMPLE_TRIP;
  const [view, setView] = useState("dashboard");
  const [moreOpen, setMoreOpen] = useState(false);

  // State
  const [bookings, setBookings] = useState(() => {
    const init = {};
    trip.days.forEach((d) => d.activities.forEach((a) => { init[a.id] = a.booked; }));
    return init;
  });
  const [hotelSelections, setHotelSelections] = useState(() => {
    const init = {};
    trip.accommodation.forEach((a) => {
      const booked = a.options.find((o) => o.booked);
      init[a.dest] = booked ? { name: booked.name, status: "booked" } : { name: "", status: "none" };
    });
    return init;
  });
  const [packingChecks, setPackingChecks] = useState({});
  const [expenses, setExpenses] = useState([]);
  const [notes, setNotes] = useState([]);
  const [selectedDay, setSelectedDay] = useState(0);

  // Computed
  const totalActivities = trip.days.reduce((s, d) => s + d.activities.length, 0);
  const bookedActivities = Object.values(bookings).filter(Boolean).length;
  const urgentCount = trip.days.reduce((s, d) => s + d.activities.filter((a) => a.urgent && !bookings[a.id]).length, 0);
  const totalDests = trip.accommodation.length;
  const bookedDests = Object.values(hotelSelections).filter((h) => h.status === "booked").length;
  const selectedDests = Object.values(hotelSelections).filter((h) => h.status === "selected").length;
  const totalPackItems = trip.packingCategories.reduce((s, c) => s + c.items.length, 0);
  const checkedPackItems = Object.values(packingChecks).filter(Boolean).length;
  const dLeft = daysUntil(trip.departureDate);

  const toggleBooking = useCallback((id) => setBookings((p) => ({ ...p, [id]: !p[id] })), []);

  // ─── VIEWS ─────────────────────────────────────────────────────────

  const Dashboard = () => {
    const actPct = totalActivities > 0 ? Math.round((bookedActivities / totalActivities) * 100) : 0;
    const hotelPct = totalDests > 0 ? Math.round(((bookedDests + selectedDests * 0.5) / totalDests) * 100) : 0;
    const packPct = totalPackItems > 0 ? Math.round((checkedPackItems / totalPackItems) * 100) : 0;

    const Ring = ({ pct, color, label, detail }) => (
      <div className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-col items-center shadow-sm">
        <svg width="72" height="72" viewBox="0 0 72 72" className="mb-2">
          <circle cx="36" cy="36" r="28" fill="none" stroke="#f1f5f9" strokeWidth="6" />
          <circle cx="36" cy="36" r="28" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 28}`}
            strokeDashoffset={`${2 * Math.PI * 28 * (1 - pct / 100)}`}
            transform="rotate(-90 36 36)"
            style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.16,1,0.3,1)" }}
          />
          <text x="36" y="41" textAnchor="middle" fontSize="15" fontWeight="700" fill={color}>{pct}%</text>
        </svg>
        <div className="text-xs font-semibold" style={{ color }}>{label}</div>
        <div className="text-[10px] text-slate-400 text-center mt-0.5 leading-tight">{detail}</div>
      </div>
    );

    return (
      <div className="space-y-5">
        {/* Countdown hero */}
        <div className="rounded-2xl p-6 text-white text-center relative overflow-hidden" style={{ background: "linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)" }}>
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3), transparent 60%)" }} />
          <div className="relative">
            <div className="flex items-center justify-center gap-2 text-[10px] opacity-50 tracking-widest uppercase mb-3">
              {Icons.plane({ size: 14 })} Until departure
            </div>
            {dLeft > 0 ? (
              <>
                <div className="text-6xl font-bold tracking-tight" style={{ fontFamily: "Georgia, serif" }}>{dLeft}</div>
                <div className="text-xs opacity-50 mt-1 tracking-wide">days to go</div>
              </>
            ) : (
              <div className="text-3xl font-bold" style={{ fontFamily: "Georgia, serif" }}>Bon voyage!</div>
            )}
            <div className="text-[11px] opacity-40 mt-3">{trip.destinations.length} destinations · {trip.days.length} days</div>
          </div>
        </div>

        {/* Progress rings */}
        <div className="grid grid-cols-3 gap-3">
          <Ring pct={hotelPct} color="#7c3aed" label="Hotels" detail={`${bookedDests}/${totalDests} booked`} />
          <Ring pct={actPct} color="#2563eb" label="Activities" detail={`${bookedActivities}/${totalActivities}`} />
          <Ring pct={packPct} color="#059669" label="Packing" detail={`${checkedPackItems}/${totalPackItems}`} />
        </div>

        {/* Alerts */}
        {urgentCount > 0 && (
          <button onClick={() => setView("timeline")} className="w-full flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 shadow-sm text-left">
            {Icons.alert({ size: 16, className: "text-red-500 shrink-0" })}
            <span className="text-sm font-semibold text-red-700">{urgentCount} urgent booking{urgentCount !== 1 ? "s" : ""} need attention</span>
          </button>
        )}

        {/* Route preview */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Your Route</div>
          <div className="flex items-center gap-0 overflow-x-auto pb-2">
            {trip.destinations.map((dest, i) => (
              <div key={dest.id} className="flex items-center shrink-0">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-sm" style={{ background: dest.color }}>
                    {i + 1}
                  </div>
                  <div className="text-[10px] font-medium text-slate-600 mt-1 text-center whitespace-nowrap">{dest.name}</div>
                  <div className="text-[9px] text-slate-400">{dest.nights}n</div>
                </div>
                {i < trip.destinations.length - 1 && (
                  <div className="w-8 h-px bg-slate-200 mx-1 mt-[-16px]" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick checklist */}
        <div>
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Pre-Trip Checklist</div>
          <div className="space-y-1.5">
            {trip.accommodation.map((a) => {
              const done = hotelSelections[a.dest]?.status === "booked";
              return (
                <div key={a.dest} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 border transition-colors ${done ? "bg-slate-50 border-transparent opacity-50" : "bg-white border-slate-100 shadow-sm"}`}>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${done ? "bg-emerald-500 border-emerald-500" : "border-slate-300"}`}>
                    {done && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <span className={`text-xs ${done ? "line-through text-slate-400" : "text-slate-700 font-medium"}`}>Book {a.dest} accommodation</span>
                </div>
              );
            })}
            <div className={`flex items-center gap-3 rounded-xl px-3 py-2.5 border transition-colors ${checkedPackItems > 0 ? "bg-slate-50 border-transparent opacity-50" : "bg-white border-slate-100 shadow-sm"}`}>
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${checkedPackItems > 0 ? "bg-emerald-500 border-emerald-500" : "border-slate-300"}`}>
                {checkedPackItems > 0 && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
              <span className={`text-xs ${checkedPackItems > 0 ? "line-through text-slate-400" : "text-slate-700 font-medium"}`}>Start packing</span>
            </div>
            <div className={`flex items-center gap-3 rounded-xl px-3 py-2.5 border transition-colors ${urgentCount === 0 ? "bg-slate-50 border-transparent opacity-50" : "bg-white border-slate-100 shadow-sm"}`}>
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${urgentCount === 0 ? "bg-emerald-500 border-emerald-500" : "border-slate-300"}`}>
                {urgentCount === 0 && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
              <span className={`text-xs ${urgentCount === 0 ? "line-through text-slate-400" : "text-slate-700 font-medium"}`}>Complete all urgent bookings</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const Timeline = () => {
    const day = trip.days[selectedDay];
    const dest = trip.destinations.find((d) => d.name === day.dest);
    const dayBooked = day.activities.filter((a) => bookings[a.id]).length;
    const dayUrgent = day.activities.filter((a) => a.urgent && !bookings[a.id]).length;
    const [filter, setFilter] = useState("all");

    const filtered = filter === "all" ? day.activities : day.activities.filter((a) => a.type === filter);

    return (
      <div className="space-y-3">
        {/* Day selector — horizontal scroll */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-1 px-1" style={{ scrollbarWidth: "none" }}>
          {trip.days.map((d, i) => {
            const active = i === selectedDay;
            const dc = trip.destinations.find((x) => x.name === d.dest);
            const dUrgent = d.activities.filter((a) => a.urgent && !bookings[a.id]).length;
            return (
              <button key={i} onClick={() => setSelectedDay(i)}
                className={`shrink-0 rounded-xl px-3 py-2 text-left border transition-all min-w-[90px] ${active ? "text-white border-transparent shadow-md" : "bg-white border-slate-100 hover:border-slate-200"}`}
                style={active ? { background: dc?.color || "#334155" } : undefined}
              >
                <div className={`text-[9px] tracking-wide ${active ? "opacity-60" : "text-slate-400"}`}>{d.date.slice(5)}</div>
                <div className={`text-[11px] font-semibold leading-snug mt-0.5 ${active ? "" : "text-slate-700"}`}>{d.title}</div>
                <div className="flex items-center gap-1 mt-1">
                  {dUrgent > 0 && !active && <span className="w-1.5 h-1.5 rounded-full bg-red-400" />}
                  <span className={`text-[9px] ${active ? "opacity-50" : "text-slate-400"}`}>{d.dest}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Day hero */}
        <div className="rounded-2xl overflow-hidden shadow-md" style={{ background: dest?.color || "#334155" }}>
          <div className="px-4 py-4 text-white">
            <div className="text-[10px] opacity-50 tracking-widest uppercase">{day.date} · {day.weekday}</div>
            <h2 className="text-lg font-semibold mt-1">{day.title}</h2>
            <div className="text-[11px] opacity-60 mt-0.5">{day.stay}</div>
            <div className="mt-3 h-1 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white/60 rounded-full transition-all" style={{ width: `${day.activities.length > 0 ? (dayBooked / day.activities.length) * 100 : 0}%` }} />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[9px] opacity-50">Day progress</span>
              <span className="text-[9px] opacity-60">{dayBooked}/{day.activities.length} confirmed</span>
            </div>
          </div>
        </div>

        {/* Urgent banner */}
        {dayUrgent > 0 && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
            {Icons.alert({ size: 14, className: "text-red-500 shrink-0" })}
            <span className="text-xs font-semibold text-red-700">{dayUrgent} item{dayUrgent > 1 ? "s" : ""} need booking</span>
          </div>
        )}

        {/* Filter pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {[{ v: "all", l: "All" }, ...Object.entries(TYPE_COLORS).map(([k, v]) => ({ v: k, l: v.label }))].map(({ v, l }) => (
            <button key={v} onClick={() => setFilter(v)}
              className={`shrink-0 text-[10px] px-3 py-1.5 rounded-lg font-medium border transition-all ${filter === v ? "bg-slate-800 text-white border-slate-800" : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"}`}
            >{l}</button>
          ))}
        </div>

        {/* Activities */}
        <div className="space-y-2">
          {filtered.map((act) => {
            const isBooked = bookings[act.id];
            const isUrgent = act.urgent && !isBooked;
            const tc = TYPE_COLORS[act.type] || TYPE_COLORS.free;
            return (
              <div key={act.id} className={`bg-white rounded-xl border p-3.5 shadow-sm transition-all ${isUrgent ? "border-red-200 bg-red-50/30" : isBooked ? "border-emerald-200/50 bg-emerald-50/20" : "border-slate-100"}`}>
                <div className="flex items-start gap-3">
                  <button onClick={() => toggleBooking(act.id)}
                    className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5 transition-all ${isBooked ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300 hover:border-slate-400"}`}
                  >
                    {isBooked && Icons.check({ size: 12 })}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded border font-semibold ${tc.bg} ${tc.text} ${tc.border}`}>{tc.label}</span>
                      {isUrgent && <span className="text-[9px] px-1.5 py-0.5 rounded border font-semibold bg-red-50 text-red-600 border-red-200">⚠ Urgent</span>}
                    </div>
                    <div className={`text-sm font-semibold mt-1 ${isBooked ? "line-through opacity-50" : "text-slate-800"}`}>{act.name}</div>
                    {act.cost > 0 && <span className="text-xs text-slate-400">€{act.cost}</span>}
                    {act.note && <p className="text-[11px] text-slate-400 mt-1 leading-snug">{act.note}</p>}
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {act.link && !isBooked && (
                        <a href={act.link} target="_blank" rel="noopener noreferrer"
                          className={`inline-flex items-center gap-1 text-[10px] px-3 py-1.5 rounded-lg font-semibold text-white ${isUrgent ? "bg-red-500" : "bg-slate-800"}`}>
                          Book now {Icons.ext({ size: 10 })}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const Accommodation = () => {
    const [expanded, setExpanded] = useState(null);
    const [tierFilter, setTierFilter] = useState("all");
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">Accommodation</h2>

        {/* Tier filter */}
        <div className="flex gap-1.5">
          {["all", "budget", "mid", "luxury"].map((t) => (
            <button key={t} onClick={() => setTierFilter(t)}
              className={`text-[10px] px-3 py-1.5 rounded-lg font-medium border transition-all ${tierFilter === t ? "bg-slate-800 text-white border-slate-800" : "bg-white border-slate-200 text-slate-500"}`}
            >{t === "all" ? "All" : TIER_COLORS[t].label}</button>
          ))}
        </div>

        {trip.accommodation.map((a) => {
          const sel = hotelSelections[a.dest];
          const isExpanded = expanded === a.dest;
          const opts = tierFilter === "all" ? a.options : a.options.filter((o) => o.tier === tierFilter);

          return (
            <div key={a.dest} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <button onClick={() => setExpanded(isExpanded ? null : a.dest)} className="w-full px-4 py-3.5 flex items-center gap-3 text-left">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold" style={{ background: trip.destinations.find((d) => d.name === a.dest)?.color || "#475569" }}>
                  {a.nights}n
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-slate-800">{a.dest}</div>
                  <div className="text-[10px] text-slate-400">{a.checkIn} → {a.checkOut}</div>
                </div>
                <div className="flex items-center gap-2">
                  {sel?.status === "booked" && <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">Booked</span>}
                  {sel?.status === "selected" && <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold border border-amber-200">Selected</span>}
                  {sel?.status === "none" && <span className="text-[9px] px-2 py-0.5 rounded-full bg-red-50 text-red-600 font-semibold border border-red-200">Needed</span>}
                  {isExpanded ? Icons.chevUp({ size: 16, className: "text-slate-400" }) : Icons.chevDown({ size: 16, className: "text-slate-400" })}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-slate-100 divide-y divide-slate-50">
                  {opts.map((opt) => {
                    const isSel = sel?.name === opt.name;
                    const tc = TIER_COLORS[opt.tier];
                    return (
                      <div key={opt.name} className={`px-4 py-3.5 ${isSel ? "bg-blue-50/40" : ""}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-[9px] px-1.5 py-0.5 rounded border font-semibold ${tc.bg} ${tc.text} ${tc.border}`}>{tc.label}</span>
                              {opt.stars > 0 && <span className="text-[9px] text-slate-400">{"★".repeat(opt.stars)}</span>}
                            </div>
                            <div className="text-sm font-semibold text-slate-800 mt-1">{opt.name}</div>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {opt.perks.map((p, i) => (
                                <span key={i} className="text-[9px] px-2 py-0.5 rounded-full bg-slate-50 text-slate-500 border border-slate-100">{p}</span>
                              ))}
                            </div>
                            <div className="text-xs text-slate-500 mt-2">
                              <span className="font-semibold text-slate-700">${opt.pricePerNight}/night</span>
                              <span className="text-slate-300 mx-1.5">·</span>
                              <span>${opt.pricePerNight * a.nights} total</span>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1.5 shrink-0">
                            {!isSel ? (
                              <button onClick={() => setHotelSelections((p) => ({ ...p, [a.dest]: { name: opt.name, status: "selected" } }))}
                                className="text-[10px] px-3 py-1.5 rounded-lg font-semibold bg-slate-800 text-white">
                                Select
                              </button>
                            ) : sel.status !== "booked" ? (
                              <button onClick={() => setHotelSelections((p) => ({ ...p, [a.dest]: { name: opt.name, status: "booked" } }))}
                                className="text-[10px] px-3 py-1.5 rounded-lg font-semibold bg-emerald-500 text-white">
                                Mark booked
                              </button>
                            ) : (
                              <span className="text-[10px] px-3 py-1.5 rounded-lg font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                                {Icons.check({ size: 10 })} Booked
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const Budget = () => {
    const byCat = { ticket: 0, food: 0, experience: 0, transport: 0, free: 0 };
    trip.days.forEach((d) => d.activities.forEach((a) => { byCat[a.type] = (byCat[a.type] || 0) + a.cost; }));

    const accomTotal = trip.accommodation.reduce((s, a) => {
      const sel = hotelSelections[a.dest];
      if (sel?.status === "booked" || sel?.status === "selected") {
        const opt = a.options.find((o) => o.name === sel.name);
        return s + (opt ? opt.pricePerNight * a.nights : 0);
      }
      return s;
    }, 0);

    const actTotal = Object.values(byCat).reduce((s, v) => s + v, 0);
    const actLocal = Math.round(actTotal * trip.exchangeRate);
    const grand = accomTotal + actLocal;

    const lines = [
      { label: "Accommodation", amount: accomTotal, color: "#7c3aed", detail: `${bookedDests} booked, ${selectedDests} selected` },
      { label: "Transport", amount: Math.round(byCat.transport * trip.exchangeRate), color: "#64748b", detail: "Trains, ferries, transfers" },
      { label: "Tickets", amount: Math.round(byCat.ticket * trip.exchangeRate), color: "#2563eb", detail: "Museums, attractions" },
      { label: "Dining", amount: Math.round(byCat.food * trip.exchangeRate), color: "#ea580c", detail: "Planned meals" },
      { label: "Experiences", amount: Math.round(byCat.experience * trip.exchangeRate), color: "#9333ea", detail: "Tours, classes, activities" },
    ];

    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">Budget Overview</h2>

        {/* Grand total card */}
        <div className="rounded-2xl p-5 text-white" style={{ background: "linear-gradient(135deg, #1e293b, #334155)" }}>
          <div className="text-[10px] opacity-50 uppercase tracking-widest">Estimated Total</div>
          <div className="text-3xl font-bold mt-1" style={{ fontFamily: "Georgia, serif" }}>
            ${grand > 0 ? grand.toLocaleString() : "—"}
          </div>
          <div className="text-xs opacity-40 mt-1">{trip.currency} · based on selected options</div>
        </div>

        {/* Breakdown */}
        <div className="space-y-2">
          {lines.map((l) => (
            <div key={l.label} className="bg-white rounded-xl border border-slate-100 p-3.5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-8 rounded-full" style={{ background: l.color }} />
                  <div>
                    <div className="text-sm font-semibold text-slate-700">{l.label}</div>
                    <div className="text-[10px] text-slate-400">{l.detail}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-800">${l.amount > 0 ? l.amount.toLocaleString() : "—"}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Expense total from live tracker */}
        {expenses.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="text-[10px] text-amber-600 font-semibold uppercase tracking-widest">Live Spending</div>
            <div className="text-xl font-bold text-amber-800 mt-1">
              €{expenses.reduce((s, e) => s + e.amount, 0).toFixed(0)}
            </div>
            <div className="text-xs text-amber-600 mt-0.5">{expenses.length} expense{expenses.length !== 1 ? "s" : ""} logged</div>
          </div>
        )}
      </div>
    );
  };

  const Expenses = () => {
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ desc: "", amount: "", cat: "food", paidBy: trip.travelers[0], date: new Date().toISOString().slice(0, 10) });
    const cats = ["accommodation", "transport", "food", "activities", "shopping", "other"];

    const handleAdd = () => {
      const amt = parseFloat(form.amount);
      if (!form.desc.trim() || isNaN(amt) || amt <= 0) return;
      setExpenses((p) => [{ id: Date.now().toString(), desc: form.desc, amount: amt, cat: form.cat, paidBy: form.paidBy, date: form.date }, ...p]);
      setForm({ desc: "", amount: "", cat: "food", paidBy: trip.travelers[0], date: new Date().toISOString().slice(0, 10) });
      setShowForm(false);
    };

    const total = expenses.reduce((s, e) => s + e.amount, 0);
    const byPerson = trip.travelers.map((t) => ({ name: t, total: expenses.filter((e) => e.paidBy === t).reduce((s, e) => s + e.amount, 0) }));

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">Expenses</h2>
          <button onClick={() => setShowForm(!showForm)} className="text-xs px-3 py-1.5 rounded-lg font-semibold bg-slate-800 text-white inline-flex items-center gap-1">
            {Icons.plus({ size: 12 })} Add
          </button>
        </div>

        {/* Split summary */}
        {expenses.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
            <div className="text-xs text-slate-400 mb-2">Total: <span className="font-bold text-slate-700">€{total.toFixed(2)}</span></div>
            <div className="flex gap-3">
              {byPerson.map((p) => (
                <div key={p.name} className="flex-1 bg-slate-50 rounded-lg p-2.5 text-center">
                  <div className="text-xs text-slate-500">{p.name}</div>
                  <div className="text-sm font-bold text-slate-800">€{p.total.toFixed(0)}</div>
                </div>
              ))}
            </div>
            {byPerson.length === 2 && (
              <div className="text-center mt-2 text-[10px] text-slate-400">
                {Math.abs(byPerson[0].total - byPerson[1].total) > 1
                  ? `${byPerson[0].total > byPerson[1].total ? byPerson[1].name : byPerson[0].name} owes €${Math.abs((byPerson[0].total - byPerson[1].total) / 2).toFixed(0)}`
                  : "All even!"}
              </div>
            )}
          </div>
        )}

        {/* Add form */}
        {showForm && (
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
            <input value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} placeholder="What was it for?" className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300" />
            <div className="flex gap-2">
              <input value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="€ amount" type="number" className="flex-1 text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300" />
              <input value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} type="date" className="text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300" />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {cats.map((c) => (
                <button key={c} onClick={() => setForm({ ...form, cat: c })} className={`text-[10px] px-2.5 py-1 rounded-lg border font-medium capitalize ${form.cat === c ? "bg-slate-800 text-white border-slate-800" : "bg-white border-slate-200 text-slate-500"}`}>{c}</button>
              ))}
            </div>
            <div className="flex gap-1.5">
              {trip.travelers.map((t) => (
                <button key={t} onClick={() => setForm({ ...form, paidBy: t })} className={`text-[10px] px-3 py-1.5 rounded-lg border font-medium ${form.paidBy === t ? "bg-slate-800 text-white border-slate-800" : "bg-white border-slate-200 text-slate-500"}`}>{t}</button>
              ))}
            </div>
            <button onClick={handleAdd} className="w-full text-sm py-2 rounded-lg font-semibold bg-slate-800 text-white">Add Expense</button>
          </div>
        )}

        {/* Expense list */}
        <div className="space-y-1.5">
          {expenses.map((e) => (
            <div key={e.id} className="bg-white rounded-xl border border-slate-100 px-3.5 py-3 shadow-sm flex items-center gap-3">
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-700">{e.desc}</div>
                <div className="text-[10px] text-slate-400">{e.date} · {e.paidBy} · <span className="capitalize">{e.cat}</span></div>
              </div>
              <div className="text-sm font-bold text-slate-800">€{e.amount.toFixed(0)}</div>
              <button onClick={() => setExpenses((p) => p.filter((x) => x.id !== e.id))} className="text-slate-300 hover:text-red-400">{Icons.trash({ size: 14 })}</button>
            </div>
          ))}
          {expenses.length === 0 && <div className="text-center py-8 text-sm text-slate-400">No expenses yet. Add one above during your trip.</div>}
        </div>
      </div>
    );
  };

  const Packing = () => {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">Packing List</h2>
        <div className="bg-white rounded-xl border border-slate-100 p-3 shadow-sm">
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${totalPackItems > 0 ? (checkedPackItems / totalPackItems) * 100 : 0}%` }} />
          </div>
          <div className="text-[10px] text-slate-400 mt-1.5 text-right">{checkedPackItems}/{totalPackItems} packed</div>
        </div>

        {trip.packingCategories.map((cat) => (
          <div key={cat.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-slate-50/60 border-b border-slate-100 text-sm font-semibold text-slate-700">{cat.label}</div>
            <div className="divide-y divide-slate-50">
              {cat.items.map((item, i) => {
                const key = `${cat.id}-${i}`;
                const checked = packingChecks[key];
                return (
                  <button key={key} onClick={() => setPackingChecks((p) => ({ ...p, [key]: !p[key] }))}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50/50 transition-colors"
                  >
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${checked ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300"}`}>
                      {checked && Icons.check({ size: 12 })}
                    </div>
                    <span className={`text-sm ${checked ? "line-through text-slate-400" : "text-slate-700"}`}>{item}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const Notes = () => {
    const [draft, setDraft] = useState("");
    const handleAdd = () => {
      if (!draft.trim()) return;
      setNotes((p) => [{ id: Date.now().toString(), content: draft, date: new Date().toISOString().slice(0, 10) }, ...p]);
      setDraft("");
    };
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">Notes</h2>
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm space-y-2">
          <textarea value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Add a note..." rows={3} className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300 resize-none" />
          <button onClick={handleAdd} className="text-xs px-4 py-1.5 rounded-lg font-semibold bg-slate-800 text-white">Save Note</button>
        </div>
        <div className="space-y-2">
          {notes.map((n) => (
            <div key={n.id} className="bg-white rounded-xl border border-slate-100 px-4 py-3 shadow-sm">
              <div className="text-sm text-slate-700 whitespace-pre-wrap">{n.content}</div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] text-slate-400">{n.date}</span>
                <button onClick={() => setNotes((p) => p.filter((x) => x.id !== n.id))} className="text-slate-300 hover:text-red-400">{Icons.trash({ size: 14 })}</button>
              </div>
            </div>
          ))}
          {notes.length === 0 && <div className="text-center py-8 text-sm text-slate-400">No notes yet. Jot something down above.</div>}
        </div>
      </div>
    );
  };

  // ─── NAVIGATION ────────────────────────────────────────────────────
  const primaryNav = [
    { id: "dashboard", label: "Home", icon: Icons.home },
    { id: "timeline", label: "Days", icon: Icons.calendar },
    { id: "hotels", label: "Hotels", icon: Icons.bed },
    { id: "budget", label: "Budget", icon: Icons.wallet },
  ];
  const moreNav = [
    { id: "expenses", label: `Expenses${expenses.length > 0 ? ` (${expenses.length})` : ""}`, icon: Icons.receipt },
    { id: "packing", label: `Packing`, icon: Icons.bag },
    { id: "notes", label: `Notes${notes.length > 0 ? ` (${notes.length})` : ""}`, icon: Icons.note },
  ];
  const isMoreActive = moreNav.some((n) => n.id === view);

  const renderView = () => {
    switch (view) {
      case "dashboard": return <Dashboard />;
      case "timeline": return <Timeline />;
      case "hotels": return <Accommodation />;
      case "budget": return <Budget />;
      case "expenses": return <Expenses />;
      case "packing": return <Packing />;
      case "notes": return <Notes />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20" style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      {/* Content */}
      <main className="max-w-lg mx-auto px-4 py-4">
        {renderView()}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-md border-t border-slate-200" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        <div className="max-w-lg mx-auto flex items-end">
          {primaryNav.map(({ id, label, icon }) => {
            const active = view === id;
            return (
              <button key={id} onClick={() => { setView(id); setMoreOpen(false); }}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-all ${active ? "text-slate-800" : "text-slate-400"}`}
              >
                <div className={`rounded-xl px-3 py-1 transition-all ${active ? "bg-slate-100" : ""}`}>
                  {icon({ size: 20 })}
                </div>
                <span className={`text-[10px] font-medium ${active ? "text-slate-800" : ""}`}>{label}</span>
              </button>
            );
          })}

          {/* More */}
          <button onClick={() => setMoreOpen((v) => !v)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-all relative ${isMoreActive ? "text-slate-800" : "text-slate-400"}`}
          >
            <div className={`rounded-xl px-3 py-1 transition-all ${isMoreActive ? "bg-slate-100" : ""}`}>
              {moreOpen ? Icons.x({ size: 20 }) : Icons.menu({ size: 20 })}
            </div>
            <span className={`text-[10px] font-medium ${isMoreActive ? "text-slate-800" : ""}`}>More</span>
            {urgentCount > 0 && <span className="absolute top-1 right-3 w-4 h-4 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center">{urgentCount}</span>}
          </button>
        </div>

        {/* More drawer */}
        {moreOpen && (
          <div className="border-t border-slate-200 bg-white/95 backdrop-blur-md">
            <div className="max-w-lg mx-auto px-4 py-3 grid grid-cols-3 gap-2">
              {moreNav.map(({ id, label, icon }) => {
                const active = view === id;
                return (
                  <button key={id} onClick={() => { setView(id); setMoreOpen(false); }}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all ${active ? "bg-slate-800 text-white border-slate-800" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                  >
                    {icon({ size: 16 })}
                    <span className="text-[11px] font-medium">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}
