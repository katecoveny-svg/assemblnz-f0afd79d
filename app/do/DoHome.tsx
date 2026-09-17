"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpRight, Mic } from "lucide-react";
import { DoLivingBlob } from "@/components/do/DoLivingBlob";
import { DoDownloadCtas } from "@/components/do/DoDownloadCtas";
import { DoDownloadsStrip } from "@/components/do/DoDownloadsStrip";
import { readHomeBrief } from "@/apps/do/shared/home-handoff";
import {
  PUBLIC_DO_SPECIALISTS,
  type PublicDoSpecialist,
} from "@/lib/do/public-do-specialists";
import "./do-craft.css";
import styles from "./do-home.module.css";

/**
 * Public DO home — Kate lock + craft rebuild 2026-09-17.
 * Meeting DO + Household DO only. Brand: plum / rose / chalk / paper.
 */
export function DoHome() {
  const params = useSearchParams();
  const router = useRouter();
  const [selected, setSelected] = useState<PublicDoSpecialist>(
    PUBLIC_DO_SPECIALISTS[0],
  );
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
            "Homepage draft received. Open Meeting notes or the Household board below. Nothing was sent.",
          );
        } else {
          setHandoffNotice(
            "This homepage draft has expired or is unavailable in this tab. Open Meeting or Household below.",
          );
        }
      } catch {
        setHandoffNotice(
          "This browser could not open the homepage draft. Open Meeting or Household below.",
        );
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [params]);

  return (
    <div className={`do-craft ${styles.page}`}>
      <a className={styles.skip} href="#tools">
        Skip to tools
      </a>

      <header className={styles.header}>
        <Link href="/" className={styles.brand}>
          assembl
        </Link>
        <span className={styles.product}>/ DO</span>
        <nav aria-label="DO">
          <Link href="/do/meetings">Meeting</Link>
          <Link href="/do/household">Household</Link>
        </nav>
      </header>

      <DoDownloadCtas variant="banner" />

      <section className={styles.hero} aria-labelledby="do-hero-title">
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>DO · PUBLIC FACE</p>
          <h1 id="do-hero-title">
            Meeting notes.
            <br />
            Household board.
          </h1>
          <p className={styles.lede}>
            Two tools you can try. Drafts only — nothing is sent for you.
          </p>
          <div className={styles.heroActions}>
            <Link href="/do/meetings" className={styles.heroPrimary}>
              Open Meeting DO <Mic size={17} aria-hidden />
            </Link>
            <Link href="/do/household" className={styles.heroGhost}>
              Try Household board <ArrowUpRight size={17} aria-hidden />
            </Link>
          </div>
          <p className={styles.boundary}>
            DEMO honesty · public shelf only · review before any handoff
          </p>
        </div>
        <div className={styles.heroMark} aria-hidden="true">
          <DoLivingBlob size="lg" label="DO" />
        </div>
      </section>

      {handoffNotice ? (
        <p className={styles.dropNotice} role="status">
          {handoffNotice}
        </p>
      ) : null}

      <section className={styles.tools} id="tools" aria-labelledby="tools-title">
        <div className={styles.toolsHead}>
          <p className={styles.eyebrowDark}>TWO TOOLS · ONE SHELF</p>
          <h2 id="tools-title">What you can DO here.</h2>
          <p>
            Pick one job. Keep the context close. Review what it prepares.
          </p>
        </div>

        <div className={styles.toolRail} role="list">
          {PUBLIC_DO_SPECIALISTS.map((item, index) => {
            const active = selected.id === item.id;
            return (
              <article
                key={item.id}
                role="listitem"
                className={active ? styles.toolPlateActive : styles.toolPlate}
                data-identity={item.id}
              >
                <button
                  type="button"
                  className={styles.toolSelect}
                  aria-pressed={active}
                  onClick={() => setSelected(item)}
                >
                  <span className={styles.toolIndex}>
                    0{index + 1} / {item.id.toUpperCase()}
                  </span>
                  <span className={styles.toolGlyph} aria-hidden="true">
                    {item.glyph}
                  </span>
                  <strong>{item.name}</strong>
                  <span className={styles.toolDesc}>{item.description}</span>
                </button>
                <div className={styles.toolBody}>
                  <p>{item.note}</p>
                  <button
                    type="button"
                    className="do-cta"
                    onClick={() => router.push(item.href)}
                  >
                    Open {item.name} <ArrowUpRight size={16} aria-hidden />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className={styles.proof} aria-labelledby="proof-title">
        <div className={styles.proofCopy}>
          <p className={styles.eyebrow}>HOW MEETING WORKS</p>
          <h2 id="proof-title">
            Record.
            <br />
            Get notes.
            <br />
            You decide.
          </h2>
          <p>
            Capture the conversation. Turn audio into a transcript. Review
            actions, decisions and who said what. Nothing leaves this page until
            you choose a handoff.
          </p>
          <Link href="/do/meetings" className={styles.proofCta}>
            Start Meeting DO <ArrowUpRight size={16} aria-hidden />
          </Link>
        </div>
        <ol className={styles.proofSteps}>
          <li>
            <span>01</span>
            <div>
              <strong>Capture</strong>
              <p>Record in the browser, or paste notes you already have.</p>
            </div>
          </li>
          <li>
            <span>02</span>
            <div>
              <strong>Notes</strong>
              <p>Turn the recording into a transcript you can correct.</p>
            </div>
          </li>
          <li>
            <span>03</span>
            <div>
              <strong>Review</strong>
              <p>Actions, decisions, attendees — drafts only. You stay in control.</p>
            </div>
          </li>
        </ol>
      </section>

      <section className={styles.household} aria-labelledby="hh-title">
        <p className={styles.eyebrowDark}>HOUSEHOLD · DEMO</p>
        <h2 id="hh-title">A simple chores board.</h2>
        <p>
          Not your real household. Install the public demo template, run the
          evening board, then leave it. Private family installs stay closed here.
        </p>
        <Link href="/do/household" className="do-cta">
          Open Household DO <ArrowUpRight size={16} aria-hidden />
        </Link>
      </section>

      <section className={styles.portable} aria-labelledby="keep-title">
        <div className={styles.toolsHead}>
          <p className={styles.eyebrowDark}>KEEP DO CLOSE</p>
          <h2 id="keep-title">Phone, Chrome, Mac.</h2>
          <p>
            Companions still open Meeting DO. They do not open private operator
            boards from the public site.
          </p>
        </div>
        <DoDownloadsStrip anchorId="get-do" />
      </section>

      <footer className={styles.footer}>
        <Link className={styles.brand} href="/">
          assembl
        </Link>
        <p>DO prepares. You decide.</p>
        <nav aria-label="assembl products">
          <a
            href="https://assembl-pursuit.katecoveny.chatgpt.site"
            target="_blank"
            rel="noopener noreferrer"
          >
            Pursuit
          </a>
          <Link href="/creative-studio">Studio</Link>
        </nav>
      </footer>
    </div>
  );
}
