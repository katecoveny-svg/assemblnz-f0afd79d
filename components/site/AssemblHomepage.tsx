"use client";

import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import { prepareVisit, type VisitChoice } from "@/lib/copy/prepared-visit";
import "./assembl-homepage.css";
import CinematicJourney from "./CinematicJourney";

const PreparationWorld = dynamic(() => import("./PreparationWorld"), {
  ssr: false,
});
const choices: { value: VisitChoice; label: string; note: string }[] = [
  {
    value: "mobility",
    label: "help me keep moving",
    note: "prepare a transport question",
  },
  {
    value: "clarity",
    label: "explain the work first",
    note: "prepare the questions before approval",
  },
  {
    value: "pickup",
    label: "keep pickup simple",
    note: "prepare a concise collection checklist",
  },
  {
    value: "skip",
    label: "skip this question",
    note: "continue with the ordinary checklist",
  },
];
const pilot = `assembl | one customer journey\n\nStart with one repeated problem: a customer has to chase, repeat information or arrive unprepared.\n\nProposed first engagement: a 2–4 week journey sprint. Map the current service, build one working demonstrator, agree approved data and tools, and define the first measured pilot. Scope and price are agreed before work starts.\n\nDeliverables: journey map; customer experience; specialist-agent roles and limits; human review point; permission and evidence receipt; integration boundary; measurement plan.\n\nInitial access: only the approved information needed for the selected journey. Actions, external messages and reward fulfilment each require explicit permissions.\n\nMeasure: customer effort, missing information, prepared-step acceptance, handoff quality and actual operating cost. Reward cost is measured separately if a rewarded model is tested.\n\nDecide together: one journey, one accountable business owner, one customer cohort, one useful outcome and one success threshold.\n\nPrepared for discussion. No booking or message has been sent.`;

