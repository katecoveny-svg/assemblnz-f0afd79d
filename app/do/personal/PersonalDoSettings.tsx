"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { ArrowLeft, ArrowRight, Check, Settings2, ShieldCheck, X } from "lucide-react";
import {
  DEFAULT_PERSONAL_DO_PROFILE,
  PERSONAL_DO_PROFILE_CONSENT,
  type PersonalDoProfile,
  type PersonalDoProfileInput,
} from "@/apps/do/personal/profile";
import { DO_VOICE_VOICES } from "@/apps/do/shared/gemini-live";
import { PersonalDoCharacter } from "./PersonalDoCharacter";
import styles from "./identity.module.css";

const characters = [
  { value: "bloom", label: "Bloom", note: "A fresh perspective" },
  { value: "orbit", label: "Orbit", note: "Keeping things together" },
  { value: "pebble", label: "Pebble", note: "A steady presence" },
  { value: "spark", label: "Spark", note: "A little momentum" },
] as const;
const tones = [
  { value: "warm", label: "Warm & easy", note: "A friendly nudge. Plain words." },
  { value: "direct", label: "Straight to it", note: "The answer, then the next step." },
  { value: "thoughtful", label: "Think it through", note: "Space for context and good questions." },
] as const;
const lengths = [
  { value: "brief", label: "Keep it brief" },
  { value: "balanced", label: "A little context" },
  { value: "detailed", label: "Give me the detail" },
] as const;
const initiatives = [
  { value: "on_request", label: "Stick to my question" },
  { value: "gentle", label: "Suggest a next step" },
  { value: "proactive", label: "Point out loose ends" },
] as const;

function editable(profile: PersonalDoProfile): PersonalDoProfileInput {
  const { updatedAt: _updatedAt, ...input } = profile;
  return input;
}

