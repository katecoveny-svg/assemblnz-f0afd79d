import { useState } from "react";
import { NeonCalendar, NeonMail, NeonStar, NeonDocument, NeonCheckmark } from "@/components/NeonIcons";

const ROOMS = ["Lodge Suite 1", "Lodge Suite 2", "Valley View 1", "Valley View 2", "Premium Suite"];
const STATUS_COLORS: Record<string, string> = { booked: "#E6B422", available: "#00FF88", maintenance: "#FF4444" };

interface Booking {
  id: string; guest: string; nationality: string; room: string; arrival: string; departure: string;
  rate: string; dietary: string; occasion: string; arrivalMethod: string; requests: string; vip: boolean; returning: boolean;
}

const SAMPLE_BOOKINGS: Booking[] = [
  { id: "1", guest: "Mr & Mrs Chen", nationality: "Singapore", room: "Premium Suite", arrival: "2026-03-25", departure: "2026-03-28", rate: "$2,800", dietary: "Pescatarian, no shellfish", occasion: "Anniversary", arrivalMethod: "Helicopter", requests: "Preferred Pinot Noir in suite", vip: true, returning: true },
  { id: "2", guest: "James & Sarah Mitchell", nationality: "Australia", room: "Lodge Suite 1", arrival: "2026-03-26", departure: "2026-03-30", rate: "$1,800", dietary: "Gluten-free", occasion: "Honeymoon", arrivalMethod: "Car transfer", requests: "Late checkout if possible", vip: false, returning: false },
];

const COMMS_TEMPLATES = [
  { label: "Booking Confirmation", desc: "Warm, personal confirmation — never transactional" },
  { label: "Pre-Arrival Pack", desc: "What to bring, how to arrive, what to expect" },
  { label: "Arrival Day SMS", desc: "'We're looking forward to welcoming you this afternoon'" },
  { label: "During-Stay Check-in", desc: "Day 2 morning message from the manager" },
  { label: "Departure Thank-you", desc: "Personal farewell and feedback request" },
  { label: "Post-Stay Follow-up", desc: "2 weeks later — personal, not automated-feeling" },
  { label: "Birthday/Anniversary Card", desc: "For the following year — surprise return invite" },
  { label: "Returning Guest Welcome", desc: "'We've remembered your favourite Pinot from last year'" },
  { label: "Referral Thank-you", desc: "Personal acknowledgment of recommendations" },
];

const REVIEW_TEMPLATES = [
  { label: "Review Request", desc: "Post-stay for TripAdvisor, Google, Booking.com" },
  { label: "Positive Review Response", desc: "Grateful, personal acknowledgment" },
  { label: "Mixed Review Response", desc: "Acknowledge concerns + invite back" },
  { label: "Negative Review Response", desc: "Empathetic, solution-focused, offline resolution" },
];

const color = "#E6B422";

interface Props { onGenerate?: (prompt: string) => void; }

