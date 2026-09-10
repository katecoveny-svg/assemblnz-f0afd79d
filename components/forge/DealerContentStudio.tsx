'use client';

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import NextImage from 'next/image';
import { ArrowUpRight, Check, Download, ImagePlus, LoaderCircle, Copy, WandSparkles } from 'lucide-react';
import { CAMPAIGN_TYPES, DEALER_CHANNELS, DEALER_MARQUES, buildDealerTemplate, dealerBriefSchema, dealerPackSchema, dealerPackText, type DealerBrief, type DealerChannel, type DealerPack } from '@/lib/forge/dealer-content';
import './dealer-content-studio.css';

const SAMPLE: DealerBrief = { marque: 'Subaru', model: 'WRX', dealership: 'Example Motors', location: 'Auckland', campaign: 'Vehicle introduction', facts: 'WR blue pearl\nFour-door sedan', contact: '', reviewer: 'Dealership reviewer' };
const accents: Record<string, string> = { Subaru: '#234f89', Toyota: '#9e242c', Ford: '#224c73', Mazda: '#692b34', Hyundai: '#334c68', Kia: '#354647', Mitsubishi: '#952e34', Volkswagen: '#29456b', Audi: '#565459', BMW: '#315275', 'Mercedes-Benz': '#4e565d' };

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a'); link.href = url; link.download = filename; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
async function loadPhoto(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => { const image = new Image(); image.onload = () => resolve(image); image.onerror = () => reject(new Error('The photograph could not be opened.')); image.src = src; });
}

