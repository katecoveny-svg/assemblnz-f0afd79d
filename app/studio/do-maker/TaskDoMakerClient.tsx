'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { AgentSpec } from '@/apps/do/shared/types';
import {
  DEFAULT_BRAND,
  DEFAULT_CONFIG,
  PARTNER_SKINS,
  PARTNER_SLUGS,
  POWERED_BY_ASSEMBL,
  PURSUIT_PLAYGROUND_PATH,
  type PartnerSlug,
  type PursuitJourney,
  type TaskDoDraft,
  type TaskDoMode,
  type TaskDoTemplateId,
  applyCustomClient,
  applyPartnerSkin,
  applyTemplate,
  compileTaskDoSpec,
  draftFromParts,
  draftFromSearchParams,
  draftToSearchParams,
  isPreviewMode,
  makerHref,
  partnerMakerHref,
  previewHref,
  readLocalDraft,
  templatesForMode,
  writeHandoffSpec,
  writeLocalDraft,
} from '@/lib/studio/task-do-maker';
import { JourneyBuilderPanel } from './JourneyBuilderPanel';
import { OutreachGateEditor, OutreachGateOverlay } from './OutreachGate';
import { SponsoredAgentPanel } from './SponsoredAgentPanel';
import styles from './do-maker.module.css';

type PersistState = 'idle' | 'browser' | 'copied' | 'exported' | 'handed-off';

function hasMakerContext(search: { get(name: string): string | null }): boolean {
  return Boolean(
    search.get('mode') ||
      search.get('opportunity') ||
      search.get('partner') ||
      search.get('task') ||
      search.get('template') ||
      search.get('brand') ||
      search.get('title') ||
      search.get('job') ||
      search.get('journey') ||
      search.get('sponsored') ||
      search.get('preview'),
  );
}

function seedDraft(search: { get(name: string): string | null }): TaskDoDraft {
  if (hasMakerContext(search)) {
    return draftFromSearchParams(search);
  }
  // Do not read localStorage during the first render — avoids hydration mismatch.
  return draftFromParts(DEFAULT_BRAND, DEFAULT_CONFIG);
}

