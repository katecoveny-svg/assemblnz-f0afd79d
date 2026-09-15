"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { Component, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUpRight, Move, RotateCcw } from "lucide-react";
import styles from "./spatial.module.css";

export type OfficeCounts = { needsYou: number; working: number; done: number };
export type OfficeView = "overview" | "review" | "builder" | "proof";
const OfficeScene = dynamic(() => import("./OfficeScene"), {
  ssr: false,
  loading: () => <p className={styles.loading}>Opening the studio…</p>,
});
class SceneBoundary extends Component<
  { children: ReactNode; onReset: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className={styles.loading}>
        <p>
          This browser could not open the 3D view. The studio image and task
          board are available.
        </p>
        <button onClick={this.props.onReset}>Return to studio image</button>
      </div>
    ) : (
      this.props.children
    );
  }
}
const VIEWS: { id: OfficeView; name: string }[] = [
  { id: "overview", name: "Whole studio" },
  { id: "review", name: "Review room" },
  { id: "builder", name: "Builder lab" },
  { id: "proof", name: "Proof library" },
];
export function DoOfficeSpatial(counts: OfficeCounts) {
  const [exploring, setExploring] = useState(false);
  const [view, setView] = useState<OfficeView>("overview");
  const [reset, setReset] = useState(0);
  return (
    <section className={styles.wrap} aria-labelledby="do-office-spatial-title">
      <div className={styles.copy}>
        <div>
          <span>DO OFFICE / HARBOUR STUDIO</span>
          <h2 id="do-office-spatial-title">
            Make room
            <br />
            for good work.
          </h2>
        </div>
        <p>
          A place to review, build and bring the proof together. Explore the
          studio, then open the work that needs you.
        </p>
      </div>
      <div className={styles.scene} aria-label="DO harbour studio">
        <Image
          className={styles.poster}
          src="/do/office/office-poster.webp"
          alt="An imagined harbour studio with walnut desks, rose lounge seating and a glowing D sculpture"
          width={1500}
          height={1000}
          priority
        />
        {exploring ? (
          <SceneBoundary key={reset} onReset={() => setExploring(false)}>
            <OfficeScene {...counts} view={view} />
          </SceneBoundary>
        ) : (
          <div className={styles.enter}>
            <button onClick={() => setExploring(true)}>
              <Move size={18} />
              Explore in 3D <ArrowUpRight size={17} />
            </button>
            <span>Drag to look around. Scroll to move closer.</span>
          </div>
        )}
        <div className={styles.sceneCaption}>
          <span>01 / AN IMAGINED HARBOUR STUDIO</span>
          {exploring && (
            <button
              onClick={() => {
                setView("overview");
                setReset((value) => value + 1);
              }}
              aria-label="Reset studio view"
            >
              <RotateCcw size={15} />
              Reset view
            </button>
          )}
        </div>
      </div>
      {exploring && (
        <nav className={styles.views} aria-label="Studio viewpoints">
          {VIEWS.map((item) => (
            <button
              key={item.id}
              aria-pressed={view === item.id}
              onClick={() => setView(item.id)}
            >
              {item.name}
            </button>
          ))}
          <button onClick={() => setExploring(false)}>Still view</button>
        </nav>
      )}
      <nav className={styles.legend} aria-label="Open the Office task board">
        <a href="#board-needs_you">
          <span className={styles.dot} />
          Needs you <strong>{counts.needsYou}</strong>
          <ArrowDown size={15} />
        </a>
        <a href="#board-working">
          <span className={styles.dot} />
          Working <strong>{counts.working}</strong>
          <ArrowDown size={15} />
        </a>
        <a href="#board-done">
          <span className={styles.dot} />
          Done <strong>{counts.done}</strong>
          <ArrowDown size={15} />
        </a>
      </nav>
      <p className={styles.fallback}>
        The room and board use the same Office state. This preview is not a
        connected team workspace.{" "}
        <a href="/do/office/do-harbour-studio.blend" download>
          Download the editable Blender scene
        </a>
        .
      </p>
    </section>
  );
}
