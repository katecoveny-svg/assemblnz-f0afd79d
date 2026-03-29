import { useState } from "react";
import { Copy, Calendar, Sparkles, PartyPopper, MapPin, Users, DollarSign } from "lucide-react";

const FORGE_COLOR = "#FF4D6A";

const STANDARD_EVENTS = [
  "New Model Launch Night", "VIP Customer Preview Evening", "Service Clinic / Open Day",
  "Long Weekend Sale Event", "Community Sponsorship Event", "Kids' Day (School Holidays)", "Customer Appreciation / Christmas Function",
];

const WOW_EVENTS = [
  { name: "Test Drive & Dine", desc: "Partner with a local NZ restaurant — customers test drive to the venue for dinner with vehicle on display." },
  { name: "Adventure Test Drive", desc: "Scenic NZ route (West Auckland ranges, Port Hills, Crown Range) to showcase vehicle capability." },
  { name: "Drive-In Movie Night", desc: "Screen at the dealership, customers watch from display vehicles. Popcorn, feature demos at intermission." },
  { name: "Coffee & Cars Morning", desc: "Weekend morning with specialty NZ coffee (Allpress/Kokako), display vehicles open, live music." },
  { name: "EV Experience Day", desc: "Charging demo, range myth-busting, cost comparison, local EV owner testimonials, home charging info." },
  { name: "Family Fun Day & Launch", desc: "Bouncy castle, face painting, sausage sizzle, new model reveal with smoke/lights." },
  { name: "Track Day Experience", desc: "Hampton Downs or Taupo track, performance models at speed, pro ride-alongs, GoPro content." },
  { name: "Glamping & 4WD Experience", desc: "Partner with NZ glamping site, off-road course, camping in vehicles, stargazing." },
  { name: "Art & Automotive", desc: "Local NZ artists, vehicles as art, wine, live painting, charity auction." },
  { name: "Heritage Collection Day", desc: "Classic/older models same brand, timeline display, new vs old photos, storytelling." },
];

const generateEventPlan = (eventName: string) => {
  return `# ${eventName} — Event Plan

## Concept & Theme
${eventName} — an immersive customer experience designed to generate leads, build brand loyalty, and create shareable social content.

## Guest List Strategy
• Target: 40-80 guests (manageable, high-quality interactions)
• Invite sources: Recent enquiries, service customers (last 12mo), VIP database, social media followers
• Method: Email invitation + physical card for VIP customers + social media event page

## Invitation Template
Subject: You're Invited — ${eventName} at [Dealership]

Hi [Name],

We'd love you to join us for an exclusive ${eventName.toLowerCase()} at [Dealership]. An evening of [experience description], with refreshments and a first look at our latest models.

📅 [Date] | 🕕 [Time] | 📍 [Venue]

RSVP by [Date]: [Link] or call [Phone]

Warm regards,
[Dealership Team]

## Timeline / Run Sheet
5:00pm — Team briefing, final venue check
5:30pm — Registration & welcome drinks
6:00pm — Welcome address from Dealer Principal
6:15pm — Vehicle reveal / experience begins
7:00pm — Refreshments and networking
7:30pm — Guest test drives / feature demonstrations
8:30pm — Prize draw / special announcement
9:00pm — Thank you & close

## Venue Requirements
• Space for 4-6 display vehicles
• Power for lighting and AV
• Kitchen/catering area
• Registration table at entrance
• Test drive route planned and approved

## Catering Suggestions
• NZ craft beer (Garage Project, Panhead, Behemoth)
• Local wine (Hawke's Bay or Marlborough)
• Canapes from local caterer
• Non-alcoholic options (Karma Cola, Good Buzz)
• Coffee cart (Allpress, Kokako, or local roaster)

## Budget Estimate (50 guests)
| Item | Cost |
|------|------|
| Catering & beverages | $2,500 |
| Venue hire/setup | $1,500 |
| Entertainment/music | $800 |
| Printing/invitations | $400 |
| Decorations/branding | $600 |
| Photography | $500 |
| Prizes/giveaways | $300 |
| Contingency (10%) | $660 |
| **TOTAL** | **$7,260** |

## Marketing Plan
### Pre-Event (2 weeks before)
- Social media announcement post
- Email invitation to database
- Event hashtag: #[Dealership]${eventName.replace(/\s/g,'')}
- Countdown stories on Instagram/Facebook

### During Event
- Live social media stories/posts
- Professional photographer for hero shots
- Guest testimonial capture
- Real-time hashtag monitoring

### Post-Event
- Thank you email with photo gallery link
- Special offer for attendees (24-48hr exclusive)
- Social media photo album
- Blog post recap

## Lead Capture Strategy
• Registration form captures: Name, email, phone, vehicle interest, current vehicle
• Test drive sign-ups during event
• Competition entry captures details
• Follow-up calls within 48 hours
• Assign all leads to CRM pipeline

## Post-Event Follow-Up
**Day 1:** Thank you email + photo gallery
**Day 3:** Personal phone call from sales team
**Day 7:** Special attendee-only offer
**Day 14:** Final follow-up with new stock updates

## ROI Measurement
• Leads generated vs cost per lead
• Test drives conducted at event
• Sales attributed within 30 days
• Social media reach and engagement
• Customer feedback score`;
};

interface EventRecord {
  id: string; name: string; date: string; type: string;
  status: "Planning" | "Confirmed" | "Complete";
  invited: number; attended: number; leads: number; sales: number;
  budget: number; spent: number; notes: string;
}