export function TaskDoMakerClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const previewOnly = isPreviewMode(searchParams);

  const initial = useMemo(() => seedDraft(searchParams), []);
  const [brand, setBrand] = useState(initial.brand);
  const [config, setConfig] = useState(initial.config);
  const [journey, setJourney] = useState<PursuitJourney>(initial.journey);
  const [persist, setPersist] = useState<PersistState>('idle');
  const [message, setMessage] = useState(
    'Drafts stay in this browser until you export or hand off to DO.',
  );
  const [specId, setSpecId] = useState(() => crypto.randomUUID());
  const [customName, setCustomName] = useState('');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (hasMakerContext(searchParams)) {
      setHydrated(true);
      return;
    }
    const local = readLocalDraft(window.localStorage);
    if (local) {
      setBrand(local.brand);
      setConfig(local.config);
      setJourney(local.journey);
      setPersist('browser');
      setMessage('Restored the last draft saved in this browser.');
    }
    setHydrated(true);
  }, [searchParams]);

  const mode = config.mode;
  const skin = config.partnerSlug ? PARTNER_SKINS[config.partnerSlug] : undefined;
  const templates = useMemo(() => templatesForMode(mode), [mode]);
  const draft: TaskDoDraft = useMemo(
    () => draftFromParts(brand, config, journey),
    [brand, config, journey],
  );
  const spec = useMemo(
    () => compileTaskDoSpec(brand, config, { id: specId }),
    [brand, config, specId],
  );

  useEffect(() => {
    if (previewOnly || !hydrated) return;
    const timer = window.setTimeout(() => {
      const params = draftToSearchParams(draft);
      router.replace(`?${params.toString()}`, { scroll: false });
      writeLocalDraft(window.localStorage, draft);
      setPersist('browser');
    }, 400);
    return () => window.clearTimeout(timer);
  }, [draft, previewOnly, router, hydrated]);

  // Keep logoUrl synced from uploaded mark when present.
  useEffect(() => {
    if (journey.assets.markDataUrl && brand.logoUrl !== journey.assets.markDataUrl) {
      setBrand((prev) => ({ ...prev, logoUrl: journey.assets.markDataUrl }));
    }
  }, [journey.assets.markDataUrl]);

  const setMode = useCallback((next: TaskDoMode) => {
    if (next === 'partner') {
      const slug = (config.partnerSlug || 'bp') as PartnerSlug;
      const seeded = applyPartnerSkin(slug, { opportunity: config.opportunity || journey.brief });
      setBrand(seeded.brand);
      setConfig(seeded.config);
      setJourney(seeded.journey);
    } else {
      const nextConfig = applyTemplate('research-brief', {
        ...DEFAULT_CONFIG,
        mode: 'pursuit',
        partnerSlug: null,
        opportunity: config.opportunity || journey.brief,
        partner: '',
        task: 'research-brief',
      });
      setBrand(DEFAULT_BRAND);
      setConfig(nextConfig);
      setJourney({
        ...journey,
        title: journey.title || '',
        brief: journey.brief || config.opportunity,
        sponsored: { ...journey.sponsored, enabled: false },
      });
    }
    setSpecId(crypto.randomUUID());
    setMessage(next === 'partner'
      ? 'Partner mode — customer-facing skin. Assembl attribution stays minimal.'
      : 'Pursuit mode — Studio pitch surface with flexible journey builder.');
  }, [config.opportunity, config.partnerSlug, journey]);

  const onPartnerSkin = useCallback((slug: PartnerSlug) => {
    const seeded = applyPartnerSkin(slug, { opportunity: config.opportunity || journey.brief });
    setBrand(seeded.brand);
    setConfig(seeded.config);
    setJourney(seeded.journey);
    setSpecId(crypto.randomUUID());
    setMessage(`${PARTNER_SKINS[slug].productName} demo skin loaded. ${PARTNER_SKINS[slug].honesty}`);
  }, [config.opportunity, journey.brief]);

  const onCustomClient = useCallback(() => {
    const name = customName.trim() || 'Custom client';
    const seeded = applyCustomClient(name, {
      mode,
      opportunity: journey.brief || config.opportunity,
    }, brand);
    setBrand(seeded.brand);
    setConfig(seeded.config);
    setJourney(seeded.journey);
    setSpecId(crypto.randomUUID());
    setMessage(`Custom client “${name}” — freeform brand and journey. No preset skin lock.`);
  }, [brand, config.opportunity, customName, journey.brief, mode]);

  const onTemplate = useCallback((id: TaskDoTemplateId) => {
    setConfig((prev) => applyTemplate(id, { ...prev, title: '', job: '', instructions: DEFAULT_CONFIG.instructions }));
    setSpecId(crypto.randomUUID());
  }, []);

  const copyShare = useCallback(async () => {
    const url = `${window.location.origin}${previewHref(draft)}`;
    await navigator.clipboard.writeText(url);
    setPersist('copied');
    setMessage('Preview link copied. Branding travels in the URL — imagery stays in this browser draft.');
  }, [draft]);

  const exportJson = useCallback(() => {
    const payload = { agentSpec: spec, journey, brand, config };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    const safe = (brand.displayName || 'task-do').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'task-do';
    anchor.href = url;
    anchor.download = `${safe}-pursuit-draft.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setPersist('exported');
    setMessage('AgentSpec + journey JSON downloaded. Open the AgentSpec in DO Office or keep the journey pack.');
  }, [brand, config, journey, spec]);

  const handoffToOffice = useCallback(() => {
    writeHandoffSpec(window.sessionStorage, spec, brand);
    writeLocalDraft(window.localStorage, draft);
    setPersist('handed-off');
    setMessage('Spec parked in this session for DO Office. Durable cloud save still needs sign-in on Builder jobs — this handoff is local and honest.');
    window.location.href = '/do/office?from=task-do-maker';
  }, [brand, draft, spec]);

  const previewBody = (
    <>
      <WidgetPreview
        brand={brand}
        config={config}
        spec={spec}
        mode={mode}
        railLabel={skin?.railLabel}
        journey={journey}
        large
      />
      {journey.sponsored.enabled ? (
        <SponsoredPreview journey={journey} />
      ) : null}
      <p className={styles.honesty}>
        Preview only. This DO drafts work for review. Nothing is sent, connected or claimed live from this link.
      </p>
      {mode === 'partner' ? <p className={styles.poweredBy}>{POWERED_BY_ASSEMBL}</p> : null}
    </>
  );

  if (previewOnly) {
    return (
      <div
        className={`${styles.shell} ${mode === 'partner' ? styles.partnerShell : ''}`}
        style={{
          ['--partner-accent' as string]: brand.accent,
          ['--partner-accent-2' as string]: brand.accentSecondary,
        }}
        data-mode={mode}
      >
        <header className={styles.topbar}>
          <div className={styles.navBrandCol}>
            <div className={styles.navBrandRow}>
              {mode === 'partner' ? (
                <>
                  <span className={styles.brand}>{brand.displayName}</span>
                  <span className={styles.slash}>/</span>
                  <span>task helper</span>
                </>
              ) : (
                <>
                  <Link href="/" className={styles.brand}>assembl</Link>
                  <span className={styles.slash}>/</span>
                  <Link href="/studio">studio</Link>
                  <span className={styles.slash}>/</span>
                  <span>task do preview</span>
                </>
              )}
            </div>
            <p className={styles.demoBadge}>scripted · draft-only · DEMO</p>
          </div>
          <nav aria-label="Preview">
            <Link href={`/studio/do-maker?${draftToSearchParams(draft).toString()}`}>edit in maker</Link>
            {mode === 'pursuit' ? <Link href="/pursuit">Pursuit</Link> : null}
          </nav>
        </header>
        <main className={styles.previewPage}>
          <OutreachGateOverlay draftId={specId} outreach={journey.outreach}>
            {previewBody}
          </OutreachGateOverlay>
        </main>
      </div>
    );
  }

  return (
    <div
      className={`${styles.shell} ${mode === 'partner' ? styles.partnerShell : ''}`}
      style={{
        ['--partner-accent' as string]: brand.accent,
        ['--partner-accent-2' as string]: brand.accentSecondary,
      }}
      data-mode={mode}
    >
      <header className={styles.topbar}>
        <div className={styles.navBrandCol}>
          <div className={styles.navBrandRow}>
            {mode === 'partner' ? (
              <>
                <span className={styles.brand}>{brand.displayName || 'partner'}</span>
                <span className={styles.slash}>/</span>
                <span>maker</span>
              </>
            ) : (
              <>
                <Link href="/" className={styles.brand}>assembl</Link>
                <span className={styles.slash}>/</span>
                <Link href="/studio">studio</Link>
                <span className={styles.slash}>/</span>
                <span>task do maker</span>
              </>
            )}
          </div>
          <p className={styles.demoBadge}>
            {mode === 'partner' ? 'partner skin · draft-only · DEMO' : 'pursuit desk · draft-only · DEMO'}
          </p>
        </div>
        <nav aria-label="Maker destinations">
          <Link href={makerHref({ mode: 'pursuit', opportunity: 'Service quote preparation', task: 'research-brief', template: 'research-brief' })}>Mode A · Pursuit</Link>
          <Link href={partnerMakerHref('bp')}>Mode B · bp Road-Ready</Link>
          <Link href={partnerMakerHref('warehouse')}>Mode B · Warehouse</Link>
          <Link href={PURSUIT_PLAYGROUND_PATH}>Public playground</Link>
          <Link href="/do/office">DO Office</Link>
        </nav>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>
              {mode === 'partner' ? 'Partner desk · PREVIEW' : 'Studio · Pursuit desk · PREVIEW'}
            </p>
            <h1>{mode === 'partner' ? 'Assemble the client demo.' : 'Assemble a Pursuit demo.'}</h1>
            <p className={styles.heroCopy}>
              {mode === 'partner'
                ? 'Start from a partner skin or a custom client. Edit the journey, attach brand imagery, and wire a Sponsored Agent module — drafts-only, no fake live connections.'
                : 'Freeform client, editable journey steps, optional Sponsored Agent advertising, and an outreach gate before deeper DEMO. Not locked to dropdown verticals.'}
            </p>
          </div>
          <div className={styles.heroMeta}>
            <div className={styles.modeSwitch} role="group" aria-label="Maker mode">
              <button type="button" aria-pressed={mode === 'pursuit'} onClick={() => setMode('pursuit')}>Pursuit</button>
              <button type="button" aria-pressed={mode === 'partner'} onClick={() => setMode('partner')}>Partner</button>
            </div>
            <span>Browser draft · {persist === 'idle' ? 'unsaved' : persist}</span>
          </div>
        </section>

        <aside className={styles.handoff} aria-label="Client starters">
          <p className={styles.eyebrow}>Client starters · editable after load</p>
          <div className={styles.skinRow}>
            {PARTNER_SLUGS.map((slug) => {
              const item = PARTNER_SKINS[slug];
              return (
                <button
                  key={slug}
                  type="button"
                  className={styles.skinChip}
                  aria-pressed={config.partnerSlug === slug}
                  onClick={() => {
                    if (mode !== 'partner') setMode('partner');
                    onPartnerSkin(slug);
                  }}
                  style={{ ['--skin-accent' as string]: item.brand.accent }}
                >
                  <strong>{item.productName}</strong>
                  <span>{item.verticalHint} · {item.railLabel}</span>
                </button>
              );
            })}
          </div>
          <div className={styles.customClientRow}>
            <label>
              Custom client name
              <input
                value={customName}
                onChange={(event) => setCustomName(event.target.value)}
                placeholder="Northside Joinery"
                maxLength={80}
              />
            </label>
            <button type="button" className={styles.ghostBtn} onClick={onCustomClient}>
              Use custom client
            </button>
          </div>
          <p className={styles.skinNote}>
            {skin?.honesty || 'Skins are starters. Rename, recolour, upload imagery, and rewrite the journey freely.'}
            {skin?.slug === 'bp' ? ' BP seed: Loyalty Moment Concierge on Road-Ready — not a second BP skin.' : ''}
          </p>
        </aside>

        {(config.opportunity || journey.brief || journey.title) && (
          <aside className={styles.handoff} aria-label="Journey context">
            <p className={styles.eyebrow}>Journey context</p>
            <div>
              {journey.title ? <span><strong>Title</strong> {journey.title}</span> : null}
              {(journey.brief || config.opportunity) ? (
                <span><strong>Brief</strong> {journey.brief || config.opportunity}</span>
              ) : null}
              {skin ? <span><strong>Rail</strong> {skin.railLabel}</span> : null}
              {journey.sponsored.enabled ? <span><strong>Sponsored</strong> on · ASA labelled</span> : null}
            </div>
          </aside>
        )}

        <div className={styles.grid}>
          <section className={styles.panel} aria-labelledby="brand-title">
            <div className={styles.sectionHead}>
              <span>01</span>
              <div>
                <strong id="brand-title">{mode === 'partner' ? 'Partner skin' : 'White-label'}</strong>
                <p>Client name and colour tokens. Imagery uploads sit in the journey builder.</p>
              </div>
            </div>
            <div className={styles.fields}>
              <label>
                {mode === 'partner' ? 'Product / brand name' : 'Brand / display name'}
                <input
                  value={brand.displayName}
                  onChange={(event) => setBrand((prev) => ({ ...prev, displayName: event.target.value }))}
                  maxLength={80}
                  placeholder={mode === 'partner' ? 'bp Road-Ready' : 'Northside Joinery'}
                />
              </label>
              <div className={styles.colourRow}>
                <label>
                  Accent
                  <input
                    type="color"
                    value={brand.accent}
                    onChange={(event) => setBrand((prev) => ({ ...prev, accent: event.target.value }))}
                  />
                </label>
                <label>
                  Secondary
                  <input
                    type="color"
                    value={brand.accentSecondary}
                    onChange={(event) => setBrand((prev) => ({ ...prev, accentSecondary: event.target.value }))}
                  />
                </label>
              </div>
              <label>
                Logo URL <em>optional · or upload a mark below</em>
                <input
                  value={brand.logoUrl.startsWith('data:') ? '' : brand.logoUrl}
                  onChange={(event) => setBrand((prev) => ({ ...prev, logoUrl: event.target.value }))}
                  maxLength={500}
                  placeholder="https://…"
                  inputMode="url"
                />
              </label>
              <label>
                Short promise
                <input
                  value={brand.promise}
                  onChange={(event) => setBrand((prev) => ({ ...prev, promise: event.target.value }))}
                  maxLength={180}
                />
              </label>
            </div>
          </section>

          <section className={styles.panel} aria-labelledby="task-title">
            <div className={styles.sectionHead}>
              <span>02</span>
              <div>
                <strong id="task-title">Task starters</strong>
                <p>Optional chips — rewrite title, job and boundaries freely.</p>
              </div>
            </div>
            <div className={styles.chips} role="group" aria-label="Starter templates">
              {templates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  aria-pressed={config.templateId === template.id}
                  onClick={() => onTemplate(template.id)}
                >
                  {template.label}
                </button>
              ))}
            </div>
            <div className={styles.fields}>
              <label>
                Task title
                <input
                  value={config.title}
                  onChange={(event) => setConfig((prev) => ({ ...prev, title: event.target.value }))}
                  maxLength={80}
                  placeholder={mode === 'partner' ? 'Loyalty Moment Concierge' : 'Research brief'}
                />
              </label>
              <label>
                One-line job
                <input
                  value={config.job}
                  onChange={(event) => setConfig((prev) => ({ ...prev, job: event.target.value }))}
                  maxLength={240}
                  placeholder="What this DO does"
                />
              </label>
              <label>
                Instructions / boundaries
                <textarea
                  value={config.instructions}
                  onChange={(event) => setConfig((prev) => ({ ...prev, instructions: event.target.value }))}
                  maxLength={1200}
                  rows={5}
                />
              </label>
            </div>
          </section>

          <section className={styles.previewPanel} aria-labelledby="preview-title">
            <div className={styles.sectionHead}>
              <span>03</span>
              <div>
                <strong id="preview-title">Portable preview</strong>
                <p>Widget stub + journey + sponsored walkthrough. Demo-ready, not connected.</p>
              </div>
            </div>
            <WidgetPreview brand={brand} config={config} spec={spec} mode={mode} railLabel={skin?.railLabel} journey={journey} />
            <div className={styles.actions}>
              <button type="button" onClick={() => void copyShare()}>Copy preview link</button>
              <button type="button" onClick={exportJson}>Export pack</button>
              <button type="button" className={styles.primaryAction} onClick={handoffToOffice}>
                Open in DO Office
              </button>
            </div>
            <p className={styles.status} role="status">{message}</p>
            {mode === 'partner' ? <p className={styles.poweredBy}>{POWERED_BY_ASSEMBL}</p> : null}
          </section>
        </div>

        <div className={styles.journeyGrid}>
          <JourneyBuilderPanel
            journey={journey}
            onChange={(next) => {
              setJourney(next);
              if (next.brief !== config.opportunity) {
                setConfig((prev) => ({ ...prev, opportunity: next.brief }));
              }
            }}
          />
          <SponsoredAgentPanel journey={journey} onChange={setJourney} />
          <OutreachGateEditor
            outreach={journey.outreach}
            onChange={(outreach) => setJourney((prev) => ({ ...prev, outreach }))}
          />
        </div>

        {journey.sponsored.enabled ? (
          <section className={styles.specPanel} aria-labelledby="sponsored-preview-title">
            <div className={styles.sectionHead}>
              <span>03b</span>
              <div>
                <strong id="sponsored-preview-title">Sponsored walkthrough</strong>
                <p>Ad/loyalty → branded agent → useful step → offer → Permit → action → receipt.</p>
              </div>
            </div>
            <SponsoredPreview journey={journey} />
          </section>
        ) : null}

        <section className={styles.specPanel} aria-labelledby="spec-title">
          <div className={styles.sectionHead}>
            <span>04</span>
            <div>
              <strong id="spec-title">AgentSpec + journey</strong>
              <p>Same portable AgentSpec shape — journey pack rides alongside for the Pursuit demo.</p>
            </div>
          </div>
          <pre>{JSON.stringify({ agentSpec: spec, journey: { ...journey, assets: { imageryDataUrl: journey.assets.imageryDataUrl ? '[data-url]' : '', markDataUrl: journey.assets.markDataUrl ? '[data-url]' : '' } } }, null, 2)}</pre>
        </section>
      </main>
    </div>
  );
}

function WidgetPreview({
  brand,
  config,
  spec,
  mode,
  railLabel,
  journey,
  large = false,
}: {
  brand: typeof DEFAULT_BRAND;
  config: typeof DEFAULT_CONFIG;
  spec: AgentSpec;
  mode: TaskDoMode;
  railLabel?: string;
  journey: PursuitJourney;
  large?: boolean;
}) {
  const title = journey.title.trim() || config.title.trim() || spec.name;
  const job = config.job.trim() || journey.brief.trim() || 'One bounded job. Drafts for review.';
  const hero = journey.assets.imageryDataUrl;
  return (
    <div className={large ? styles.widgetLarge : styles.widget} aria-label="White-label DO preview">
      {mode === 'partner' && railLabel ? (
        <div className={styles.partnerRail}><span>{railLabel}</span><em>drafts only</em></div>
      ) : null}
      {hero ? (
        <div className={styles.widgetHero}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={hero} alt="" />
        </div>
      ) : null}
      <div className={styles.sheet}>
        <div className={styles.sheetHead}>
          {brand.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={brand.logoUrl} alt="" className={styles.logo} onError={(event) => { (event.target as HTMLImageElement).style.display = 'none'; }} />
          ) : (
            <span className={styles.logoFallback} aria-hidden>{(brand.displayName || 'DO').slice(0, 1).toUpperCase()}</span>
          )}
          <div>
            <strong>{brand.displayName || 'your brand'}</strong>
            <span>{brand.promise}</span>
          </div>
        </div>
        <div className={styles.sheetBody}>
          <p className={styles.sheetLabel}>{mode === 'partner' ? 'Your helper' : 'Task DO'}</p>
          <h2>{title}</h2>
          <p>{job}</p>
          <ul>
            <li>Primitive · {spec.primitive}</li>
            <li>Send posture · drafts only</li>
            <li>Connector · hook later</li>
            {journey.sponsored.enabled ? <li>Sponsored module · ASA labelled</li> : null}
          </ul>
        </div>
        <div className={styles.sheetFoot}>
          <span>needs you</span>
          <span>{mode === 'partner' ? POWERED_BY_ASSEMBL : 'preview stub'}</span>
        </div>
      </div>
      <button type="button" className={styles.orb} aria-label={`${brand.displayName} DO orb preview`}>
        <span />
      </button>
    </div>
  );
}

function SponsoredPreview({ journey }: { journey: PursuitJourney }) {
  const [index, setIndex] = useState(0);
  const stage = journey.sponsored.stages[index];
  if (!stage) return null;
  return (
    <div className={styles.sponsoredPreview}>
      <div className={styles.sponsoredMeta}>
        {stage.showSponsoredLabel ? (
          <span className={styles.sponsoredPill}>{journey.sponsored.asaLabel}</span>
        ) : null}
        {stage.demoOnly ? <span className={styles.demoPill}>DEMO</span> : null}
        <span className={styles.sheetLabel}>
          {index + 1} / {journey.sponsored.stages.length}
        </span>
      </div>
      <h3>{stage.label}</h3>
      <p>{stage.copy}</p>
      <div className={styles.actions}>
        <button type="button" disabled={index === 0} onClick={() => setIndex((v) => Math.max(0, v - 1))}>
          Back
        </button>
        <button
          type="button"
          className={styles.primaryAction}
          disabled={index >= journey.sponsored.stages.length - 1}
          onClick={() => setIndex((v) => Math.min(journey.sponsored.stages.length - 1, v + 1))}
        >
          Next stage
        </button>
      </div>
      <p className={styles.skinNote}>{journey.sponsored.honesty}</p>
    </div>
  );
}
