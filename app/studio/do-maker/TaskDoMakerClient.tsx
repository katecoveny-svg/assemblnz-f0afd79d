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
  type PartnerSlug,
  type TaskDoDraft,
  type TaskDoMode,
  type TaskDoTemplateId,
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
import styles from './do-maker.module.css';

type PersistState = 'idle' | 'browser' | 'copied' | 'exported' | 'handed-off';

function downloadSpec(spec: AgentSpec, brandName: string) {
  const blob = new Blob([JSON.stringify(spec, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  const safe = (brandName || 'task-do').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'task-do';
  anchor.href = url;
  anchor.download = `${safe}-agentspec.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

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
      search.get('preview'),
  );
}

function seedDraft(search: { get(name: string): string | null }): { draft: TaskDoDraft; fromBrowser: boolean } {
  if (hasMakerContext(search)) {
    return { draft: draftFromSearchParams(search), fromBrowser: false };
  }
  if (typeof window !== 'undefined') {
    const local = readLocalDraft(window.localStorage);
    if (local) return { draft: local, fromBrowser: true };
  }
  return { draft: draftFromParts(DEFAULT_BRAND, DEFAULT_CONFIG), fromBrowser: false };
}

export function TaskDoMakerClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const previewOnly = isPreviewMode(searchParams);

  const initial = useMemo(() => seedDraft(searchParams), []);
  const [brand, setBrand] = useState(initial.draft.brand);
  const [config, setConfig] = useState(initial.draft.config);
  const [persist, setPersist] = useState<PersistState>(initial.fromBrowser ? 'browser' : 'idle');
  const [message, setMessage] = useState(
    initial.fromBrowser
      ? 'Restored the last draft saved in this browser.'
      : 'Drafts stay in this browser until you export or hand off to DO.',
  );
  const [specId, setSpecId] = useState(() => crypto.randomUUID());

  const mode = config.mode;
  const skin = config.partnerSlug ? PARTNER_SKINS[config.partnerSlug] : undefined;
  const templates = useMemo(() => templatesForMode(mode), [mode]);
  const draft: TaskDoDraft = useMemo(() => draftFromParts(brand, config), [brand, config]);
  const spec = useMemo(
    () => compileTaskDoSpec(brand, config, { id: specId }),
    [brand, config, specId],
  );

  useEffect(() => {
    if (previewOnly) return;
    const timer = window.setTimeout(() => {
      const params = draftToSearchParams(draft);
      router.replace(`?${params.toString()}`, { scroll: false });
      writeLocalDraft(window.localStorage, draft);
      setPersist('browser');
    }, 400);
    return () => window.clearTimeout(timer);
  }, [draft, previewOnly, router]);

  const setMode = useCallback((next: TaskDoMode) => {
    if (next === 'partner') {
      const slug = (config.partnerSlug || 'bp') as PartnerSlug;
      const seeded = applyPartnerSkin(slug, { opportunity: config.opportunity });
      setBrand(seeded.brand);
      setConfig(seeded.config);
    } else {
      const nextConfig = applyTemplate('research-brief', {
        ...DEFAULT_CONFIG,
        mode: 'pursuit',
        partnerSlug: null,
        opportunity: config.opportunity,
        partner: '',
        task: 'research-brief',
      });
      setBrand(DEFAULT_BRAND);
      setConfig(nextConfig);
    }
    setSpecId(crypto.randomUUID());
    setMessage(next === 'partner'
      ? 'Partner mode — customer-facing skin. Assembl attribution stays minimal.'
      : 'Pursuit mode — Studio pitch surface with opportunity handoff.');
  }, [config.opportunity, config.partnerSlug]);

  const onPartnerSkin = useCallback((slug: PartnerSlug) => {
    const seeded = applyPartnerSkin(slug, { opportunity: config.opportunity });
    setBrand(seeded.brand);
    setConfig(seeded.config);
    setSpecId(crypto.randomUUID());
    setMessage(`${PARTNER_SKINS[slug].productName} demo skin loaded. ${PARTNER_SKINS[slug].honesty}`);
  }, [config.opportunity]);

  const onTemplate = useCallback((id: TaskDoTemplateId) => {
    setConfig((prev) => applyTemplate(id, { ...prev, title: '', job: '', instructions: DEFAULT_CONFIG.instructions }));
    setSpecId(crypto.randomUUID());
  }, []);

  const copyShare = useCallback(async () => {
    const url = `${window.location.origin}${previewHref(draft)}`;
    await navigator.clipboard.writeText(url);
    setPersist('copied');
    setMessage('Preview link copied. Branding travels in the URL — no partner API claimed.');
  }, [draft]);

  const exportJson = useCallback(() => {
    downloadSpec(spec, brand.displayName);
    setPersist('exported');
    setMessage('AgentSpec JSON downloaded. Open it in DO Office or keep it as a portable draft.');
  }, [brand.displayName, spec]);

  const handoffToOffice = useCallback(() => {
    writeHandoffSpec(window.sessionStorage, spec, brand);
    writeLocalDraft(window.localStorage, draft);
    setPersist('handed-off');
    setMessage('Spec parked in this session for DO Office. Durable cloud save still needs sign-in on Builder jobs — this handoff is local and honest.');
    window.location.href = '/do/office?from=task-do-maker';
  }, [brand, draft, spec]);

  if (previewOnly) {
    return (
      <div
        className={`${styles.shell} ${mode === 'partner' ? styles.partnerShell : ''}`}
        style={{ ['--maker-accent' as string]: brand.accent, ['--maker-accent-2' as string]: brand.accentSecondary }}
        data-mode={mode}
      >
        <header className={styles.topbar}>
          <div>
            {mode === 'partner' ? (
              <>
                <span className={styles.brand}>{brand.displayName}</span>
                <span className={styles.slash}>/</span>
                <span>task helper</span>
                <span className={styles.preview}>partner demo</span>
              </>
            ) : (
              <>
                <Link href="/" className={styles.brand}>assembl</Link>
                <span className={styles.slash}>/</span>
                <Link href="/studio">studio</Link>
                <span className={styles.slash}>/</span>
                <span>task do preview</span>
                <span className={styles.preview}>demo</span>
              </>
            )}
          </div>
          <nav aria-label="Preview">
            <Link href={`/studio/do-maker?${draftToSearchParams(draft).toString()}`}>edit in maker</Link>
            {mode === 'pursuit' ? <Link href="/pursuit">Pursuit</Link> : null}
          </nav>
        </header>
        <main className={styles.previewPage}>
          <WidgetPreview brand={brand} config={config} spec={spec} mode={mode} railLabel={skin?.railLabel} large />
          <p className={styles.honesty}>
            Preview only. This DO drafts work for review. Nothing is sent, connected or claimed live from this link.
          </p>
          {mode === 'partner' ? <p className={styles.poweredBy}>{POWERED_BY_ASSEMBL}</p> : null}
        </main>
      </div>
    );
  }

  return (
    <div
      className={`${styles.shell} ${mode === 'partner' ? styles.partnerShell : ''}`}
      style={{ ['--maker-accent' as string]: brand.accent, ['--maker-accent-2' as string]: brand.accentSecondary }}
      data-mode={mode}
    >
      <header className={styles.topbar}>
        <div>
          {mode === 'partner' ? (
            <>
              <span className={styles.brand}>{brand.displayName || 'partner'}</span>
              <span className={styles.slash}>/</span>
              <span>maker</span>
              <span className={styles.preview}>partner</span>
            </>
          ) : (
            <>
              <Link href="/" className={styles.brand}>assembl</Link>
              <span className={styles.slash}>/</span>
              <Link href="/studio">studio</Link>
              <span className={styles.slash}>/</span>
              <span>task do maker</span>
              <span className={styles.preview}>pursuit</span>
            </>
          )}
        </div>
        <nav aria-label="Maker destinations">
          <Link href={makerHref({ mode: 'pursuit', opportunity: 'Service quote preparation', task: 'research-brief', template: 'research-brief' })}>Mode A · Pursuit</Link>
          <Link href={partnerMakerHref('bp')}>Mode B · bp</Link>
          <Link href={partnerMakerHref('warehouse')}>Mode B · Warehouse</Link>
          <Link href="/do/office">DO Office</Link>
        </nav>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>
              {mode === 'partner' ? 'Partner-facing DO maker' : 'Studio · Pursuit handoff'}
            </p>
            <h1>{mode === 'partner' ? 'Your customers’ task helper.' : 'Mint a task DO.'}</h1>
            <p className={styles.heroCopy}>
              {mode === 'partner'
                ? 'Partner skin first. Rewarded wait and drafts-only utility. Assembl stays a small credit — no fake live connections.'
                : 'Narrow job, partner colours, drafts-only by default. Export a real AgentSpec for DO Office — not a full family OS.'}
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

        {mode === 'partner' ? (
          <aside className={styles.handoff} aria-label="Partner skins">
            <p className={styles.eyebrow}>Demo partner skins</p>
            <div className={styles.skinRow}>
              {PARTNER_SLUGS.map((slug) => {
                const item = PARTNER_SKINS[slug];
                return (
                  <button
                    key={slug}
                    type="button"
                    className={styles.skinChip}
                    aria-pressed={config.partnerSlug === slug}
                    onClick={() => onPartnerSkin(slug)}
                    style={{ ['--skin-accent' as string]: item.brand.accent }}
                  >
                    <strong>{item.productName}</strong>
                    <span>{item.railLabel}</span>
                  </button>
                );
              })}
            </div>
            <p className={styles.skinNote}>{skin?.honesty || 'Offline config objects only — not live OAuth.'}</p>
          </aside>
        ) : null}

        {(config.opportunity || (mode === 'pursuit' && (config.partner || config.task))) && (
          <aside className={styles.handoff} aria-label={mode === 'partner' ? 'Context' : 'Pursuit context'}>
            <p className={styles.eyebrow}>{mode === 'partner' ? 'Context' : 'From Pursuit'}</p>
            <div>
              {config.opportunity ? <span><strong>Opportunity</strong> {config.opportunity}</span> : null}
              {mode === 'pursuit' && config.partner ? <span><strong>Partner</strong> {config.partner}</span> : null}
              {config.task ? <span><strong>Task</strong> {config.task}</span> : null}
              {skin ? <span><strong>Rail</strong> {skin.railLabel}</span> : null}
            </div>
          </aside>
        )}

        <div className={styles.grid}>
          <section className={styles.panel} aria-labelledby="brand-title">
            <div className={styles.sectionHead}>
              <span>01</span>
              <div>
                <strong id="brand-title">{mode === 'partner' ? 'Partner skin' : 'White-label'}</strong>
                <p>
                  {mode === 'partner'
                    ? 'Product name and colours customers see. Assembl credit stays secondary.'
                    : 'Partner-facing name, colours and promise for the Pursuit pitch.'}
                </p>
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
                Logo URL <em>optional</em>
                <input
                  value={brand.logoUrl}
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
                <strong id="task-title">Task</strong>
                <p>
                  {mode === 'partner'
                    ? 'Rewarded wait and wait-time utility. Drafts-only by default — no scrape claims.'
                    : 'One job. Boundaries stay drafts-only unless you change them deliberately.'}
                </p>
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
                  placeholder={mode === 'partner' ? 'Rewarded wait' : 'Research brief'}
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
                <p>
                  {mode === 'partner'
                    ? 'Customer-facing widget stub with partner rail. Demo-ready, not connected.'
                    : 'Orb + chat sheet stub with your colours. Demo-ready, not connected.'}
                </p>
              </div>
            </div>
            <WidgetPreview brand={brand} config={config} spec={spec} mode={mode} railLabel={skin?.railLabel} />
            <div className={styles.actions}>
              <button type="button" onClick={() => void copyShare()}>Copy preview link</button>
              <button type="button" onClick={exportJson}>Export AgentSpec</button>
              <button type="button" className={styles.primaryAction} onClick={handoffToOffice}>
                Open in DO Office
              </button>
            </div>
            <p className={styles.status} role="status">{message}</p>
            {mode === 'partner' ? <p className={styles.poweredBy}>{POWERED_BY_ASSEMBL}</p> : null}
          </section>
        </div>

        <section className={styles.specPanel} aria-labelledby="spec-title">
          <div className={styles.sectionHead}>
            <span>04</span>
            <div>
              <strong id="spec-title">AgentSpec</strong>
              <p>Same portable shape for both modes — DO Office and companions already understand it.</p>
            </div>
          </div>
          <pre>{JSON.stringify(spec, null, 2)}</pre>
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
  large = false,
}: {
  brand: typeof DEFAULT_BRAND;
  config: typeof DEFAULT_CONFIG;
  spec: AgentSpec;
  mode: TaskDoMode;
  railLabel?: string;
  large?: boolean;
}) {
  const title = config.title.trim() || spec.name;
  const job = config.job.trim() || 'One bounded job. Drafts for review.';
  return (
    <div className={large ? styles.widgetLarge : styles.widget} aria-label="White-label DO preview">
      {mode === 'partner' && railLabel ? (
        <div className={styles.partnerRail}><span>{railLabel}</span><em>drafts only</em></div>
      ) : null}
      <div className={styles.sheet}>
        <div className={styles.sheetHead}>
          {brand.logoUrl ? (
            // Optional partner logo URL entered by the maker — remote host unknown.
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
