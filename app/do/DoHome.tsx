"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  Cable,
  Download,
  Grip,
  Mic,
  X,
} from "lucide-react";
import { DoReveal } from "./DoReveal";
import { DO_TEMPLATES } from "./do-templates";
import { DoMark } from "@/components/do/DoMark";
import { DoPortableStarters } from "@/components/do/DoPortableStarters";
import { DoDownloadsStrip } from "@/components/do/DoDownloadsStrip";
import { DO_TASKS } from "@/apps/do/shared/preparation";
import { readHomeBrief } from "@/apps/do/shared/home-handoff";
import type { DoSkill } from "./DoBuilder";
import styles from "./do-home.module.css";

const DoWorkspace = dynamic(() =>
  import("./DoWorkspace").then((module) => module.DoWorkspace),
);
type Specialist = {
  id: string;
  name: string;
  scope: "personal" | "work";
  glyph: string;
  description: string;
  note: string;
  task?: DoSkill;
  href?: string;
};
const SPECIALISTS: Specialist[] = [
  {
    id: "writing",
    name: "Writing DO",
    scope: "work",
    glyph: "✦",
    description: "Make the words sound like you.",
    note: "Polish a draft, keep its meaning and review the result.",
    task: "rewrite",
  },
  {
    id: "personal",
    name: "Personal DO",
    scope: "personal",
    glyph: "◎",
    description: "A little less life admin.",
    note: "Turn the notes you choose into a plan you can edit.",
    task: "plan",
  },
  {
    id: "household",
    name: "Household Floor",
    scope: "personal",
    glyph: "⌂",
    description: "Family seats, evening board, drafts only.",
    note: "Public scrubbed template — install, customise, run the board. Browser seat for school pages.",
    href: "/do/household",
  },
  {
    id: "inbox",
    name: "Inbox DO",
    scope: "personal",
    glyph: "↩",
    description: "Bring the important details forward.",
    note: "School-admin Gmail pilot. Account connection and message selection required.",
    href: "/do/family",
  },
  {
    id: "creative",
    name: "Creative DO",
    scope: "work",
    glyph: "◈",
    description: "Give an idea a visible shape.",
    note: "Prepare an image from your brief when the image provider is configured.",
    task: "image",
  },
  {
    id: "details",
    name: "Detail DO",
    scope: "work",
    glyph: "⌕",
    description: "Find the dates, figures and links.",
    note: "Extract exact details from the text you approve.",
    task: "extract",
  },
  {
    id: "bills",
    name: "Bills DO",
    scope: "personal",
    glyph: "⇄",
    description: "Get a clearer view of a bill.",
    note: "Read your bill, check the figures and review a comparison.",
    href: "/do/bills",
  },
  {
    id: "builder",
    name: "Builder DO",
    scope: "work",
    glyph: "⌘",
    description: "Turn a software idea into a build job.",
    note: "Prepare a build contract for your chosen coding worker. Review before execution.",
    href: "/do/builder",
  },
];