export function DealerContentStudio() {
  const [brief, setBrief] = useState<DealerBrief>(SAMPLE);
  const [snapshot, setSnapshot] = useState<DealerBrief>(SAMPLE);
  const [pack, setPack] = useState<DealerPack>(() => buildDealerTemplate(SAMPLE));
  const [channel, setChannel] = useState<DealerChannel>('social');
  const [method, setMethod] = useState('Template preview');
  const [notice, setNotice] = useState('Sample vehicle and dealership. Add your own facts to create a campaign.');
  const [busy, setBusy] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [photo, setPhoto] = useState('');
  const [format, setFormat] = useState<'4:5' | '1:1'>('4:5');
  const [customMarque, setCustomMarque] = useState(false);
  const [copied, setCopied] = useState(false);
  const upload = useRef<HTMLInputElement>(null);
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), []);
  useEffect(() => () => { if (photo) URL.revokeObjectURL(photo); }, [photo]);
  const stale = JSON.stringify(brief) !== JSON.stringify(snapshot);
  const accent = accents[snapshot.marque] || '#654a4e';
  const examplePhoto = snapshot.marque === 'Subaru' && snapshot.model.toLowerCase() === 'wrx' ? '/brand/transport/subaru-reference.webp' : '';
  const imageSrc = photo || examplePhoto;
  const imageNote = photo ? 'Uploaded vehicle photograph' : examplePhoto ? 'Generated concept image · replace with your vehicle photograph' : 'Add your vehicle photograph';
  const fileStem = `${snapshot.marque}-${snapshot.model}-draft`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  function update<K extends keyof DealerBrief>(key: K, value: DealerBrief[K]) { setBrief(old => ({ ...old, [key]: value })); }
  function changeMarque(value: string) {
    setCustomMarque(value === 'Other');
    setBrief(old => ({ ...old, marque: value === 'Other' ? '' : value, model: '', facts: '' }));
    setPhoto(''); if (upload.current) upload.current.value = '';
    setNotice('Add this marque’s vehicle details and photograph, then create a new campaign.');
  }
  async function selectPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 10 * 1024 * 1024) { setNotice('Choose a JPG, PNG or WebP photograph under 10 MB.'); event.target.value = ''; return; }
    const url = URL.createObjectURL(file);
    try { const image = await loadPhoto(url); if (image.naturalWidth * image.naturalHeight > 50000000) throw new Error('Choose a photograph below 50 megapixels.'); setPhoto(url); setNotice('Photograph added. It stays in your browser and is included in your image export.'); }
    catch (error) { URL.revokeObjectURL(url); setNotice(error instanceof Error ? error.message : 'Choose another photograph.'); }
  }
  async function generate(event: FormEvent) {
    event.preventDefault();
    const parsed = dealerBriefSchema.safeParse(brief); if (!parsed.success) { setNotice(parsed.error.issues[0].message); return; }
    request.current?.abort(); const controller = new AbortController(); request.current = controller;
    setBusy(true); setCopied(false); setNotice('Preparing the four campaign drafts from your supplied facts…');
    const timeout = setTimeout(() => controller.abort(), 55000);
    try {
      const response = await fetch('/api/forge/content', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(parsed.data), signal: controller.signal });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Drafting is unavailable. Try again.');
      const next = dealerPackSchema.parse(data.pack);
      setPack(next); setSnapshot(parsed.data); setMethod(data.method); setNotice(data.note);
    } catch (error) { setNotice(error instanceof Error && error.name === 'AbortError' ? 'Drafting took too long. Please try again.' : error instanceof Error ? error.message : 'Drafting is unavailable.'); }
    finally { clearTimeout(timeout); setBusy(false); }
  }

  async function posterBlob(): Promise<Blob> {
    await document.fonts.ready;
    const canvas = document.createElement('canvas'); canvas.width = 1080; canvas.height = format === '4:5' ? 1350 : 1080;
    const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('Image export is unavailable in this browser.');
    const height = canvas.height;
    ctx.fillStyle = '#fffdfb'; ctx.fillRect(0, 0, 1080, height);
    ctx.fillStyle = accent; ctx.fillRect(0, 0, 1080, 14);
    const bodyFont = getComputedStyle(document.documentElement).getPropertyValue('--font-body').trim() || 'sans-serif';
    const monoFont = getComputedStyle(document.documentElement).getPropertyValue('--font-mono').trim() || 'monospace';
    ctx.fillStyle = '#654a4e'; ctx.font = `21px ${monoFont}`; ctx.fillText('CAMPAIGN DRAFT / FOR REVIEW', 65, 74);
    ctx.fillStyle = '#240b21'; ctx.font = `500 42px ${bodyFont}`; ctx.fillText(snapshot.dealership.slice(0, 42), 65, 145, 945);
    const words = pack.headline.split(/\s+/); let headlineSize = 76; let lines: string[] = [];
    do {
      ctx.font = `500 ${headlineSize}px ${bodyFont}`; lines = []; let line = '';
      for (const word of words) { const next = `${line}${word} `; if (ctx.measureText(next).width > 950 && line) { lines.push(line.trim()); line = `${word} `; } else line = next; }
      if (line.trim()) lines.push(line.trim());
      if (lines.length <= 3 || headlineSize <= 32) break;
      headlineSize -= 4;
    } while (true);
    let lineY = 250;
    lines.forEach((line, index) => { lineY = 250 + index * headlineSize * 1.12; ctx.fillText(line, 65, lineY, 950); });
    const imageTop = lineY + 48; const imageHeight = Math.max(180, height - imageTop - 260);
    if (imageSrc) {
      const image = await loadPhoto(imageSrc); const scale = Math.min(980 / image.naturalWidth, imageHeight / image.naturalHeight);
      ctx.drawImage(image, (1080 - image.naturalWidth * scale) / 2, imageTop + (imageHeight - image.naturalHeight * scale) / 2, image.naturalWidth * scale, image.naturalHeight * scale);
    } else { ctx.strokeStyle = '#916a70'; ctx.lineWidth = 1; ctx.strokeRect(65, imageTop, 950, imageHeight); ctx.fillStyle = '#654a4e'; ctx.font = `26px ${bodyFont}`; ctx.fillText('Vehicle photograph to be supplied', 95, imageTop + imageHeight / 2); }
    ctx.fillStyle = '#654a4e'; ctx.font = `19px ${monoFont}`; ctx.fillText(photo ? 'VEHICLE PHOTOGRAPH SUPPLIED BY USER' : examplePhoto ? 'CONCEPT IMAGE / NOT A STOCK LISTING' : 'VEHICLE PHOTOGRAPH TO BE SUPPLIED', 65, height - 195, 950);
    ctx.strokeStyle = '#d8cdcf'; ctx.beginPath(); ctx.moveTo(65, height - 160); ctx.lineTo(1015, height - 160); ctx.stroke();
    ctx.fillStyle = '#240b21'; ctx.font = `28px ${bodyFont}`; ctx.fillText(`${snapshot.marque} ${snapshot.model}`, 65, height - 106, 650);
    ctx.fillStyle = '#654a4e'; ctx.font = `22px ${bodyFont}`; ctx.fillText(snapshot.location || 'Prepared for dealership review', 65, height - 62, 700);
    return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Image export failed.')), 'image/png'));
  }
  async function download(kind: 'image' | 'pack') {
    if (stale || busy) return; setExporting(true);
    try {
      const poster = await posterBlob();
      if (kind === 'image') saveBlob(poster, `${fileStem}-${format.replace(':', 'x')}.png`);
      else {
        const { default: JSZip } = await import('jszip'); const zip = new JSZip();
        zip.file('campaign-drafts.md', dealerPackText(snapshot, pack, method)); zip.file('social-draft.png', poster);
        zip.file('review-record.json', JSON.stringify({ status: 'Draft — not approved or published', preparedFor: snapshot.reviewer, brief: snapshot, method, image: imageNote, format, createdAt: new Date().toISOString(), checks: ['Verify supplied facts against the actual vehicle', 'Check photograph rights and vehicle identity', 'Confirm pricing, conditions and contact details where used', 'Obtain dealership approval before publishing'] }, null, 2));
        saveBlob(await zip.generateAsync({ type: 'blob' }), `${fileStem}.zip`);
      }
      setNotice(kind === 'pack' ? 'Draft pack downloaded: four copy formats, social image and review record.' : 'Social image downloaded as a draft for review.');
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Export failed. Please try again.'); }
    finally { setExporting(false); }
  }
  async function copy() { try { await navigator.clipboard.writeText(pack[channel]); setCopied(true); } catch { setNotice('Select and copy the editable draft below.'); } }

  return (
    <section className="frg-section dealer-studio" id="forge-content" aria-labelledby="dealer-studio-title">
      <div className="dealer-studio-heading">
        <div><p className="frg-eyebrow frg-mono">Forge / dealership content studio</p><h2 id="dealer-studio-title">One vehicle.<br />A campaign to review.</h2></div>
        <p>Choose a marque. Add the facts and a vehicle photograph. Prepare social, listing, email and video-script drafts for your team.</p>
      </div>
      <div className="dealer-workbench">
        <form className="dealer-brief" onSubmit={generate}>
          <div className="dealer-panel-label frg-mono"><span>01 / Your brief</span><ArrowUpRight size={16} aria-hidden /></div>
          <fieldset disabled={busy}>
            <div className="dealer-field-pair">
              <label>Marque<select value={customMarque ? 'Other' : brief.marque} onChange={e => changeMarque(e.target.value)}>{DEALER_MARQUES.map(m => <option key={m}>{m}</option>)}</select></label>
              <label>Vehicle model<input required maxLength={80} value={brief.model} onChange={e => update('model', e.target.value)} placeholder="Model and variant" /></label>
            </div>
            {customMarque && <label>Marque name<input required maxLength={60} value={brief.marque} onChange={e => update('marque', e.target.value)} /></label>}
            <label>Campaign<select value={brief.campaign} onChange={e => update('campaign', e.target.value as DealerBrief['campaign'])}>{CAMPAIGN_TYPES.map(c => <option key={c}>{c}</option>)}</select></label>
            <div className="dealer-field-pair"><label>Dealership<input required maxLength={100} value={brief.dealership} onChange={e => update('dealership', e.target.value)} /></label><label>Town or region<input maxLength={80} value={brief.location} onChange={e => update('location', e.target.value)} /></label></div>
            <label>Facts this campaign can use<textarea required rows={4} maxLength={2000} value={brief.facts} onChange={e => update('facts', e.target.value)} placeholder="Verified vehicle details, condition, offer terms…" /><small>Use details you can verify. Prices and offers are included only if you supply them.</small></label>
            <label>Contact or destination<input maxLength={200} value={brief.contact} onChange={e => update('contact', e.target.value)} placeholder="Dealership phone number or web address" /></label>
            <label>Prepared for<input required maxLength={80} value={brief.reviewer} onChange={e => update('reviewer', e.target.value)} placeholder="Person reviewing this campaign" /></label>
            <label className="dealer-upload"><ImagePlus size={20} aria-hidden /><span>{photo ? 'Replace vehicle photograph' : 'Add vehicle photograph'}<small>JPG, PNG, WebP · up to 10 MB · stays in this browser</small></span><input ref={upload} type="file" accept="image/jpeg,image/png,image/webp" onChange={selectPhoto} /></label>
            {photo && <button type="button" className="dealer-text-button" onClick={() => { setPhoto(''); if (upload.current) upload.current.value = ''; }}>Remove photograph</button>}
            <button className="dealer-create" type="submit">{busy ? <LoaderCircle size={18} className="dealer-spin" aria-hidden /> : <WandSparkles size={18} aria-hidden />}{busy ? 'Preparing campaign…' : 'Create campaign drafts'}</button>
          </fieldset>
          <p className="dealer-privacy">Your written brief is sent to Muse when available. Photographs stay in your browser. Nothing is published or sent to customers.</p>
        </form>

        <div className="dealer-output" aria-busy={busy}>
          <div className="dealer-panel-label frg-mono"><span>02 / {method}</span><span>For review</span></div>
          <div className="dealer-notice" role="status">{stale ? 'Brief changed. Create a new campaign to update these drafts before export.' : notice}</div>
          <div className="dealer-output-grid">
            <div className="dealer-art-column">
              <div className="dealer-poster" style={{ borderTopColor: accent, aspectRatio: format.replace(':', '/') }}>
                <p className="frg-mono">Campaign draft</p><span>{snapshot.dealership}</span><h3>{pack.headline}</h3>
                {imageSrc ? <NextImage src={imageSrc} alt={`${snapshot.marque} ${snapshot.model} — ${imageNote.toLowerCase()}`} width={600} height={380} unoptimized /> : <div className="dealer-photo-empty"><ImagePlus size={32} aria-hidden /><span>Your vehicle<br />photograph</span></div>}
                <small>{photo ? 'User-supplied photograph' : examplePhoto ? 'Concept image · not a stock listing' : 'Vehicle photograph to be supplied'}</small>
                <div className="dealer-poster-footer"><span>{snapshot.marque} {snapshot.model}</span><span>{snapshot.location}</span></div>
              </div>
              <label className="dealer-format">Image format<select value={format} onChange={e => setFormat(e.target.value as '4:5' | '1:1')}><option value="4:5">Portrait · 1080 × 1350</option><option value="1:1">Square · 1080 × 1080</option></select></label>
              <button type="button" className="dealer-export" disabled={stale || busy || exporting} onClick={() => void download('image')}><Download size={16} aria-hidden />Download image</button>
            </div>
            <div className="dealer-copy-column">
              <div className="dealer-channels" role="tablist" aria-label="Campaign format">{DEALER_CHANNELS.map(c => <button type="button" role="tab" id={`dealer-tab-${c.id}`} key={c.id} aria-selected={channel === c.id} aria-controls="dealer-copy-panel" onClick={() => { setChannel(c.id); setCopied(false); }} onKeyDown={e => { if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return; e.preventDefault(); const index = DEALER_CHANNELS.findIndex(x => x.id === channel); const next = e.key === 'Home' ? 0 : e.key === 'End' ? 3 : (index + (e.key === 'ArrowRight' ? 1 : 3)) % 4; setChannel(DEALER_CHANNELS[next].id); document.getElementById(`dealer-tab-${DEALER_CHANNELS[next].id}`)?.focus(); }} tabIndex={channel === c.id ? 0 : -1}>{c.label}</button>)}</div>
              <div id="dealer-copy-panel" role="tabpanel" aria-labelledby={`dealer-tab-${channel}`}>
                <label>Campaign headline<input maxLength={140} value={pack.headline} onChange={e => setPack(old => ({ ...old, headline: e.target.value }))} /></label>
                <label>{DEALER_CHANNELS.find(c => c.id === channel)?.label} draft<textarea rows={14} maxLength={2400} value={pack[channel]} onChange={e => { setPack(old => ({ ...old, [channel]: e.target.value })); setCopied(false); }} /></label>
                <button type="button" className="dealer-text-button" disabled={stale || busy} onClick={() => void copy()}>{copied ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}{copied ? 'Copied' : 'Copy this draft'}</button>
              </div>
              <div className="dealer-review-note"><span className="frg-mono">Human review</span><p>Prepared for <strong>{snapshot.reviewer}</strong>. Check vehicle identity, supplied facts, image rights and any offer terms before use.</p></div>
              <button type="button" className="dealer-create" disabled={stale || busy || exporting} onClick={() => void download('pack')}>{exporting ? <LoaderCircle size={17} className="dealer-spin" aria-hidden /> : <Download size={17} aria-hidden />}Download draft pack</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