const DEMO_EVENTS: EventRecord[] = [
  { id: "1", name: "Summer Launch Night", date: "2025-01-25", type: "New Model Launch", status: "Complete", invited: 65, attended: 48, leads: 22, sales: 4, budget: 7500, spent: 6800, notes: "Great turnout. 4 sales within 2 weeks." },
  { id: "2", name: "Coffee & Cars March", date: "2025-03-15", type: "Coffee & Cars", status: "Confirmed", invited: 80, attended: 0, leads: 0, sales: 0, budget: 3000, spent: 1200, notes: "Allpress confirmed. Instagram promo live." },
  { id: "3", name: "Easter Long Weekend Sale", date: "2025-04-18", type: "Sale Event", status: "Planning", invited: 0, attended: 0, leads: 0, sales: 0, budget: 5000, spent: 0, notes: "Need to confirm radio ad booking." },
];

export default function ForgeEvents() {
  const [tab, setTab] = useState<"planner" | "calendar">("planner");
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [eventPlan, setEventPlan] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const copy = (text: string) => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      <h2 className="text-lg font-bold text-foreground">Events</h2>
      <div className="flex gap-2">
        <button onClick={() => setTab("planner")} className="px-3 py-1.5 rounded-lg text-[10px] font-medium"
          style={{ backgroundColor: tab === "planner" ? FORGE_COLOR + "20" : "transparent", color: tab === "planner" ? FORGE_COLOR : "hsl(var(--muted-foreground))", border: `1px solid ${tab === "planner" ? FORGE_COLOR + "40" : "hsl(var(--border))"}` }}>
          <PartyPopper size={10} className="inline mr-1" /> Event Planner
        </button>
        <button onClick={() => setTab("calendar")} className="px-3 py-1.5 rounded-lg text-[10px] font-medium"
          style={{ backgroundColor: tab === "calendar" ? FORGE_COLOR + "20" : "transparent", color: tab === "calendar" ? FORGE_COLOR : "hsl(var(--muted-foreground))", border: `1px solid ${tab === "calendar" ? FORGE_COLOR + "40" : "hsl(var(--border))"}` }}>
          <Calendar size={10} className="inline mr-1" /> Event Calendar
        </button>
      </div>

      {tab === "planner" && !eventPlan && (
        <div className="space-y-4">
          <div>
            <h3 className="text-xs font-bold text-foreground mb-2">Standard Events</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {STANDARD_EVENTS.map(e => (
                <button key={e} onClick={() => setEventPlan(generateEventPlan(e))}
                  className="text-left p-3 rounded-xl border border-border bg-card hover:border-foreground/10 transition-colors">
                  <p className="text-xs font-medium text-foreground">{e}</p>
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold text-foreground mb-2 flex items-center gap-1"><Sparkles size={12} style={{ color: FORGE_COLOR }} /> Out-of-This-World Events</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {WOW_EVENTS.map(e => (
                <button key={e.name} onClick={() => setEventPlan(generateEventPlan(e.name))}
                  className="text-left p-3 rounded-xl border bg-card hover:border-foreground/10 transition-colors" style={{ borderColor: FORGE_COLOR + "20" }}>
                  <p className="text-xs font-medium text-foreground">{e.name}</p>
                  <p className="text-[9px] text-muted-foreground mt-0.5">{e.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "planner" && eventPlan && (
        <div className="space-y-3">
          <button onClick={() => setEventPlan(null)} className="text-xs text-muted-foreground hover:text-foreground">← Back to events</button>
          <div className="p-4 rounded-xl border border-border bg-card">
            <pre className="whitespace-pre-wrap text-[10px] text-foreground/80 font-sans">{eventPlan}</pre>
          </div>
          <button onClick={() => copy(eventPlan)} className="flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-bold" style={{ backgroundColor: FORGE_COLOR, color: "#0A0A14" }}>
            <Copy size={12} /> {copied ? "Copied!" : "Copy Event Plan"}
          </button>
        </div>
      )}

      {tab === "calendar" && (
        <div className="space-y-2">
          {DEMO_EVENTS.map(e => (
            <div key={e.id} className="p-3 rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-xs font-bold text-foreground">{e.name}</h4>
                <span className="text-[9px] px-2 py-0.5 rounded-full" style={{
                  backgroundColor: e.status === "Complete" ? "#00FF8820" : e.status === "Confirmed" ? "#00E5FF20" : "#FFB80020",
                  color: e.status === "Complete" ? "#00FF88" : e.status === "Confirmed" ? "#00E5FF" : "#FFB800",
                }}>{e.status}</span>
              </div>
              <p className="text-[10px] text-muted-foreground mb-2">{e.type} · {new Date(e.date).toLocaleDateString("en-NZ", { day: "numeric", month: "short", year: "numeric" })}</p>
              <div className="flex gap-4 text-[9px] text-muted-foreground">
                <span><Users size={9} className="inline" /> {e.attended}/{e.invited}</span>
                <span>Leads: {e.leads}</span>
                <span>Sales: {e.sales}</span>
                <span><DollarSign size={9} className="inline" /> ${e.spent.toLocaleString()}/${e.budget.toLocaleString()}</span>
              </div>
              {e.notes && <p className="text-[9px] text-muted-foreground mt-1 italic">{e.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
