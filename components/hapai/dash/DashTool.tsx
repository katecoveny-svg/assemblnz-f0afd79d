'use client';

import { useState } from 'react';
import { Copy, Download, Sparkles, Upload, X } from 'lucide-react';
import { DashLoader } from '@/components/marketplace/DashLoader';
import { DashToolShell } from '@/components/hapai/dash/DashToolShell';
import type { DashToolConfig } from '@/lib/hapai/dash/tools';
import { useToolGate } from '@/lib/hapai/use-tool-gate';

function htmlToText(html: string) {
  return html
    .replace(/<h2>(.*?)<\/h2>/g, '\n## $1\n')
    .replace(/<h3>(.*?)<\/h3>/g, '\n### $1\n')
    .replace(/<li>(.*?)<\/li>/g, '- $1\n')
    .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
    .replace(/<\/?ul>/g, '')
    .replace(/<p>(.*?)<\/p>/g, '$1\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function DashTool({ config }: { config: DashToolConfig }) {
  const initial = Object.fromEntries(config.fields.map((f) => [f.name, defaultValue(f.type, f.options)]));
  const [values, setValues] = useState<Record<string, string>>(initial);
  const [imageDataUrl, setImageDataUrl] = useState('');
  const [imageName, setImageName] = useState('');
  const [html, setHtml] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const gate = useToolGate(config.slug);

  const setField = (name: string, value: string) => setValues((prev) => ({ ...prev, [name]: value }));

  const hasInput =
    Object.values(values).join('').trim().length >= 4 || Boolean(imageDataUrl);

  async function run() {
    setError('');
    setHtml('');
    setLoading(true);
    try {
      const response = await gate.fetch(config.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, imageDataUrl }),
      });
      if (!response) return; // gated — capture modal showing
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Could not generate that. Try again.');
      setHtml(data.html);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not generate that. Try again.');
    } finally {
      setLoading(false);
    }
  }

  function clearAll() {
    setValues(initial);
    setImageDataUrl('');
    setImageName('');
    setHtml('');
    setError('');
  }

  function loadSample() {
    if (config.sample) setValues((prev) => ({ ...prev, ...config.sample }));
  }

  function handleImage(file: File | null) {
    setError('');
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Upload a photo or screenshot image.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError('Please upload an image under 8MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImageDataUrl(String(reader.result ?? ''));
      setImageName(file.name);
    };
    reader.onerror = () => setError('Could not read that image. Try a smaller photo.');
    reader.readAsDataURL(file);
  }

  function copyOutput() {
    navigator.clipboard.writeText(htmlToText(html));
  }

  function downloadEvidencePack() {
    const stamped = new Date().toLocaleString('en-NZ', {
      timeZone: 'Pacific/Auckland',
      dateStyle: 'full',
      timeStyle: 'short',
    });
    const doc = `<!doctype html><html lang="en-NZ"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${escapeHtml(config.name)} — evidence pack</title>
<style>
  :root { color-scheme: light; }
  body { margin: 0; background: #ffffff; color: #313c42; font: 16px/1.6 "Lato",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; }
  .wrap { max-width: 760px; margin: 0 auto; padding: 48px 40px; }
  .mark { font-weight: 900; letter-spacing: -0.02em; color: #313c42; font-size: 22px; }
  .eyebrow { font: 700 11px/1 "Space Mono",ui-monospace,monospace; letter-spacing: 0.22em; text-transform: uppercase; color: #b8964f; }
  h1 { font: 500 34px/1.05 'Cormorant Garamond', Georgia, serif; letter-spacing: -0.02em; margin: 12px 0 4px; color: #313c42; }
  .dash { width: 120px; height: 9px; background: #b8964f; border-radius: 999px; margin: 14px 0 18px; }
  .meta { color: #8A8678; font-size: 13px; margin-bottom: 24px; }
  .rule { border: 0; border-top: 1px solid rgba(35,33,31,0.10); margin: 24px 0; }
  .body h2 { font-size: 22px; font-weight: 900; color: #313c42; margin: 24px 0 8px; }
  .body h3 { font-size: 17px; font-weight: 700; color: #313c42; margin: 18px 0 6px; }
  .body ul { margin: 0 0 12px; padding-left: 20px; }
  .body p { margin: 0 0 12px; }
  .foot { margin-top: 32px; padding: 16px 18px; background: #313c42; color: #ffffff; border-radius: 10px; font-size: 13px; line-height: 1.5; }
  .foot b { color: #b8964f; }
  @media print { body { background: #fff; } .wrap { padding: 0; } }
</style></head>
<body><div class="wrap">
  <div class="mark">assembl</div>
  <p class="eyebrow" style="margin-top:18px">SPARK · evidence pack</p>
  <h1>${escapeHtml(config.evidenceTitle)}</h1>
  <div class="dash"></div>
  <p class="meta">Generated ${stamped} · Pacific/Auckland</p>
  <hr class="rule"/>
  <div class="body">${html}</div>
  <div class="foot"><b>${escapeHtml(config.evidenceNote)}</b><br/>Made with assembl — assembl.co.nz/hapai/${config.slug}</div>
</div></body></html>`;
    const blob = new Blob([doc], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${config.slug}-evidence-pack.html`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <DashToolShell
      eyebrow={config.eyebrow}
      title={config.title}
      intro={config.intro}
      toolPath={`/hapai/${config.slug}`}
      shareTitle={`${config.name} by assembl`}
      shareText={config.shareText}
      posture={config.posture}
      highlights={config.highlights}
    >
      <div className="p-5 md:p-7">
        {config.sample ? (
          <div className="mb-5">
            <button
              type="button"
              onClick={loadSample}
              className="font-mono rounded-full border border-[rgba(35,33,31,0.10)] bg-white px-4 py-2 text-[10px] uppercase tracking-[0.12em] text-[#8A8678] transition hover:text-[#313c42]"
            >
              Load an example
            </button>
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          {config.allowImage ? (
            <label className="md:col-span-2">
              <span className="font-mono mb-2 block text-[10px] uppercase tracking-[0.22em] text-[#8A8678]">
                {config.imageLabel ?? 'Upload a photo'}
              </span>
              <div className="relative overflow-hidden rounded-[10px] border border-dashed border-[#D8CEB4] bg-white p-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImage(e.target.files?.[0] ?? null)}
                  className="absolute inset-0 cursor-pointer opacity-0"
                  aria-label={config.imageLabel ?? 'Upload a photo'}
                />
                <div className="flex items-center gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#b8964f] text-[#313c42]">
                    <Upload className="h-5 w-5" aria-hidden />
                  </span>
                  <div className="flex-1">
                    <p className="font-bold text-[#313c42]">{imageName || 'Tap to add a photo or screenshot.'}</p>
                    <p className="mt-1 text-sm text-[#8A8678]">It reads the visible text. If the image is unclear, it won’t guess.</p>
                  </div>
                  {imageDataUrl ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setImageDataUrl('');
                        setImageName('');
                      }}
                      className="relative z-10 inline-flex h-10 items-center gap-2 rounded-full border border-[rgba(35,33,31,0.10)] bg-white px-4 text-sm text-[#56544B]"
                    >
                      <X className="h-4 w-4" aria-hidden />
                      Remove
                    </button>
                  ) : null}
                </div>
                {imageDataUrl ? (
                  <div className="mt-4 overflow-hidden rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageDataUrl} alt="" className="max-h-[260px] w-full object-contain" />
                  </div>
                ) : null}
              </div>
            </label>
          ) : null}

          {config.fields.map((field) => {
            const full = field.full || field.type === 'textarea';
            return (
              <label key={field.name} className={full ? 'md:col-span-2' : 'block'}>
                <span className="font-mono mb-2 block text-[10px] uppercase tracking-[0.22em] text-[#8A8678]">{field.label}</span>
                {field.type === 'textarea' ? (
                  <textarea
                    value={values[field.name] ?? ''}
                    onChange={(e) => setField(field.name, e.target.value)}
                    className="min-h-[150px] w-full rounded-[10px] border border-[rgba(35,33,31,0.10)] bg-white p-4 text-sm leading-relaxed text-[#313c42] outline-none focus:border-[#b8964f]"
                    placeholder={field.placeholder}
                  />
                ) : field.type === 'select' ? (
                  <select
                    value={values[field.name] ?? ''}
                    onChange={(e) => setField(field.name, e.target.value)}
                    className="h-11 w-full rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white px-3 text-sm text-[#313c42] outline-none focus:border-[#b8964f]"
                  >
                    {field.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    value={values[field.name] ?? ''}
                    onChange={(e) => setField(field.name, e.target.value)}
                    className="h-11 w-full rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white px-3 text-sm text-[#313c42] outline-none focus:border-[#b8964f]"
                    placeholder={field.placeholder}
                  />
                )}
              </label>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={run}
            disabled={loading || !hasInput}
            className="inline-flex items-center rounded-full bg-[#313c42] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#56544B] disabled:cursor-not-allowed disabled:bg-[#C8C2BC]"
          >
            <Sparkles className="mr-2 h-4 w-4" aria-hidden />
            {loading ? 'Working…' : config.ctaLabel}
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="rounded-full border border-[rgba(35,33,31,0.10)] bg-white px-6 py-3 text-sm text-[#56544B] transition hover:text-[#313c42]"
          >
            Clear
          </button>
          <span className="flex items-center">{gate.counter}</span>
        </div>

        {loading ? (
          <div className="mt-6 rounded-[12px] border border-[rgba(35,33,31,0.10)] bg-white p-5">
            <DashLoader label={config.loadingLabel} width={64} />
          </div>
        ) : null}
        {error ? (
          <p className="mt-4 rounded-[10px] border border-[#B42828]/25 bg-[#FCEDED] px-4 py-3 text-sm text-[#7A1F1F]">{error}</p>
        ) : null}
      </div>

      {html ? (
        <section className="m-4 rounded-[12px] border border-[rgba(35,33,31,0.10)] bg-white p-7 md:m-5 md:p-9">
          <div
            className="dash-output max-w-none text-[#313c42] [&_h2]:mt-6 [&_h2]:font-display [&_h2]:text-3xl [&_h2]:font-medium [&_h2]:tracking-[-0.01em] [&_h2:first-child]:mt-0 [&_h3]:mt-5 [&_h3]:text-lg [&_h3]:font-bold [&_li]:mb-1.5 [&_p]:mt-3 [&_p]:leading-relaxed [&_strong]:font-bold [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:text-[#56544B]"
            dangerouslySetInnerHTML={{ __html: html }}
          />
          <div className="mt-7 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={downloadEvidencePack}
              className="inline-flex items-center gap-2 rounded-full bg-[#313c42] px-5 py-3 text-sm font-bold text-white hover:bg-[#56544B]"
            >
              <Download className="h-4 w-4" /> Download evidence pack
            </button>
            <button
              type="button"
              onClick={copyOutput}
              className="inline-flex items-center gap-2 rounded-full border border-[rgba(35,33,31,0.10)] bg-white px-5 py-3 text-sm text-[#56544B] hover:text-[#313c42]"
            >
              <Copy className="h-4 w-4" /> Copy to clipboard
            </button>
          </div>
        </section>
      ) : null}
      {gate.modal}
    </DashToolShell>
  );
}

function defaultValue(type: string, options?: readonly { value: string; label: string }[]) {
  if (type === 'select') return options?.[0]?.value ?? '';
  return '';
}

function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
