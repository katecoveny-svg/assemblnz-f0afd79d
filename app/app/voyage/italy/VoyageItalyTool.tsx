"use client";

import { useEffect, useState } from "react";
import { DashAgentLoader } from "@/components/dash/DashAgentLoader";
import {
  CalendarDays,
  Camera,
  CheckCircle2,
  CloudSun,
  Copy,
  Download,
  Euro,
  FileText,
  Hotel,
  ImagePlus,
  MapPin,
  MessageCircle,
  Plane,
  Sparkles,
  Train,
  Upload,
  X,
} from "lucide-react";
import { HapaiToolShell } from "@/components/hapai/HapaiToolShell";

function htmlToMarkdown(html: string) {
  return html
    .replace(/<h2>(.*?)<\/h2>/g, "\n## $1\n")
    .replace(/<li>(.*?)<\/li>/g, "- $1\n")
    .replace(/<strong>(.*?)<\/strong>/g, "**$1**")
    .replace(/<\/?ul>/g, "")
    .replace(/<p>(.*?)<\/p>/g, "$1\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const cityOptions = ["Milan", "Lake Garda", "Florence", "Tuscany", "Rome", "Praiano", "Amalfi", "Como", "Venice", "Naples", "Bologna", "Siena"];
const STORAGE_KEY = "assembl:voyage-italy:trip-board:v1";
const MOMENTS_KEY = "assembl:voyage-italy:moments:v1";

const kateAdrianRoute = [
  "Milan — 25-28 May · 3 nights · Crowne Plaza Milan City · arrive 6:30am, Como day trip, Duomo rooftops",
  "Lake Garda — 28-30 May · 2 nights · Bellerive Lifestyle Hotel · Monte Baldo, Verona, lakeside reset",
  "Florence — 30 May-1 Jun · 2 nights · Dimora Collection - Le Logge · Uffizi, David, food, walking",
  "Tuscany — 1-3 Jun · 2 nights · Villa Mami · Chianti, Siena, Val d'Orcia, slower days",
  "Rome — 3-5 Jun · 2 nights · Indigo Hotel - Rome · Colosseum, Vatican, neighbourhood dinners",
  "Praiano & Amalfi — 5-9 Jun · 4 nights · Hotel Piccolo Sant'Andrea · coast, Path of the Gods, Capri/Positano options",
  "Rome flight leg — 9 Jun · final transfer and departure buffer",
].join("\n");

const itineraryStops = [
  {
    stop: "01",
    city: "Milan",
    dates: "25-28 May",
    hotel: "Crowne Plaza Milan City",
    note: "Arrive 6:30am, recover gently, Como day trip, Duomo rooftop sunset, Navigli aperitivo.",
  },
  {
    stop: "02",
    city: "Lake Garda",
    dates: "28-30 May",
    hotel: "Bellerive Lifestyle Hotel",
    note: "Monte Baldo, Verona option, lake weather, easy shoes, road buffer.",
  },
  {
    stop: "03",
    city: "Florence",
    dates: "30 May-1 Jun",
    hotel: "Dimora Collection - Le Logge",
    note: "Uffizi, David, galleries, food, short walks between heat and queues.",
  },
  {
    stop: "04",
    city: "Tuscany",
    dates: "1-3 Jun",
    hotel: "Villa Mami",
    note: "Chianti, Siena, Val d'Orcia, slower drives and one excellent lunch.",
  },
  {
    stop: "05",
    city: "Rome",
    dates: "3-5 Jun",
    hotel: "Indigo Hotel - Rome",
    note: "Vatican, Colosseum, neighbourhood evenings, ticket timing checks.",
  },
  {
    stop: "06",
    city: "Praiano",
    dates: "5-9 Jun",
    hotel: "Hotel Piccolo Sant'Andrea",
    note: "Amalfi Coast, Path of the Gods, ferries/boats only if weather makes sense.",
  },
  {
    stop: "07",
    city: "Rome",
    dates: "9 Jun",
    hotel: "flight leg",
    note: "Transfer buffer, repack, documents, departure day calm.",
  },
] as const;

type RouteWeather = {
  city: string;
  summary: string;
};

type TripMoment = {
  id: string;
  imageDataUrl: string;
  caption: string;
  createdAt: string;
};

const proofCards = [
  {
    icon: CloudSun,
    title: "live travel read",
    body: "weather and EUR to NZD checked before the brief is drafted",
  },
  {
    icon: Camera,
    title: "reads a photo",
    body: "menus, signs, tickets, booking emails, and train boards made useful",
  },
  {
    icon: Train,
    title: "timing risks",
    body: "must-book spots, Sunday hours, queues, transfers, and train buffers",
  },
] as const;

export function VoyageItalyTool() {
  const [city, setCity] = useState("Milan");
  const [travelers, setTravelers] = useState("Kate, Adrian");
  const [departureDate, setDepartureDate] = useState("2026-05-24");
  const [routePlan, setRoutePlan] = useState(kateAdrianRoute);
  const [bookingVault, setBookingVault] = useState("");
  const [today, setToday] = useState("");
  const [bookings, setBookings] = useState("");
  const [worries, setWorries] = useState("");
  const [notes, setNotes] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState("");
  const [imageName, setImageName] = useState("");
  const [html, setHtml] = useState("");
  const [weather, setWeather] = useState("");
  const [fx, setFx] = useState("");
  const [routeWeather, setRouteWeather] = useState<RouteWeather[]>([]);
  const [question, setQuestion] = useState("");
  const [moments, setMoments] = useState<TripMoment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved) as Partial<{
        city: string;
        travelers: string;
        departureDate: string;
        routePlan: string;
        bookingVault: string;
        bookings: string;
        worries: string;
        notes: string;
        question: string;
      }>;
      if (parsed.city) setCity(parsed.city);
      if (parsed.travelers) setTravelers(parsed.travelers);
      if (parsed.departureDate) setDepartureDate(parsed.departureDate);
      if (parsed.routePlan) setRoutePlan(parsed.routePlan);
      if (parsed.bookingVault) setBookingVault(parsed.bookingVault);
      if (parsed.bookings) setBookings(parsed.bookings);
      if (parsed.worries) setWorries(parsed.worries);
      if (parsed.notes) setNotes(parsed.notes);
      if (parsed.question) setQuestion(parsed.question);
    } catch {
      // Local-only convenience cache; ignore corrupt values.
    }
    try {
      const savedMoments = window.localStorage.getItem(MOMENTS_KEY);
      if (savedMoments) setMoments(JSON.parse(savedMoments) as TripMoment[]);
    } catch {
      // Ignore moment cache errors; uploads still work in-session.
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ city, travelers, departureDate, routePlan, bookingVault, bookings, worries, notes, question }),
      );
    } catch {
      // Private browsing or storage disabled; the tool still works.
    }
  }, [city, travelers, departureDate, routePlan, bookingVault, bookings, worries, notes, question]);

  useEffect(() => {
    try {
      window.localStorage.setItem(MOMENTS_KEY, JSON.stringify(moments.slice(0, 8)));
    } catch {
      // Large photos may exceed browser storage; the visible session still works.
    }
  }, [moments]);

  const hasInput = `${city}${travelers}${departureDate}${routePlan}${bookingVault}${today}${bookings}${worries}${notes}${imageDataUrl ? "image" : ""}`.trim().length >= 8;

  async function generateBrief() {
    setError("");
    setHtml("");
    setLoading(true);
    try {
      const response = await fetch("/api/voyage/italy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city,
          travelers,
          departureDate,
          routePlan,
          bookingVault,
          today,
          bookings,
          worries,
          notes,
          imageDataUrl,
          question,
          moments: moments.map((moment) => `${moment.caption || "Untitled moment"} (${moment.createdAt})`).join("\n"),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not draft the Italy desk.");
      setHtml(data.html);
      setWeather(data.weather ?? "");
      setFx(data.fx ?? "");
      setRouteWeather(Array.isArray(data.routeWeather) ? data.routeWeather : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not draft the Italy desk.");
    } finally {
      setLoading(false);
    }
  }

  function handleImageUpload(file: File | null) {
    setError("");
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Upload a photo or screenshot image.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("Please upload an image under 8MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImageDataUrl(String(reader.result ?? ""));
      setImageName(file.name);
    };
    reader.onerror = () => setError("Could not read that image. Try a smaller screenshot.");
    reader.readAsDataURL(file);
  }

  function handleBookingUpload(file: File | null) {
    setError("");
    if (!file) return;
    if (file.type.startsWith("image/")) {
      handleImageUpload(file);
      setBookingVault((value) =>
        `${value}${value ? "\n\n" : ""}[Image uploaded for parser: ${file.name}. Ask VOYAGE to read the visible booking details.]`,
      );
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("For now, upload text/email/calendar files under 2MB, or take a screenshot of the booking.");
      return;
    }
    const lower = file.name.toLowerCase();
    const readable =
      file.type.startsWith("text/") ||
      lower.endsWith(".txt") ||
      lower.endsWith(".eml") ||
      lower.endsWith(".ics") ||
      lower.endsWith(".csv") ||
      lower.endsWith(".json") ||
      lower.endsWith(".md");
    if (!readable) {
      setError("I can read screenshots/images, .eml, .ics, .txt, .csv, .json, and .md here. For Air NZ PDFs, upload a screenshot or paste the confirmation text.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "").slice(0, 9000);
      setBookingVault((value) => `${value}${value ? "\n\n" : ""}--- ${file.name} ---\n${text}`);
    };
    reader.onerror = () => setError("Could not read that file. Paste the booking text or upload a screenshot.");
    reader.readAsText(file);
  }

  function handleMomentUpload(file: File | null) {
    setError("");
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Upload a trip photo or screenshot image.");
      return;
    }
    if (file.size > 1.4 * 1024 * 1024) {
      setError("Keep trip moment photos under 1.4MB so they fit in browser storage.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const moment: TripMoment = {
        id: crypto.randomUUID(),
        imageDataUrl: String(reader.result ?? ""),
        caption: "",
        createdAt: new Date().toISOString(),
      };
      setMoments((value) => [moment, ...value].slice(0, 8));
    };
    reader.onerror = () => setError("Could not read that photo. Try a smaller image.");
    reader.readAsDataURL(file);
  }

  function loadItalySample() {
    setCity("Milan");
    setTravelers("Kate, Adrian");
    setDepartureDate("2026-05-24");
    setRoutePlan(kateAdrianRoute);
    setToday("Flying into Milan on Sunday with Adrian. Need one calm place for flights, hotel, Vatican booking, weather, and first moves.");
    setBookings("Air New Zealand flight details to add. Vatican booked early in the trip — confirm exact date/time. Hotels from the old app: Crowne Plaza Milan City, Bellerive Lifestyle Hotel, Dimora Collection - Le Logge, Villa Mami, Indigo Hotel Rome, Hotel Piccolo Sant'Andrea.");
    setBookingVault("Paste Air New Zealand confirmation, hotel bookings, train tickets, restaurant bookings, museum tickets, and travel insurance notes here.\n\nKnown trip shell from the old app:\n" + kateAdrianRoute);
    setWorries("Jet lag, airport transfer, Milan arrival timing, Vatican/Colosseum queues, hotel check-in windows, driving buffers, ferry/weather on the coast, and weather across each city.");
    setNotes("Prefer interesting local-feeling ideas, secret corners, photo moments, coffee breaks, food, no frantic crossing the city. Need what to bring before leaving the hotel.");
  }

  function copyOutput() {
    navigator.clipboard.writeText(htmlToMarkdown(html));
  }

  function downloadMarkdown() {
    const blob = new Blob([htmlToMarkdown(html)], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `voyage-italy-${city.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.md`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <HapaiToolShell
      kicker="voyage · italy"
      title="Italy, made easier to move through."
      description="Private travel desk for the signed-in traveller. Paste bookings, upload a menu or train board, add worries, and leave with today's moves, weather-aware packing, timing risks, useful Italian, and draft actions to review before you step out."
      toolPath="/app/voyage/italy"
      shareTitle="voyage italy"
      shareText="Private Italy travel desk."
      posture="Draft travel desk only. Check bookings, tickets, safety, weather, official travel advice, and opening hours before acting."
      highlights={proofCards.map(({ icon: Icon, title, body }) => ({
        title,
        body,
        icon: <Icon className="h-5 w-5" aria-hidden />,
      }))}
    >
        <div className="grid gap-5 lg:grid-cols-[1.04fr_0.58fr]">
          <div className="rounded-[8px] border border-[rgba(35,33,31,0.08)] bg-white/84 p-5 shadow-[0_22px_80px_rgba(35,33,31,0.08)] md:p-7">
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <button type="button" onClick={loadItalySample} className="rounded-full border border-[rgba(43,107,87,0.24)] bg-[#FAF7F2] px-4 py-2 font-mono text-[12px] uppercase tracking-[0.12em] text-[#2B6B57] hover:bg-white">
                Load Kate + Adrian trip
              </button>
              <span className="inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.12em] text-[#6B6661]">
                <Euro className="h-3.5 w-3.5" /> live FX
              </span>
              <span className="inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.12em] text-[#6B6661]">
                <CloudSun className="h-3.5 w-3.5" /> live weather
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label>
                <span className="mb-2 block font-mono text-[12px] uppercase tracking-[0.22em] text-[#6B6661]">Travellers</span>
                <input
                  value={travelers}
                  onChange={(event) => setTravelers(event.target.value)}
                  className="h-11 w-full rounded-[8px] border border-[rgba(35,33,31,0.12)] bg-[#F7F4EE] px-3 outline-none focus:border-[#2B6B57]"
                  placeholder="Kate, Adrian"
                />
              </label>
              <label>
                <span className="mb-2 block font-mono text-[12px] uppercase tracking-[0.22em] text-[#6B6661]">Departure from NZ</span>
                <input
                  type="date"
                  value={departureDate}
                  onChange={(event) => setDepartureDate(event.target.value)}
                  className="h-11 w-full rounded-[8px] border border-[rgba(35,33,31,0.12)] bg-[#F7F4EE] px-3 outline-none focus:border-[#2B6B57]"
                />
              </label>
              <label>
                <span className="mb-2 block font-mono text-[12px] uppercase tracking-[0.22em] text-[#6B6661]">Where are you based?</span>
                <select
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  className="h-11 w-full rounded-[8px] border border-[rgba(35,33,31,0.12)] bg-[#F7F4EE] px-3 outline-none focus:border-[#2B6B57]"
                >
                  {cityOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className="mb-2 block font-mono text-[12px] uppercase tracking-[0.22em] text-[#6B6661]">Today&apos;s shape</span>
                <input
                  value={today}
                  onChange={(event) => setToday(event.target.value)}
                  className="h-11 w-full rounded-[8px] border border-[rgba(35,33,31,0.12)] bg-[#F7F4EE] px-3 outline-none focus:border-[#2B6B57]"
                  placeholder="e.g. First day, jet lagged, want a gentle Rome loop."
                />
              </label>
              <label className="md:col-span-2">
                <span className="mb-2 block font-mono text-[12px] uppercase tracking-[0.22em] text-[#6B6661]">Route board</span>
                <textarea
                  value={routePlan}
                  onChange={(event) => setRoutePlan(event.target.value)}
                  className="min-h-[112px] w-full rounded-[8px] border border-[rgba(35,33,31,0.12)] bg-[#F7F4EE] p-3 leading-relaxed outline-none focus:border-[#2B6B57] focus:bg-white"
                  placeholder="Rome — dates/nights&#10;Florence — dates/nights&#10;Venice — dates/nights"
                />
              </label>
              <label className="md:col-span-2">
                <span className="mb-2 block font-mono text-[12px] uppercase tracking-[0.22em] text-[#6B6661]">Upload Air NZ, hotel, booking, calendar, or ticket file</span>
                <div className="relative overflow-hidden rounded-[10px] border border-dashed border-[rgba(43,107,87,0.32)] bg-[#F7F4EE] p-4">
                  <input
                    type="file"
                    accept="image/*,.txt,.eml,.ics,.csv,.json,.md,text/*"
                    onChange={(event) => handleBookingUpload(event.target.files?.[0] ?? null)}
                    className="absolute inset-0 cursor-pointer opacity-0"
                    aria-label="Upload flight, hotel, or booking details"
                  />
                  <div className="flex items-center gap-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#103F35] text-[#FAF7F2]">
                      <FileText className="h-5 w-5" aria-hidden />
                    </span>
                    <div>
                      <p className="font-medium text-[#23211F]">Add Air NZ emails, .ics calendar holds, booking text, or screenshots.</p>
                      <p className="mt-1 text-sm text-[#6B6661]">PDF parsing comes next; for now, paste the text or upload a screenshot of the PDF/booking page.</p>
                    </div>
                  </div>
                </div>
              </label>
              <label className="md:col-span-2">
                <span className="mb-2 block font-mono text-[12px] uppercase tracking-[0.22em] text-[#6B6661]">Trip booking vault</span>
                <textarea
                  value={bookingVault}
                  onChange={(event) => setBookingVault(event.target.value)}
                  className="min-h-[150px] w-full rounded-[8px] border border-[rgba(35,33,31,0.12)] bg-[#F7F4EE] p-3 font-mono text-[12px] leading-relaxed outline-none focus:border-[#2B6B57] focus:bg-white"
                  placeholder="Paste Air New Zealand flight numbers, departure/arrival times, hotel addresses, booking references, restaurant reservations, train tickets, museum bookings, insurance notes..."
                />
              </label>
              <label className="md:col-span-2">
                <span className="mb-2 block font-mono text-[12px] uppercase tracking-[0.22em] text-[#6B6661]">Photo, ticket, menu, sign, train board, or booking screenshot</span>
                <div className="relative overflow-hidden rounded-[10px] border border-dashed border-[rgba(43,107,87,0.32)] bg-[#F7F4EE] p-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => handleImageUpload(event.target.files?.[0] ?? null)}
                    className="absolute inset-0 cursor-pointer opacity-0"
                    aria-label="Upload an image for Voyage Italy"
                  />
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2B6B57] text-[#FAF7F2]">
                        <Upload className="h-5 w-5" aria-hidden />
                      </span>
                      <div>
                        <p className="font-medium text-[#23211F]">
                          {imageName || "Drop in the thing you do not want to decode on the footpath."}
                        </p>
                        <p className="mt-1 text-sm text-[#6B6661]">
                          The parser reads visible details only: times, places, prices, addresses, menu words, and warnings.
                        </p>
                      </div>
                    </div>
                    {imageDataUrl ? (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.preventDefault();
                          setImageDataUrl("");
                          setImageName("");
                        }}
                        className="relative z-10 inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[rgba(35,33,31,0.16)] bg-white px-4 text-sm text-[#5A5550]"
                      >
                        <X className="h-4 w-4" aria-hidden />
                        Remove
                      </button>
                    ) : null}
                  </div>
                  {imageDataUrl ? (
                    <div className="mt-4 overflow-hidden rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imageDataUrl} alt="" className="max-h-[260px] w-full object-contain" />
                    </div>
                  ) : null}
                </div>
              </label>
              <Field label="Bookings, tickets, trains, hotel" value={bookings} onChange={setBookings} placeholder="Paste confirmation snippets, times, booking names, train routes, museum plans..." />
              <Field label="Worries or things to check" value={worries} onChange={setWorries} placeholder="Sunday hours, heat, queues, safety, transfer buffer, what to pack..." />
              <label className="md:col-span-2">
                <span className="mb-2 block font-mono text-[12px] uppercase tracking-[0.22em] text-[#6B6661]">Loose notes</span>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  className="min-h-[150px] w-full rounded-[8px] border border-[rgba(35,33,31,0.12)] bg-[#F7F4EE] p-3 leading-relaxed outline-none focus:border-[#2B6B57] focus:bg-white"
                  placeholder="Paste anything: places you want, food preferences, walking limits, family notes, things to avoid, or tomorrow's plan."
                />
              </label>
              <label className="md:col-span-2">
                <span className="mb-2 block font-mono text-[12px] uppercase tracking-[0.22em] text-[#6B6661]">Ask VOYAGE anything</span>
                <div className="rounded-[10px] border border-[rgba(43,107,87,0.18)] bg-white/62 p-3">
                  <div className="flex items-start gap-3">
                    <MessageCircle className="mt-3 h-5 w-5 shrink-0 text-[#2B6B57]" aria-hidden />
                    <textarea
                      value={question}
                      onChange={(event) => setQuestion(event.target.value)}
                      className="min-h-[88px] flex-1 resize-y bg-transparent p-2 leading-relaxed outline-none"
                      placeholder="e.g. We land in Milan Sunday and have the Vatican booked the next day. What should we do first, what could go wrong, and what is one less-obvious thing near us?"
                    />
                  </div>
                </div>
              </label>
              <div className="md:col-span-2 rounded-[10px] border border-[rgba(35,33,31,0.10)] bg-[#FAF7F2]/78 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-[#2B6B57]">trip moments</p>
                    <p className="mt-2 text-sm leading-relaxed text-[#5A5550]">
                      Keep a small local gallery of moments, screenshots, places, menus, or ideas. These captions feed the next VOYAGE brief.
                    </p>
                  </div>
                  <label className="relative inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-[#103F35] px-5 text-sm font-medium text-[#FAF7F2]">
                    <ImagePlus className="h-4 w-4" aria-hidden />
                    Add photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => handleMomentUpload(event.target.files?.[0] ?? null)}
                      className="absolute inset-0 cursor-pointer opacity-0"
                      aria-label="Add a trip moment"
                    />
                  </label>
                </div>
                {moments.length ? (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {moments.map((moment) => (
                      <div key={moment.id} className="overflow-hidden rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={moment.imageDataUrl} alt="" className="h-36 w-full object-cover" />
                        <div className="p-3">
                          <input
                            value={moment.caption}
                            onChange={(event) =>
                              setMoments((value) =>
                                value.map((item) =>
                                  item.id === moment.id ? { ...item, caption: event.target.value } : item,
                                ),
                              )
                            }
                            className="w-full rounded-[6px] border border-[rgba(35,33,31,0.10)] bg-[#F7F4EE] px-3 py-2 text-sm outline-none focus:border-[#2B6B57]"
                            placeholder="Caption this moment for the agent..."
                          />
                          <button
                            type="button"
                            onClick={() => setMoments((value) => value.filter((item) => item.id !== moment.id))}
                            className="mt-2 font-mono text-[12px] uppercase tracking-[0.16em] text-[#8B4B3E] hover:text-[#23211F]"
                          >
                            remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={generateBrief}
                disabled={loading || !hasInput}
                className="inline-flex rounded-full bg-[#23211F] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#2B6B57] disabled:bg-[#C8C2BC]"
              >
                <Sparkles className="mr-2 h-4 w-4" aria-hidden />
                {loading ? "Checking Italy..." : "Make my travel desk"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setToday("");
                  setBookings("");
                  setWorries("");
                  setNotes("");
                  setImageDataUrl("");
                  setImageName("");
                  setHtml("");
                  setWeather("");
                  setFx("");
                  setRouteWeather([]);
                  setQuestion("");
                  setError("");
                }}
                className="rounded-full border border-[rgba(35,33,31,0.18)] px-6 py-3 text-sm text-[#5A5550] hover:text-[#23211F]"
              >
                Clear
              </button>
            </div>
            {loading ? <DashAgentLoader label="VOYAGE" /> : null}
            {loading ? (
              <p className="mt-4 rounded-[10px] border border-[#D9A85A]/35 bg-[#FFF9EC] px-4 py-3 text-sm italic text-[#6B5A28]">
                VOYAGE is checking weather, FX, visible image details, and travel risks before drafting.
              </p>
            ) : null}
            {error ? (
              <p className="mt-4 rounded-[10px] border border-[#B42828]/25 bg-[#FCEDED] px-4 py-3 text-sm text-[#7A1F1F]">{error}</p>
            ) : null}
          </div>

          <div className="rounded-[8px] border border-[rgba(35,33,31,0.08)] bg-[#FAF7F2]/78 p-6 shadow-[0_22px_80px_rgba(35,33,31,0.06)]">
            <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-[#2B6B57]">your trip board</p>
            <div className="mt-5 rounded-[8px] border border-[rgba(43,107,87,0.18)] bg-white/68 p-4">
              <div className="grid gap-3 text-sm leading-relaxed text-[#3D4250]">
                <p className="flex items-center gap-2">
                  <Plane className="h-4 w-4 text-[#2B6B57]" aria-hidden />
                  <strong className="text-[#23211F]">{travelers || "Kate, Adrian"}</strong>
                </p>
                <p className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-[#2B6B57]" aria-hidden />
                  Leaving New Zealand {departureDate || "2026-05-24"}
                </p>
                <p className="flex items-center gap-2">
                  <Hotel className="h-4 w-4 text-[#2B6B57]" aria-hidden />
                  {bookingVault.trim() ? "Booking vault loaded in this browser" : "Add flights, hotels, trains, and tickets"}
                </p>
              </div>
            </div>
            <div className="mt-5 rounded-[8px] border border-[rgba(35,33,31,0.08)] bg-[#103F35] p-4 text-[#FAF7F2]">
              <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-[#D9A85A]">route</p>
              <div className="mt-4 space-y-3">
                {routePlan
                  .split(/\n+/)
                  .map((stop) => stop.trim())
                  .filter(Boolean)
                  .slice(0, 6)
                  .map((stop, index) => (
                    <div key={`${stop}-${index}`} className="grid grid-cols-[24px_1fr] gap-3 text-sm">
                      <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-full border border-[#D9A85A]/60 font-mono text-[12px] text-[#D9A85A]">
                        {index + 1}
                      </span>
                      <span className="text-[#FAF7F2]/86">{stop}</span>
                    </div>
                ))}
              </div>
            </div>
            <div className="mt-5 rounded-[8px] border border-[rgba(35,33,31,0.08)] bg-white/68 p-4">
              <div className="flex items-center justify-between gap-4">
                <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-[#2B6B57]">Kate + Adrian map board</p>
                <span className="rounded-full bg-[#FAF7F2] px-3 py-1 font-mono text-[12px] uppercase tracking-[0.14em] text-[#6B6661]">
                  7 stops
                </span>
              </div>
              <div className="mt-4 overflow-hidden rounded-[8px] border border-[rgba(43,107,87,0.16)] bg-[#F4EEE5]">
                <div className="relative h-44 bg-[radial-gradient(circle_at_20%_36%,rgba(43,107,87,0.22),transparent_20%),radial-gradient(circle_at_52%_42%,rgba(217,168,90,0.32),transparent_19%),radial-gradient(circle_at_68%_72%,rgba(103,65,53,0.20),transparent_18%),linear-gradient(135deg,#FAF7F2,#E8DDD0)]">
                  <div className="absolute left-[14%] top-[25%] h-1.5 w-[72%] rotate-[18deg] rounded-full bg-[#2B6B57]/18" />
                  {itineraryStops.map((item, index) => (
                    <div
                      key={item.city + item.dates}
                      className="absolute flex h-8 w-8 items-center justify-center rounded-full border border-white/80 bg-[#103F35] font-mono text-[12px] text-[#FAF7F2] shadow-[0_10px_24px_rgba(35,33,31,0.20)]"
                      style={{
                        left: `${12 + index * 11.8}%`,
                        top: `${index < 2 ? 28 + index * 5 : index < 5 ? 38 + index * 7 : 72 - (index - 5) * 6}%`,
                      }}
                      title={`${item.city} · ${item.dates}`}
                    >
                      {item.stop}
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 space-y-3">
                {itineraryStops.map((item) => (
                  <div key={`${item.stop}-${item.city}`} className="grid grid-cols-[34px_1fr] gap-3 border-t border-[rgba(35,33,31,0.08)] pt-3">
                    <span className="mt-1 font-mono text-[12px] uppercase tracking-[0.12em] text-[#2B6B57]">{item.stop}</span>
                    <div>
                      <p className="font-medium text-[#23211F]">{item.city} <span className="font-normal text-[#6B6661]">· {item.dates}</span></p>
                      <p className="mt-1 text-sm leading-relaxed text-[#5A5550]">{item.hotel}</p>
                      <p className="mt-1 text-xs leading-relaxed text-[#6B6661]">{item.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-5 rounded-[8px] border border-[rgba(35,33,31,0.08)] bg-white/64 p-4">
              <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-[#2B6B57]">city weather</p>
              {routeWeather.length ? (
                <div className="mt-3 space-y-3">
                  {routeWeather.map((item) => (
                    <div key={item.city} className="rounded-[8px] border border-[rgba(43,107,87,0.13)] bg-[#FAF7F2]/72 p-3">
                      <p className="font-display text-2xl font-light italic leading-none text-[#103F35]">{item.city}</p>
                      <p className="mt-2 text-sm leading-relaxed text-[#3D4250]">{item.summary}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm leading-relaxed text-[#5A5550]">
                  Generate a travel desk to check weather across the cities named in your route.
                </p>
              )}
            </div>
            <p className="mt-7 font-mono text-[12px] uppercase tracking-[0.22em] text-[#2B6B57]">what it can do now</p>
            <div className="mt-5 space-y-5">
              {[
                [MapPin, "Cluster the day", "Turn a messy wish-list into a walkable plan."],
                [Plane, "Keep NZ context", "Jet lag, long-haul recovery, NZD thinking, passport and insurance prompts."],
                [CheckCircle2, "Leave with actions", "Draft messages, calendar reminders, and tomorrow checks for review."],
              ].map(([Icon, title, body]) => {
                const TypedIcon = Icon as typeof MapPin;
                return (
                  <div key={String(title)} className="border-t border-[rgba(35,33,31,0.10)] pt-5">
                    <TypedIcon className="h-5 w-5 text-[#2B6B57]" aria-hidden />
                    <h2 className="mt-3 font-display text-3xl font-light italic leading-none">{title as string}</h2>
                    <p className="mt-3 text-sm leading-relaxed text-[#5A5550]">{body as string}</p>
                  </div>
                );
              })}
            </div>
            {(weather || fx) ? (
              <div className="mt-7 rounded-[8px] border border-[rgba(43,107,87,0.18)] bg-white/64 p-4">
                <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-[#2B6B57]">live read</p>
                {weather ? <p className="mt-3 text-sm leading-relaxed text-[#3D4250]">{weather}</p> : null}
                {fx ? <p className="mt-2 text-sm leading-relaxed text-[#3D4250]">{fx}</p> : null}
              </div>
            ) : null}
          </div>
        </div>

        {html ? (
          <section className="mt-8 rounded-[8px] border border-[rgba(35,33,31,0.08)] bg-white/88 p-6 shadow-[0_22px_80px_rgba(35,33,31,0.08)] md:p-8">
            <div
              className="prose prose-neutral max-w-none [&_h2]:font-display [&_h2]:text-3xl [&_h2]:font-light [&_h2]:italic [&_h2]:text-[#103F35] [&_li]:my-1.5 [&_p]:text-[#3D4250]"
              dangerouslySetInnerHTML={{ __html: html }}
            />
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" onClick={copyOutput} className="inline-flex items-center gap-2 rounded-full bg-[#23211F] px-5 py-3 text-sm font-medium text-white hover:bg-[#2B6B57]">
                <Copy className="h-4 w-4" /> Copy markdown
              </button>
              <button type="button" onClick={downloadMarkdown} className="inline-flex items-center gap-2 rounded-full border border-[rgba(35,33,31,0.18)] px-5 py-3 text-sm text-[#5A5550] hover:text-[#23211F]">
                <Download className="h-4 w-4" /> Download .md
              </button>
            </div>
          </section>
        ) : null}
    </HapaiToolShell>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label>
      <span className="mb-2 block font-mono text-[12px] uppercase tracking-[0.22em] text-[#6B6661]">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-[132px] w-full rounded-[8px] border border-[rgba(35,33,31,0.12)] bg-[#F7F4EE] p-3 leading-relaxed outline-none focus:border-[#2B6B57] focus:bg-white"
        placeholder={placeholder}
      />
    </label>
  );
}
