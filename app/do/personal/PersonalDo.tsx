"use client";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  ArrowUpRight,
  Check,
  Clock3,
  ChevronDown,
  HeartHandshake,
  CloudSun,
  Pause,
  Plus,
  RefreshCw,
  X,
} from "lucide-react";
import { DoBrand } from "@/components/do/DoBrand";
import { DoPresence } from "@/components/do/DoPresence";
import { DoShareButton } from "@/components/do/DoShareButton";
import { DoReadAloud } from "@/components/do/DoReadAloud";
import { DoGeminiLive } from "@/app/do/DoGeminiLive";
import type { PersonalDoProfile } from "@/apps/do/personal/profile";
import { PersonalDoSettings } from "./PersonalDoSettings";
import { LifeAdmin } from "./LifeAdmin";
import { PersonalDoAssistant, type PersonalAssistantWork } from "./PersonalDoAssistant";
import { NzCareNavigation } from "./NzCareNavigation";
import { LifeAdminLocalUpdates } from "./LifeAdminLocalUpdates";
import { acceptDoShare, readDoShareForWorkspace, doShareText } from "@/apps/do/shared/share-intake";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { replacePersonalLoad, shouldRevalidatePersonalOwner } from "@/apps/do/personal/session";
import {
  PERSONAL_BOUNDARY,
  PERSONAL_STARTERS,
  responsibilityStatus,
  type PersonalState,
  type Responsibility,
} from "@/apps/do/personal/contract";
import { personalWorkerHealth } from "@/apps/do/personal/worker-health";
import styles from "./personal.module.css";
const emptyForm = {
  title: "",
  goal: "",
  notes: "",
  timezone: "Pacific/Auckland",
  localHour: 7,
};
const stamp = (date: string, zone = "Pacific/Auckland") =>
  new Intl.DateTimeFormat("en-NZ", {
    timeZone: zone,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
export function PersonalDo() {
  const [state, setState] = useState<PersonalState | null>(null);
  const [personalProfile, setPersonalProfile] = useState<PersonalDoProfile | null>(null);
  const [sharedIntake, setSharedIntake] = useState<{ id: string; text: string; sourceTitle: string }>();
  const [workspaceKey, setWorkspaceKey] = useState<string | null>(null);
  const [guestDirty, setGuestDirty] = useState(false);
  const [assistantWork, setAssistantWork] = useState<PersonalAssistantWork>({ dirty: false, exportText: "" });
  const [assistantWorking, setAssistantWorking] = useState(false);
  const [leavingHref, setLeavingHref] = useState<string | null>(null);
  const leaveDialog = useRef<HTMLDialogElement>(null);
  const approvedLeave = useRef(false);
  const workspaceRef = useRef<string | null>(null);
  const loadRequest = useRef<AbortController | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const workerHealth = state ? personalWorkerHealth(state.worker, now) : null;
  const [access, setAccess] = useState<
    "loading" | "signed-out" | "ready" | "error"
  >("loading");
  const [notice, setNotice] = useState("");
  const [callOpen, setCallOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | undefined>();
  const [consent, setConsent] = useState(false);
  const [editor, setEditor] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const editorHeading = useRef<HTMLHeadingElement>(null);
  const settingsButton = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const load = useCallback(async () => {
    const controller = replacePersonalLoad(loadRequest.current);
    loadRequest.current = controller;
    let verifiedScope: string | null = null;
    try {
      const r = await fetch("/api/do/personal", { cache: "no-store", signal: controller.signal });
      const data = await r.json();
      if (controller.signal.aborted) return;
      const scope = data.workspaceKey === "guest" || (typeof data.workspaceKey === "string" && /^[a-f0-9-]{36}$/i.test(data.workspaceKey)) ? data.workspaceKey as string : null;
      if (!scope) throw new Error("Account identity unavailable.");
      verifiedScope = scope;
      if (workspaceRef.current !== scope) {
        if (workspaceRef.current !== null) setSharedIntake(undefined);
        setAssistantWork({ dirty: false, exportText: "" }); setAssistantWorking(false);
        setPersonalProfile(null);
        setForm(emptyForm); setEditor(false); setConsent(false); setEditId(undefined);
      }
      workspaceRef.current = scope;
      setWorkspaceKey(scope);
      try {
        const share = readDoShareForWorkspace(window.sessionStorage, scope);
        if (share) setSharedIntake({ id: share.id, text: doShareText(share), sourceTitle: share.title || "Shared into DO" });
      } catch { /* Storage access must not stop the workspace loading. */ }
      if (r.status === 401) {
        setState(null);
        setPersonalProfile(null);
        setAccess("signed-out");
        setForm(emptyForm);
        setEditor(false);
        return;
      }
      if (!r.ok) throw new Error(data.error);
      setState(data);
      setNow(Date.now());
      setAccess("ready");
    } catch {
      if (controller.signal.aborted) return;
      // An authenticated storage error includes a verified scope; network or
      // malformed identity errors cannot safely reuse a previous person's UI.
      setPersonalProfile(null);
      if (!verifiedScope) { workspaceRef.current = null; setWorkspaceKey(null); setSharedIntake(undefined); setEditor(false); setConsent(false); setAssistantWork({ dirty: false, exportText: "" }); setAssistantWorking(false); }
      setAccess("error");
      setState(null);
      setNotice(
        "Your workspace could not load. Try again; nothing has been changed.",
      );
    }
  }, []);
  // load changes state only after its asynchronous fetch completes.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
    const refresh = () => {
      if (!lock.current) void load();
    };
    window.addEventListener("focus", refresh);
    let unsubscribe: (() => void) | undefined;
    try {
      const client = createBrowserClient();
      const subscription = client.auth.onAuthStateChange((_event, session) => {
        const hintedScope = session?.user?.id ?? "guest";
        if (shouldRevalidatePersonalOwner(_event, workspaceRef.current, hintedScope)) {
          loadRequest.current?.abort();
          workspaceRef.current = null;
          setWorkspaceKey(null); setState(null); setPersonalProfile(null); setAssistantWork({ dirty: false, exportText: "" }); setAssistantWorking(false);
          setSharedIntake(undefined); setForm(emptyForm); setEditor(false); setConsent(false);
          // The event only invalidates. The server verifies the new owner.
          void load();
        }
      });
      unsubscribe = () => subscription.data.subscription.unsubscribe();
    } catch { /* Public local tools still work when Supabase is not configured. */ }
    return () => { window.removeEventListener("focus", refresh); loadRequest.current?.abort(); unsubscribe?.(); };
  }, [load]);
  useEffect(() => {
    if (editor) {
      dialog.current?.showModal();
      editorHeading.current?.focus();
    } else {
      dialog.current?.close();
    }
  }, [editor]);
  useEffect(() => {
    if (leavingHref) leaveDialog.current?.showModal();
    else leaveDialog.current?.close();
  }, [leavingHref]);
  useEffect(() => {
    if (workspaceKey !== "guest" || !guestDirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      if (approvedLeave.current) return;
      event.preventDefault(); event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [workspaceKey, guestDirty]);
  function openEditor(
    item?: Responsibility,
    starter?: (typeof PERSONAL_STARTERS)[number],
  ) {
    setEditId(item?.id);
    setForm(
      item
        ? {
            title: item.title,
            goal: item.goal,
            notes: item.notes,
            timezone: item.timezone,
            localHour: item.local_hour,
          }
        : { ...emptyForm, ...starter },
    );
    setConsent(false);
    setEditor(true);
    setNotice("");
  }
  async function change(payload: unknown, run = false): Promise<boolean> {
    if (lock.current) return false;
    lock.current = true;
    setBusy(true);
    setNotice(run ? "DO is preparing from your saved notes…" : "Saving…");
    try {
      const r = await fetch(run ? "/api/do/personal/run" : "/api/do/personal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Please try again.");
      await load();
      setNotice(
        run
          ? data.published
            ? "A draft is ready for your review."
            : "No draft was published. Check the run history for a failure or cancellation."
          : "Saved.",
      );
      return true;
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Please try again.");
      return false;
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  async function save(event: FormEvent) {
    event.preventDefault();
    if (await change({ action: "save", ...form, id: editId, consent })) {
      setEditor(false);
      setForm(emptyForm);
      setConsent(false);
    }
  }
  function keepCallDraft(notes: string) {
    if (busy || editor || !state?.worker.configured || state.responsibilities.length >= 5 || notes.length > 10000) return false;
    setEditId(undefined);
    setForm({
      ...emptyForm,
      title: "A next step from our call",
      goal: "Prepare the next useful step from these reviewed call notes. Flag anything that still needs checking or my decision.",
      notes,
    });
    setConsent(false);
    setNotice("");
    setEditor(true);
    return true;
  }
  const needsReview =
    state?.runs.filter((r) => r.status === "needs_review").length ?? 0;
  return (
    <main className={styles.page} onClickCapture={event => {
      if (workspaceKey !== "guest" || !guestDirty || !(event.target instanceof Element)) return;
      const link = event.target.closest<HTMLAnchorElement>("a[href]");
      if (!link || link.target === "_blank" || link.download) return;
      const destination = new URL(link.href, window.location.href);
      if (destination.origin !== window.location.origin || (destination.pathname === window.location.pathname && destination.search === window.location.search)) return;
      event.preventDefault(); event.stopPropagation(); setLeavingHref(destination.href);
    }}>
      <header className={styles.nav}>
        <DoBrand />
        <nav aria-label="DO" className={styles.navActions}>
          <details className={styles.more}><summary>More <Plus size={15} /></summary><nav aria-label="More DO tools"><Link href="/do/widget">Write, talk or look</Link><Link href="/do/meetings">Meeting notes · sign in</Link><Link href="/do/bills">Bills · examples and CSV</Link><Link href="/do/enquiries">Enquiries · private pilot</Link><Link href="/do/install">Install DO</Link><Link href="/legal/privacy">Privacy</Link></nav></details>
          <Link className={styles.phoneLink} href="/do/install#phone">Install DO <ArrowUpRight size={14} /></Link>
          {access === "ready" && workspaceKey
            ? <PersonalDoSettings key={workspaceKey} compact triggerRef={settingsButton} onProfileChange={setPersonalProfile} />
            : <Link className={styles.signIn} href="/login?redirect=%2Fdo">Sign in <ArrowUpRight size={15} /></Link>}
        </nav>
      </header>
      <div className={styles.notice} role="status" aria-live="polite">
        {notice}
      </div>
      {access === "loading" && (
        <p className={styles.loading}>Opening DO…</p>
      )}
      {access === "error" && (
        <button className={styles.retry} onClick={() => void load()}>
          Try loading again <RefreshCw size={16} />
        </button>
      )}
      {workspaceKey && <LifeAdmin key={workspaceKey} assistant={<PersonalDoAssistant key={workspaceKey} profile={personalProfile ?? undefined} onWorkingChange={setAssistantWorking} onWorkChange={setAssistantWork} />} assistantWork={assistantWork} assistantWorking={assistantWorking} profile={personalProfile} onCustomise={access === "ready" ? () => settingsButton.current?.click() : undefined} storageScope={workspaceKey} intake={sharedIntake} onGuestWorkChange={setGuestDirty} onIntakeAccepted={id => { try { acceptDoShare(window.sessionStorage, id); } catch { /* Storage may be unavailable. */ } }} onTalk={() => { setCallOpen(true); requestAnimationFrame(() => document.getElementById("personal-do-call")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" })); }} />}
      {workspaceKey && callOpen && <div id="personal-do-call" className={styles.call}>
        <div className={styles.callHeading}><p className={styles.eyebrow}>VOICE</p><a href="#life-admin">Back to my workspace ↑</a></div>
        <DoGeminiLive
          key={`${workspaceKey}:${personalProfile?.updatedAt ?? "default"}`}
          profile={personalProfile ?? undefined}
          draftTarget="responsibility"
          onDraft={state?.worker.configured && state.responsibilities.length < 5 ? keepCallDraft : undefined}
        />
      </div>}
      {workspaceKey && <section className={styles.around} aria-labelledby="around-you-title">
        <div className={styles.aroundHeading}><p className={styles.eyebrow}>NEW ZEALAND</p><h2 id="around-you-title">Local information</h2></div>
        <div className={styles.aroundGrid}>
          <details className={styles.aroundPanel}><summary><HeartHandshake size={23} /><span><strong>Care, health & later life</strong><small>Support, appointments and the right place to ask</small></span><Plus size={19} /></summary><NzCareNavigation storageScope={workspaceKey} /></details>
          <details className={styles.aroundPanel}><summary><CloudSun size={23} /><span><strong>Weather & public updates</strong><small>Check the conditions before your next step</small></span><Plus size={19} /></summary><LifeAdminLocalUpdates key={workspaceKey} /></details>
        </div>
      </section>}
      {access === "ready" && state && (
        <details className={styles.ongoing}>
          <summary><span><span className={styles.eyebrow}>SAVED NOTES</span><strong>Ongoing responsibilities</strong></span><span className={styles.ongoingCount}>{needsReview ? `${needsReview} to review` : `${state.responsibilities.length} saved`} <ChevronDown size={20} /></span></summary>
          <div className={styles.ongoingIntro}><p>Give DO a set of notes and permission to prepare the next step each day.</p><button className={styles.save} onClick={() => openEditor()} disabled={busy || !state.worker.configured || state.responsibilities.length >= 5}><Plus size={18} /> Give DO a responsibility</button></div>
          <section
            className={styles.worker}
            aria-label="Background worker status"
          >
            <Clock3 size={20} />
            <div>
              <strong>
                {workerHealth?.label}
              </strong>
              <p>
                {workerHealth?.detail}{" "}
                {state.worker.lastSeenAt
                  ? `Last worker check: ${stamp(state.worker.lastSeenAt)} (NZ time).`
                  : "Waiting for the first cloud worker check."}{" "}
                Checks are scheduled hourly; queued work may take longer. Results appear
                here. Phone notifications are not connected. Uses Assembl’s configured drafting provider; this flow does not use the TypeSafe check.
              </p>
            </div>
            <button
              onClick={() => void load()}
              disabled={busy}
              aria-label="Refresh workspace"
            >
              <RefreshCw size={18} />
            </button>
          </section>
          <section className={styles.workspace}>
            <div>
              <div className={styles.sectionHeading}>
                <div>
                  <p className={styles.eyebrow}>RESPONSIBILITIES</p>
                  <h2>My responsibilities</h2>
                </div>
                <span>{state.responsibilities.length} / 5</span>
              </div>
              {state.responsibilities.length === 0 && (
                <p className={styles.empty}>
                  Start with one small responsibility. Add the notes you want DO
                  to use, then choose when to check them.
                </p>
              )}
              <div className={styles.responsibilities}>
                {state.responsibilities.map((item) => (
                  <article className={styles.responsibility} key={item.id}>
                    <div className={styles.row}>
                      <span className={styles.status}>
                        {responsibilityStatus(item, now)}
                      </span>
                      <span>
                        Daily · {String(item.local_hour).padStart(2, "0")}:00
                      </span>
                    </div>
                    <h3>{item.title}</h3>
                    <p>{item.goal}</p>
                    <p className={styles.meta}>
                      {item.timezone}
                      <br />
                      Next eligible check:{" "}
                      {stamp(item.next_run_at, item.timezone)}
                      <br />
                      Permission until{" "}
                      {stamp(item.consent_until, item.timezone)}
                    </p>
                    <details>
                      <summary>What DO remembers</summary>
                      <p className={styles.notes}>{item.notes}</p>
                      <small>
                        Only notes you saved. Update them when something
                        changes.
                      </small>
                    </details>
                    <div className={styles.actions}>
                      <button
                        disabled={
                          busy ||
                          responsibilityStatus(item, now) !== "Scheduled" ||
                          !state.worker.configured
                        }
                        onClick={() => void change({ id: item.id }, true)}
                      >
                        Prepare now <ArrowUpRight size={15} />
                      </button>
                      <button disabled={busy} onClick={() => openEditor(item)}>
                        Edit / renew
                      </button>
                      {item.active && (
                        <button
                          disabled={busy}
                          onClick={() =>
                            void change({ action: "pause", id: item.id })
                          }
                        >
                          <Pause size={14} /> Pause
                        </button>
                      )}
                      <button
                        disabled={busy}
                        onClick={() => setDeleting(item.id)}
                      >
                        Delete
                      </button>
                    </div>
                    {deleting === item.id && (
                      <div className={styles.confirm}>
                        <p>
                          Delete these notes and all their prepared drafts? This
                          cannot be undone.
                        </p>
                        <button
                          disabled={busy}
                          onClick={() =>
                            void change({ action: "delete", id: item.id }).then(
                              (ok) => {
                                if (ok) setDeleting(null);
                              },
                            )
                          }
                        >
                          Delete notes and history
                        </button>
                        <button onClick={() => setDeleting(null)}>
                          Keep them
                        </button>
                      </div>
                    )}
                  </article>
                ))}
              </div>
              <div className={styles.starters}>
                <p className={styles.eyebrow}>A FEW USEFUL PLACES TO START</p>
                {PERSONAL_STARTERS.map((item) => (
                  <button
                    key={item.title}
                    disabled={
                      busy ||
                      state.responsibilities.length >= 5 ||
                      !state.worker.configured
                    }
                    onClick={() => openEditor(undefined, item)}
                  >
                    {item.title}
                    <Plus size={18} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className={styles.sectionHeading}>
                <div>
                  <p className={styles.eyebrow}>PREPARED FOR YOU</p>
                  <h2>
                    Needs you<span className={styles.count}>{needsReview}</span>
                  </h2>
                </div>
              </div>
              {state.runs.length === 0 && (
                <div className={styles.emptyResult}>
                  <DoPresence size="small" />
                  <h3>No drafts yet</h3>
                  <p>
                    Save a responsibility, then tap Prepare now or wait for its
                    scheduled check.
                  </p>
                </div>
              )}
              <div className={styles.results}>
                {state.runs.map((run) => {
                  const item = state.responsibilities.find(
                    (i) => i.id === run.responsibility_id,
                  );
                  const stale = !!item && item.revision !== run.revision;
                  const interrupted =
                    run.status === "running" &&
                    now - Date.parse(run.started_at) > 600000;
                  return (
                    <article key={run.id} className={styles.result}>
                      <p className={styles.eyebrow}>
                        {run.status === "needs_review"
                          ? "DRAFT · REVIEW NEEDED"
                          : run.status === "reviewed"
                            ? "REVIEWED DRAFT"
                            : interrupted
                              ? "WORKER INTERRUPTED"
                              : run.status.replace("_", " ").toUpperCase()}
                      </p>
                      <h3>{item?.title ?? "Prepared work"}</h3>
                      <time>{stamp(run.started_at)}</time>
                      {stale && (
                        <p className={styles.stale}>
                          Prepared before the latest change. Check against your
                          current notes.
                        </p>
                      )}
                      {run.output ? (
                        <p className={styles.output}>{run.output}</p>
                      ) : (
                        <p>
                          {run.status === "failed" || interrupted
                            ? "Preparation did not finish. Your notes remain saved; try again after the run limit resets."
                            : run.status === "cancelled"
                              ? "This run was cancelled. No result was published."
                              : "Preparing from your saved notes. Refresh to check progress."}
                        </p>
                      )}
                      <details>
                        <summary>What happened</summary>
                        <p>{PERSONAL_BOUNDARY}</p>
                        <p className={styles.meta}>
                          {typeof run.evidence.model === "string"
                            ? `Prepared with ${run.evidence.model}. `
                            : ""}
                          {typeof run.evidence.notesUpdatedAt === "string"
                            ? `Notes saved ${stamp(run.evidence.notesUpdatedAt)}.`
                            : ""}
                        </p>
                        <p>
                          Review records your decision. It does not send or
                          complete the proposed work.
                        </p>
                      </details>
                      {run.output && (
                        <div className={styles.actions}>
                          {run.status === "needs_review" && (
                            <button
                              disabled={busy}
                              onClick={() =>
                                void change({ action: "review", id: run.id })
                              }
                            >
                              <Check size={16} /> Mark reviewed
                            </button>
                          )}
                          <DoShareButton
                            disabled={run.status !== "reviewed" || stale}
                            label="Share reviewed draft"
                            content={{
                              title: item?.title ?? "Personal DO draft",
                              text: run.output,
                              filename: "personal-do-draft.txt",
                            }}
                          />
                          <DoReadAloud text={run.output} />
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        </details>
      )}
      <details id="how-it-works" className={styles.how}>
        <summary>What DO can do today <Plus size={18} /></summary>
        <div className={styles.howContent}>
        <p className={styles.eyebrow}>CURRENT FEATURES</p>
        <h2>
          Saved notes and drafts
        </h2>
        <div>
          <article>
            <span>01</span>
            <h3>Saved notes</h3>
            <p>
              Save the notes, preferences and open questions for each
              responsibility. You can read, replace or delete them.
            </p>
          </article>
          <article>
            <span>02</span>
            <h3>Background drafts</h3>
            <p>
              When the background worker is healthy, it can prepare work while this page is closed. Check its status above. You approve seven days at a time, with up to five preparations per account in 24 hours.
            </p>
          </article>
          <article>
            <span>03</span>
            <h3>Review and share</h3>
            <p>
              Read the draft and its source record. Share only after review.
              Messages, bookings and account changes need their own approval and
              connection.
            </p>
          </article>
        </div>
        <p className={styles.scope}>
          This version uses your saved notes. Live inbox, calendar and bank
          monitoring, push notifications and cross-app screen access are not
          connected.
        </p>
        </div>
      </details>
      <footer className={styles.footer}>
        <span>DO by assembl</span>
        <Link href="/legal/privacy">Privacy</Link>
      </footer>
      {leavingHref && <dialog ref={leaveDialog} className={styles.editorBackdrop} aria-labelledby="guest-leave-title" onCancel={event => { event.preventDefault(); setLeavingHref(null); }}>
        <section className={styles.editor}>
          <p className={styles.eyebrow}>KEEP YOUR WORK BEFORE YOU GO</p>
          <h2 id="guest-leave-title">Your checklist is in this page.</h2>
          <p>Signing in or leaving starts a fresh workspace. Stay and use Download all guest work to keep a copy first. You can paste it back into your signed-in workspace.</p>
          <div className={styles.actions}>
            <button type="button" onClick={() => { setLeavingHref(null); setNotice("Use Download all guest work above your checklist before signing in."); }}>Stay and keep my work</button>
            <button type="button" onClick={() => { approvedLeave.current = true; window.location.assign(leavingHref); }}>Leave without this work</button>
          </div>
        </section>
      </dialog>}
      {editor && (
        <dialog
          ref={dialog}
          onCancel={(e) => {
            e.preventDefault();
            if (!busy) setEditor(false);
          }}
          className={styles.editorBackdrop}
          aria-labelledby="personal-editor-title"
        >
          <section
            className={styles.editor}
          >
            <div className={styles.row}>
              <p className={styles.eyebrow}>GIVE DO AN ONGOING JOB</p>
              <button
                aria-label="Close editor"
                onClick={() => setEditor(false)}
                disabled={busy}
              >
                <X size={22} />
              </button>
            </div>
            <h2 id="personal-editor-title" ref={editorHeading} tabIndex={-1}>
              {editId ? "Keep DO up to date." : "One less loose end."}
            </h2>
            <form onSubmit={save}>
              <label>
                Responsibility
                <input
                  required
                  maxLength={100}
                  value={form.title}
                  onChange={(e) => {
                    setForm({ ...form, title: e.target.value });
                    setConsent(false);
                  }}
                  placeholder="Prepare my day"
                />
              </label>
              <label>
                What should DO prepare?
                <textarea
                  required
                  minLength={10}
                  maxLength={1500}
                  rows={3}
                  value={form.goal}
                  onChange={(e) => {
                    setForm({ ...form, goal: e.target.value });
                    setConsent(false);
                  }}
                  placeholder="A short brief, the next three actions, and questions that need me."
                />
              </label>
              <label>
                Notes for DO to remember
                <textarea
                  required
                  maxLength={10000}
                  rows={6}
                  value={form.notes}
                  onChange={(e) => {
                    setForm({ ...form, notes: e.target.value });
                    setConsent(false);
                  }}
                  placeholder="Add the actual dates, plans, preferences and unfinished work. Nothing is imported from your other apps."
                />
              </label>
              <div className={styles.schedule}>
                <label>
                  Daily check hour
                  <select
                    value={form.localHour}
                    onChange={(e) => {
                      setForm({ ...form, localHour: Number(e.target.value) });
                      setConsent(false);
                    }}
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>
                        {String(i).padStart(2, "0")}:00
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Time zone
                  <input
                    required
                    value={form.timezone}
                    onChange={(e) => {
                      setForm({ ...form, timezone: e.target.value });
                      setConsent(false);
                    }}
                  />
                </label>
              </div>
              <label className={styles.consent}>
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                />
                <span>
                  Save these notes privately to my account and let DO send them
                  to Assembl’s configured generation provider for daily
                  preparation over the next seven days. I can pause or delete
                  this responsibility. A request already in progress cannot be
                  recalled.
                </span>
              </label>
              <p>
                Results appear in Personal DO. This permission covers
                preparation only. Uses Assembl’s configured drafting provider; this flow does not use the TypeSafe check.
              </p>
              <button
                type="submit"
                className={styles.save}
                disabled={!consent || busy || !state?.worker.configured}
              >
                {busy ? "Saving…" : "Save & start seven days"}{" "}
                <ArrowUpRight size={18} />
              </button>
              <p role="status">{notice}</p>
            </form>
          </section>
        </dialog>
      )}
    </main>
  );
}
