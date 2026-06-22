"use client";

/**
 * Wallet page — balance + redeem to charity.
 * Live mode (Supabase configured): reads the real balance and calls the atomic `redeem` RPC.
 * Demo mode (no backend): shows a friendly placeholder so the page still renders.
 */

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { dashLive, ensureUser, getBalanceCents } from "@/lib/dashApi";
import { canRedeem, formatNZD } from "@/lib/ledger";

const THRESHOLD = 500; // cents

export default function WalletPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);
  const [msg, setMsg] = useState<string>("");
  const [busy, setBusy] = useState(false);

  async function refresh(uid: string) {
    setBalance(await getBalanceCents(uid));
  }

  useEffect(() => {
    if (!dashLive) return;
    ensureUser(null).then(async (id) => {
      if (id) { setUserId(id); await refresh(id); }
    });
  }, []);

  async function redeemToCharity() {
    if (!userId || !supabase) return;
    setBusy(true); setMsg("");
    const { error } = await supabase.rpc("redeem", {
      p_user: userId, p_amount: balance, p_destination: "charity",
    });
    if (error) setMsg("Couldn't redeem: " + error.message);
    else { setMsg("Donated " + formatNZD(balance) + " to charity. Ka pai 🌭"); await refresh(userId); }
    setBusy(false);
  }

  if (!dashLive) {
    return (
      <main className="page">
        <div className="k">Dash · wallet</div>
        <h1>Your wallet</h1>
        <p className="muted">
          Running in demo mode (no backend). Add your Supabase keys to <code>.env.local</code> and run
          <code> supabase/schema.sql</code> to see a real balance and redeem to charity here.
        </p>
        <div className="done" style={{ marginTop: 20, borderColor: "var(--line)" }}>
          <div className="amt" style={{ color: "var(--lgrey)" }}>$0.00</div>
          <p className="muted" style={{ fontSize: 13 }}>Connect Supabase to start earning.</p>
        </div>
      </main>
    );
  }

  const ready = canRedeem(balance, balance, THRESHOLD); // can redeem the whole balance?

  return (
    <main className="page">
      <div className="k">Dash · wallet</div>
      <h1>Your wallet</h1>
      <div className="done" style={{ marginTop: 16 }}>
        <div style={{ fontSize: 12.5, color: "var(--lgrey)" }}>Balance</div>
        <div className="amt">{formatNZD(balance)}</div>
        <p className="muted" style={{ fontSize: 13 }}>
          {ready
            ? "Ready to redeem."
            : `Earn ${formatNZD(Math.max(THRESHOLD - balance, 0))} more to redeem (min ${formatNZD(THRESHOLD)}).`}
        </p>
        <button
          className="pri"
          style={{ marginTop: 12, width: "100%", opacity: ready && !busy ? 1 : 0.5 }}
          disabled={!ready || busy}
          onClick={redeemToCharity}
        >
          {busy ? "Redeeming…" : "Donate balance to charity ❤️"}
        </button>
        {msg ? <p className="muted" style={{ marginTop: 10, fontSize: 13 }}>{msg}</p> : null}
      </div>
      <p className="muted" style={{ marginTop: 18 }}>
        Cash withdrawal unlocks later (NZ$10+ balance, ID check). For now: charity, KiwiSaver, Airpoints.
      </p>
    </main>
  );
}
