"use client";

/**
 * DashLoader — the core widget.
 * Shows an opt-in prompt, then a calm "agent is working" card with one sponsored line,
 * credits the user while they wait, and lets them send earnings to a reward.
 *
 * Runs in DEMO MODE automatically when no Supabase env vars are set (ad is hard-coded,
 * earnings are local). When NEXT_PUBLIC_SUPABASE_URL + ANON_KEY are present it goes LIVE:
 * it fetches a real sponsored line (serve-slot) and credits a real wallet (record-view).
 *
 * Props:
 *   context     - where it's shown ('agent_working' | 'spinner' | 'completion')
 *   hostName    - label only
 *   totalSteps  - number of progress segments
 *   userId      - app_users.id (e.g. the logged-in Assembl user). If omitted in live mode,
 *                 an anonymous app_users row is created automatically.
 *   hostApiKey  - the hosts.api_key for this surface (needed for live ad fetch)
 */

import { useEffect, useRef, useState } from "react";
import {
  dashLive, serveSlot, recordView, ensureUser, setOptIn, type Slot,
} from "@/lib/dashApi";

type Context = "agent_working" | "spinner" | "completion";
type Phase = "optin" | "working" | "done" | "banked";
type Dest = "charity" | "kiwisaver" | "airpoints" | "cash";

const DEMO_AD = { brand: "Z Energy", line: "fuel up & earn on the way home ⛽" };
const TASK_SECONDS = 120;

const DEST_LABEL: Record<Dest, string> = {
  charity: "charity", kiwisaver: "KiwiSaver", airpoints: "Airpoints", cash: "cash",
};

