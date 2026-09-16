"use client";
import { useState, type CSSProperties } from "react";
export type DoAppearance = {
  colour: "plum" | "violet" | "copper";
  character: "symbol" | "franklin";
  glow: boolean;
};
export const DEFAULT_APPEARANCE: DoAppearance = {
  colour: "plum",
  character: "symbol",
  glow: true,
};
export function readAppearance(value: unknown): DoAppearance {
  if (!value || typeof value !== "object") return DEFAULT_APPEARANCE;
  const v = value as Record<string, unknown>;
  return {
    colour: v.colour === "violet" || v.colour === "copper" ? v.colour : "plum",
    character: v.character === "franklin" ? "franklin" : "symbol",
    glow: v.glow !== false,
  };
}
export { DoMark } from "@/components/do/DoMark";
import { DoMark } from "@/components/do/DoMark";
export function DoAppearancePanel({
  name,
  skill,
  value,
  onChange,
  onName,
}: {
  name: string;
  skill: string;
  value: DoAppearance;
  onChange: (v: DoAppearance) => void;
  onName: (n: string) => void;
}) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [drag, setDrag] = useState<{
    x: number;
    y: number;
    ox: number;
    oy: number;
  } | null>(null);
  const colours = { plum: "#d5a6e8", violet: "#a3a0ff", copper: "#e7ac91" };
  return (
    <section
      className="do-customise"
      style={{ "--do-accent": colours[value.colour] } as CSSProperties}
      aria-label="Customise your DO"
    >
      <div className="do-customise-controls">
        <span className="dob-kicker">MAKE DO YOURS · LOCAL DESIGN PREVIEW</span>
        <h2>assembl your DO</h2>
        <p>
          Choose its appearance, then choose what it helps with. Save a setup
          for work, personal tasks or family admin.
        </p>
        <label htmlFor="do-profile-name">Name your DO</label>
        <input
          id="do-profile-name"
          value={name}
          maxLength={80}
          onChange={(e) => onName(e.target.value)}
        />
        <fieldset>
          <legend>Appearance</legend>
          <button
            type="button"
            aria-pressed={value.character === "symbol"}
            onClick={() => onChange({ ...value, character: "symbol" })}
          >
            <DoMark />D + dot
          </button>
          <button
            type="button"
            aria-pressed={value.character === "franklin"}
            onClick={() => onChange({ ...value, character: "franklin" })}
          >
            <DoMark character="franklin" />
            Dachshund
          </button>
        </fieldset>
        <fieldset>
          <legend>Colour</legend>
          {(["plum", "violet", "copper"] as const).map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={value.colour === c}
              onClick={() => onChange({ ...value, colour: c })}
            >
              <span
                style={{ background: colours[c] }}
                className="do-colour-chip"
              />
              {c}
            </button>
          ))}
        </fieldset>
        <label className="do-glow-control">
          <input
            type="checkbox"
            checked={value.glow}
            onChange={(e) => onChange({ ...value, glow: e.target.checked })}
          />
          Soft glow
        </label>
        <small>
          Use Save agent recipe below to keep the name, appearance and task
          directions on this device.
        </small>
      </div>
      <div className="do-device-stage">
        <span className="dob-kicker">COMPACT APP PREVIEW</span>
        <div className="do-phone">
          <div className="do-phone-top">
            DO <span>Preview · no access</span>
          </div>
          <button
            type="button"
            className={`do-profile-orb ${value.glow ? "has-glow" : ""}`}
            aria-label="Move assistant preview with arrow keys or drag"
            style={{ transform: `translate(${position.x}px,${position.y}px)` }}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              setDrag({
                x: e.clientX,
                y: e.clientY,
                ox: position.x,
                oy: position.y,
              });
            }}
            onPointerMove={(e) => {
              if (drag)
                setPosition({
                  x: Math.max(-65, Math.min(65, drag.ox + e.clientX - drag.x)),
                  y: Math.max(-25, Math.min(60, drag.oy + e.clientY - drag.y)),
                });
            }}
            onPointerUp={() => setDrag(null)}
            onPointerCancel={() => setDrag(null)}
            onKeyDown={(e) => {
              if (
                [
                  "ArrowLeft",
                  "ArrowRight",
                  "ArrowUp",
                  "ArrowDown",
                  "Home",
                ].includes(e.key)
              ) {
                e.preventDefault();
                setPosition((p) =>
                  e.key === "Home"
                    ? { x: 0, y: 0 }
                    : {
                        x: Math.max(
                          -65,
                          Math.min(
                            65,
                            p.x +
                              (e.key === "ArrowLeft"
                                ? -10
                                : e.key === "ArrowRight"
                                  ? 10
                                  : 0),
                          ),
                        ),
                        y: Math.max(
                          -25,
                          Math.min(
                            60,
                            p.y +
                              (e.key === "ArrowUp"
                                ? -10
                                : e.key === "ArrowDown"
                                  ? 10
                                  : 0),
                          ),
                        ),
                      },
                );
              }
            }}
          >
            <DoMark character={value.character} />
            {value.character === "franklin" && (
              <span className="do-character-badge">
                <DoMark />
              </span>
            )}
          </button>
          <h3>{name.trim() || "Your DO"}</h3>
          <p>Ready when you are.</p>
          <div className="do-phone-task">
            <small>YOUR CHOSEN SKILL</small>
            <strong>{skill}</strong>
            <span>Add context below, then review before running.</span>
          </div>
          <div className="do-phone-context">
            Context preview · nothing added
          </div>
          <footer>
            Dragging moves the preview.
            <br />
            It does not capture anything.
          </footer>
        </div>
      </div>
    </section>
  );
}
