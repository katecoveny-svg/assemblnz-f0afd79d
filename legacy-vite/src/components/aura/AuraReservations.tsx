import { useState, useEffect } from "react";
import { NeonCalendar, NeonMail, NeonStar, NeonDocument, NeonCheckmark } from "@/components/NeonIcons";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Trash2, Edit2, Plus, Loader2, Search, Filter, X } from "lucide-react";
import { AaaipGuardBadge, useAaaipGuard } from "@/aaaip";

const MANAAKI_COLOR = "#4AA5A8";
const PROPERTY_CAPACITY = 12;

const ROOMS = ["Lodge Suite 1", "Lodge Suite 2", "Valley View 1", "Valley View 2", "Premium Suite"];
const STATUS_COLORS: Record<string, string> = { booked: "#5AADA0", available: "#5AADA0", maintenance: "#FF4444" };

interface Booking {
  id: string;
  guest_name: string;
  nationality: string;
  room: string;
  arrival: string;
  departure: string;
  rate: string;
  dietary: string;
  occasion: string;
  arrival_method: string;
  requests: string;
  vip: boolean;
  returning_guest: boolean;
  status: string;
  notes: string;
}

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

const color = "#5AADA0";

interface Props { onGenerate?: (prompt: string) => void; }

const emptyBooking: Omit<Booking, 'id'> = {
  guest_name: "", nationality: "", room: ROOMS[0], arrival: "", departure: "",
  rate: "", dietary: "", occasion: "", arrival_method: "", requests: "",
  vip: false, returning_guest: false, status: "confirmed", notes: ""
};

