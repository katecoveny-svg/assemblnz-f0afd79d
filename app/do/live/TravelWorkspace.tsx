"use client";
import { useState } from "react";
import {
  newDoTrip,
  tripSchema,
  safeTravelLink,
  travelRevisionBrief,
  type DoTrip,
} from "@/apps/do/shared/travel";
const KEY = "assembl-do-trips-v1";
export default function TravelWorkspace({
  draft,
  onRevise,
  hidden = false,
}: {
  draft?: string;
  hidden?: boolean;
  onRevise: (text: string) => void;
}) {
  const [trip, setTrip] = useState<DoTrip>(newDoTrip);
  const [saved, setSaved] = useState<DoTrip[]>([]);
  const [status, setStatus] = useState("");
  const [emailDraft, setEmailDraft] = useState("");
  function edit<K extends keyof DoTrip>(key: K, value: DoTrip[K]) {
    setTrip((old) => ({ ...old, [key]: value }));
    setStatus("Unsaved changes");
  }
  function readSaved() {
    try {
      const raw: unknown = JSON.parse(localStorage.getItem(KEY) || "[]");
      return Array.isArray(raw)
        ? raw.slice(0, 12).flatMap((v) => {
            const p = tripSchema.safeParse(v);
            return p.success ? [p.data] : [];
          })
        : [];
    } catch {
      return [];
    }
  }
  function save() {
    try {
      const next = tripSchema.parse({
        ...trip,
        updatedAt: new Date().toISOString(),
      });
      const list = [next, ...readSaved().filter((t) => t.id !== next.id)].slice(
        0,
        12,
      );
      localStorage.setItem(KEY, JSON.stringify(list));
      setTrip(next);
      setSaved(list);
      setStatus("Trip saved in this browser on this device.");
    } catch {
      setStatus("Could not save the trip. Your edits remain here.");
    }
  }
  function dayField(
    id: string,
    key: "title" | "notes" | "place" | "bookingLink",
    value: string,
  ) {
    edit(
      "days",
      trip.days.map((d) => (d.id === id ? { ...d, [key]: value } : d)),
    );
  }
  return (
    <section className="do-trip" hidden={hidden} aria-label="Editable trip">
      <div className="do-trip-heading">
        <span className="do-live-eyebrow">TRAVEL DO / YOUR TRIP</span>
        <h2>A plan you can keep shaping.</h2>
        <p>
          Save your plan here, then bring it back to DO when something changes.
        </p>
      </div>
      <div className="do-trip-tools">
        <button onClick={save}>Save trip on this device</button>
        <button
          onClick={() => {
            const list = readSaved();
            setSaved(list);
            setStatus(
              list.length
                ? "Choose a saved trip below."
                : "No saved trips in this browser yet.",
            );
          }}
        >
          Open saved trips
        </button>
        <button onClick={() => window.print()}>Print / save PDF</button>
      </div>
      {!!saved.length && (
        <div className="do-trip-tools">
          {saved.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTrip(t);
                setStatus("Saved trip opened.");
                setEmailDraft("");
              }}
            >
              {t.title || "Untitled trip"}
            </button>
          ))}
        </div>
      )}
      <div className="do-trip-fields">
        {(
          [
            ["title", "Trip name"],
            ["destination", "Destination"],
            ["dates", "Travel dates"],
            ["budget", "Total budget and currency"],
            ["travellers", "Travellers"],
            ["preferences", "Preferences and constraints"],
          ] as const
        ).map(([key, label]) => (
          <label key={key}>
            {label}
            <input
              value={trip[key]}
              maxLength={
                key === "preferences"
                  ? 2000
                  : key === "destination" || key === "travellers"
                    ? 160
                    : 120
              }
              onChange={(e) => edit(key, e.target.value)}
            />
            <span className="do-trip-print-value">
              {trip[key] || "Not specified"}
            </span>
          </label>
        ))}
      </div>
      <label>
        Research and draft itinerary
        <textarea
          rows={8}
          maxLength={32000}
          value={trip.summary}
          onChange={(e) => edit("summary", e.target.value)}
          placeholder="Add your plan or keep a draft from Travel DO."
        />
        <span className="do-trip-print-value">{trip.summary}</span>
      </label>
      <div className="do-trip-tools">
        <button
          disabled={!draft}
          onClick={() => edit("summary", draft!.slice(0, 32000))}
        >
          Keep latest Travel DO draft
        </button>
        <button onClick={() => onRevise(travelRevisionBrief(trip))}>
          Ask DO to revise this trip
        </button>
      </div>
      <h3>Day by day</h3>
      {trip.days.map((day, i) => (
        <article className="do-trip-day" key={day.id}>
          <label>
            Day {i + 1} · date and title
            <input
              value={day.title}
              maxLength={160}
              onChange={(e) => dayField(day.id, "title", e.target.value)}
            />
            <span className="do-trip-print-value">{day.title}</span>
          </label>
          <label>
            Plan
            <textarea
              rows={3}
              value={day.notes}
              maxLength={4000}
              onChange={(e) => dayField(day.id, "notes", e.target.value)}
            />
            <span className="do-trip-print-value">{day.notes}</span>
          </label>
          <label>
            Place for map
            <input
              value={day.place}
              maxLength={240}
              onChange={(e) => dayField(day.id, "place", e.target.value)}
            />
          </label>
          {day.place && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(day.place)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open map for {day.place} ↗
            </a>
          )}
          <label>
            Provider or booking link
            <input
              value={day.bookingLink}
              maxLength={1500}
              onChange={(e) => dayField(day.id, "bookingLink", e.target.value)}
            />
          </label>
          {safeTravelLink(day.bookingLink) && (
            <a
              href={safeTravelLink(day.bookingLink)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Review provider page ↗
            </a>
          )}
          <p>
            Availability, total price and booking terms need checking. Nothing
            is held or booked.
          </p>
          <button
            className="do-trip-remove"
            onClick={() =>
              edit(
                "days",
                trip.days.filter((d) => d.id !== day.id),
              )
            }
          >
            Remove day
          </button>
        </article>
      ))}
      <button
        className="do-trip-add"
        disabled={trip.days.length >= 31}
        onClick={() =>
          edit("days", [
            ...trip.days,
            {
              id: crypto.randomUUID(),
              title: `Day ${trip.days.length + 1}`,
              notes: "",
              place: "",
              bookingLink: "",
            },
          ])
        }
      >
        Add a day
      </button>
      <h3>Packing and preparation</h3>
      {trip.packing.map((item) => (
        <div className="do-trip-pack" key={item.id}>
          <input
            type="checkbox"
            aria-label={`Packed: ${item.text || "item"}`}
            checked={item.packed}
            onChange={(e) =>
              edit(
                "packing",
                trip.packing.map((p) =>
                  p.id === item.id ? { ...p, packed: e.target.checked } : p,
                ),
              )
            }
          />
          <input
            aria-label="Packing item"
            value={item.text}
            maxLength={240}
            onChange={(e) =>
              edit(
                "packing",
                trip.packing.map((p) =>
                  p.id === item.id ? { ...p, text: e.target.value } : p,
                ),
              )
            }
          />
          <span className="do-trip-print-value">
            {item.packed ? "Packed: " : "To pack: "}
            {item.text}
          </span>
          <button
            onClick={() =>
              edit(
                "packing",
                trip.packing.filter((p) => p.id !== item.id),
              )
            }
            aria-label={`Remove ${item.text || "packing item"}`}
          >
            ×
          </button>
        </div>
      ))}
      <button
        className="do-trip-add"
        disabled={trip.packing.length >= 80}
        onClick={() =>
          edit("packing", [
            ...trip.packing,
            { id: crypto.randomUUID(), text: "", packed: false },
          ])
        }
      >
        Add a checklist item
      </button>
      <section className="do-trip-delivery">
        <h3>Take your trip with you</h3>
        <p>
          Use Print / save PDF for a copy you can take along. This preview saves
          only on this device. Private trip links, phone sync, email and
          messaging delivery are not connected.
        </p>
        <button
          onClick={() =>
            setEmailDraft(
              `Subject: ${trip.title}\n\nHere is my draft plan for ${trip.destination || "our trip"}.\nDates: ${trip.dates || "To confirm"}\n\n${trip.summary}\n\nThis is a draft itinerary. Bookings and prices need checking.`,
            )
          }
        >
          Prepare an email draft
        </button>
        {emailDraft && (
          <label>
            Review before using
            <textarea
              value={emailDraft}
              onChange={(e) => setEmailDraft(e.target.value)}
              rows={6}
            />
            <small>No recipient selected. No email has been sent.</small>
          </label>
        )}
      </section>
      {status && <p role="status">{status}</p>}
      <footer>
        DO by assembl · Draft itinerary · Review prices, availability and
        documents before booking.
      </footer>
    </section>
  );
}
