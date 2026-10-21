'use client';

/**
 * assembl / living — product widget (client)
 * ------------------------------------------
 * Renders one product's choices, a schematic preview, honest estimates and
 * the item configuration. Inside an iframe on a store page it posts the item
 * to the parent, where the loader (public/living/widget.js) attaches it to
 * the store's own add-to-cart form. It never adds to a cart itself.
 */

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { buildItem, defaultAccent, itemMessage, needsAccent, printFile, printSheet, textSpecFor, widgetSpec, type ItemConfiguration, type WidgetMessage, type WidgetSpec } from '@/lib/living';
import { assemblyViews } from '@/lib/living/assembly';
import { fredoka } from '../../fonts';
import { POD_CONTENTS, POD_CONTENTS_NOTE } from '@/lib/living/pod-contents';

/** dayrally surfaces: cream stage behind the part, the Fredoka face for slate lettering. */
const DAYRALLY_STAGE = '#efe6d6';
const LIVING_STAGE = '#f5f1f2';

type Props = { handle: string; embed: boolean; origin: string | null };

const PartPreview3D = dynamic(() => import('./PartPreview3D'), { ssr: false, loading: () => <p className="lvw-counter">loading the print file…</p> });
const GlbPreview3D = dynamic(() => import('./GlbPreview3D'), { ssr: false, loading: () => <p className="lvw-counter">loading the assembled view…</p> });
const AssemblyPreview3D = dynamic(() => import('./AssemblyPreview3D'), { ssr: false, loading: () => <p className="lvw-counter">assembling the print files…</p> });

function post(message: WidgetMessage, origin: string | null) {
  if (typeof window === 'undefined' || window.parent === window) return;
  window.parent.postMessage(message, origin ?? '*');
}

export function ProductWidget({ handle, embed, origin }: Props) {
  const spec = useMemo(() => widgetSpec(handle), [handle]);
  if (!spec) return <p className="lv-small">Unknown product.</p>;
  return <Widget spec={spec} embed={embed} origin={origin} />;
}