const AuraReservations = ({ onGenerate }: Props) => {
  const gen = (prompt: string) => onGenerate?.(prompt);
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [activeSection, setActiveSection] = useState<"dashboard" | "comms" | "reviews">("dashboard");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Omit<Booking, 'id'>>(emptyBooking);
  const guard = useAaaipGuard("manaaki");

  // Filter state
  const [searchName, setSearchName] = useState("");
  const [filterRoom, setFilterRoom] = useState<string>("all");
  const [filterVip, setFilterVip] = useState<string>("all");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters = searchName || filterRoom !== "all" || filterVip !== "all" || filterDateFrom || filterDateTo;

  const filteredBookings = bookings.filter(b => {
    if (searchName && !b.guest_name.toLowerCase().includes(searchName.toLowerCase())) return false;
    if (filterRoom !== "all" && b.room !== filterRoom) return false;
    if (filterVip === "vip" && !b.vip) return false;
    if (filterVip === "returning" && !b.returning_guest) return false;
    if (filterVip === "standard" && (b.vip || b.returning_guest)) return false;
    if (filterDateFrom && b.arrival < filterDateFrom) return false;
    if (filterDateTo && b.departure > filterDateTo) return false;
    return true;
  });

  const clearFilters = () => {
    setSearchName(""); setFilterRoom("all"); setFilterVip("all"); setFilterDateFrom(""); setFilterDateTo("");
  };

  // Fetch bookings
  useEffect(() => {
    if (!user) {
      setBookings([]);
      setLoading(false);
      return;
    }
    const fetchBookings = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("arrival", { ascending: true });
      if (error) {
        toast({ title: "Error loading bookings", description: error.message, variant: "destructive" });
      } else {
        setBookings(data || []);
      }
      setLoading(false);
    };
    fetchBookings();
  }, [user]);

  const openCreateDialog = () => {
    setFormData(emptyBooking);
    setEditMode(false);
    setDialogOpen(true);
  };

  const openEditDialog = (booking: Booking) => {
    setFormData({
      guest_name: booking.guest_name, nationality: booking.nationality, room: booking.room,
      arrival: booking.arrival, departure: booking.departure, rate: booking.rate,
      dietary: booking.dietary, occasion: booking.occasion, arrival_method: booking.arrival_method,
      requests: booking.requests, vip: booking.vip, returning_guest: booking.returning_guest,
      status: booking.status, notes: booking.notes
    });
    setSelectedBooking(booking);
    setEditMode(true);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!user) {
      toast({ title: "Please sign in", description: "You must be signed in to manage bookings", variant: "destructive" });
      return;
    }
    if (!formData.guest_name || !formData.arrival || !formData.departure) {
      toast({ title: "Missing fields", description: "Guest name, arrival and departure dates are required", variant: "destructive" });
      return;
    }
    // AAAIP Manaaki policy gate — block overbooks before we touch
    // Supabase. Runs on the create path only; edits pass through.
    if (!editMode) {
      const decision = guard.check({
        kind: "confirm_reservation",
        payload: {
          guestName: formData.guest_name,
          region: "nz",
        },
        world: {
          confirmedCount: bookings.length,
          propertyCapacity: PROPERTY_CAPACITY,
        },
        rationale: `Confirm booking for ${formData.guest_name}`,
      });
      if (decision.blocked) {
        toast({
          title: "Booking blocked by AAAIP",
          description: decision.explanation,
          variant: "destructive",
        });
        return;
      }
      if (decision.requiresHuman) {
        toast({
          title: "Front-of-house approval required",
          description: decision.explanation,
        });
        return;
      }
    }

    setSaving(true);
    if (editMode && selectedBooking) {
      const { error } = await supabase
        .from("bookings")
        .update(formData)
        .eq("id", selectedBooking.id);
      if (error) {
        toast({ title: "Error updating booking", description: error.message, variant: "destructive" });
      } else {
        setBookings(prev => prev.map(b => b.id === selectedBooking.id ? { ...b, ...formData } : b));
        toast({ title: "Booking updated" });
        setDialogOpen(false);
      }
    } else {
      const { data, error } = await supabase
        .from("bookings")
        .insert({ ...formData, user_id: user.id })
        .select()
        .single();
      if (error) {
        toast({ title: "Error creating booking", description: error.message, variant: "destructive" });
      } else {
        setBookings(prev => [...prev, data]);
        toast({ title: "Booking created — cleared by AAAIP Manaaki" });
        setDialogOpen(false);
      }
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("bookings").delete().eq("id", id);
    if (error) {
      toast({ title: "Error deleting booking", description: error.message, variant: "destructive" });
    } else {
      setBookings(prev => prev.filter(b => b.id !== id));
      setSelectedBooking(null);
      toast({ title: "Booking deleted" });
    }
  };

  const updateField = (field: keyof Omit<Booking, 'id'>, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {/* Header row with AAAIP guard badge */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2 flex-wrap">
          {(["dashboard", "comms", "reviews"] as const).map(s => (
            <button key={s} onClick={() => setActiveSection(s)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{ background: activeSection === s ? color + "20" : "transparent", color: activeSection === s ? color : "hsl(var(--muted-foreground))", border: `1px solid ${activeSection === s ? color + "40" : "hsl(var(--border))"}` }}>
              {s === "dashboard" ? "Booking Dashboard" : s === "comms" ? "Guest Communications" : "Review Management"}
            </button>
          ))}
        </div>
        <AaaipGuardBadge
          domain="manaaki"
          accentColor={MANAAKI_COLOR}
          subtitle={`Property cap ${bookings.length}/${PROPERTY_CAPACITY}`}
        />
      </div>

      {activeSection === "dashboard" && (
        <>
          {/* Add Booking Button */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog} className="gap-2" style={{ background: color, color: "#0A0A14" }}>
                <Plus size={16} /> Add Booking
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editMode ? "Edit Booking" : "New Booking"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3 py-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="guest_name">Guest Name *</Label>
                    <Input id="guest_name" value={formData.guest_name} onChange={e => updateField("guest_name", e.target.value)} placeholder="Mr & Mrs Chen" />
                  </div>
                  <div>
                    <Label htmlFor="nationality">Nationality</Label>
                    <Input id="nationality" value={formData.nationality} onChange={e => updateField("nationality", e.target.value)} placeholder="Singapore" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="room">Room *</Label>
                  <Select value={formData.room} onValueChange={v => updateField("room", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ROOMS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="arrival">Arrival Date *</Label>
                    <Input id="arrival" type="date" value={formData.arrival} onChange={e => updateField("arrival", e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="departure">Departure Date *</Label>
                    <Input id="departure" type="date" value={formData.departure} onChange={e => updateField("departure", e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="rate">Rate/Night</Label>
                    <Input id="rate" value={formData.rate} onChange={e => updateField("rate", e.target.value)} placeholder="$2,800" />
                  </div>
                  <div>
                    <Label htmlFor="occasion">Occasion</Label>
                    <Input id="occasion" value={formData.occasion} onChange={e => updateField("occasion", e.target.value)} placeholder="Anniversary" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="dietary">Dietary Requirements</Label>
                  <Input id="dietary" value={formData.dietary} onChange={e => updateField("dietary", e.target.value)} placeholder="Pescatarian, no shellfish" />
                </div>
                <div>
                  <Label htmlFor="arrival_method">Arrival Method</Label>
                  <Input id="arrival_method" value={formData.arrival_method} onChange={e => updateField("arrival_method", e.target.value)} placeholder="Helicopter" />
                </div>
                <div>
                  <Label htmlFor="requests">Special Requests</Label>
                  <Input id="requests" value={formData.requests} onChange={e => updateField("requests", e.target.value)} placeholder="Preferred Pinot Noir in suite" />
                </div>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={formData.vip} onChange={e => updateField("vip", e.target.checked)} className="rounded" />
                    VIP Guest
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={formData.returning_guest} onChange={e => updateField("returning_guest", e.target.checked)} className="rounded" />
                    Returning Guest
                  </label>
                </div>
                <Button onClick={handleSave} disabled={saving} style={{ background: color, color: "#0A0A14" }}>
                  {saving ? <Loader2 className="animate-spin" size={16} /> : editMode ? "Update Booking" : "Create Booking"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Search & Filter Bar */}
          <div className="space-y-2">
            <div className="flex gap-2 items-center">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search guest name..."
                  value={searchName}
                  onChange={e => setSearchName(e.target.value)}
                  className="pl-8 h-9 text-xs"
                />
              </div>
              <Button
                variant={showFilters ? "secondary" : "outline"}
                size="sm"
                className="gap-1.5 text-xs h-9"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={13} />
                Filters
                {hasActiveFilters && (
                  <span className="ml-1 w-4 h-4 rounded-full text-[10px] flex items-center justify-center" style={{ background: color, color: "#0A0A14" }}>
                    !
                  </span>
                )}
              </Button>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" className="gap-1 text-xs h-9 text-muted-foreground" onClick={clearFilters}>
                  <X size={13} /> Clear
                </Button>
              )}
            </div>

            {showFilters && (
              <div className="grid grid-cols-2 gap-2 p-3 rounded-lg border border-border bg-card">
                <div>
                  <Label className="text-[11px] text-muted-foreground mb-1 block">Room</Label>
                  <Select value={filterRoom} onValueChange={setFilterRoom}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Rooms</SelectItem>
                      {ROOMS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[11px] text-muted-foreground mb-1 block">Guest Type</Label>
                  <Select value={filterVip} onValueChange={setFilterVip}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Guests</SelectItem>
                      <SelectItem value="vip">VIP Only</SelectItem>
                      <SelectItem value="returning">Returning Only</SelectItem>
                      <SelectItem value="standard">Standard Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[11px] text-muted-foreground mb-1 block">From Date</Label>
                  <Input type="date" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} className="h-8 text-xs" />
                </div>
                <div>
                  <Label className="text-[11px] text-muted-foreground mb-1 block">To Date</Label>
                  <Input type="date" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} className="h-8 text-xs" />
                </div>
              </div>
            )}

            {hasActiveFilters && (
              <p className="text-[11px] text-muted-foreground">
                Showing {filteredBookings.length} of {bookings.length} booking{bookings.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          {/* Room Status */}
          <div className="rounded-xl border border-border bg-card p-4" style={{ borderColor: color + "20" }}>
            <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2"><NeonCalendar size={16} color={color} /> Room Occupancy</h3>
            {loading ? (
              <div className="flex items-center justify-center py-8"><Loader2 className="animate-spin" size={24} style={{ color }} /></div>
            ) : (
              <div className="space-y-2">
                {ROOMS.map(room => {
                  const booking = bookings.find(b => b.room === room && b.status !== "cancelled" && b.status !== "checked_out");
                  const status = booking ? "booked" : "available";
                  return (
                    <div key={room} className="flex items-center gap-2 text-xs p-2 rounded-lg border border-border">
                      <span className="w-2 h-2 rounded-full" style={{ background: STATUS_COLORS[status] }} />
                      <span className="font-medium text-foreground flex-1">{room}</span>
                      {booking ? (
                        <button onClick={() => setSelectedBooking(booking)} className="flex items-center gap-1 hover:underline" style={{ color }}>
                          {booking.guest_name} {booking.vip && <NeonStar size={12} />}
                        </button>
                      ) : (
                        <span className="text-muted-foreground">Available</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            <div className="flex gap-4 mt-3 text-[10px] text-muted-foreground">
              {Object.entries(STATUS_COLORS).map(([k, v]) => (
                <span key={k} className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: v }} />{k}</span>
              ))}
            </div>
          </div>

          {/* Booking Cards */}
          {!loading && filteredBookings.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              {!user ? "Sign in to manage bookings." : hasActiveFilters ? "No bookings match your filters." : "No bookings yet. Click 'Add Booking' to create one."}
            </div>
          )}
          <div className="space-y-3">
            {filteredBookings.map(b => (
              <div key={b.id} className="rounded-xl border border-border bg-card p-4 cursor-pointer hover:border-foreground/10 transition-all" onClick={() => setSelectedBooking(b)}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-foreground">{b.guest_name}</span>
                    {b.vip && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: color + "20", color }}>VIP</span>}
                    {b.returning_guest && <span className="px-1.5 py-0.5 rounded text-[9px] bg-muted text-muted-foreground">Returning</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-muted-foreground">{b.nationality}</span>
                    <button onClick={(e) => { e.stopPropagation(); openEditDialog(b); }} className="p-1 hover:bg-muted rounded"><Edit2 size={14} /></button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(b.id); }} className="p-1 hover:bg-destructive/10 rounded text-destructive"><Trash2 size={14} /></button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[11px] text-foreground/70">
                  <div><span className="text-muted-foreground">Room:</span> {b.room}</div>
                  <div><span className="text-muted-foreground">Rate:</span> {b.rate}/night</div>
                  <div><span className="text-muted-foreground">Arrival:</span> {b.arrival}</div>
                  <div><span className="text-muted-foreground">Departure:</span> {b.departure}</div>
                  <div><span className="text-muted-foreground">Dietary:</span> {b.dietary || "None"}</div>
                  <div><span className="text-muted-foreground">Occasion:</span> {b.occasion || "None"}</div>
                  <div><span className="text-muted-foreground">Arrival:</span> {b.arrival_method || "TBD"}</div>
                  <div><span className="text-muted-foreground">Requests:</span> {b.requests || "None"}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Pre-Arrival Dossier */}
          {selectedBooking && (
            <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: color + "40", background: color + "08" }}>
              <h3 className="font-semibold text-sm flex items-center gap-2" style={{ color }}><NeonDocument size={16} color={color} /> Pre-Arrival Dossier — {selectedBooking.guest_name}</h3>
              <div className="space-y-2 text-xs text-foreground/80">
                <div className="p-2 rounded-lg bg-card border border-border"><span className="font-medium">Welcome Letter:</span> Personalised to {selectedBooking.occasion ? selectedBooking.occasion.toLowerCase() : "their visit"} celebration. Mention previous stay preferences if returning.</div>
                <div className="p-2 rounded-lg bg-card border border-border"><span className="font-medium">Room Prep:</span> {selectedBooking.occasion === "Honeymoon" ? "Rose petals, champagne on ice, congratulations card" : selectedBooking.occasion === "Anniversary" ? "Handwritten card from GM, commemorative photo frame, preferred wine" : "Fresh flowers, welcome amenities"}</div>
                <div className="p-2 rounded-lg bg-card border border-border"><span className="font-medium">Dietary Brief:</span> {selectedBooking.dietary || "No dietary requirements noted"} — kitchen team notified for all meals</div>
                <div className="p-2 rounded-lg bg-card border border-border"><span className="font-medium">Activity Suggestions:</span> Based on {selectedBooking.arrival} season — stargazing, nature walks, wine tasting</div>
                {selectedBooking.returning_guest && <div className="p-2 rounded-lg bg-card border border-border"><span className="font-medium">Returning Guest:</span> Recall preferences from previous visit — favourite wines, activities, room temperature</div>}
              </div>
              <button onClick={() => gen(`Generate a complete pre-arrival guest dossier for ${selectedBooking.guest_name}. They are celebrating their ${selectedBooking.occasion ? selectedBooking.occasion.toLowerCase() : "stay"}. Dietary: ${selectedBooking.dietary || "None specified"}. Room: ${selectedBooking.room}. Arriving ${selectedBooking.arrival} via ${selectedBooking.arrival_method || "TBD"}. ${selectedBooking.returning_guest ? "This is a returning guest — recall preferences from previous visits." : "First-time guest."} Special requests: ${selectedBooking.requests || "None"}. Include: personalised welcome letter, room preparation notes, activity recommendations for the season, wine pairing suggestions, and weather forecast for their stay. Luxury lodge tone — warm, understated, anticipatory.`)} className="w-full py-2 rounded-lg text-xs font-medium" style={{ background: color, color: "#0A0A14" }}>Generate Full Dossier</button>
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
                  <button onClick={() => gen(`Generate a luxury lodge "${t.label}" template for review management. ${t.desc}. Tone: personal, genuine, and warm. For negative reviews: empathetic, solution-focused, take the conversation offline. Never defensive or templated-sounding.`)} className="px-3 py-1 rounded-full text-[10px] font-medium" style={{ background: color + "20", color }}>Generate</button>
                </div>
              ))}
            </div>
          </div>
          <button onClick={() => gen(`Generate a monthly guest review summary report. Include: aggregate scores across platforms (TripAdvisor, Google, Booking.com), common praise themes, common improvement themes, sentiment analysis breakdown, and a prioritised action plan for next month. Present as a professional report the GM can share with the team.`)} className="w-full py-2.5 rounded-lg text-xs font-medium" style={{ background: color, color: "#0A0A14" }}>Generate Monthly Review Summary</button>
        </div>
      )}
    </div>
  );
};

export default AuraReservations;
