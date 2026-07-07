"use client";

import { useState } from "react";

const INK = "#1A1918";
const PAPER = "#FBFAF6";
const GREY = "#5A5850";
const GOLD = "#BFA37A";
const SAND = "#EFEADC";
const CLOUD = "#FFFFFF";

export function PilotCta() {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", company: "", note: "" });
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email.includes("@")) { setErr("A valid email, please."); return; }
    setBusy(true); setErr(null);
    try {
      const res = await fetch("/api/creative/pilot", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const j = await res.json().catch(() => ({}));
      if (j.ok) setSent(true);
      else setErr(j.error ?? "Something went wrong — try again.");
    } catch {
      setErr("Something went wrong — try again.");
    } finally {
      setBusy(false);
    }
  };

  const field: React.CSSProperties = {
    width: "100%", border: `1px solid ${SAND}`, borderRadius: 10, padding: "10px 12px",
    fontSize: 14, fontFamily: "inherit", background: CLOUD, color: INK, marginBottom: 10,
  };

  if (sent)
    return (
      <div style={{ border: `1px solid ${GOLD}`, background: "#FBF3DD", borderRadius: 14, padding: "18px 20px", color: "#6B531C", fontSize: 14 }}>
        Kia ora — your pilot request is in. Kate will be in touch. Nothing was sent automatically; this just lands in the queue.
      </div>
    );

  return (
    <form onSubmit={submit} style={{ maxWidth: 460 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <input style={field} placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input style={field} placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
      </div>
      <input style={field} placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <textarea style={{ ...field, resize: "vertical" }} rows={2} placeholder="What would you want it to make first?" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
      {err && <p style={{ color: "#9A3B2E", fontSize: 12.5, marginBottom: 8 }}>{err}</p>}
      <button type="submit" disabled={busy}
        style={{ padding: "11px 22px", borderRadius: 999, border: "none", background: INK, color: PAPER, fontSize: 14, fontWeight: 600, cursor: busy ? "default" : "pointer" }}>
        {busy ? "Sending…" : "Book a pilot"}
      </button>
      <p style={{ fontSize: 11.5, color: GREY, marginTop: 8 }}>Draft-only demo · action dispatch is off · nothing is emailed automatically.</p>
    </form>
  );
}