export function AssemblHomepage() {
  const [choice, setChoice] = useState<VisitChoice | null>(null);
  const [reviewed, setReviewed] = useState(false);
  const [open, setOpen] = useState(false);
  const [paused, setPaused] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyHelp, setCopyHelp] = useState(false);
  const [layer, setLayer] = useState<"helpful" | "rewarded" | "sponsored">(
    "helpful",
  );
  const result = prepareVisit(choice);
  const stage = reviewed ? 3 : choice ? 2 : 0;
  function reset() {
    setChoice(null);
    setReviewed(false);
  }
  function download() {
    const url = URL.createObjectURL(
      new Blob([pilot], { type: "text/plain;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "assembl-journey-pilot.txt";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(pilot);
      setCopied(true);
    } catch {
      const el = document.querySelector<HTMLTextAreaElement>(".aw-pilot-text");
      el?.select();
      const ok = document.execCommand("copy");
      setCopied(ok);
      setCopyHelp(!ok);
    }
  }
  return (
    <div className="aw-home">
      <header className="aw-nav">
        <Link className="aw-wordmark" href="/" aria-label="assembl home">
          assembl
        </Link>
        <nav aria-label="Main navigation">
          <a href="#journey">experience it</a>
          <a href="#offering">what we do</a>
          <a href="#assembling">useful waits</a>
        </nav>
        <button className="aw-nav-cta" onClick={() => setOpen(true)}>
          start with one journey <span>↗</span>
        </button>
      </header>
      <CinematicJourney />
      <section className="aw-intro" id="offering">
        <p className="aw-label">01 / what we do</p>
        <div>
          <h2>
            the whole journey.
            <br />
            thought through.
          </h2>
          <p>
            Enquiries become plans. Missing information becomes a useful
            question. Decisions arrive with the context to make them.
          </p>
          <p>
            assembl connects the customer experience to the work behind it. We
            shape the journey, build the specialist agents, connect approved
            systems and measure what changes.
          </p>
        </div>
        <aside>
          <span>designed around your service</span>
          <p>
            enquiry
            <br />
            preparation
            <br />
            review
            <br />
            handoff
            <br />
            follow-through
          </p>
        </aside>
      </section>
      <section
        id="journey"
        className="aw-journey"
        aria-labelledby="aw-journey-title"
      >
        <div className="aw-section-head">
          <div>
            <p className="aw-label">02 / experience the difference</p>
            <h2 id="aw-journey-title">
              one answer.
              <br />a different next step.
            </h2>
          </div>
          <p>
            A vehicle service is being prepared. A customer needs to know what
            happens next. Try one useful question.
          </p>
        </div>
        <div className="aw-disclosure">
          Guided concept. Sample information. No live booking, stock check,
          agent connection or external message.
        </div>
        <div className="aw-workbench">
          <div className="aw-world">
            <div className="aw-world-toolbar">
              <span>the preparation table</span>
              <button onClick={() => setPaused(!paused)}>
                {paused ? "resume motion" : "pause motion"}
              </button>
            </div>
            <PreparationWorld stage={stage} choice={choice} paused={paused} />
            <div className="aw-world-state">
              <span>
                {reviewed
                  ? "03 / reviewed"
                  : choice
                    ? "02 / prepared"
                    : "01 / a question worth asking"}
              </span>
              <strong>
                {reviewed
                  ? "the brief is yours."
                  : choice
                    ? "your answer changed the work."
                    : "a service visit is taking shape."}
              </strong>
            </div>
            <p className="aw-small">
              Original 3D folio study. Scroll changes the viewing depth. The
              controls work in still view too.
            </p>
          </div>
          <div className="aw-customer">
            <div className="aw-customer-top">
              <span>sample service journey</span>
              <button onClick={reset}>restart</button>
            </div>
            {!choice ? (
              <>
                <h3>what would make the visit easier?</h3>
                <p>
                  Use one answer to prepare this visit brief. This page only. No
                  preference is saved.
                </p>
                <div className="aw-choices">
                  {choices.map((c) => (
                    <button key={c.value} onClick={() => setChoice(c.value)}>
                      <span>
                        {c.label}
                        <small>{c.note}</small>
                      </span>
                      <span>↗</span>
                    </button>
                  ))}
                </div>
                <p className="aw-small">
                  Choosing an answer gives one-time permission. Skip continues
                  without sharing an answer. There is no reward in this example.
                </p>
              </>
            ) : (
              <>
                <p className="aw-label">
                  {reviewed
                    ? "your reviewed brief"
                    : "prepared for your review"}
                </p>
                <h3>{result.title}</h3>
                <p className="aw-because">{result.reason}</p>
                <ul>
                  {result.items.map((item) => (
                    <li key={item}>
                      <span>✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="aw-reviewer">
                  <span>review owner</span>
                  <strong>sample service adviser</strong>
                  <p>{result.boundary}</p>
                </div>
                {reviewed ? (
                  <div className="aw-receipt">
                    <span className="aw-label">
                      permission & outcome receipt
                    </span>
                    <dl>
                      <dt>answer</dt>
                      <dd>{choices.find((c) => c.value === choice)?.label}</dd>
                      <dt>use</dt>
                      <dd>
                        {choice === "skip"
                          ? "no answer shared"
                          : "this sample visit only"}
                      </dd>
                      <dt>changed</dt>
                      <dd>{result.change}</dd>
                      <dt>status</dt>
                      <dd>reviewed locally, not sent</dd>
                      <dt>reward</dt>
                      <dd>none in this example</dd>
                      <dt>retention</dt>
                      <dd>page memory only</dd>
                    </dl>
                    <button onClick={reset}>
                      delete this sample and restart
                    </button>
                  </div>
                ) : (
                  <div className="aw-actions">
                    <button
                      className="aw-button"
                      onClick={() => setReviewed(true)}
                    >
                      review this brief <span>↗</span>
                    </button>
                    <button className="aw-text-link" onClick={reset}>
                      edit / undo
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        <div className="aw-before-after">
          <div>
            <span>before</span>
            <p>
              A booking reference.
              <br />
              Another conversation to organise.
            </p>
          </div>
          <div>
            <span>after</span>
            <p>
              A brief that reflects the customer.
              <br />A clearer conversation for the team.
            </p>
          </div>
          <p>
            That is the work assembl is built to do. The sample shows
            preparation and review. A live pilot connects only the systems and
            actions you approve.
          </p>
        </div>
      </section>
      <section className="aw-service">
        <div>
          <p className="aw-label">03 / from first question to follow-through</p>
          <h2>
            designed.
            <br />
            connected.
            <br />
            <em>run with care.</em>
          </h2>
        </div>
        <div className="aw-service-list">
          <article>
            <span>01</span>
            <div>
              <h3>shape the customer journey</h3>
              <p>
                Find where people chase, repeat themselves or get stuck. Design
                the experience around one useful outcome.
              </p>
            </div>
          </article>
          <article>
            <span>02</span>
            <div>
              <h3>assemble the work</h3>
              <p>
                Give specialist agents approved information, defined tasks and
                clear limits. Prepare plans, checklists, explanations and
                reviewable actions.
              </p>
            </div>
          </article>
          <article>
            <span>03</span>
            <div>
              <h3>connect the handoff</h3>
              <p>
                Bring the right context to the person responsible. Make
                permission, review and next steps visible.
              </p>
            </div>
          </article>
          <article>
            <span>04</span>
            <div>
              <h3>measure and improve</h3>
              <p>
                Track customer effort, missing information, handoff quality and
                actual cost. Keep what helps. Change what doesn’t.
              </p>
            </div>
          </article>
        </div>
      </section>
      <section id="assembling" className="aw-waits">
        <div className="aw-wait-photo">
          <Image
            src="/images/assembl-preparation-world.webp"
            alt="Paper, phone and folio on the preparation table"
            fill
            sizes="(max-width: 800px) 100vw, 50vw"
          />
          <span>assembling / the useful wait layer</span>
        </div>
        <div className="aw-wait-copy">
          <p className="aw-label">04 / when the journey includes a wait</p>
          <h2>
            make the time
            <br />
            <em>useful.</em>
          </h2>
          <p>
            While a real process runs, assembling can explain what is happening,
            prepare what is missing and help the customer leave ready.
          </p>
          <div className="aw-layers" aria-label="Explore useful wait models">
            {(["helpful", "rewarded", "sponsored"] as const).map((l) => (
              <button
                key={l}
                aria-pressed={layer === l}
                onClick={() => setLayer(l)}
              >
                {l}
              </button>
            ))}
          </div>
          <div className="aw-layer-body" aria-live="polite">
            {layer === "helpful" ? (
              <>
                <h3>useful in its own right.</h3>
                <p>
                  Answer a question, understand the next step or prepare a
                  brief. No purchase or reward is needed to make that
                  worthwhile.
                </p>
              </>
            ) : layer === "rewarded" ? (
              <>
                <h3>give something useful back.</h3>
                <p>
                  A business may offer a clearly disclosed reward for an
                  optional answer or task. The answer must improve the journey.
                  The reward rules and fulfilment need approval.
                </p>
              </>
            ) : (
              <>
                <h3>a partner can fund the usefulness.</h3>
                <p>
                  A relevant sponsor may fund a service or participation award.
                  Show who pays. Keep the customer’s choice independent. Share
                  no context by default.
                </p>
              </>
            )}
          </div>
          <p className="aw-small">
            Never manufacture a delay. Skipping keeps the ordinary journey
            intact. Rewards and sponsorship are optional pilot models, not
            automatic earnings.
          </p>
        </div>
      </section>
      <section className="aw-applications">
        <p className="aw-label">
          05 / the same care, different customer worlds
        </p>
        <h2>
          built around
          <br />
          your kind of customer.
        </h2>
        <div className="aw-app-grid">
          <article>
            <span>lending & insurance</span>
            <h3>
              the decision,
              <br />
              better prepared.
            </h3>
            <p>Documents, questions and a clear adviser handoff.</p>
          </article>
          <article>
            <span>retirement & care</span>
            <h3>
              the family story,
              <br />
              carried forward.
            </h3>
            <p>Distinct priorities and a useful visit brief.</p>
          </article>
          <article>
            <span>automotive & retail</span>
            <h3>
              the next visit,
              <br />
              thought through.
            </h3>
            <p>Project lists, ownership needs and prepared collection.</p>
          </article>
          <article>
            <span>energy & mobility</span>
            <h3>
              the stop,
              <br />
              made useful.
            </h3>
            <p>Useful preparation during a real connection or charging wait.</p>
          </article>
        </div>
        <p className="aw-small">
          Illustrative applications. Scope, systems and outcomes are agreed with
          each business.
        </p>
        <Link className="aw-text-link" href="/concepts">
          explore the concept lab ↗
        </Link>
      </section>
      <section className="aw-close">
        <p className="aw-label">06 / start small. learn something real.</p>
        <h2>
          one journey.
          <br />
          one useful change.
          <br />
          <em>let’s build that.</em>
        </h2>
        <div>
          <p>
            A proposed 2–4 week journey sprint. One customer moment, one
            accountable owner and one outcome to test.
          </p>
          <p>
            Leave with a working demonstrator, an integration plan and a clear
            way to measure the pilot.
          </p>
          <button className="aw-button" onClick={() => setOpen(true)}>
            scope this pilot <span>↗</span>
          </button>
          <span className="aw-small">
            Scope and price agreed before work begins.
          </span>
        </div>
      </section>
      <footer className="aw-footer">
        <Link className="aw-wordmark" href="/">
          assembl
        </Link>
        <p>less admin, more mahi.</p>
        <nav aria-label="More from assembl">
          <Link href="/generative-studio">generative studio ↗</Link>
          <Link href="/about">about</Link>
          <Link href="/admin/login">operator login</Link>
        </nav>
      </footer>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="aw-dialog-overlay" />
          <Dialog.Content className="aw-dialog">
            <Dialog.Title>start with one journey.</Dialog.Title>
            <Dialog.Description>
              A prepared scope to copy or download. Nothing is booked or sent.
            </Dialog.Description>
            <textarea
              className="aw-pilot-text"
              aria-label="proposed pilot summary"
              readOnly
              value={pilot}
            />
            <div className="aw-actions">
              <button className="aw-button" onClick={copy}>
                {copied ? "copied" : "copy summary"}
              </button>
              <button className="aw-text-link" onClick={download}>
                download summary
              </button>
            </div>
            {copyHelp && (
              <p>The summary is selected. Copy it manually or use download.</p>
            )}
            <Dialog.Close
              className="aw-dialog-close"
              aria-label="Close pilot summary"
            >
              ×
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
