"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  CloudSun,
  Copy,
  Download,
  Euro,
  MapPin,
  Plane,
  Sparkles,
  Train,
  Upload,
  X,
} from "lucide-react";
import { ShareableToolActions } from "@/components/hapai/ShareableToolActions";

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

const cityOptions = ["Rome", "Florence", "Venice", "Milan", "Naples", "Bologna", "Siena", "Amalfi"];

const proofCards = [
  {
    icon: CloudSun,
    title: "live travel read",
    body: "weather and EUR to NZD checked before the brief is drafted",
  },
  {
    icon: Camera,
    title: "photo parser",
    body: "menus, signs, tickets, booking emails, and train boards made useful",
  },
  {
    icon: Train,
    title: "timing risks",
    body: "must-book spots, Sunday hours, queues, transfers, and train buffers",
  },
] as const;

export function VoyageItalyTool() {
  const [city, setCity] = useState("Rome");
  const [today, setToday] = useState("");
  const [bookings, setBookings] = useState("");
  const [worries, setWorries] = useState("");
  const [notes, setNotes] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState("");
  const [imageName, setImageName] = useState("");
  const [html, setHtml] = useState("");
  const [weather, setWeather] = useState("");
  const [fx, setFx] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const hasInput = `${city}${today}${bookings}${worries}${notes}${imageDataUrl ? "image" : ""}`.trim().length >= 8;

  async function generateBrief() {
    setError("");
    setHtml("");
    setLoading(true);
    try {
      const response = await fetch("/api/hapai/voyage-italy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city, today, bookings, worries, notes, imageDataUrl }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not draft the Italy desk.");
      setHtml(data.html);
      setWeather(data.weather ?? "");
      setFx(data.fx ?? "");
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

  function loadItalySample() {
    setCity("Rome");
    setToday("First proper day in Rome. Need a calm plan that avoids overdoing it after the long flight from New Zealand.");
    setBookings("Hotel near Pantheon. Vatican Museums not booked yet. Train to Florence later in the week. Need restaurant ideas that are easy and not too touristy.");
    setWorries("Jet lag, heat, pickpockets around crowded sights, booking windows, and whether Sunday hours change things.");
    setNotes("Prefer walking clusters, coffee breaks, galleries, pasta, no frantic crossing the city. Need what to bring before leaving the hotel.");
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
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_78%_14%,rgba(217,168,90,0.22),transparent_33%),radial-gradient(circle_at_12%_80%,rgba(43,107,87,0.13),transparent_34%),linear-gradient(180deg,#FAF7F2_0%,#F4EEE5_54%,#FAF7F2_100%)] px-5 py-12 text-[#23211F] md:px-10 md:py-16">
      <div className="mx-auto max-w-[1500px]">
        <Link href="/hapai" className="mb-8 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[#6B6661] hover:text-[#2B6B57]">
          <ArrowLeft className="h-3.5 w-3.5" /> HAPAI library
        </Link>

        <section className="grid gap-8 lg:grid-cols-[0.96fr_0.78fr] lg:items-stretch">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#2B6B57]">
              HAPAI · voyage italy
            </p>
            <h1 className="mt-3 max-w-5xl font-display text-[clamp(4.2rem,8.4vw,9rem)] font-normal italic leading-[0.82] text-[#103F35]">
              Italy, made easier to move through.
            </h1>
            <p className="mt-7 max-w-3xl text-[clamp(1.05rem,1.7vw,1.32rem)] leading-relaxed text-[#3D4250]">
              A practical travel desk for the trip: paste bookings, upload a
              menu or train board, add worries, and leave with today&apos;s moves,
              weather-aware packing, timing risks, useful Italian, and draft
              actions to review before you step out.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {proofCards.map(({ icon: Icon, title, body }) => (
                <div key={title} className="rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/58 p-4 shadow-[0_18px_54px_rgba(35,33,31,0.06)]">
                  <Icon className="h-5 w-5 text-[#2B6B57]" aria-hidden />
                  <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-[#2B6B57]">{title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-[#5A5550]">{body}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="relative overflow-hidden rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-[#103F35] p-6 text-[#FAF7F2] shadow-[0_34px_110px_rgba(35,33,31,0.18)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_18%,rgba(217,168,90,0.30),transparent_32%),linear-gradient(135deg,rgba(250,247,242,0.12),transparent_48%)]" />
            <div className="relative">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#D9A85A]">travel companion</p>
              <p className="mt-3 font-display text-4xl font-light italic leading-none text-[#FAF7F2]">
                The public version drafts. A connected version could watch the whole trip.
              </p>
              <div className="mt-6 grid gap-3">
                {[
                  ["Today", "weather, bring-list, timings"],
                  ["Move", "trains, buffers, neighbourhood clusters"],
                  ["Read", "menus, signs, tickets, booking screenshots"],
                  ["Remember", "draft messages, calendar holds, tomorrow checks"],
                ].map(([label, value]) => (
                  <div key={label} className="grid grid-cols-[88px_1fr] gap-3 border-t border-white/15 pt-3 text-sm">
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#D9A85A]">{label}</span>
                    <span className="text-[#FAF7F2]/84">{value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <ShareableToolActions
                  title="Voyage Italy by assembl"
                  text="A practical Italy travel desk: weather, FX, photo parser, timing risks, useful Italian, and draft actions."
                  path="/hapai/voyage-italy"
                />
              </div>
            </div>
          </aside>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-[1.04fr_0.58fr]">
          <div className="rounded-[8px] border border-[rgba(35,33,31,0.08)] bg-white/84 p-5 shadow-[0_22px_80px_rgba(35,33,31,0.08)] md:p-7">
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <button type="button" onClick={loadItalySample} className="rounded-full border border-[rgba(43,107,87,0.24)] bg-[#FAF7F2] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[#2B6B57] hover:bg-white">
                Load Rome sample
              </button>
              <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[#6B6661]">
                <Euro className="h-3.5 w-3.5" /> live FX
              </span>
              <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[#6B6661]">
                <CloudSun className="h-3.5 w-3.5" /> live weather
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label>
                <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.22em] text-[#6B6661]">Where are you based?</span>
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
                <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.22em] text-[#6B6661]">Today&apos;s shape</span>
                <input
                  value={today}
                  onChange={(event) => setToday(event.target.value)}
                  className="h-11 w-full rounded-[8px] border border-[rgba(35,33,31,0.12)] bg-[#F7F4EE] px-3 outline-none focus:border-[#2B6B57]"
                  placeholder="e.g. First day, jet lagged, want a gentle Rome loop."
                />
              </label>
              <label className="md:col-span-2">
                <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.22em] text-[#6B6661]">Photo, ticket, menu, sign, train board, or booking screenshot</span>
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
                <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.22em] text-[#6B6661]">Loose notes</span>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  className="min-h-[150px] w-full rounded-[8px] border border-[rgba(35,33,31,0.12)] bg-[#F7F4EE] p-3 leading-relaxed outline-none focus:border-[#2B6B57] focus:bg-white"
                  placeholder="Paste anything: places you want, food preferences, walking limits, family notes, things to avoid, or tomorrow's plan."
                />
              </label>
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
                  setError("");
                }}
                className="rounded-full border border-[rgba(35,33,31,0.18)] px-6 py-3 text-sm text-[#5A5550] hover:text-[#23211F]"
              >
                Clear
              </button>
            </div>
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
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#2B6B57]">what it can do now</p>
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
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#2B6B57]">live read</p>
                {weather ? <p className="mt-3 text-sm leading-relaxed text-[#3D4250]">{weather}</p> : null}
                {fx ? <p className="mt-2 text-sm leading-relaxed text-[#3D4250]">{fx}</p> : null}
              </div>
            ) : null}
          </div>
        </section>

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
      </div>
    </main>
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
      <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.22em] text-[#6B6661]">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-[132px] w-full rounded-[8px] border border-[rgba(35,33,31,0.12)] bg-[#F7F4EE] p-3 leading-relaxed outline-none focus:border-[#2B6B57] focus:bg-white"
        placeholder={placeholder}
      />
    </label>
  );
}