export default function DashLoader({
  context = "agent_working",
  hostName = "this app",
  totalSteps = 6,
  userId,
  hostApiKey,
}: {
  context?: Context;
  hostName?: string;
  totalSteps?: number;
  userId?: string;
  hostApiKey?: string;
}) {
  const [phase, setPhase] = useState<Phase>("optin");
  const [optedIn, setOptedIn] = useState(false);
  const [step, setStep] = useState(1);
  const [eta, setEta] = useState(TASK_SECONDS);
  const [earnedCents, setEarnedCents] = useState(0);
  const [dest, setDest] = useState<Dest>("charity");
  const [adText, setAdText] = useState<string>(`${DEMO_AD.brand} — ${DEMO_AD.line}`);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);
  const optedRef = useRef(false);          // read inside the interval
  const campaignId = useRef<string | undefined>(undefined);
  const resolvedUser = useRef<string | undefined>(userId);

  // In live mode, make sure we have an app_users id to credit.
  useEffect(() => {
    let cancelled = false;
    if (dashLive && !resolvedUser.current) {
      ensureUser(null).then((id) => { if (!cancelled && id) resolvedUser.current = id; });
    }
    return () => { cancelled = true; };
  }, []);

  useEffect(() => () => { if (tick.current) clearInterval(tick.current); }, []);

  function markOptedIn(v: boolean) {
    setOptedIn(v);
    optedRef.current = v;
    if (dashLive && v && resolvedUser.current) setOptIn(resolvedUser.current, true);
  }

  async function startWorking(withDash: boolean) {
    markOptedIn(withDash);
    setStep(1); setEta(TASK_SECONDS); setEarnedCents(0); setPhase("working");

    // fetch a real ad in live mode (demo keeps the hard-coded line)
    if (dashLive && hostApiKey) {
      try {
        const slot: Slot = await serveSlot(hostApiKey, context);
        if (slot?.ad_line) { setAdText(slot.ad_line); campaignId.current = slot.campaign_id; }
      } catch { /* keep demo fallback */ }
    }

    if (tick.current) clearInterval(tick.current);
    tick.current = setInterval(() => {
      setEta((e) => {
        const next = e - 4;
        setStep((s) => (next % 20 === 0 && s < totalSteps ? s + 1 : s));
        if (optedRef.current) setEarnedCents((c) => c + 2); // visual "earning…" ticker
        if (next <= 0) { if (tick.current) clearInterval(tick.current); finish(); return 0; }
        return next;
      });
    }, 600); // demo tick = 0.6s
  }

  async function finish() {
    setPhase("done");
    if (dashLive && optedRef.current && resolvedUser.current) {
      try {
        const r = await recordView({
          user_id: resolvedUser.current,
          campaign_id: campaignId.current,
          context,
          viewed_seconds: TASK_SECONDS,
          clicked: false,
        });
        // show the real credited amount if the server returned one
        if (typeof r?.credited === "number" && r.credited > 0) setEarnedCents(r.credited);
      } catch { /* keep local earnings shown */ }
    }
  }

  // ---------- views ----------
  if (phase === "optin") {
    return (
      <div className="optin">
        <h3>Earn while your agent works?</h3>
        <p>
          Dash shows one sponsored line during the wait and pays the value to you — KiwiSaver,
          Airpoints, or charity. Opt in anytime, opt out anytime.
        </p>
        <div className="btns">
          <button className="pri" onClick={() => startWorking(true)}>Switch Dash on</button>
          <button className="sec" onClick={() => startWorking(false)}>Not now</button>
        </div>
      </div>
    );
  }

  if (phase === "working") {
    const m = Math.floor(eta / 60);
    const s = String(eta % 60).padStart(2, "0");
    return (
      <div className="working">
        <div className="wrow">
          <div className="stat">Your agent is working…</div>
          <div className="eta">step {step}/{totalSteps} · ETA {m}:{s}</div>
        </div>
        <div className="segs">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className={"seg " + (i < step - 1 ? "done" : i === step - 1 ? "active" : "")}>
              {i === step - 1 ? <i /> : null}
            </div>
          ))}
        </div>
        {optedIn ? (
          <>
            <div className="divider" />
            <div className="spon"><span className="dot" /> sponsored · while you wait</div>
            <div className="ad" dangerouslySetInnerHTML={{ __html: adText.replace(/^(.*?) —/, "<b>$1</b> —") }} />
            <div className="earn">◷ earning… ${(earnedCents / 100).toFixed(2)} this task</div>
          </>
        ) : (
          <>
            <div className="divider" />
            <div className="ad" style={{ color: "var(--grey)", fontSize: 12.5 }}>
              Switch Dash on to earn while this runs →{" "}
              <button className="pri" style={{ padding: "6px 10px", marginLeft: 6 }} onClick={() => markOptedIn(true)}>
                Switch on
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  if (phase === "done") {
    if (!optedIn) {
      return (
        <div className="done" style={{ borderColor: "var(--line)" }}>
          <div style={{ fontSize: 22 }}>✓</div>
          <h3>Your agent finished.</h3>
          <p className="muted" style={{ fontSize: 13 }}>Dash was off, so nothing was earned. Switch it on next time.</p>
          <button className="pri" style={{ marginTop: 10 }} onClick={() => setPhase("optin")}>Switch Dash on</button>
        </div>
      );
    }
    return (
      <div className="done">
        <div style={{ fontSize: 22 }}>🌭 ✓</div>
        <h3>Your agent finished — and so did Dash.</h3>
        <div className="amt">+ ${(earnedCents / 100).toFixed(2)}</div>
        <div style={{ fontSize: 12.5, color: "var(--lgrey)" }}>Send it to:</div>
        <div className="dest">
          {(["charity", "kiwisaver", "airpoints", "cash"] as Dest[]).map((d) => (
            <div
              key={d}
              className={"chip " + (dest === d ? "on" : "")}
              onClick={() => (d === "cash"
                ? alert("Cash comes later — needs a $10+ balance + ID check. Pick charity, KiwiSaver or Airpoints for now.")
                : setDest(d))}
            >
              {d === "charity" ? "❤️ Charity" : d === "kiwisaver" ? "🥝 KiwiSaver" : d === "airpoints" ? "✈️ Airpoints" : "💵 Cash (soon)"}
            </div>
          ))}
        </div>
        <button className="pri" style={{ marginTop: 12, width: "100%" }} onClick={() => setPhase("banked")}>
          Bank it to {DEST_LABEL[dest]}
        </button>
      </div>
    );
  }

  // banked
  return (
    <div className="done">
      <div style={{ fontSize: 22 }}>🎉</div>
      <h3>Banked. Nice.</h3>
      <p className="muted" style={{ fontSize: 13 }}>
        ${(earnedCents / 100).toFixed(2)} sent to {DEST_LABEL[dest]}. Long dog, short wait.
      </p>
      <button className="pri" style={{ marginTop: 12 }} onClick={() => setPhase("optin")}>Run it again</button>
    </div>
  );
}
