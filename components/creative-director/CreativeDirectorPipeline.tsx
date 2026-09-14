/**
 * Creative Director PREVIEW — pipeline UI.
 * Mounted at /creative-studio. DEMO honesty throughout.
 * Does not touch live homepage `/` or One NZ journeys.
 */

'use client';

import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
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
      setSelectedDirectionId(seed.suggestedDirectionId);
      setVisualTargets(seed.visualTargets);
      setConstruct(seed.suggestedConstruct);
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
    <div className="cd-root" data-preview="creative-director-v0">
      <header className="cd-nav">
        <Link href="/creative-studio" className="cd-brand">
          <strong>assembl</strong>
          <span className="cd-mono">studio · creative director</span>
        </Link>
        <p className="cd-badge cd-mono">PREVIEW · DEMO · not live craft</p>
      </header>

      <section className="cd-hero" aria-label="Creative director overview">
        <p className="cd-eyebrow cd-mono">idea → direction → world → experience</p>
        <h1>
          Art direction before <em>code</em>.
        </h1>
        <p className="cd-lede">
          Three materially different directions. Then construct. Then a critic that can
          send you back. This door elevates the creative studio — it does not replace the
          live homepage.
        </p>
        <div className="cd-hero-actions">
          <button
            type="button"
            className="cd-btn cd-btn-primary"
            onClick={runEnergyDemo}
            disabled={pending}
          >
            Run energy DEMO
          </button>
          <a className="cd-btn cd-btn-ghost" href="/generative-studio">
            Open Generative Studio craft
          </a>
          <a className="cd-btn cd-btn-ghost" href="/agents/ensemble">
            Ensemble desk
          </a>
        </div>
        <p className="cd-demo-note cd-mono">{ENERGY_DEMO_LABEL}</p>
      </section>

      <nav className="cd-steps" aria-label="Pipeline steps">
        {PIPELINE_STEPS.map((s) => {
          const active = s.id === step;
          const done = stepIndex(s.id) < stepIndex(step);
          return (
            <button
              key={s.id}
              type="button"
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
      </nav>

      {/* 01 Understand */}
      {step === 'understand' && (
        <section className="cd-panel" aria-labelledby="cd-understand-title">
          <div className="cd-panel-head">
            <p className="cd-eyebrow cd-mono">01 · understand</p>
            <h2 id="cd-understand-title">Brief extract</h2>
            <p>Brand, audience, emotion, NZ context, references — compiled into a CREATIVE INTENT block.</p>
          </div>
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
          <div className="cd-row">
            <button
              type="button"
              className="cd-btn cd-btn-primary"
              disabled={!prompt.trim() || pending}
              onClick={() => runUnderstand(prompt.trim())}
            >
              Compile intent
            </button>
            <button
              type="button"
              className="cd-btn cd-btn-ghost"
              onClick={runEnergyDemo}
              disabled={pending}
            >
              Use energy DEMO prompt
            </button>
          </div>
        </section>
      )}

      {/* Intent always visible once compiled */}
      {intent && step !== 'understand' && (
        <section className="cd-panel cd-intent" aria-labelledby="cd-intent-title">
          <div className="cd-panel-head">
            <p className="cd-eyebrow cd-mono">creative intent</p>
            <h2 id="cd-intent-title">Compiled block</h2>
            {demoSeeded && <p className="cd-mono cd-pill">from energy DEMO seed</p>}
          </div>
          <dl className="cd-intent-grid">
            <div><dt>Core idea</dt><dd>{intent.coreIdea}</dd></div>
            <div><dt>Brand</dt><dd>{intent.brand}</dd></div>
            <div><dt>Audience</dt><dd>{intent.audience}</dd></div>
            <div><dt>Emotion</dt><dd>{intent.emotion}</dd></div>
            <div><dt>NZ context</dt><dd>{intent.nzContext}</dd></div>
            <div><dt>Hero</dt><dd>{intent.hero}</dd></div>
            <div><dt>Motion</dt><dd>{intent.motion}</dd></div>
          </dl>
          <details className="cd-details">
            <summary className="cd-mono">Full CREATIVE INTENT block</summary>
            <pre className="cd-pre">{intentBlock}</pre>
          </details>
        </section>
      )}

      {/* 02 Art direct */}
      {(step === 'art-direct' || (directions.length > 0 && stepIndex(step) > 1)) &&
        step === 'art-direct' && (
          <section className="cd-panel" aria-labelledby="cd-directions-title">
            <div className="cd-panel-head">
              <p className="cd-eyebrow cd-mono">02 · art direct</p>
              <h2 id="cd-directions-title">Three directions</h2>
              <p>
                Metaphor, composition, motion and type each differ. Not three colour
                variants.
              </p>
            </div>
            <div className="cd-directions">
              {directions.map((d) => (
                <article
                  key={d.id}
                  className={`cd-direction${selectedDirectionId === d.id ? ' is-selected' : ''}`}
                >
                  <p className="cd-mono cd-dir-id">{d.id}</p>
                  <h3>{d.title}</h3>
                  <p className="cd-dir-meta"><strong>Metaphor</strong> {d.metaphor}</p>
                  <p className="cd-dir-meta"><strong>Composition</strong> {d.composition}</p>
                  <p className="cd-dir-meta"><strong>Motion</strong> {d.motion}</p>
                  <p className="cd-dir-meta"><strong>Type</strong> {d.type}</p>
                  <p className="cd-dir-meta"><strong>Palette</strong> {d.paletteNote}</p>
                  <p className="cd-mono cd-blocks">
                    {d.registryBlocks.map((b) => `@assembl/${b}`).join(' · ')}
                  </p>
                  <p className="cd-why">{d.whyDifferent}</p>
                  <button
                    type="button"
                    className="cd-btn cd-btn-primary"
                    onClick={() => selectDirection(d.id)}
                  >
                    Choose {d.title}
                  </button>
                </article>
              ))}
            </div>
          </section>
        )}

      {/* 03 Visual targets */}
      {step === 'visual-targets' && selectedDirection && (
        <section className="cd-panel" aria-labelledby="cd-targets-title">
          <div className="cd-panel-head">
            <p className="cd-eyebrow cd-mono">03 · visual targets</p>
            <h2 id="cd-targets-title">{selectedDirection.title} plates</h2>
            <p>DEMO placeholders — honest until Chromium capture lands.</p>
          </div>
          <div className="cd-targets">
            {visualTargets.map((t) => (
              <figure key={t.kind} className="cd-target">
                <div className={`cd-plate cd-plate-${t.kind}`} aria-hidden="true">
                  <span className="cd-mono">{t.placeholder}</span>
                </div>
                <figcaption>
                  <strong>{t.label}</strong>
                  <p>{t.demoNote}</p>
                </figcaption>
              </figure>
            ))}
          </div>
          <div className="cd-row">
            <button type="button" className="cd-btn cd-btn-ghost" onClick={() => setStep('art-direct')}>
              Back to directions
            </button>
            <button type="button" className="cd-btn cd-btn-primary" onClick={goConstruct}>
              Continue to construct
            </button>
          </div>
        </section>
      )}

      {/* 04 Construct */}
      {step === 'construct' && selectedDirection && (
        <section className="cd-panel" aria-labelledby="cd-construct-title">
          <div className="cd-panel-head">
            <p className="cd-eyebrow cd-mono">04 · construct</p>
            <h2 id="cd-construct-title">Implementation grammar</h2>
            <p>Pick how the chosen world gets built. Suggested from the direction; override freely.</p>
          </div>
          <div className="cd-constructs">
            {CONSTRUCT_CHOICES.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`cd-construct${construct === c.id ? ' is-selected' : ''}`}
                onClick={() => setConstruct(c.id)}
              >
                <h3>{c.label}</h3>
                <p>{c.summary}</p>
                <p className="cd-mono">{c.stack.join(' · ')}</p>
              </button>
            ))}
          </div>
          {constructChoice && (
            <p className="cd-mono cd-blocks">
              Registry: {constructChoice.registryBlocks.map((b) => `@assembl/${b}`).join(' · ')}
            </p>
          )}
          <div className="cd-row">
            <button
              type="button"
              className="cd-btn cd-btn-ghost"
              onClick={() => setStep('visual-targets')}
            >
              Back to targets
            </button>
            <button
              type="button"
              className="cd-btn cd-btn-primary"
              disabled={!construct || pending}
              onClick={runCritic}
            >
              Run Creative Critic
            </button>
          </div>
        </section>
      )}

      {/* 05 Critic */}
      {step === 'critic' && critic && (
        <section className="cd-panel" aria-labelledby="cd-critic-title">
          <div className="cd-panel-head">
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
                className="cd-btn cd-btn-primary"
                onClick={() => setStep('art-direct')}
              >
                Return to art direction
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
              <div className="cd-row">
                <button type="button" className="cd-btn cd-btn-ghost" onClick={runEnergyDemo}>
                  Re-run energy DEMO
                </button>
                <a className="cd-btn cd-btn-ghost" href="/generative-studio">
                  Generative Studio craft
                </a>
              </div>
            </div>
          )}
        </section>
      )}

      <footer className="cd-footer">
        <p className="cd-mono">
          assembl studio · creative director v0 · PREVIEW only · homepage `/` untouched
        </p>
        <p>
          <Link href="/generative-studio">Generative Studio</Link>
          {' · '}
          <Link href="/agents/ensemble">Ensemble</Link>
          {' · '}
          <Link href="/studio">Agent builder studio</Link>
        </p>
      </footer>
    </div>
  );
}
