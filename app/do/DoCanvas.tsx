"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  ArrowRight,
  GripVertical,
  FileText,
  PanelsTopLeft,
  Scan,
  ArrowLeft,
  ArrowUpRight,
  X,
} from "lucide-react";
import { DoMark, type DoAppearance } from "./DoAppearance";
import type { DoTask } from "@/apps/do/shared/preparation";
import "./do-canvas.css";
export type CanvasModule = "context" | "skill" | "review";
export const DEFAULT_MODULES: CanvasModule[] = ["context", "skill", "review"];
export function readModules(value: unknown): CanvasModule[] {
  return Array.isArray(value) &&
    value.length === 3 &&
    new Set(value).size === 3 &&
    value.every((v) => DEFAULT_MODULES.includes(v))
    ? value
    : DEFAULT_MODULES;
}
type Props = {
  name: string;
  onName: (v: string) => void;
  appearance: DoAppearance;
  onAppearance: (v: DoAppearance) => void;
  skill: string;
  context: string;
  onContext: (v: string) => void;
  onSave: () => void;
  onTemplate: (task: DoTask, direction: string) => void;
  modules: CanvasModule[];
  onModules: (v: CanvasModule[]) => void;
};
export function DoCanvas(p: Props) {
  const [appearanceOpen, setAppearanceOpen] = useState(true),
    [templatesOpen, setTemplatesOpen] = useState(false),
    [contextOpen, setContextOpen] = useState(true),
    [pos, setPos] = useState({ x: 0, y: 0 }),
    [drag, setDrag] = useState<{
      x: number;
      y: number;
      ox: number;
      oy: number;
    } | null>(null),
    [moving, setMoving] = useState<CanvasModule | null>(null);
  const widgetMoved = useRef(false);
  useEffect(() => {
    const clamp = () =>
      setPos((p) => ({
        x: Math.max(-window.innerWidth + 100, Math.min(0, p.x)),
        y: Math.max(-window.innerHeight + 120, Math.min(0, p.y)),
      }));
    window.addEventListener("resize", clamp);
    return () => window.removeEventListener("resize", clamp);
  }, []);
  const accent = { plum: "#d5a6e8", violet: "#aaa5ff", copper: "#e3ad91" }[
    p.appearance.colour
  ];
  function reorder(from: CanvasModule, to: CanvasModule) {
    const next = p.modules.filter((m) => m !== from);
    next.splice(p.modules.indexOf(to), 0, from);
    p.onModules(next);
  }
  function move(key: CanvasModule, amount: number) {
    const at = p.modules.indexOf(key),
      to = at + amount;
    if (to >= 0 && to < p.modules.length) reorder(key, p.modules[to]);
  }
  const items = {
    context: {
      name: "Context",
      description: p.context
        ? "Your text is ready to review."
        : "Add what DO should use.",
      Icon: FileText,
    },
    skill: {
      name: p.skill,
      description: "Choose a task and prepare a draft.",
      Icon: PanelsTopLeft,
    },
    review: {
      name: "Review",
      description: "Check the result before using it.",
      Icon: Scan,
    },
  };
  return (
    <section
      className="docanvas"
      style={{ "--canvas-accent": accent } as CSSProperties}
      aria-label="DO visual workspace"
    >
      <header className="docanvas-nav">
        <Link href="/do" className="docanvas-brand">
          <DoMark />
          <strong>DO</strong>
          <small>by assembl</small>
        </Link>
        <div>
          <button
            aria-expanded={templatesOpen}
            onClick={() => setTemplatesOpen(!templatesOpen)}
          >
            Templates
          </button>
          <button
            aria-expanded={appearanceOpen}
            onClick={() => setAppearanceOpen(!appearanceOpen)}
          >
            Appearance
          </button>
          <label>
            Name
            <input
              aria-label="Name your DO"
              value={p.name}
              maxLength={80}
              onChange={(e) => p.onName(e.target.value)}
            />
          </label>
          <button className="docanvas-save" onClick={p.onSave}>
            Save DO <ArrowRight size={18} />
          </button>
        </div>
      </header>
      {templatesOpen && (
        <nav className="docanvas-templates" aria-label="DO templates">
          {[
            {
              name: "Work",
              task: "reply",
              direction:
                "Write a clear professional reply. Preserve commitments and ask about missing details.",
            },
            {
              name: "Personal",
              task: "plan",
              direction: "Organise my notes into a practical personal plan.",
            },
            {
              name: "Family",
              task: "extract",
              direction:
                "Find dates and actions in the supplied family or school notes.",
            },
            {
              name: "Pet DO",
              task: "plan",
              direction:
                "Organise the supplied pet-care notes and questions. Do not diagnose or prescribe.",
            },
          ].map((t) => (
            <button
              key={t.name}
              onClick={() => {
                p.onTemplate(t.task as DoTask, t.direction);
                p.onAppearance({
                  ...p.appearance,
                  character: t.name === "Pet DO" ? "franklin" : "symbol",
                });
                setTemplatesOpen(false);
              }}
            >
              {t.name}
              <ArrowUpRight size={15} />
            </button>
          ))}
        </nav>
      )}
      <div className="docanvas-layout">
        <div className="docanvas-main">
          <div className="docanvas-hero">
            <div className="docanvas-copy">
              <span>DO / YOUR WORKSPACE</span>
              <h2 aria-label="assembl your DO">
                assembl
                <br /> your <span className="docanvas-heading-do">DO</span>
              </h2>
              <p>
                Bring the context, choose what it helps with, and review the
                work.
              </p>
            </div>
            <div
              className={`docanvas-object ${p.appearance.glow ? "glowing" : ""}`}
            >
              <Image
                src="/do/canvas/dimensional-d.png"
                alt="Dimensional purple D and glowing dot"
                width={800}
                height={800}
                priority
              />
            </div>
          </div>
          <div
            className="docanvas-modules"
            aria-label="Arrange workspace modules"
          >
            {p.modules.map((key, index) => {
              const item = items[key];
              return (
                <article
                  key={key}
                  draggable
                  onDragStart={(e) => {
                    setMoving(key);
                    e.dataTransfer.setData("application/x-do-module", key);
                  }}
                  onDragEnd={() => setMoving(null)}
                  onDragOver={(e) => {
                    if (moving) e.preventDefault();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (moving) reorder(moving, key);
                    setMoving(null);
                  }}
                >
                  <GripVertical size={16} aria-hidden />
                  <div>
                    <item.Icon size={26} />
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                    <div className="docanvas-module-actions">
                      <button
                        disabled={index === 0}
                        aria-label={`Move ${item.name} earlier`}
                        onClick={() => move(key, -1)}
                      >
                        <ArrowLeft size={14} />
                      </button>
                      <button
                        disabled={index === 2}
                        aria-label={`Move ${item.name} later`}
                        onClick={() => move(key, 1)}
                      >
                        <ArrowRight size={14} />
                      </button>
                      <button
                        onClick={() => {
                          if (key === "context") setContextOpen(true);
                          else
                            document
                              .getElementById(
                                key === "skill"
                                  ? "do-task-palette"
                                  : "do-runtime-board",
                              )
                              ?.scrollIntoView({
                                behavior: "auto",
                                block: "start",
                              });
                        }}
                      >
                        Open
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          <p className="docanvas-caption">
            Drag to arrange your workspace. Task review is always required.
          </p>
          {appearanceOpen && (
            <section className="docanvas-appearance" aria-label="Appearance">
              <div>
                <h3>Appearance</h3>
                <div className="docanvas-swatches">
                  {(["plum", "violet", "copper"] as const).map((c) => (
                    <button
                      key={c}
                      aria-pressed={p.appearance.colour === c}
                      onClick={() =>
                        p.onAppearance({ ...p.appearance, colour: c })
                      }
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <label>
                  <input
                    type="checkbox"
                    checked={p.appearance.glow}
                    onChange={(e) =>
                      p.onAppearance({
                        ...p.appearance,
                        glow: e.target.checked,
                      })
                    }
                  />
                  Glow
                </label>
              </div>
              <div className="docanvas-character">
                <Image
                  src="/do/canvas/pet-do-purple.png"
                  width={120}
                  height={120}
                  alt="Pet DO appearance"
                />
                <label>
                  Appearance
                  <select
                    value={p.appearance.character}
                    onChange={(e) =>
                      p.onAppearance({
                        ...p.appearance,
                        character: e.target.value as DoAppearance["character"],
                      })
                    }
                  >
                    <option value="symbol">D + dot</option>
                    <option value="franklin">Pet DO</option>
                  </select>
                </label>
              </div>
            </section>
          )}
        </div>
        {contextOpen && (
          <aside className="docanvas-context">
            <header>
              <small>Preview · no page access</small>
              <button
                aria-label="Close context panel"
                onClick={() => setContextOpen(false)}
              >
                <X size={18} />
              </button>
            </header>
            <h3>Choose what DO can use</h3>
            <p>Add text for this task. Review it before running.</p>
            <label htmlFor="canvas-context">
              Text or notes
              <textarea
                id="canvas-context"
                value={p.context}
                maxLength={12000}
                onChange={(e) => p.onContext(e.target.value)}
                rows={7}
                placeholder="Paste the relevant text here…"
              />
            </label>
            <button
              onClick={() => document.getElementById("canvas-context")?.focus()}
            >
              <FileText size={18} />
              Add selected text by pasting
            </button>
            <button disabled>
              <PanelsTopLeft size={18} />
              Current page · extension required
            </button>
            <button
              onClick={() => {
                const vision = document.getElementById(
                  "do-vision-context",
                ) as HTMLDetailsElement | null;
                if (vision) {
                  vision.open = true;
                  vision.scrollIntoView({ behavior: "auto", block: "start" });
                }
              }}
            >
              <Scan size={18} />
              Show DO a screen or image
            </button>
            <hr />
            <h4>What happens here?</h4>
            <p>
              Moving DO does not capture anything. Your text is sent for
              processing only when you confirm and run the task below.
            </p>
            <button
              className="docanvas-continue"
              onClick={() =>
                document
                  .getElementById("do-runtime-board")
                  ?.scrollIntoView({ behavior: "auto" })
              }
            >
              Review task <ArrowRight size={18} />
            </button>
          </aside>
        )}
      </div>
      <button
        className={`docanvas-widget ${p.appearance.glow ? "glowing" : ""}`}
        aria-label="Move DO widget; click to open context"
        style={{ transform: `translate(${pos.x}px,${pos.y}px)` }}
        onClick={() => {
          if (!widgetMoved.current) setContextOpen(true);
          widgetMoved.current = false;
        }}
        onPointerDown={(e) => {
          widgetMoved.current = false;
          e.currentTarget.setPointerCapture(e.pointerId);
          setDrag({ x: e.clientX, y: e.clientY, ox: pos.x, oy: pos.y });
        }}
        onPointerMove={(e) => {
          if (drag && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 5)
            widgetMoved.current = true;
          if (drag)
            setPos({
              x: Math.max(
                -window.innerWidth + 100,
                Math.min(0, drag.ox + e.clientX - drag.x),
              ),
              y: Math.max(
                -window.innerHeight + 120,
                Math.min(0, drag.oy + e.clientY - drag.y),
              ),
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
            setPos((v) =>
              e.key === "Home"
                ? { x: 0, y: 0 }
                : {
                    x: Math.max(
                      -window.innerWidth + 100,
                      Math.min(
                        0,
                        v.x +
                          (e.key === "ArrowLeft"
                            ? -20
                            : e.key === "ArrowRight"
                              ? 20
                              : 0),
                      ),
                    ),
                    y: Math.max(
                      -window.innerHeight + 120,
                      Math.min(
                        0,
                        v.y +
                          (e.key === "ArrowUp"
                            ? -20
                            : e.key === "ArrowDown"
                              ? 20
                              : 0),
                      ),
                    ),
                  },
            );
          }
        }}
      >
        {p.appearance.character === "franklin" ? (
          <Image
            src="/do/canvas/pet-do-purple.png"
            width={70}
            height={70}
            alt="Pet DO"
          />
        ) : (
          <DoMark />
        )}
        <span>Context</span>
      </button>
    </section>
  );
}
