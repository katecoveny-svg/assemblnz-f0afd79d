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

export function GlowDoWidget() {
  const launcher = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [opened, setOpened] = useState(false);
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

  return (
    <>
      <button
        ref={launcher}
        className={styles.launcher}
        aria-label="Open DO. Drag to move, or use Alt and arrow keys. Escape resets position."
        style={
          position
            ? { left: position.left, top: position.top, right: "auto" }
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
          setOpened(true);
          dialog.current?.showModal();
        }}
      >
        <span className={styles.mark}>
          <DoMark />
        </span>
        <span className={styles.label}>
          Open DO <ArrowUpRight size={12} />
        </span>
      </button>
      <dialog
        ref={dialog}
        className="do-workspace-dialog"
        aria-label="DO workspace"
        onClose={() => setOpened(false)}
      >
        <button
          type="button"
          className="do-dialog-close"
          aria-label="Close DO workspace"
          onClick={() => dialog.current?.close()}
        >
          <X size={21} />
        </button>
        {opened ? <DoWorkspace /> : null}
        <nav className={styles.shortcuts} aria-label="More from DO">
          <Link href="/do">
            Your DOs <ArrowUpRight size={14} />
          </Link>
          <Link href="/do/office">Office</Link>
          <Link href="/do/connections">Connections</Link>
        </nav>
      </dialog>
    </>
  );
}
