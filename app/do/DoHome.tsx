"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpRight, Download, Mic } from "lucide-react";
import { DoMark } from "@/components/do/DoMark";
import { DoDownloadCtas } from "@/components/do/DoDownloadCtas";
import { readHomeBrief } from "@/apps/do/shared/home-handoff";
import { PUBLIC_DO_SPECIALISTS } from "@/lib/do/public-do-specialists";
import styles from "./do-home.module.css";

/**
 * Public DO home — Kate lock 2026-09-17.
 * Only Meeting DO + generic Household DO on the public shelf.
 */
export function DoHome() {
  const params = useSearchParams();
  const router = useRouter();
  const [selected, setSelected] = useState(PUBLIC_DO_SPECIALISTS[0]);
  const [handoffNotice, setHandoffNotice] = useState("");

  useEffect(() => {
    if (params.get("from") !== "home") return;
    const frame = requestAnimationFrame(() => {
      try {
        const incoming = readHomeBrief(
          sessionStorage,
          params.get("handoff") || "",
        );
        if (incoming) {
          setHandoffNotice(
            "Homepage draft received. Public DO offers Meeting notes or Household chores — open one below. Nothing was sent.",
          );
        } else {
          setHandoffNotice(
            "This homepage draft has expired or is unavailable in this tab. Open Meeting DO or Household DO below.",
          );
        }
      } catch {
        setHandoffNotice(
          "This browser could not open the homepage draft. Open Meeting DO or Household DO below.",
        );
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [params]);

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
          <Link href="/do/meetings">Meeting DO</Link>
          <Link href="/do/household">Household DO</Link>
        </nav>
      </header>
      <DoDownloadCtas variant="banner" />

      <section className={styles.team} id="your-dos" aria-labelledby="team-title">
        <div className={styles.sectionHead}>
          <div>
            <p className={styles.eyebrow}>PUBLIC DO · TWO TOOLS</p>
            <h2 id="team-title" aria-label="Meet your To DO’s.">
              Meet your To{" "}
              <span className={styles.teamWordmark}>
                <span className={styles.teamLogo}>
                  <DoMark />
                </span>
                <span>DO’s.</span>
              </span>
            </h2>
          </div>
          <div>
            <p>
              Record a meeting into useful notes, or run a generic household
              chores board. Nothing else is offered on the public face.
            </p>
          </div>
        </div>

        {handoffNotice ? (
          <p className={styles.dropNotice} role="status">
            {handoffNotice}
          </p>
        ) : null}

        <div className={styles.assembly}>
          <div className={styles.cards}>
            {PUBLIC_DO_SPECIALISTS.map((item) => (
              <button
                className={styles.card}
                data-identity={item.id}
                key={item.id}
                type="button"
                aria-pressed={selected.id === item.id}
                onClick={() => setSelected(item)}
              >
                <span className={styles.cardTop}>
                  <span>{item.scope}</span>
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
          <aside className={styles.dropzone} aria-label="Selected public DO">
            <span className={styles.eyebrow}>YOUR SELECTED DO</span>
            <span className={styles.mark}>
              <DoMark />
            </span>
            <h3>{selected.name}</h3>
            <p>{selected.note}</p>
            <button
              type="button"
              className={styles.primary}
              onClick={() => router.push(selected.href)}
            >
              Open {selected.name} <ArrowUpRight size={17} />
            </button>
            <small>Choosing a DO does not run a task or send anything.</small>
          </aside>
        </div>
      </section>

      <section className={styles.portable} aria-labelledby="paths-title">
        <div className={styles.sectionHead}>
          <div>
            <p className={styles.eyebrow}>START HERE</p>
            <h2 id="paths-title">Two honest paths.</h2>
          </div>
          <p>
            Meeting DO needs a microphone or a paste. Household DO uses a
            scrubbed demo template — private family installs stay closed here.
          </p>
        </div>
        <div className={styles.portableGrid}>
          <article>
            <span>01 / MEETING</span>
            <h3>Capture → notes.</h3>
            <p>
              Record or paste. Transcribe when Deepgram is configured. Review
              actions, decisions and attendees before any handoff.
            </p>
            <Link href="/do/meetings">
              Open Meeting DO <Mic size={16} />
            </Link>
            <Link href="/do/meetings?phone=1">
              Phone-easy view <ArrowUpRight size={16} />
            </Link>
          </article>
          <article>
            <span>02 / HOUSEHOLD</span>
            <h3>Chores board.</h3>
            <p>
              Generic demo household — fictional names only. Install the public
              template; owner-private install is refused on this site.
            </p>
            <Link href="/do/household">
              Open Household DO <ArrowUpRight size={16} />
            </Link>
          </article>
          <article>
            <span>03 / DOWNLOAD</span>
            <h3>Keep DO close.</h3>
            <p>
              Chrome and Mac companions still open Meeting DO. They do not unlock
              private operator boards from the public site.
            </p>
            <a
              href="/api/do/download?format=extension"
              download="assembl-do-extension-1.5.2.zip"
            >
              Download Chrome DO <Download size={16} />
            </a>
          </article>
        </div>
      </section>

      <footer className={styles.footer}>
        <Link className={styles.brand} href="/">
          assembl
        </Link>
        <p>DO prepares. You decide.</p>
        <nav aria-label="assembl products">
          <Link href="/pursuit">Pursuit</Link>
          <Link href="/creative-studio">Studio</Link>
        </nav>
      </footer>
    </div>
  );
}