const AuraReservations = ({ onGenerate }: Props) => {
  const gen = (prompt: string) => onGenerate?.(prompt);
  const [bookings] = useState<Booking[]>(SAMPLE_BOOKINGS);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [activeSection, setActiveSection] = useState<"dashboard" | "comms" | "reviews">("dashboard");

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {/* Section tabs */}
      <div className="flex gap-2">
        {(["dashboard", "comms", "reviews"] as const).map(s => (
          <button key={s} onClick={() => setActiveSection(s)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{ background: activeSection === s ? color + "20" : "transparent", color: activeSection === s ? color : "hsl(var(--muted-foreground))", border: `1px solid ${activeSection === s ? color + "40" : "hsl(var(--border))"}` }}>
            {s === "dashboard" ? "Booking Dashboard" : s === "comms" ? "Guest Communications" : "Review Management"}
          </button>
        ))}
      </div>

      {activeSection === "dashboard" && (
        <>
          {/* Room Status */}
          <div className="rounded-xl border border-border bg-card p-4" style={{ borderColor: color + "20" }}>
            <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2"><NeonCalendar size={16} color={color} /> Room Occupancy</h3>
            <div className="space-y-2">
              {ROOMS.map(room => {
                const booking = bookings.find(b => b.room === room);
                const status = booking ? "booked" : "available";
                return (
                  <div key={room} className="flex items-center gap-2 text-xs p-2 rounded-lg border border-border">
                    <span className="w-2 h-2 rounded-full" style={{ background: STATUS_COLORS[status] }} />
                    <span className="font-medium text-foreground flex-1">{room}</span>
                    {booking ? (
                      <button onClick={() => setSelectedBooking(booking)} className="flex items-center gap-1 hover:underline" style={{ color }}>
                        {booking.guest} {booking.vip && <NeonStar size={12} />}
                      </button>
                    ) : (
                      <span className="text-muted-foreground">Available</span>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex gap-4 mt-3 text-[10px] text-muted-foreground">
              {Object.entries(STATUS_COLORS).map(([k, v]) => (
                <span key={k} className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: v }} />{k}</span>
              ))}
            </div>
          </div>

          {/* Booking Cards */}
          <div className="space-y-3">
            {bookings.map(b => (
              <div key={b.id} className="rounded-xl border border-border bg-card p-4 cursor-pointer hover:border-foreground/10 transition-all" onClick={() => setSelectedBooking(b)}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-foreground">{b.guest}</span>
                    {b.vip && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: color + "20", color }}>VIP</span>}
                    {b.returning && <span className="px-1.5 py-0.5 rounded text-[9px] bg-muted text-muted-foreground">Returning</span>}
                  </div>
                  <span className="text-[11px] text-muted-foreground">{b.nationality}</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[11px] text-foreground/70">
                  <div><span className="text-muted-foreground">Room:</span> {b.room}</div>
                  <div><span className="text-muted-foreground">Rate:</span> {b.rate}/night</div>
                  <div><span className="text-muted-foreground">Arrival:</span> {b.arrival}</div>
                  <div><span className="text-muted-foreground">Departure:</span> {b.departure}</div>
                  <div><span className="text-muted-foreground">Dietary:</span> {b.dietary}</div>
                  <div><span className="text-muted-foreground">Occasion:</span> {b.occasion}</div>
                  <div><span className="text-muted-foreground">Arrival:</span> {b.arrivalMethod}</div>
                  <div><span className="text-muted-foreground">Requests:</span> {b.requests}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Pre-Arrival Dossier */}
          {selectedBooking && (
            <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: color + "40", background: color + "08" }}>
              <h3 className="font-semibold text-sm flex items-center gap-2" style={{ color }}><NeonDocument size={16} color={color} /> Pre-Arrival Dossier — {selectedBooking.guest}</h3>
              <div className="space-y-2 text-xs text-foreground/80">
                <div className="p-2 rounded-lg bg-card border border-border"><span className="font-medium">Welcome Letter:</span> Personalised to {selectedBooking.occasion.toLowerCase()} celebration. Mention previous stay preferences if returning.</div>
                <div className="p-2 rounded-lg bg-card border border-border"><span className="font-medium">Room Prep:</span> {selectedBooking.occasion === "Honeymoon" ? "Rose petals, champagne on ice, congratulations card" : selectedBooking.occasion === "Anniversary" ? "Handwritten card from GM, commemorative photo frame, preferred wine" : "Fresh flowers, welcome amenities"}</div>
                <div className="p-2 rounded-lg bg-card border border-border"><span className="font-medium">Dietary Brief:</span> {selectedBooking.dietary} — kitchen team notified for all meals</div>
                <div className="p-2 rounded-lg bg-card border border-border"><span className="font-medium">Activity Suggestions:</span> Based on {selectedBooking.arrival} season — stargazing, nature walks, wine tasting</div>
                {selectedBooking.returning && <div className="p-2 rounded-lg bg-card border border-border"><span className="font-medium">Returning Guest:</span> Recall preferences from previous visit — favourite wines, activities, room temperature</div>}
              </div>
              <button onClick={() => gen(`Generate a complete pre-arrival guest dossier for ${selectedBooking.guest}. They are celebrating their ${selectedBooking.occasion.toLowerCase()}. Dietary: ${selectedBooking.dietary}. Room: ${selectedBooking.room}. Arriving ${selectedBooking.arrival} via ${selectedBooking.arrivalMethod}. ${selectedBooking.returning ? "This is a returning guest — recall preferences from previous visits." : "First-time guest."} Special requests: ${selectedBooking.requests}. Include: personalised welcome letter, room preparation notes, activity recommendations for the season, wine pairing suggestions, and weather forecast for their stay. Luxury lodge tone — warm, understated, anticipatory.`)} className="w-full py-2 rounded-lg text-xs font-medium" style={{ background: color, color: "#0A0A14" }}>Generate Full Dossier</button>
            </div>
          )}
        </>
      )}

      {activeSection === "comms" && (
        <div className="space-y-3">
          <div className="rounded-xl border border-border bg-card p-4" style={{ borderColor: color + "20" }}>
            <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2"><NeonMail size={16} color={color} /> Guest Communication Templates</h3>
            <p className="text-[11px] text-muted-foreground mb-3">Every communication feels handwritten and personal — warm, understated, anticipatory.</p>
            <div className="space-y-2">
              {COMMS_TEMPLATES.map(t => (
                <div key={t.label} className="flex items-center justify-between p-2.5 rounded-lg border border-border hover:border-foreground/10 transition-all">
                  <div>
                    <div className="text-xs font-medium text-foreground">{t.label}</div>
                    <div className="text-[10px] text-muted-foreground">{t.desc}</div>
                  </div>
                  <button onClick={() => gen(`Generate a luxury lodge "${t.label}" template. ${t.desc}. The tone must feel handwritten and personal — warm, understated, anticipatory. Think 'We've remembered your favourite Pinot from last year and have a bottle waiting in your suite' not 'Dear Guest, please rate your stay.' Include personalisation placeholders for guest name, dates, room, and occasion.`)} className="px-3 py-1 rounded-full text-[10px] font-medium" style={{ background: color + "20", color }}>Generate</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSection === "reviews" && (
        <div className="space-y-3">
          <div className="rounded-xl border border-border bg-card p-4" style={{ borderColor: color + "20" }}>
            <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2"><NeonStar size={16} /> Review Management</h3>
            <div className="space-y-2">
              {REVIEW_TEMPLATES.map(t => (
                <div key={t.label} className="flex items-center justify-between p-2.5 rounded-lg border border-border">
                  <div>
                    <div className="text-xs font-medium text-foreground">{t.label}</div>
                    <div className="text-[10px] text-muted-foreground">{t.desc}</div>
                  </div>
                  <button className="px-3 py-1 rounded-full text-[10px] font-medium" style={{ background: color + "20", color }}>Generate</button>
                </div>
              ))}
            </div>
          </div>
          <button className="w-full py-2.5 rounded-lg text-xs font-medium" style={{ background: color, color: "#0A0A14" }}>Generate Monthly Review Summary</button>
        </div>
      )}
    </div>
  );
};

export default AuraReservations;