function Widget({ spec, embed, origin }: { spec: WidgetSpec; embed: boolean; origin: string | null }) {
  const [colour, setColour] = useState(spec.colours[0].id);
  const [accent, setAccent] = useState<string | null>(null);
  const [choices, setChoices] = useState<Record<string, string>>(() => Object.fromEntries(spec.choices.map((c) => [c.key, c.defaultId])));
  const [text, setText] = useState('');
  const [qty, setQty] = useState(1);
  const [copied, setCopied] = useState(false);
  // The real print file is the preview wherever one is served; the schematic is the fallback and a toggle.
  const [view, setView] = useState<'schematic' | '3d'>(() => (spec.glb || spec.partsFor(Object.fromEntries(spec.choices.map((c) => [c.key, c.defaultId]))).some((p) => printFile(p.id).file) ? '3d' : 'schematic'));
  const root = useRef<HTMLDivElement>(null);
  const dayrally = spec.colourSet === 'dayrally';
  const [displayFont, setDisplayFont] = useState<string | null>(null);
  useEffect(() => {
    if (!dayrally || !root.current) return;
    const fam = getComputedStyle(root.current).getPropertyValue('--font-dayrally').trim();
    setDisplayFont(fam || null);
  }, [dayrally]);

  const parts = useMemo(() => spec.partsFor(choices), [spec, choices]);
  const partIds = parts.map((p) => p.id);
  // The assembled views: every part in its place, from the assembly definition the renders use too.
  const views = assemblyViews(spec.handle, partIds);
  const [viewIndex, setViewIndex] = useState(0);
  const assembled = views[Math.min(viewIndex, Math.max(0, views.length - 1))] ?? null;
  const accentNeeded = spec.roles ? partIds.some((id) => spec.roles?.[id] === 'accent') : needsAccent(partIds);
  const textSpec = textSpecFor(partIds);
  const bodyColour = spec.colours.find((c) => c.id === colour) ?? spec.colours[0];
  const accentColour = accentNeeded ? spec.colours.find((c) => c.id === accent) ?? defaultAccent(spec.colours, bodyColour) : null;

  const result = useMemo(
    () => buildItem({ handle: spec.handle, colour, accent: accentColour?.id ?? null, choices, text, qty }),
    [spec.handle, colour, accentColour?.id, choices, text, qty],
  );

  // Tell the host page about every change: the item when it is complete, the reasons when it is not.
  useEffect(() => {
    if (!embed) return;
    post(result.ok ? itemMessage(result.item) : { type: 'assembl:invalid', issues: result.issues }, origin);
  }, [embed, origin, result]);

  useEffect(() => {
    if (!embed || !root.current) return;
    post({ type: 'assembl:ready', handle: spec.handle }, origin);
    const el = root.current;
    const ro = new ResizeObserver(() => post({ type: 'assembl:size', height: el.scrollHeight + 8 }, origin));
    ro.observe(el);
    return () => ro.disconnect();
  }, [embed, origin, spec.handle]);

  const download = () => {
    if (!result.ok) return;
    const blob = new Blob([printSheet(result.item)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${result.item.sku ?? spec.handle}-print-sheet.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const copy = async () => {
    if (!result.ok) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(result.item, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  // The main part: heaviest body part. Its print file drives both previews.
  const main = spec.glb
    ? { name: spec.title, file: null as null | { path: string }, dims_mm: { x: spec.size.length ? 1 : 1, y: 1, z: 1 } }
    : parts.map((p) => printFile(p.id)).filter((f) => f.file || parts.length === 1).sort((a, b) => b.mass_g_pla - a.mass_g_pla)[0] ?? printFile(parts[0].id);
  const dims = main.dims_mm;
  const pattern = choices.lid ?? choices.shape ?? null;
  const textPart = textSpec && !spec.glb ? printFile(textSpec.partId) : null;
  const has3d = Boolean(main.file) || Boolean(spec.glb);
  const accentParts = spec.roles ? Object.entries(spec.roles).filter(([, r]) => r === 'accent').map(([id]) => id) : [];

  return (
    <div ref={root} className={`lv lvw ${fredoka.variable}`} data-embed={embed ? 'true' : 'false'} data-line={dayrally ? 'dayrally' : 'living'}>
      {dayrally ? (
        <div className="lvw-band">
          <span className="lv-eyebrow">dayrally · by assembl / living · made to order</span>
          <div className="lvw-mark">
            <span className="lvw-wordmark">dayrally</span>
            <KeyGlyph />
            <p className="lvw-line">one system. endless days.</p>
          </div>
          <span className="lv-status" data-tone="quiet">{statusLine(spec)}</span>
        </div>
      ) : (
        <div className="lvw-head">
          <span className="lv-eyebrow">assembl / living · made to order</span>
          <span className="lv-status" data-tone="quiet">{statusLine(spec)}</span>
        </div>
      )}
      <div className="lvw-grid">
        <div className="lvw-preview">
          <div className="lvw-stage" aria-hidden={view === 'schematic'}>
            {view === '3d' && assembled ? (
              <Suspense fallback={<p className="lvw-counter">assembling the print files…</p>}>
                <AssemblyPreview3D view={assembled} body={bodyColour.hex} accent={accentColour?.hex ?? null} text={textSpec ? text.trim() : ''} font={dayrally ? displayFont : null} stage={dayrally ? DAYRALLY_STAGE : LIVING_STAGE} />
              </Suspense>
            ) : view === '3d' && spec.glb ? (
              <Suspense fallback={<p className="lvw-counter">loading the assembled view…</p>}>
                <GlbPreview3D path={spec.glb} body={bodyColour.hex} accent={accentColour?.hex ?? null} accentParts={accentParts} stage={dayrally ? DAYRALLY_STAGE : LIVING_STAGE} />
              </Suspense>
            ) : view === '3d' && main.file ? (
              <Suspense fallback={<p className="lvw-counter">loading the print file…</p>}>
                <PartPreview3D path={main.file.path} dims={dims} body={bodyColour.hex} accent={accentColour?.hex ?? null} text={textSpec ? text.trim() : ''} textSize={textPart ? { x: textPart.dims_mm.x, y: textPart.dims_mm.y } : null} stage={dayrally ? DAYRALLY_STAGE : LIVING_STAGE} font={dayrally ? displayFont : null} />
              </Suspense>
            ) : spec.previewImage ? (
              // eslint-disable-next-line @next/next/no-img-element -- CAD-derived preview served from the public pack; no optimisation pipeline for these.
              <img src={spec.previewImage} alt={`${spec.title}, CAD preview as delivered`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <Preview body={bodyColour.hex} accent={accentColour?.hex ?? null} text={textSpec ? text : ''} dims={dims} pattern={pattern} round={spec.colourSet === 'dayrally'} />
            )}
          </div>
          <div className="lvw-label">
            <p className="lvw-counter">{view === '3d' && assembled ? `assembled from its ${assembled.parts.length} print files · ${spec.revision} · your colours and name, live · drag to turn` : view === '3d' ? `${main.name.replace(/\s*\(sample:[^)]*\)/i, '')} · ${spec.revision} ${spec.glb ? 'assembled view' : 'print file'} · drag to turn` : spec.previewImage ? `CAD preview as delivered · ${spec.size}` : `Schematic · ${spec.size}`} · colours are filament names</p>
            {view === '3d' && views.length > 1 && (
              <div className="lv-chips" role="group" aria-label="View">
                {views.map((v, i) => (
                  <button key={v.name} type="button" className="lv-chip" aria-pressed={i === viewIndex} onClick={() => setViewIndex(i)}>{v.name}</button>
                ))}
              </div>
            )}
            {has3d && (
              <button type="button" className="lv-btn" data-variant="small" style={{ background: 'transparent', color: 'var(--lv-plum)', borderColor: 'var(--lv-line-strong)' }} onClick={() => setView((v) => (v === '3d' ? 'schematic' : '3d'))}>
                {view === '3d' ? 'schematic' : 'view in 3D'}
              </button>
            )}
          </div>
          {POD_CONTENTS[spec.handle] && (
            <section className="lvw-contents" aria-label="Example contents">
              <h3>what could go inside.</h3>
              <p className="lv-small">{POD_CONTENTS_NOTE}</p>
              <p className="lvw-counter">Fixed examples below. Your colour, lid and insert choices are set in the controls.</p>
              <div className="lvw-contents-grid">
                {POD_CONTENTS[spec.handle].map((example) => (
                  <figure key={example.image}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- fixed, publicly served CAD example */}
                    <img src={`/living/renders/${example.image}.jpg`} alt={`${example.label}. ${POD_CONTENTS_NOTE}`} width={1600} height={1200} loading="lazy" />
                    <figcaption>{example.label}</figcaption>
                  </figure>
                ))}
              </div>
              <p className="lvw-counter">Pod designs include the chosen lid, insert and two TURN connector keys. Everyday objects shown inside are not included.</p>
            </section>
          )}
        </div>

        <div className="lvw-controls">
          <div>
            <h2>{spec.title}</h2>
            <p className="lv-small">{spec.blurb}</p>
          </div>

          {spec.lines.length > 0 && (
            <div className="lv-field">
              <div className="lvw-label"><b>In the kit</b><span className="lvw-counter">one colour, printed together</span></div>
              <ul className="lvw-lines">
                {spec.lines.map((l) => <li key={l.handle}><span>{l.qty} ×</span> {l.title}</li>)}
              </ul>
            </div>
          )}

          <div className="lv-field">
            <div className="lvw-label"><b>Colour</b><span className="lvw-counter">{bodyColour.name}</span></div>
            <div className="lvw-swatches" role="group" aria-label="Colour">
              {spec.colours.map((c) => (
                <button key={c.id} type="button" className="lvw-swatch" style={{ background: c.hex }} title={c.name} aria-label={c.name} aria-pressed={c.id === bodyColour.id} onClick={() => setColour(c.id)} />
              ))}
            </div>
          </div>

          {accentNeeded && accentColour && (
            <div className="lv-field">
              <div className="lvw-label"><b>Accent</b><span className="lvw-counter">{accentColour.name} · lettering and inlays</span></div>
              <div className="lvw-swatches" role="group" aria-label="Accent colour">
                {spec.colours.filter((c) => c.id !== bodyColour.id).map((c) => (
                  <button key={c.id} type="button" className="lvw-swatch" style={{ background: c.hex }} title={c.name} aria-label={c.name} aria-pressed={c.id === accentColour.id} onClick={() => setAccent(c.id)} />
                ))}
              </div>
            </div>
          )}

          {spec.choices.map((c) => (
            <div className="lv-field" key={c.key}>
              <div className="lvw-label"><b>{c.label}</b></div>
              <div className="lv-chips" role="group" aria-label={c.label}>
                {c.options.map((o) => (
                  <button key={o.id} type="button" className="lv-chip" aria-pressed={choices[c.key] === o.id} onClick={() => setChoices((s) => ({ ...s, [c.key]: o.id }))}>{o.label}</button>
                ))}
              </div>
            </div>
          ))}

          {textSpec && (
            <div className="lv-field">
              <label className="lvw-label" htmlFor={`lvw-text-${spec.handle}`}><b>{textSpec.label}</b><span className="lvw-counter">{text.trim().length} / {textSpec.maxChars}</span></label>
              <input id={`lvw-text-${spec.handle}`} className="lv-input" value={text} maxLength={textSpec.maxChars} inputMode={textSpec.pattern.source.includes('0-9]*') && !textSpec.pattern.source.includes('A-Z') ? 'numeric' : 'text'} placeholder={textSpec.hint} onChange={(e) => setText(e.target.value)} />
            </div>
          )}

          <div className="lv-field">
            <div className="lvw-label"><b>Quantity</b></div>
            <div className="lvw-qty">
              <button type="button" aria-label="Fewer" disabled={qty <= 1} onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
              <output aria-live="polite">{qty}</output>
              <button type="button" aria-label="More" disabled={qty >= 20} onClick={() => setQty((q) => Math.min(20, q + 1))}>+</button>
            </div>
          </div>

          {result.ok ? <Estimate item={result.item} /> : (
            <ul className="lvw-issues" aria-live="polite">{result.issues.map((i) => <li key={i}>{i}</li>)}</ul>
          )}

          {embed ? (
            <p className="lvw-applied">
              <span className="lv-status" data-tone={result.ok ? 'ok' : 'quiet'}>{result.ok ? 'applied to this page' : 'finish the choices'}</span>
              <span>{result.ok ? 'Your choices travel with the add-to-cart button on this page.' : 'The add-to-cart button waits for a complete item.'}</span>
            </p>
          ) : (
            <div className="lv-actions">
              <button type="button" className="lv-btn" disabled={!result.ok} onClick={download}>download print sheet</button>
              <button type="button" className="lv-btn" data-variant="ghost" disabled={!result.ok} onClick={copy}>{copied ? 'copied' : 'copy configuration'}</button>
              {spec.colourSet === 'living' && spec.kind !== 'prototype' && <Link className="lv-btn" data-variant="ghost" href={spec.kind === 'kit' ? `/living/studio?kit=${spec.handle.replace('al-kit-', '')}` : '/living/studio'}>{spec.kind === 'kit' ? 'arrange it on a wall' : 'plan a whole wall'}</Link>}
            </div>
          )}
        </div>
      </div>
      <div className="lvw-foot">
        <p className="lvw-counter">{result.ok ? `${result.item.sku ?? 'no code'} · ${result.item.interface.pack} · ${result.item.printFiles.length} print files` : `${spec.handle} · ${spec.colourSet} colours`}</p>
        <p className="lv-small">{spec.kind === 'prototype' ? (spec.handle.startsWith('lab-') ? 'Lab item: designed in the v0.3 pipeline and checked digitally, never printed, no price. The store must not list it until a test print passes.' : 'AC-02 digital prototype: real CAD, never printed, not approved for manufacture, no price. The store must not list it until samples pass.') : embed ? 'Nothing is bought here. Price, stock and checkout belong to the store page.' : 'Nothing is for sale here yet. Estimates are planning figures, not a quote.'}</p>
      </div>
    </div>
  );
}

function statusLine(spec: WidgetSpec): string {
  if (spec.kind === 'prototype') return spec.handle.startsWith('lab-') ? `lab · ${spec.revision} · unprinted` : `digital prototype · ${spec.revision} · unprinted`;
  return `proposed · ${spec.colourSet === 'dayrally' ? 'dayrally' : 'TURN'} · ${spec.material}`;
}

/** The dayrally key glyph that follows the wordmark: a rounded key with its lug, as on the boards. */
function KeyGlyph() {
  return (
    <svg className="lvw-key" viewBox="0 0 68 36" aria-hidden focusable="false">
      <rect x="2" y="9" width="64" height="18" rx="9" fill="#240b21" />
      <circle cx="54" cy="18" r="3.2" fill="#fffdf8" />
    </svg>
  );
}

function Estimate({ item }: { item: ItemConfiguration }) {
  const e = item.estimate.perUnit;
  const minutes = (m: number) => (m >= 60 ? `${Math.floor(m / 60)} h ${m % 60} min` : `${m} min`);
  return (
    <dl className="lvw-estimate" title={item.estimate.assumptions}>
      <div><dt>Print mass</dt><dd>{e.massG} g <small>est.</small></dd></div>
      <div><dt>Print time</dt><dd>{minutes(e.printMinutes)} <small>est.</small></dd></div>
      <div><dt>Material</dt><dd>NZD {e.materialNzd.toFixed(2)} <small>est.</small></dd></div>
      <div><dt>Suggested retail</dt><dd>{e.suggestedRetailNzd === null ? <>to be quoted <small>no price</small></> : <>NZD {e.suggestedRetailNzd.toFixed(2)} <small>proposed</small></>}</dd></div>
      <div><dt>Part code</dt><dd>{item.sku ?? '—'}</dd></div>
      <div><dt>Ships</dt><dd>{e.shipG} g <small>packed</small></dd></div>
    </dl>
  );
}

type PreviewProps = { body: string; accent: string | null; text: string; dims: { x: number; y: number; z: number }; pattern: string | null; round: boolean };

/** A flat schematic of the first part: proportions from the manifest, body and accent colours, lettering where a name applies. */
function Preview({ body, accent, text, dims, pattern, round }: PreviewProps) {
  const W = 400, H = 300, pad = 36;
  const scale = Math.min((W - pad * 2) / dims.x, (H - pad * 2) / dims.y);
  const w = dims.x * scale, h = dims.y * scale;
  const x = (W - w) / 2, y = (H - h) / 2;
  const r = round ? Math.min(w, h) * 0.18 : Math.min(w, h) * 0.06;
  const ink = accent ?? 'rgba(36, 11, 33, 0.35)';
  const fontSize = Math.min(h * 0.42, (w * 0.8) / Math.max(1, text.length) * 1.6);
  const deco = () => {
    if (!accent) return null;
    switch (pattern) {
      case 'waves':
        return [0.3, 0.5, 0.7].map((f) => <path key={f} d={`M${x + w * 0.12} ${y + h * f} q ${w * 0.1} -${h * 0.08} ${w * 0.2} 0 t ${w * 0.2} 0 t ${w * 0.2} 0 t ${w * 0.2} 0`} fill="none" stroke={accent} strokeWidth={Math.max(2, h * 0.035)} strokeLinecap="round" />);
      case 'dots':
        return Array.from({ length: 12 }, (_, i) => <circle key={i} cx={x + w * (0.2 + (i % 4) * 0.2)} cy={y + h * (0.28 + Math.floor(i / 4) * 0.22)} r={Math.max(3, h * 0.045)} fill={accent} />);
      case 'check':
        return Array.from({ length: 8 }, (_, i) => <rect key={i} x={x + w * (0.1 + (i % 4) * 0.2 + (Math.floor(i / 4) % 2) * 0.1)} y={y + h * (0.2 + Math.floor(i / 4) * 0.3)} width={w * 0.1} height={h * 0.3} fill={accent} opacity={0.85} />);
      case 'stars':
        return [0.25, 0.5, 0.75].map((f, i) => <text key={f} x={x + w * f} y={y + h * (i === 1 ? 0.62 : 0.5)} textAnchor="middle" fontSize={h * 0.3} fill={accent}>★</text>);
      case 'bolt':
        return <polygon points={`${x + w * 0.55},${y + h * 0.15} ${x + w * 0.38},${y + h * 0.55} ${x + w * 0.5},${y + h * 0.55} ${x + w * 0.42},${y + h * 0.85} ${x + w * 0.62},${y + h * 0.42} ${x + w * 0.5},${y + h * 0.42}`} fill={accent} />;
      case 'topo':
        return [0.9, 0.7, 0.5, 0.3].map((f) => <ellipse key={f} cx={x + w * 0.5} cy={y + h * 0.5} rx={(w * f) / 2 - 8} ry={(h * f) / 2 - 6} fill="none" stroke={accent} strokeWidth={2} />);
      case 'heart': return <text x={x + w / 2} y={y + h * 0.68} textAnchor="middle" fontSize={h * 0.5} fill={accent}>♥</text>;
      case 'star': return <text x={x + w / 2} y={y + h * 0.68} textAnchor="middle" fontSize={h * 0.5} fill={accent}>★</text>;
      case 'flower': return <text x={x + w / 2} y={y + h * 0.68} textAnchor="middle" fontSize={h * 0.5} fill={accent}>✿</text>;
      case 'fish': return <text x={x + w / 2} y={y + h * 0.66} textAnchor="middle" fontSize={h * 0.46} fill={accent}>◖</text>;
      case 'wave': return <path d={`M${x + w * 0.15} ${y + h * 0.55} q ${w * 0.12} -${h * 0.2} ${w * 0.24} 0 t ${w * 0.24} 0 t ${w * 0.24} 0`} fill="none" stroke={accent} strokeWidth={Math.max(3, h * 0.06)} strokeLinecap="round" />;
      default: return null;
    }
  };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Schematic preview">
      <rect x={x + 6} y={y + 8} width={w} height={h} rx={r} fill="rgba(36, 11, 33, 0.08)" />
      <rect x={x} y={y} width={w} height={h} rx={r} fill={body} stroke="rgba(36, 11, 33, 0.18)" />
      {deco()}
      {text && <text x={x + w / 2} y={y + h / 2} dominantBaseline="central" textAnchor="middle" fontFamily="var(--font-display), 'Instrument Sans', sans-serif" fontWeight={600} fontSize={fontSize} fill={ink} letterSpacing={1}>{text}</text>}
      {!accent && !text && <circle cx={x + w / 2} cy={y + h / 2} r={Math.min(w, h) * 0.08} fill="none" stroke="rgba(36, 11, 33, 0.2)" strokeWidth={2} />}
    </svg>
  );
}
