"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, X } from "lucide-react";
import { DoMark } from "@/components/do/DoMark";
import {
  clampCompanionPosition,
  COMPANION_POSITION_KEY,
  readCompanionPosition,
  type CompanionPosition,
} from "@/apps/do/shared/companion-position";
import "@/app/do/do.css";
import styles from "./glow-do-widget.module.css";

const DoWorkspace = dynamic(() =>
  import("@/app/do/DoWorkspace").then((module) => module.DoWorkspace),
);

const FIRST_VISIT_KEY = "assembl-do-glow-seen-v1";

const STARTERS = [
  {
    id: "page",
    label: "Help with this page",
    hint: "Paste or describe what you need from this page.",
    brief: "Help me with this page. Ask what I want before preparing a draft.",
  },
  {
    id: "reply",
    label: "Draft a reply",
    hint: "Paste the message you need to answer.",
    brief: "Draft a clear reply I can edit. Do not send anything.",
  },
  {
    id: "meeting",
    label: "Meeting notes",
    hint: "Record or paste notes — sign-in required for transcription.",
    meeting: true,
  },
] as const;

export function GlowDoWidget() {
  const launcher = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [opened, setOpened] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [view, setView] = useState<"welcome" | "workspace">("welcome");
  const [starterBrief, setStarterBrief] = useState("");
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [meetingGate, setMeetingGate] = useState(false);
  const [position, setPosition] = useState<CompanionPosition | null>(null);
  const drag = useRef<{
    x: number;
    y: number;
    left: number;
    top: number;
    moved: boolean;
  } | null>(null);
  const suppressClick = useRef(false);

  function bounded(value: CompanionPosition) {
    const size = launcher.current?.getBoundingClientRect() ?? {
      width: 88,
      height: 96,
    };
    return clampCompanionPosition(
      value,
      { width: innerWidth, height: innerHeight },
      size,
    );
  }
  function remember(value: CompanionPosition) {
    try {
      localStorage.setItem(COMPANION_POSITION_KEY, JSON.stringify(value));
    } catch {
      /* Dragging still works without storage. */
    }
  }

  useEffect(() => {
    try {
      setShowHint(!localStorage.getItem(FIRST_VISIT_KEY));
    } catch {
      setShowHint(true);
    }
  }, []);

  useEffect(() => {
    const restore = () => {
      try {
        const saved = readCompanionPosition(
          localStorage.getItem(COMPANION_POSITION_KEY),
        );
        if (saved) setPosition(bounded(saved));
        else setPosition((current) => (current ? bounded(current) : null));
      } catch {
        setPosition((current) => (current ? bounded(current) : null));
      }
    };
    const frame = requestAnimationFrame(restore);
    addEventListener("resize", restore);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("resize", restore);
    };
  }, []);

  useEffect(() => {
    if (!opened) return;
    let cancelled = false;
    void fetch("/api/do/runtime", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((data: { signedIn?: boolean; trial?: { bypassed?: boolean } }) => {
        if (cancelled) return;
        setSignedIn(
          typeof data.signedIn === "boolean"
            ? data.signedIn
            : Boolean(data.trial?.bypassed),
        );
      })
      .catch(() => {
        if (!cancelled) setSignedIn(null);
      });
    return () => {
      cancelled = true;
    };
  }, [opened]);

  function markSeen() {
    try {
      localStorage.setItem(FIRST_VISIT_KEY, "1");
    } catch {
      /* optional */
    }
    setShowHint(false);
  }

  function openDialog() {
    markSeen();
    setView("welcome");
    setStarterBrief("");
    setMeetingGate(false);
    setOpened(true);
    dialog.current?.showModal();
  }

  function startWorkspace(brief = "") {
    setStarterBrief(brief);
    setView("workspace");
    setMeetingGate(false);
  }

  function onStarter(id: (typeof STARTERS)[number]["id"]) {
    const starter = STARTERS.find((s) => s.id === id);
    if (!starter) return;
    if ("meeting" in starter && starter.meeting) {
      if (signedIn === false || signedIn === null) {
        setMeetingGate(true);
        return;
      }
      window.location.assign("/do/meetings");
      return;
    }
    if ("brief" in starter) startWorkspace(starter.brief);
  }

  return (
    <>
      <button
        ref={launcher}
        className={styles.launcher}
        aria-label="Open DO. Drag to move, or use Alt and arrow keys. Escape resets position."
        style={
          position
            ? { left: position.left, top: position.top, right: "auto", bottom: "auto" }
            : undefined
        }
        onPointerDown={(event) => {
          if (event.button !== 0) return;
          const rect = event.currentTarget.getBoundingClientRect();
          suppressClick.current = false;
          drag.current = {
            x: event.clientX,
            y: event.clientY,
            left: rect.left,
            top: rect.top,
            moved: false,
          };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          const start = drag.current;
          if (!start || !event.currentTarget.hasPointerCapture(event.pointerId))
            return;
          if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > 5)
            start.moved = true;
          if (start.moved)
            setPosition(
              bounded({
                left: start.left + event.clientX - start.x,
                top: start.top + event.clientY - start.y,
              }),
            );
        }}
        onPointerUp={(event) => {
          suppressClick.current = Boolean(drag.current?.moved);
          if (drag.current?.moved) {
            const rect = event.currentTarget.getBoundingClientRect();
            remember(bounded({ left: rect.left, top: rect.top }));
          }
          drag.current = null;
          if (event.currentTarget.hasPointerCapture(event.pointerId))
            event.currentTarget.releasePointerCapture(event.pointerId);
        }}
        onPointerCancel={() => {
          drag.current = null;
          suppressClick.current = false;
        }}
        onKeyDown={(event) => {
          suppressClick.current = false;
          if (event.key === "Escape") {
            setPosition(null);
            try {
              localStorage.removeItem(COMPANION_POSITION_KEY);
            } catch {
              /* Optional preference. */
            }
            return;
          }
          if (
            !event.altKey ||
            !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(
              event.key,
            )
          )
            return;
          event.preventDefault();
          const rect = event.currentTarget.getBoundingClientRect();
          const next = bounded({
            left:
              rect.left +
              (event.key === "ArrowRight"
                ? 24
                : event.key === "ArrowLeft"
                  ? -24
                  : 0),
            top:
              rect.top +
              (event.key === "ArrowDown"
                ? 24
                : event.key === "ArrowUp"
                  ? -24
                  : 0),
          });
          setPosition(next);
          remember(next);
        }}
        onClick={() => {
          if (suppressClick.current) {
            suppressClick.current = false;
            return;
          }
          openDialog();
        }}
      >
        <span className={styles.mark}>
          <DoMark />
        </span>
        <span className={styles.label}>
          {showHint ? "Open DO" : "DO"} <ArrowUpRight size={12} />
        </span>
        {showHint ? (
          <span className={styles.hint} role="status">
            Your portable DO
          </span>
        ) : null}
      </button>
      <dialog
        ref={dialog}
        className={`do-workspace-dialog ${styles.sheet}`}
        aria-label="DO workspace"
        onClose={() => {
          setOpened(false);
          setView("welcome");
          setMeetingGate(false);
        }}
      >
        <button
          type="button"
          className="do-dialog-close"
          aria-label="Close DO workspace"
          onClick={() => dialog.current?.close()}
        >
          <X size={21} />
        </button>
        {opened && view === "welcome" ? (
          <div className={styles.welcome}>
            <p className={styles.kicker}>assembl · DO</p>
            <h2>What can DO help with?</h2>
            <p>
              Prepare drafts where you already are. DO does not listen in the
              background, and it never sends, books or pays for you.
            </p>
            <div className={styles.starters} role="list">
              {STARTERS.map((starter) => (
                <button
                  key={starter.id}
                  type="button"
                  className={styles.starter}
                  role="listitem"
                  onClick={() => onStarter(starter.id)}
                >
                  <strong>{starter.label}</strong>
                  <span>{starter.hint}</span>
                </button>
              ))}
            </div>
            {meetingGate ? (
              <div className={styles.gate} role="status">
                <p>
                  Meeting transcription needs an Assembl sign-in. Sign in opens
                  in this window so login can finish, then continue to Meeting
                  DO.
                </p>
                <Link
                  className={styles.gateCta}
                  href="/login?redirect=%2Fdo%2Fmeetings"
                >
                  Sign in to use Meeting DO <ArrowUpRight size={14} />
                </Link>
                <button
                  type="button"
                  className={styles.gateSecondary}
                  onClick={() => window.location.assign("/do/meetings")}
                >
                  I am already signed in — open Meeting DO
                </button>
              </div>
            ) : null}
            <div className={styles.welcomeActions}>
              <button
                type="button"
                className={styles.continue}
                onClick={() => startWorkspace()}
              >
                Open full builder
              </button>
              {signedIn === false ? (
                <Link href="/login?redirect=%2Fdo">
                  Sign in <ArrowUpRight size={14} />
                </Link>
              ) : null}
            </div>
          </div>
        ) : null}
        {opened && view === "workspace" ? (
          <DoWorkspace
            key={starterBrief || "blank"}
            initialBrief={starterBrief}
            initialTask={starterBrief.includes("reply") ? "reply" : "brief"}
          />
        ) : null}
        <nav className={styles.shortcuts} aria-label="More from DO">
          <Link href="/do">
            Your DOs <ArrowUpRight size={14} />
          </Link>
          <Link href="/do/meetings">Meeting DO</Link>
          <Link href="/do/office">Office</Link>
          <Link href="/do/connections">Connections</Link>
          <Link href="/login?redirect=%2Fdo">Sign in</Link>
        </nav>
      </dialog>
    </>
  );
}