export function DoHome() {
  const params = useSearchParams();
  const router = useRouter();
  const workspace = useRef<HTMLDialogElement>(null);
  const downloads = useRef<HTMLDialogElement>(null);
  const [opened, setOpened] = useState(false);
  const [brief, setBrief] = useState("");
  const [task, setTask] = useState<DoSkill>("reply");
  const [template, setTemplate] = useState<string | undefined>();
  const [name, setName] = useState("My DO");
  const [handoffError, setHandoffError] = useState("");
  const [filter, setFilter] = useState<"all" | "personal" | "work">("all");
  const [selected, setSelected] = useState(SPECIALISTS[0]);
  const [dropNotice, setDropNotice] = useState("");

  function openWorkspace() {
    setOpened(true);
    workspace.current?.showModal();
  }
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const chosen = params.get("task");
      const valid =
        chosen === "image" || DO_TASKS.some((item) => item.id === chosen);
      if (params.get("from") !== "home" && params.get("open") !== "1" && !valid)
        return;
      setHandoffError("");
      setBrief("");
      setTask(valid ? (chosen as DoSkill) : "reply");
      if (params.get("from") === "home") {
        try {
          const incoming = readHomeBrief(
            sessionStorage,
            params.get("handoff") || "",
          );
          if (incoming) {
            setBrief(incoming);
            setTask("brief");
          } else
            setHandoffError(
              "This homepage draft has expired or is unavailable in this tab. Add your text to continue.",
            );
        } catch {
          setHandoffError(
            "This browser could not open the homepage draft. Add your text to continue.",
          );
        }
      }
      setOpened(true);
      workspace.current?.showModal();
    });
    return () => cancelAnimationFrame(frame);
  }, [params]);

  function openSelected() {
    if (selected.href) {
      router.push(selected.href);
      return;
    }
    setTemplate(undefined);
    setTask(selected.task ?? "reply");
    setName(selected.name);
    setBrief("");
    setHandoffError("");
    openWorkspace();
  }

  return (
    <div className={styles.page}>
      <a className={styles.skip} href="#your-dos">
        Skip to your DOs
      </a>
      <header className={styles.header}>
        <Link href="/" className={styles.brand}>
          assembl
        </Link>
        <span className={styles.product}>/ DO</span>
        <nav aria-label="DO">
          <Link href="/do/office">Office</Link>
          <Link href="/do/builder">Builder DO</Link>
          <Link href="/do/linda">Linda</Link>
          <Link href="/do/meetings">Meetings</Link>
          <Link href="/do/connections">Connections</Link>
        </nav>
      </header>
      <div>
        <DoReveal
          onBuild={(id, context) => {
            const chosen = DO_TEMPLATES.find((item) => item.id === id);
            setTemplate(id);
            setTask(chosen?.task || "reply");
            setName(chosen?.title || "My DO");
            setBrief(context);
            setHandoffError("");
            openWorkspace();
          }}
        />

        <section
          className={styles.startersBand}
          aria-label="What do you want to DO?"
        >
          <DoPortableStarters
            onStarter={(starter) => {
              if (starter.id === "meeting") {
                window.location.assign("/do/meetings");
                return;
              }
              if (starter.brief) {
                setBrief(starter.brief);
                setTask(starter.id === "reply" ? "reply" : "brief");
                setName(starter.label);
                setTemplate("");
                openWorkspace();
              }
            }}
            interceptMeeting
            showDownloads
          />
        </section>

        <section
          className={styles.team}
          id="your-dos"
          aria-labelledby="team-title"
        >
          <div className={styles.sectionHead}>
            <div>
              <p className={styles.eyebrow}>
                SMALL SPECIALISTS. YOUR KIND OF HELP.
              </p>
              <h2 id="team-title" aria-label="Meet your To DO’s.">Meet your To <span className={styles.teamWordmark}><span className={styles.teamLogo}><DoMark /></span><span>DO’s.</span></span></h2>
            </div>
            <div>
              <p>
                Drag a DO onto the glowing workspace, or tap to choose. Open it
                when you’re ready.
              </p>
              <div
                className={styles.filters}
                role="group"
                aria-label="Show DO specialists"
              >
                {(["all", "personal", "work"] as const).map((value) => (
                  <button
                    type="button"
                    key={value}
                    aria-pressed={filter === value}
                    onClick={() => setFilter(value)}
                  >
                    {value === "all"
                      ? "All DOs"
                      : value === "personal"
                        ? "Personal"
                        : "Work"}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className={styles.assembly}>
            <div className={styles.cards}>
              {SPECIALISTS.filter(
                (item) => filter === "all" || item.scope === filter,
              ).map((item) => (
                <button
                  className={styles.card}
                  data-identity={item.id}
                  key={item.id}
                  type="button"
                  draggable
                  aria-pressed={selected.id === item.id}
                  onClick={() => {
                    setSelected(item);
                    setDropNotice(
                      `${item.name} selected. Open it when you’re ready.`,
                    );
                  }}
                  onDragStart={(event) => {
                    event.dataTransfer.setData(
                      "application/x-do-specialist",
                      item.id,
                    );
                    event.dataTransfer.effectAllowed = "copy";
                  }}
                >
                  <span className={styles.cardTop}>
                    <span>{item.scope}</span>
                    <Grip size={15} aria-hidden="true" />
                  </span>
                  <span className={styles.identity} aria-hidden="true">
                    {item.glyph}
                  </span>
                  <strong>{item.name}</strong>
                  <span className={styles.description}>{item.description}</span>
                  <ArrowUpRight className={styles.cardArrow} size={17} />
                </button>
              ))}
            </div>
            <aside
              className={styles.dropzone}
              aria-label="Your selected DO workspace"
              onDragOver={(event) => {
                if (
                  event.dataTransfer.types.includes(
                    "application/x-do-specialist",
                  )
                ) {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = "copy";
                }
              }}
              onDrop={(event) => {
                event.preventDefault();
                const item = SPECIALISTS.find(
                  (candidate) =>
                    candidate.id ===
                    event.dataTransfer.getData("application/x-do-specialist"),
                );
                if (item) {
                  setSelected(item);
                  setDropNotice(
                    `${item.name} added. Open it when you’re ready.`,
                  );
                }
              }}
            >
              <span className={styles.eyebrow}>YOUR SELECTED DO</span>
              <span className={styles.mark}>
                <DoMark />
              </span>
              <h3>{selected.name}</h3>
              <p>{selected.note}</p>
              <button
                type="button"
                className={styles.primary}
                onClick={openSelected}
              >
                Open {selected.name} <ArrowUpRight size={17} />
              </button>
              <small>Choosing or moving a DO does not run a task.</small>
              <p className={styles.dropNotice} role="status">
                {dropNotice || "Drop a DO here. Make room for the work."}
              </p>
            </aside>
          </div>
        </section>

        <section className={styles.office} aria-labelledby="office-title">
          <div>
            <p className={styles.eyebrow}>DO OFFICE / SPATIAL PREVIEW</p>
            <h2 id="office-title">
              A place for
              <br />
              your DOs.
            </h2>
            <p>
              See what needs your attention, what is underway and what has a
              receipt. The Office and its 3D rooms show the same demo runtime
              state.
            </p>
            <Link className={styles.primary} href="/do/office">
              Step into the Office <ArrowUpRight size={17} />
            </Link>
            <Link className={styles.textButton} href="/do/linda">
              Open Linda task boards <ArrowUpRight size={17} />
            </Link>
          </div>
          <div className={styles.officeStates}>
            {[
              {
                id: "needs_you",
                name: "Needs you",
                glyph: "◎",
                detail: "A question. A review. Your yes.",
              },
              {
                id: "working",
                name: "Working",
                glyph: "✦",
                detail: "Preparation within the agreed scope.",
              },
              {
                id: "done",
                name: "Done",
                glyph: "✓",
                detail: "The result, with its receipt.",
              },
            ].map((item) => (
              <Link href={`/do/office#board-${item.id}`} key={item.id}>
                <span aria-hidden="true">{item.glyph}</span>
                <strong>{item.name}</strong>
                <p>{item.detail}</p>
                <ArrowUpRight size={17} />
              </Link>
            ))}
          </div>
        </section>

        <section
          className={styles.portable}
          id="take-do-with-you"
          aria-labelledby="portable-title"
        >
          <div className={styles.sectionHead}>
            <div>
              <p className={styles.eyebrow}>KEEP DO CLOSE</p>
              <h2 id="portable-title">Where you work.</h2>
            </div>
            <p>
              One DO, different ways in. Connections and permissions stay
              visible.
            </p>
          </div>
          <div className={styles.portableGrid}>
            <article>
              <span>01 / BROWSER</span>
              <h3>Beside your page.</h3>
              <p>
                Keep DO in the browser side panel. Bring selected text when you
                choose.
              </p>
              <button
                type="button"
                onClick={() => downloads.current?.showModal()}
              >
                Get the extension <Download size={16} />
              </button>
            </article>
            <article>
              <span>02 / MAC</span>
              <h3>Back when you are.</h3>
              <p>
                The Mac development app remembers its position and visibility.
                Start at login is your choice in the DO menu.
              </p>
              <a href="https://github.com/katecoveny-svg/assemblnz-f0afd79d/tree/main/apps/do/macos">
                Mac companion setup <ArrowUpRight size={16} />
              </a>
              <small>
                Development build · public signed installer not available.
              </small>
            </article>
            <article>
              <span>03 / VOICE</span>
              <h3>Talk it through.</h3>
              <p>
                Open the voice controls in your workspace. Live voice requires
                the configured service and microphone permission.
              </p>
              <button type="button" onClick={openWorkspace}>
                Open voice controls <Mic size={16} />
              </button>
            </article>
            <article>
              <span>04 / CONNECTIONS</span>
              <h3>The tools it needs.</h3>
              <p>
                Find email, work and creative connections. Check availability
                and connect the account you choose.
              </p>
              <Link href="/do/connections">
                Manage connections <Cable size={16} />
              </Link>
            </article>
          </div>
          <div className={styles.portableDownloads}>
            <DoDownloadsStrip />
          </div>
        </section>
      </div>
      <footer className={styles.footer}>
        <Link className={styles.brand} href="/">
          assembl
        </Link>
        <p>DO prepares. You decide.</p>
        <nav aria-label="assembl products">
          <Link href="/pursuit">Pursuit</Link>
          <Link href="/creative-studio">Studio</Link>
          <Link href="/do/builder">Builder DO</Link>
        </nav>
      </footer>

      <dialog
        ref={workspace}
        aria-label="DO preparation workspace"
        className="do-workspace-dialog"
        onClose={() => setOpened(false)}
      >
        <button
          type="button"
          className="do-dialog-close"
          aria-label="Close DO workspace"
          onClick={() => workspace.current?.close()}
        >
          <X size={21} />
        </button>
        {handoffError ? (
          <p className="do-error" role="alert">
            {handoffError}
          </p>
        ) : null}
        {opened ? (
          <DoWorkspace
            key={`${task}-${brief}-${name}`}
            initialBrief={brief}
            initialTask={task}
            initialName={name}
            initialTemplate={template}
          />
        ) : null}
      </dialog>
      <dialog
        ref={downloads}
        aria-label="Take DO with you"
        className="do-download-dialog"
      >
        <button
          type="button"
          className="do-dialog-close"
          aria-label="Close downloads"
          onClick={() => downloads.current?.close()}
        >
          <X size={21} />
        </button>
        <span className="do-small-label">KEEP DO CLOSE</span>
        <h2>
          Your DO.
          <br />
          Alongside you.
        </h2>
        <DoDownloadsStrip />
        <div className="do-download-card">
          <div>
            <h3>Browser side panel</h3>
            <p>
              Download and unzip the extension. In Chrome or Edge, open
              Extensions, enable Developer mode, choose “Load unpacked” and
              select the folder. Pin DO to open its side panel.
            </p>
            <a href="/api/do/download?format=extension" download>
              <Download size={16} />
              Download extension ZIP
            </a>
            <small>Direct installation · not a browser store listing.</small>
          </div>
        </div>
        <div className="do-download-card">
          <div>
            <h3>Mac companion</h3>
            <p>
              Local development build with floating orb, selection capture and
              review-first paste. Public signed installer is not available yet.
            </p>
            <a
              href="https://github.com/katecoveny-svg/assemblnz-f0afd79d/tree/main/apps/do/macos"
              target="_blank"
              rel="noreferrer"
            >
              <ArrowUpRight size={16} />
              Mac setup on GitHub
            </a>
          </div>
        </div>
        <div className="do-download-card">
          <div>
            <h3>Website companion</h3>
            <p>
              Add the floating launcher to a website. The kit includes setup
              instructions.
            </p>
            <a href="/api/do/download?format=embed" download>
              <Download size={16} />
              Download widget kit
            </a>
          </div>
        </div>
        <p>
          Move the website companion with drag or Alt + arrow keys. Its position
          is remembered in this browser. Press Escape while it is focused to
          reset.
        </p>
      </dialog>
    </div>
  );
}
