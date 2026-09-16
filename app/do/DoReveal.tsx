"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowDown, ArrowUpRight, Pause, Play, RotateCcw } from "lucide-react";
import { DoMark } from "./DoAppearance";
import "./do-reveal.css";
const notes =
  "School notice: bring swimming gear on Tuesday. Power bill: payment due Friday. Dentist reminder: Thursday at 3 pm. Please confirm who can do the school pickup.";
export function DoReveal({
  onBuild,
}: {
  onBuild: (id: string, context: string) => void;
}) {
  const root = useRef<HTMLElement>(null),
    drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(
      null,
    );
  const [progress, setProgress] = useState(0),
    [paused, setPaused] = useState(false),
    [reduced, setReduced] = useState(false),
    [skill, setSkill] = useState("school"),
    [position, setPosition] = useState({ x: 0, y: 0 }),
    [shared, setShared] = useState(false),
    [result, setResult] = useState(false),
    [draft, setDraft] = useState(
      "Tuesday — Pack swimming gear.\nThursday, 3 pm — Dentist appointment.\nFriday — Check and pay the power bill.\nTo confirm — Who can do school pickup?",
    );
  useEffect(() => {
    const media = matchMedia(
      "(prefers-reduced-motion: reduce), (max-width: 760px)",
    );
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (paused || reduced) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (root.current) {
          const r = root.current.getBoundingClientRect();
          setProgress(
            Math.max(0, Math.min(1, -r.top / (r.height - innerHeight))),
          );
        }
      });
    };
    update();
    addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", update);
      removeEventListener("resize", update);
    };
  }, [paused, reduced]);
  const open = reduced ? 1 : Math.max(0, Math.min(1, (progress - 0.08) / 0.47));
  function replay() {
    setShared(false);
    setResult(false);
    setProgress(0);
    setPaused(false);
    root.current?.scrollIntoView({ behavior: "auto" });
  }
  return (
    <section
      ref={root}
      className={`dor ${reduced ? "dor-static" : ""}`}
      style={{ "--reveal": open, "--travel": progress } as CSSProperties}
      aria-label="How to assemble your DO"
    >
      <div className="dor-stage">
        <div className="dor-intro" inert={!reduced && open > 0.5}>
          <span className="dor-eyebrow">YOUR PERSONAL ASSISTANT</span>
          <h1 aria-label="assembl your DO">
            assembl
            <br />
            your DO
          </h1>
          <p>
            Choose its work. Add your context.
            <br />
            Review what it prepares.
          </p>
          <a
            href="#dor-build"
            onClick={(e) => {
              if (!reduced && root.current) {
                e.preventDefault();
                setPaused(false);
                const r = root.current.getBoundingClientRect();
                window.scrollTo({
                  top:
                    window.scrollY +
                    r.top +
                    (r.height - window.innerHeight) * 0.8,
                  behavior: "auto",
                });
              }
            }}
          >
            Make your DO <ArrowDown size={17} />
          </a>
        </div>
        <div className="dor-object" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`dor-slice dor-slice-${i}`}>
              <span className="dor-mark">
                <DoMark />
              </span>
            </div>
          ))}
        </div>
        <div className="dor-work" id="dor-build" inert={!reduced && open < 0.5}>
          <header>
            <span>ASSEMBLE YOUR DO</span>
            <span>Interactive example · no task used</span>
          </header>
          <div className="dor-parts">
            <fieldset>
              <legend>1. Choose its work</legend>
              {[
                ["school", "Life admin"],
                ["meeting", "Meeting notes"],
                ["creative", "Images"],
              ].map(([id, title]) => (
                <button
                  key={id}
                  aria-pressed={skill === id}
                  onClick={() => setSkill(id)}
                >
                  {title}
                </button>
              ))}
            </fieldset>
            <div className="dor-workarea">
              <div className="dor-paper">
                <small>YOUR WEEK · EXAMPLE</small>
                <p>{notes}</p>
                <button
                  onClick={() => {
                    setShared(true);
                    setResult(false);
                  }}
                >
                  Select this text for DO
                </button>
              </div>
              <button
                className="dor-drag"
                aria-label="Drag DO beside the notes, or use arrow keys"
                style={{
                  transform: `translate(${position.x}px,${position.y}px)`,
                }}
                onPointerDown={(e) => {
                  e.currentTarget.setPointerCapture(e.pointerId);
                  drag.current = {
                    x: e.clientX,
                    y: e.clientY,
                    ox: position.x,
                    oy: position.y,
                  };
                }}
                onPointerMove={(e) => {
                  if (drag.current)
                    setPosition({
                      x: Math.max(
                        -100,
                        Math.min(
                          100,
                          drag.current.ox + e.clientX - drag.current.x,
                        ),
                      ),
                      y: Math.max(
                        -80,
                        Math.min(
                          80,
                          drag.current.oy + e.clientY - drag.current.y,
                        ),
                      ),
                    });
                }}
                onPointerUp={() => (drag.current = null)}
                onPointerCancel={() => (drag.current = null)}
                onKeyDown={(e) => {
                  if (e.key.startsWith("Arrow")) {
                    e.preventDefault();
                    setPosition((p) => ({
                      x: Math.max(
                        -100,
                        Math.min(
                          100,
                          p.x +
                            (e.key === "ArrowLeft"
                              ? -10
                              : e.key === "ArrowRight"
                                ? 10
                                : 0),
                        ),
                      ),
                      y: Math.max(
                        -80,
                        Math.min(
                          80,
                          p.y +
                            (e.key === "ArrowUp"
                              ? -10
                              : e.key === "ArrowDown"
                                ? 10
                                : 0),
                        ),
                      ),
                    }));
                  }
                }}
              >
                <DoMark />
              </button>
              <small className="dor-drag-note">
                Drag DO beside the work. Moving it shares nothing.
              </small>
            </div>
            <div className="dor-context">
              <h2>2. Review the context</h2>
              {shared ? (
                <>
                  <p>{notes}</p>
                  <button onClick={() => setResult(true)}>
                    Show example result
                  </button>
                  <button
                    className="dor-text-button"
                    onClick={() => {
                      setShared(false);
                      setResult(false);
                    }}
                  >
                    Remove text
                  </button>
                </>
              ) : (
                <p>
                  Select the example text to see exactly what DO would receive.
                </p>
              )}
              <small>
                This example selects only the text shown here. Open your DO and
                choose Show DO to share a real screenshot or image.
              </small>
            </div>
            <div className="dor-result">
              <h2>3. Edit the result</h2>
              {result ? (
                <>
                  <label htmlFor="dor-draft">
                    Worked example: weekly checklist
                  </label>
                  <textarea
                    id="dor-draft"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                  />
                </>
              ) : (
                <p>Your draft appears here after you review the context.</p>
              )}
              <button
                className="dor-build"
                onClick={() =>
                  onBuild(skill, skill === "school" && shared ? notes : "")
                }
              >
                Open{" "}
                {skill === "creative"
                  ? "Creative"
                  : skill === "school"
                    ? "School admin"
                    : "Meeting"}{" "}
                DO <ArrowUpRight size={16} />
              </button>
            </div>
          </div>
        </div>
        <footer className="dor-controls">
          <span>
            {open < 0.5
              ? "Scroll to open your DO"
              : "Choose → share context → review"}
          </span>
          <div>
            <button
              aria-label={
                paused ? "Resume scroll motion" : "Pause scroll motion"
              }
              aria-pressed={paused}
              onClick={() => setPaused(!paused)}
            >
              {paused ? <Play size={16} /> : <Pause size={16} />}
            </button>
            <button aria-label="Replay the demonstration" onClick={replay}>
              <RotateCcw size={16} />
            </button>
          </div>
        </footer>
      </div>
    </section>
  );
}
