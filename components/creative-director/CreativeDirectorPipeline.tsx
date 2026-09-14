/**
 * Creative Director PREVIEW — pipeline UI.
 * Ensemble / Gen Studio creative-desk DNA. Never Arc floor-plan craft.
 * Mounted at /creative-studio. DEMO honesty throughout.
 */

'use client';

import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { CraftScroll } from '@/components/agent-app';
import {
  PIPELINE_STEPS,
  compileCreativeIntent,
  formatCreativeIntentBlock,
  inventArtDirections,
  buildVisualTargets,
  CONSTRUCT_CHOICES,
  suggestConstruct,
  getConstructChoice,
  runCreativeCritic,
  seedEnergyDemo,
  ENERGY_DEMO_LABEL,
  ENERGY_DEMO_PROMPT,
  type PipelineStep,
  type CreativeIntent,
  type ArtDirection,
  type DirectionId,
  type VisualTarget,
  type ConstructGrammar,
  type CriticResult,
} from '@/lib/creative-director';
import { CreativeDirectorDeskArt } from './CreativeDirectorDeskArt';
import './creative-director.css';

function stepIndex(step: PipelineStep): number {
  return PIPELINE_STEPS.findIndex((s) => s.id === step);
}

export function CreativeDirectorPipeline() {
  const [pending, startTransition] = useTransition();
  const [step, setStep] = useState<PipelineStep>('understand');
  const [prompt, setPrompt] = useState('');
  const [intent, setIntent] = useState<CreativeIntent | null>(null);
  const [directions, setDirections] = useState<ArtDirection[]>([]);
  const [selectedDirectionId, setSelectedDirectionId] = useState<DirectionId | null>(
    null,
  );
  const [visualTargets, setVisualTargets] = useState<VisualTarget[]>([]);
  const [construct, setConstruct] = useState<ConstructGrammar | null>(null);
  const [critic, setCritic] = useState<CriticResult | null>(null);
  const [demoSeeded, setDemoSeeded] = useState(false);

  const intentBlock = useMemo(
    () => (intent ? formatCreativeIntentBlock(intent) : ''),
    [intent],
  );

  const selectedDirection = useMemo(
    () => directions.find((d) => d.id === selectedDirectionId) ?? null,
    [directions, selectedDirectionId],
  );

  const constructChoice = getConstructChoice(construct);

  function runUnderstand(nextPrompt: string, fromDemo = false) {
    startTransition(() => {
      const compiled = compileCreativeIntent(nextPrompt);
      const dirs = inventArtDirections(compiled);
      setPrompt(nextPrompt);
      setIntent(compiled);
      setDirections(dirs);
      setSelectedDirectionId(null);
      setVisualTargets([]);
      setConstruct(null);
      setCritic(null);
      setDemoSeeded(fromDemo);
      setStep('art-direct');
    });
  }

  function runEnergyDemo() {
    startTransition(() => {
      const seed = seedEnergyDemo();
      setPrompt(seed.prompt);
      setIntent(seed.intent);
      setDirections(seed.directions);
      setSelectedDirectionId(null);
      setVisualTargets([]);
      setConstruct(null);
      setCritic(null);
      setDemoSeeded(true);
      setStep('art-direct');
    });
  }

  function selectDirection(id: DirectionId) {
    const direction = directions.find((d) => d.id === id);
    if (!direction) return;
    startTransition(() => {
      setSelectedDirectionId(id);
      setVisualTargets(buildVisualTargets(direction));
      setConstruct(suggestConstruct(direction));
      setCritic(null);
      setStep('visual-targets');
    });
  }

  function goConstruct() {
    if (!selectedDirection) return;
    setStep('construct');
  }

  function runCritic() {
    if (!intent || !selectedDirection || !construct) return;
    startTransition(() => {
      const result = runCreativeCritic({
        intent,
        direction: selectedDirection,
        construct,
      });
      setCritic(result);
      setStep('critic');
    });
  }

  return (
    <div className="cd-root" data-preview="creative-director-v0" data-craft="creative-desk">
      <CraftScroll
        rootSelector=".cd-root"
        revealSelector=".cd-story > section:not(.cd-hero), .cd-footer"
      />

      <header className="cd-nav">
        <Link href="/creative-studio" className="cd-brand">
          <strong>assembl</strong>
          <span className="cd-mono">studio · creative director</span>
        </Link>
        <p className="cd-badge cd-mono">DEMO · draft-only · sample business · details fictional</p>
      </header>

      <main className="cd-story">
        <section className="cd-section cd-hero" aria-label="Creative director overview">
          <div className="cd-hero-grid">
            <div className="cd-hero-copy">
              <p className="cd-eyebrow cd-mono">idea → direction → world → experience</p>
              <h1>
                <span>Art direction</span> before code.
              </h1>
              <p className="cd-lede">
                Three materially different directions. Then construct. Then a critic that
                can send you back — the Ensemble desk family, elevated for Studio PREVIEW.
              </p>
              <div className="cd-cta-row">
                <button
                  type="button"
                  className="cd-cta cd-cta-primary"
                  onClick={runEnergyDemo}
                  disabled={pending}
                >
                  Run energy DEMO
                  <span aria-hidden="true">↗</span>
                </button>
              </div>
              <p className="cd-demo-note cd-mono">{ENERGY_DEMO_LABEL}</p>
            </div>

            <CreativeDirectorDeskArt />

            <div className="cd-hero-studio">
              <a className="cd-cta cd-cta-link" href="/generative-studio">
                Open Generative Studio craft
                <span aria-hidden="true">↗</span>
              </a>
              <a className="cd-cta cd-cta-link" href="/agents/ensemble">
                Ensemble desk
                <span aria-hidden="true">↗</span>
              </a>
              <p className="cd-share-hint">
                Same creative-desk DNA as Ensemble — never architecture floor plates.
              </p>
            </div>
          </div>
        </section>

        <nav className="cd-section cd-steps-wrap" aria-label="Pipeline steps">
          <div className="cd-steps" role="list">
            {PIPELINE_STEPS.map((s) => {
              const active = s.id === step;
              const done = stepIndex(s.id) < stepIndex(step);
              return (
                <button
                  key={s.id}
                  type="button"
                  role="listitem"
                  className={`cd-step${active ? ' is-active' : ''}${done ? ' is-done' : ''}`}
                  onClick={() => {
                    if (done || active) setStep(s.id);
                  }}
                  aria-current={active ? 'step' : undefined}
                >
                  <span className="cd-mono">{s.number}</span>
                  {s.label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* 01 Understand */}
        {step === 'understand' && (
          <section className="cd-section cd-panel" aria-labelledby="cd-understand-title">
            <div className="cd-section-head">
              <p className="cd-eyebrow cd-mono">01 · understand</p>
              <h2 id="cd-understand-title">Brief extract</h2>
              <p>
                Brand, audience, emotion, NZ context, references — compiled into a CREATIVE
                INTENT block.
              </p>
            </div>
            <div className="cd-brief-card">
              <label className="cd-label" htmlFor="cd-prompt">
                Casual prompt
              </label>
              <textarea
                id="cd-prompt"
                className="cd-prompt"
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={ENERGY_DEMO_PROMPT}
              />
              <div className="cd-cta-row">
                <button
                  type="button"
                  className="cd-cta cd-cta-primary"
                  disabled={!prompt.trim() || pending}
                  onClick={() => runUnderstand(prompt.trim())}
                >
                  Compile intent
                  <span aria-hidden="true">↗</span>
                </button>
                <button
                  type="button"
                  className="cd-cta cd-cta-ghost"
                  onClick={runEnergyDemo}
                  disabled={pending}
                >
                  Use energy DEMO prompt
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Intent board */}
        {intent && step !== 'understand' && (
          <section className="cd-section cd-panel cd-intent" aria-labelledby="cd-intent-title">
            <div className="cd-section-head">
              <p className="cd-eyebrow cd-mono">creative intent</p>
              <h2 id="cd-intent-title">Compiled block</h2>
              <p>The brief extract the directions answer — DEMO seed when labelled.</p>
              {demoSeeded && (
                <p className="cd-pill cd-mono">from energy DEMO seed</p>
              )}
            </div>
            <dl className="cd-intent-grid">
              <div className="cd-intent-cell">
                <dt className="cd-mono">Core idea</dt>
                <dd>{intent.coreIdea}</dd>
              </div>
              <div className="cd-intent-cell">
                <dt className="cd-mono">Brand</dt>
                <dd>{intent.brand}</dd>
              </div>
              <div className="cd-intent-cell">
                <dt className="cd-mono">Audience</dt>
                <dd>{intent.audience}</dd>
              </div>
              <div className="cd-intent-cell">
                <dt className="cd-mono">Emotion</dt>
                <dd>{intent.emotion}</dd>
              </div>
              <div className="cd-intent-cell">
                <dt className="cd-mono">NZ context</dt>
                <dd>{intent.nzContext}</dd>
              </div>
              <div className="cd-intent-cell">
                <dt className="cd-mono">Hero</dt>
                <dd>{intent.hero}</dd>
              </div>
              <div className="cd-intent-cell cd-intent-cell-wide">
                <dt className="cd-mono">Motion</dt>
                <dd>{intent.motion}</dd>
              </div>
            </dl>
            <details className="cd-details">
              <summary className="cd-mono">Full CREATIVE INTENT block</summary>
              <pre className="cd-pre">{intentBlock}</pre>
            </details>
          </section>
        )}

        {/* 02 Art direct */}
        {step === 'art-direct' && directions.length > 0 && (
          <section className="cd-section cd-panel" aria-labelledby="cd-directions-title">
            <div className="cd-section-head">
              <p className="cd-eyebrow cd-mono">02 · art direct</p>
              <h2 id="cd-directions-title">Three directions</h2>
              <p>
                Metaphor, composition, motion and type each differ. Not three colour
                variants.
              </p>
            </div>
            <div className="cd-directions">
              {directions.map((d, i) => (
                <article
                  key={d.id}
                  className={`cd-direction${selectedDirectionId === d.id ? ' is-selected' : ''}`}
                >
                  <header className="cd-direction-top">
                    <span className="cd-mono">0{i + 1}</span>
                    <span className="cd-mono cd-dir-id">{d.id}</span>
                  </header>
                  <h3>{d.title}</h3>
                  <dl className="cd-dir-specs">
                    <div>
                      <dt className="cd-mono">Metaphor</dt>
                      <dd>{d.metaphor}</dd>
                    </div>
                    <div>
                      <dt className="cd-mono">Composition</dt>
                      <dd>{d.composition}</dd>
                    </div>
                    <div>
                      <dt className="cd-mono">Motion</dt>
                      <dd>{d.motion}</dd>
                    </div>
                    <div>
                      <dt className="cd-mono">Type</dt>
                      <dd>{d.type}</dd>
                    </div>
                    <div>
                      <dt className="cd-mono">Palette</dt>
                      <dd>{d.paletteNote}</dd>
                    </div>
                  </dl>
                  <p className="cd-blocks cd-mono">
                    {d.registryBlocks.map((b) => `@assembl/${b}`).join(' · ')}
                  </p>
                  <p className="cd-why">{d.whyDifferent}</p>
                  <button
                    type="button"
                    className="cd-cta cd-cta-primary"
                    onClick={() => selectDirection(d.id)}
                  >
                    Choose {d.title}
                    <span aria-hidden="true">↗</span>
                  </button>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* 03 Visual targets */}
        {step === 'visual-targets' && selectedDirection && (
          <section className="cd-section cd-panel" aria-labelledby="cd-targets-title">
            <div className="cd-section-head">
              <p className="cd-eyebrow cd-mono">03 · visual targets</p>
              <h2 id="cd-targets-title">{selectedDirection.title} plates</h2>
              <p>DEMO placeholders — honest until Chromium capture lands.</p>
            </div>
            <div className="cd-board">
              {visualTargets.map((t) => (
                <figure key={t.kind} className="cd-target">
                  <div className={`cd-plate cd-plate-${t.kind}`} aria-hidden="true">
                    <span className="cd-mono">{t.placeholder}</span>
                  </div>
                  <figcaption>
                    <strong>{t.label}</strong>
                    <span className="cd-mono">DEMO plate</span>
                    <p>{t.demoNote}</p>
                  </figcaption>
                </figure>
              ))}
            </div>
            <div className="cd-cta-row">
              <button
                type="button"
                className="cd-cta cd-cta-ghost"
                onClick={() => setStep('art-direct')}
              >
                Back to directions
              </button>
              <button type="button" className="cd-cta cd-cta-primary" onClick={goConstruct}>
                Continue to construct
                <span aria-hidden="true">↗</span>
              </button>
            </div>
          </section>
        )}

        {/* 04 Construct */}
        {step === 'construct' && selectedDirection && (
          <section className="cd-section cd-panel" aria-labelledby="cd-construct-title">
            <div className="cd-section-head">
              <p className="cd-eyebrow cd-mono">04 · construct</p>
              <h2 id="cd-construct-title">Implementation grammar</h2>
              <p>
                Pick how the chosen world gets built. Suggested from the direction; override
                freely.
              </p>
            </div>
            <div className="cd-constructs">
              {CONSTRUCT_CHOICES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`cd-construct${construct === c.id ? ' is-selected' : ''}`}
                  onClick={() => setConstruct(c.id)}
                >
                  <span className="cd-mono">
                    {construct === c.id ? 'selected' : 'option'}
                  </span>
                  <strong>{c.label}</strong>
                  <p>{c.summary}</p>
                  <span className="cd-mono cd-stack">{c.stack.join(' · ')}</span>
                </button>
              ))}
            </div>
            {constructChoice && (
              <p className="cd-blocks cd-mono">
                Registry: {constructChoice.registryBlocks.map((b) => `@assembl/${b}`).join(' · ')}
              </p>
            )}
            <div className="cd-cta-row">
              <button
                type="button"
                className="cd-cta cd-cta-ghost"
                onClick={() => setStep('visual-targets')}
              >
                Back to targets
              </button>
              <button
                type="button"
                className="cd-cta cd-cta-primary"
                disabled={!construct || pending}
                onClick={runCritic}
              >
                Run Creative Critic
                <span aria-hidden="true">↗</span>
              </button>
            </div>
          </section>
        )}

        {/* 05 Critic */}
        {step === 'critic' && critic && (
          <section className="cd-section cd-panel" aria-labelledby="cd-critic-title">
            <div className="cd-section-head">
              <p className="cd-eyebrow cd-mono">05 · critic</p>
              <h2 id="cd-critic-title">
                {critic.passed ? 'Passed checklist' : 'Revise before ship'}
              </h2>
              <p>{critic.mockScreenshotNote}</p>
            </div>
            <ul className="cd-checks">
              {critic.checks.map((c) => (
                <li key={c.id} className={`cd-check is-${c.severity}`}>
                  <span className="cd-mono">{c.severity}</span>
                  <div>
                    <strong>{c.label}</strong>
                    <p>{c.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
            {!critic.passed && (
              <div className="cd-revise">
                <h3>Revise reasons</h3>
                <ul>
                  {critic.reviseReasons.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
                <button
                  type="button"
                  className="cd-cta cd-cta-primary"
                  onClick={() => setStep('art-direct')}
                >
                  Return to art direction
                  <span aria-hidden="true">↗</span>
                </button>
              </div>
            )}
            {critic.passed && (
              <div className="cd-pass">
                <p>
                  PREVIEW complete for this path. Wire real Chromium screenshots into{' '}
                  <code>runCreativeCritic</code> when ready. Registry stubs live under{' '}
                  <code>packages/registry</code>.
                </p>
                <div className="cd-cta-row">
                  <button
                    type="button"
                    className="cd-cta cd-cta-ghost"
                    onClick={runEnergyDemo}
                  >
                    Re-run energy DEMO
                  </button>
                  <a className="cd-cta cd-cta-ghost" href="/generative-studio">
                    Generative Studio craft
                  </a>
                </div>
              </div>
            )}
          </section>
        )}
      </main>

      <footer className="cd-footer">
        <p>
          Creative Director is an assembl Studio PREVIEW. Independent concept — DEMO data
          only. Homepage `/` untouched.
        </p>
        <div className="cd-footer-links">
          <Link href="/">assembl</Link>
          <Link href="/generative-studio">Generative Studio</Link>
          <Link href="/agents/ensemble">Ensemble</Link>
          <Link href="/studio">Agent builder</Link>
        </div>
      </footer>
    </div>
  );
}