export function PersonalDoSettings({ onProfileChange, compact = false, triggerRef }: {
  triggerRef?: RefObject<HTMLButtonElement | null>;
  compact?: boolean;
  onProfileChange: (profile: PersonalDoProfile | null) => void;
}) {
  const [profile, setProfile] = useState<PersonalDoProfile | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState(() => editable(DEFAULT_PERSONAL_DO_PROFILE));
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [forgetting, setForgetting] = useState(false);
  const [notice, setNotice] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const lock = useRef(false);
  const mounted = useRef(true);
  const request = useRef<AbortController | null>(null);
  const saveRequest = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    try {
      const response = await fetch("/api/do/personal/profile", { cache: "no-store", signal: controller.signal });
      const data = await response.json();
      if (!response.ok) throw new Error("Your DO settings could not load. Try again shortly.");
      if (controller.signal.aborted) return;
      setProfile(data.profile);
      setSaved(data.saved);
      onProfileChange(data.profile);
      setError("");
    } catch (e) {
      if (controller.signal.aborted) return;
      setProfile(null);
      onProfileChange(null);
      setError(e instanceof Error ? e.message : "Your DO settings could not load.");
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [onProfileChange]);
  useEffect(() => {
    mounted.current = true;
    // The state changes follow the asynchronous account-scoped fetch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
    return () => { mounted.current = false; request.current?.abort(); saveRequest.current?.abort(); };
  }, [load]);
  useEffect(() => {
    if (open) { dialog.current?.showModal(); heading.current?.focus(); }
    else dialog.current?.close();
  }, [open, step]);

  function change<K extends keyof PersonalDoProfileInput>(key: K, value: PersonalDoProfileInput[K]) {
    setDraft(previous => ({ ...previous, [key]: value }));
    setConsent(false);
    setNotice("");
    setForgetting(false);
  }
  function edit() {
    setDraft(editable(profile ?? DEFAULT_PERSONAL_DO_PROFILE));
    setConsent(false);
    setNotice("");
    setForgetting(false);
    setStep(0);
    setOpen(true);
  }
  async function save() {
    if (lock.current || !consent) return;
    lock.current = true;
    setBusy(true);
    setNotice("");
    const controller = new AbortController();
    saveRequest.current = controller;
    try {
      const response = await fetch("/api/do/personal/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...draft, displayName: draft.displayName.trim(), onboardingCompleted: true, consent: true }),
        signal: controller.signal,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Your settings could not be saved. Please try again.");
      if (!mounted.current) return;
      setProfile(data.profile);
      setSaved(true);
      onProfileChange(data.profile);
      setOpen(false);
      setNotice("Your DO, saved. You can change these settings whenever you like.");
    } catch (e) {
      if (mounted.current && !controller.signal.aborted) setNotice(e instanceof Error ? e.message : "Your settings could not be saved.");
    } finally {
      lock.current = false;
      if (mounted.current) setBusy(false);
    }
  }
  async function forget() {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setNotice("");
    const controller = new AbortController();
    saveRequest.current = controller;
    try {
      const response = await fetch("/api/do/personal/profile", { method: "DELETE", signal: controller.signal });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Your preferences could not be removed. Please try again.");
      if (!mounted.current) return;
      setProfile(data.profile);
      setSaved(false);
      onProfileChange(data.profile);
      setOpen(false);
      setForgetting(false);
      setNotice("Your saved preferences have been removed. DO is back to its defaults.");
    } catch (e) {
      if (mounted.current && !controller.signal.aborted) setNotice(e instanceof Error ? e.message : "Your preferences could not be removed.");
    } finally {
      lock.current = false;
      if (mounted.current) setBusy(false);
    }
  }
  const name = profile?.displayName || "DO";
  const sample = draft.tone === "direct"
    ? "Start with the proposal. Confirm Friday’s deadline, then choose who needs to review it."
    : draft.tone === "thoughtful"
      ? "The proposal looks like a useful place to start. Is Friday a firm deadline, or is there room to move?"
      : "Let’s make a little room in your day. Start with the proposal, then check that Friday’s deadline is still right.";
  return <>
    <section className={styles.identity} data-compact={compact || undefined} aria-label="Your DO settings">
      <PersonalDoCharacter avatar={profile?.avatar ?? "bloom"} small />
      <div className={styles.identityText}>
        <p className={styles.eyebrow}>{saved ? "MADE YOURS" : "A GOOD PLACE TO BEGIN"}</p>
        <h2>{saved ? `Meet ${name}.` : "Make a little more you."}</h2>
        <p>{loading ? "Opening your DO settings…" : error || (saved ? `${tones.find(item => item.value === profile?.tone)?.label}. ${lengths.find(item => item.value === profile?.responseLength)?.label}. Your preferences, kept with your account.` : "A name. A character. A way of working that feels right.")}</p>
      </div>
      {error ? <button type="button" onClick={() => void load()}>Try settings again</button> : <button ref={triggerRef} type="button" onClick={edit} disabled={loading}>
        {saved ? <><Settings2 size={17} /> Customise {name}</> : <>Make DO mine <ArrowRight size={17} /></>}
      </button>}
    </section>
    {!open && notice && <p className={styles.savedNotice} role="status">{notice}</p>}
    {open && <dialog ref={dialog} className={styles.backdrop} aria-labelledby="do-settings-title" onCancel={event => { event.preventDefault(); if (!busy) setOpen(false); }}>
      <div className={styles.sheet}>
        <div className={styles.sheetBar}>
          <span className={styles.eyebrow}>PERSONAL DO / MAKE IT YOURS</span>
          <button type="button" className={styles.close} onClick={() => setOpen(false)} disabled={busy} aria-label="Close customisation"><X size={22} /></button>
        </div>
        <div className={styles.progress} aria-label={`Step ${step + 1} of 3`}>
          {["A little character", "Your way of working", "The finishing touches"].map((label, index) => <span key={label} data-current={index === step} data-done={index < step}><b>{index < step ? <Check size={12} /> : `0${index + 1}`}</b><span>{label}</span></span>)}
        </div>
        <div className={styles.sheetGrid}>
          <div className={styles.form}>
            <h2 id="do-settings-title" ref={heading} tabIndex={-1}>{["Hello, your DO.", "Good help feels right.", "Little things matter."][step]}</h2>
            <p className={styles.introduction}>{["Give your companion a name and a little character. You can change your mind later.", "Choose how you like a conversation to feel. These settings shape replies and prepared drafts.", "Tell DO what makes help useful for you. Keep personal account details and secrets out of this box."][step]}</p>
            {step === 0 && <>
              <label className={styles.label}>What shall we call your DO?<input autoComplete="off" value={draft.displayName} maxLength={32} onChange={e => change("displayName", e.target.value)} placeholder="DO, Dot, Pip…" /></label>
              <fieldset className={styles.fieldset}><legend>Pick a character</legend><div className={styles.characters}>{characters.map(item => <button key={item.value} type="button" aria-pressed={draft.avatar === item.value} onClick={() => change("avatar", item.value)}><PersonalDoCharacter avatar={item.value} small /><strong>{item.label}</strong><span>{item.note}</span></button>)}</div></fieldset>
              <p className={styles.hint}>Still DO by assembl. Just a little more yours.</p>
            </>}
            {step === 1 && <>
              <fieldset className={styles.fieldset}><legend>How should DO sound?</legend><div className={styles.choices}>{tones.map(item => <button type="button" key={item.value} aria-pressed={draft.tone === item.value} onClick={() => change("tone", item.value)}><span><strong>{item.label}</strong><small>{item.note}</small></span><span className={styles.radio}>{draft.tone === item.value && <Check size={13} />}</span></button>)}</div></fieldset>
              <label className={styles.label}>How much detail?<select value={draft.responseLength} onChange={e => change("responseLength", e.target.value as PersonalDoProfile["responseLength"])}>{lengths.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
              <label className={styles.label}>When we’re talking<select value={draft.initiative} onChange={e => change("initiative", e.target.value as PersonalDoProfile["initiative"])}>{initiatives.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
              <p className={styles.hint}>This changes suggestions in your replies. Background jobs and external actions still need their own permission.</p>
            </>}
            {step === 2 && <>
              <label className={styles.label}>Anything else about how you like to work?<textarea rows={4} maxLength={1200} value={draft.preferences} onChange={e => change("preferences", e.target.value)} placeholder="Use NZ spelling. Put the next step first. Give me room to think before suggesting more." /></label>
              <label className={styles.label}>Your call voice<select value={draft.voiceName} onChange={e => change("voiceName", e.target.value as PersonalDoProfile["voiceName"])}>{DO_VOICE_VOICES.map(voice => <option key={voice}>{voice}</option>)}</select></label>
              <p className={styles.hint}>Used when live calls are available. Your microphone stays off until you choose to start a call.</p>
              <label className={styles.consent}><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} /><span>{PERSONAL_DO_PROFILE_CONSENT}</span></label>
            </>}
            <div role="status" aria-live="polite" className={styles.formNotice}>{notice}</div>
            <div className={styles.formActions}>
              {step > 0 ? <button type="button" className={styles.secondary} disabled={busy} onClick={() => setStep(step - 1)}><ArrowLeft size={16} /> Back</button> : <button type="button" className={styles.secondary} onClick={() => setOpen(false)}>Not now</button>}
              {step < 2 ? <button type="button" className={styles.primary} disabled={!draft.displayName.trim()} onClick={() => setStep(step + 1)}>Next <ArrowRight size={16} /></button> : <button type="button" className={styles.primary} disabled={busy || !consent || !draft.displayName.trim()} onClick={() => void save()}>{busy ? "Saving…" : "Save my DO"}<Check size={16} /></button>}
            </div>
            {saved && <div className={styles.resetActions}><button type="button" className={styles.reset} disabled={busy} onClick={() => { setDraft(editable(DEFAULT_PERSONAL_DO_PROFILE)); setConsent(false); setNotice("Defaults selected. Save to apply them to your account."); }}>Use DO defaults</button><button type="button" className={styles.reset} disabled={busy} onClick={() => setForgetting(!forgetting)}>Forget my preferences</button></div>}
            {forgetting && <section className={styles.forget} aria-label="Confirm preference removal"><strong>Forget these saved preferences?</strong><p>This removes your name, character and communication preferences from your account and ends any current call. Your responsibility notes and drafts stay saved. It cannot recall information already shared with a provider.</p><button type="button" className={styles.primary} disabled={busy} onClick={() => void forget()}>{busy ? "Removing…" : "Remove saved preferences"}</button><button type="button" className={styles.secondary} disabled={busy} onClick={() => setForgetting(false)}>Keep them</button></section>}
          </div>
          <aside className={styles.preview} aria-label="Personality preview">
            <span className={styles.eyebrow}>A LITTLE INTRODUCTION</span>
            <PersonalDoCharacter avatar={draft.avatar} />
            <h3>{draft.displayName.trim() || "DO"}<span>by assembl</span></h3>
            <div className={styles.sample}><span className={styles.eyebrow}>EXAMPLE REPLY</span><p>{sample}</p>{draft.responseLength === "detailed" && <p>Once that’s clear, put the outline together and leave the finished draft for your review.</p>}</div>
            <p className={styles.previewNote}>An example of the tone. Your real replies depend on the context you share.</p>
            <div className={styles.assurance}><ShieldCheck size={19} /><span>Your preferences shape the help.<br />You stay in charge of the work.</span></div>
          </aside>
        </div>
      </div>
    </dialog>}
  </>;
}
