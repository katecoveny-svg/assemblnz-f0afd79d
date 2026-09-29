"use client";
import Image from "next/image";
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
  Pause,
  Plus,
  RefreshCw,
  X,
} from "lucide-react";
import { DoPresence } from "@/components/do/DoPresence";
import { DoShareButton } from "@/components/do/DoShareButton";
import {
  PERSONAL_BOUNDARY,
  PERSONAL_STARTERS,
  responsibilityStatus,
  type PersonalState,
  type Responsibility,
} from "@/apps/do/personal/contract";
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
  const [now, setNow] = useState(() => Date.now());
  const [access, setAccess] = useState<
    "loading" | "signed-out" | "ready" | "error"
  >("loading");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | undefined>();
  const [consent, setConsent] = useState(false);
  const [editor, setEditor] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const editorHeading = useRef<HTMLHeadingElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/do/personal", { cache: "no-store" });
      const data = await r.json();
      if (r.status === 401) {
        setState(null);
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
    return () => window.removeEventListener("focus", refresh);
  }, [load]);
  useEffect(() => {
    if (editor) {
      dialog.current?.showModal();
      editorHeading.current?.focus();
    } else {
      dialog.current?.close();
    }
  }, [editor]);
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
  const needsReview =
    state?.runs.filter((r) => r.status === "needs_review").length ?? 0;
  return (
    <main className={styles.page}>
      <header className={styles.nav}>
        <Link href="/do" className={styles.brand}>
          DO <span>by assembl</span>
        </Link>
        <nav aria-label="Personal DO">
          <Link href="/do/widget">
            Workspace <ArrowUpRight size={15} />
          </Link>
          <Link href="/do/install#phone">On your phone</Link>
        </nav>
      </header>
      <section className={styles.hero}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>PERSONAL DO / YOUR ONGOING WORK</p>
          <h1>
            A little less
            <br />
            <span>on your mind.</span>
          </h1>
          <p>
            Give DO something to stay on top of. Keep the context, prepare the
            next step, and come back to work you can review.
          </p>
          <div className={styles.heroActions}>
            {access === "ready" ? (
              <button
                onClick={() => openEditor()}
                disabled={
                  busy ||
                  !state?.worker.configured ||
                  state.responsibilities.length >= 5
                }
              >
                <Plus size={18} /> Give DO a responsibility
              </button>
            ) : (
              <Link href="/login?redirect=%2Fdo%2Fpersonal">
                Open my Personal DO <ArrowUpRight size={18} />
              </Link>
            )}
            <a href="#how-it-works">See how it works ↓</a>
          </div>
        </div>
        <div className={styles.art}>
          <Image
            src="/do/editorial/work-in-your-pocket.webp"
            alt="Paperwork gathered beside a phone in a plum setting. Concept artwork."
            fill
            sizes="(max-width: 760px) 100vw, 48vw"
            priority
          />
          <div className={styles.presence}>
            <DoPresence size="small" />
          </div>
          <div className={styles.artCaption}>
            <span>your context, kept.</span>
            <strong>your next step, prepared.</strong>
          </div>
        </div>
      </section>
      <div className={styles.notice} role="status" aria-live="polite">
        {notice}
      </div>
      {access === "loading" && (
        <p className={styles.loading}>Opening your private workspace…</p>
      )}
      {access === "error" && (
        <button className={styles.retry} onClick={() => void load()}>
          Try loading again <RefreshCw size={16} />
        </button>
      )}
      {access === "ready" && state && (
        <>
          <section
            className={styles.worker}
            aria-label="Background worker status"
          >
            <Clock3 size={20} />
            <div>
              <strong>
                {state.worker.configured
                  ? "Daily cloud preparation"
                  : "Cloud preparation unavailable"}
              </strong>
              <p>
                {state.worker.lastSeenAt
                  ? `Last worker check: ${stamp(state.worker.lastSeenAt)} (NZ time).`
                  : "Waiting for the first cloud worker check."}{" "}
                Checks run hourly; queued work may take longer. Results appear
                here. Phone notifications are not connected.
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
                  <p className={styles.eyebrow}>WHAT DO KEEPS TRACK OF</p>
                  <h2>On my behalf.</h2>
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
                  <h3>Your first draft lands here.</h3>
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
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        </>
      )}
      <section id="how-it-works" className={styles.how}>
        <p className={styles.eyebrow}>THE FIRST PERSONAL DO RELEASE</p>
        <h2>
          You set the responsibility.
          <br />
          DO prepares the next step.
        </h2>
        <div>
          <article>
            <span>01</span>
            <h3>Keep the useful context.</h3>
            <p>
              Save the notes, preferences and open questions for each
              responsibility. You can read, replace or delete them.
            </p>
          </article>
          <article>
            <span>02</span>
            <h3>Come back to prepared work.</h3>
            <p>
              Daily cloud checks work while this page is closed. You approve
              seven days at a time. Up to five checks per account in 24 hours.
            </p>
          </article>
          <article>
            <span>03</span>
            <h3>Decide what happens next.</h3>
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
      </section>
      <footer className={styles.footer}>
        <Link href="/">assembl</Link>
        <span>less admin, more mahi.</span>
        <Link href="/legal/privacy">Privacy</Link>
      </footer>
      {editor && (
        <dialog
          ref={dialog}
          onCancel={(e) => {
            e.preventDefault();
            if (!busy) setEditor(false);
          }}
          className={styles.editorBackdrop}
        >
          <section
            className={styles.editor}
            role="dialog"
            aria-modal="true"
            aria-labelledby="personal-editor-title"
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
                preparation only.
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
