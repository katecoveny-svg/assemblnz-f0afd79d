'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Upload, X } from 'lucide-react';
import { BILL_IMAGE_LIMIT, type BillReading } from '@/apps/do/services/bill-reading';
export function BillReader({ onConfirm, disabled }: { onConfirm: (reading: BillReading) => void; disabled: boolean }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [consent, setConsent] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [reading, setReading] = useState<BillReading | null>(null);
  const [applied, setApplied] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  function select(next?: File) {
    setError(''); setConsent(false); setConfirmed(false); setReading(null); setApplied(false); setFile(null); setPreview('');
    if (!next) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(next.type) || next.size > BILL_IMAGE_LIMIT || !next.size) { setError('Choose a PNG, JPEG or WebP image under 2 MB. For a PDF, take a screenshot of the relevant page.'); return; }
    setFile(next); setPreview(URL.createObjectURL(next));
  }
  async function read() {
    if (!file || !consent || busy) return;
    setBusy(true); setError(''); setReading(null); setConfirmed(false); setApplied(false);
    try {
      const data = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onerror = () => reject(new Error('This image could not be opened.')); reader.onload = () => resolve(String(reader.result).split(',')[1]); reader.readAsDataURL(file); });
      const response = await fetch('/api/do/bills/read', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mimeType: file.type, data, consent: true }) });
      const result = await response.json(); if (!response.ok) throw new Error(result.message || 'This bill could not be read.');
      setReading(result.reading);
    } catch (e) { setError(e instanceof Error ? e.message : 'This bill could not be read.'); } finally { setBusy(false); }
  }
  const number = (key: 'monthlyCost' | 'usage' | 'exitFee', value: string) => { setConfirmed(false); setApplied(false); setReading(r => r ? { ...r, [key]: value === '' ? null : Number(value) } : null); };
  const valid = reading?.category && reading.currency === 'NZD' && [reading.monthlyCost, reading.usage, reading.exitFee].every(n => n === null || Number.isFinite(n) && n >= 0) && (reading.monthlyCost === null || reading.monthlyCost >= 1 && reading.monthlyCost <= 10000) && (reading.usage === null || reading.usage <= 100000) && (reading.exitFee === null || reading.exitFee <= 10000) && (reading.monthlyCost !== null || reading.usage !== null || reading.exitFee !== null);
  return <section className="bill-reader" aria-labelledby="bill-reader-title"><h2 id="bill-reader-title">Start with a bill.</h2><p>Drop a photo or screenshot here. DO reads the figures; you check them before comparing.</p><fieldset disabled={busy || disabled}><div className="bill-drop" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); if (!busy && !disabled) select(e.dataTransfer.files[0]); }}><Upload size={25}/><label>Choose a bill image<input ref={input} type="file" accept="image/png,image/jpeg,image/webp" onChange={e => select(e.target.files?.[0])}/></label><span>PNG, JPEG or WebP · up to 2 MB</span></div>{file && <><div className="bill-preview">{preview && <Image unoptimized src={preview} alt="Your selected bill, shown locally for review" width={500} height={400}/>}<button type="button" onClick={() => { select(); if (input.current) input.current.value = ''; }}><X size={16}/> Remove image</button></div><p>Crop or cover your name, address, account number and payment details first. The whole selected image will be sent for reading.</p><label className="family-consent"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)}/><span>Send this image to Google’s AI service to extract bill figures. assembl does not save the image; Google processes it under its API terms.</span></label><button type="button" className="family-primary" disabled={!consent} onClick={() => void read()}>{busy ? 'Reading your bill…' : 'Read bill · 1 free task'}</button></>}</fieldset><p role="status">{error || (busy ? 'Reading the selected image. You will review the figures next.' : '')}</p>{reading && <fieldset className="bill-review" disabled={disabled || busy}><legend>Check what DO read</legend><p>Reading can be wrong. Blanks mean DO could not establish a figure. Check the bill and correct anything below. Nothing has been sent for offer research.</p><label>Bill type<select value={reading.category || ''} onChange={e => { setReading({ ...reading, category: e.target.value as BillReading['category'], usage: null, unit: e.target.value === 'electricity' ? 'kWh' : e.target.value === 'broadband' ? 'Mbps' : 'GB' }); setConfirmed(false); setApplied(false); }}><option value="" disabled>Choose a type</option><option value="electricity">Electricity</option><option value="broadband">Broadband</option><option value="mobile">Mobile</option></select></label>{reading.currency !== 'NZD' && <p>NZ dollars were not established, so cost fields were left blank.</p>}<label>Monthly service cost including GST (NZ$)<input type="number" min="1" max="10000" step="0.01" value={reading.monthlyCost ?? ''} onChange={e => { number('monthlyCost', e.target.value); setReading(r => r ? { ...r, currency: 'NZD' } : null); }}/></label><label>{reading.category === 'electricity' ? 'Monthly usage (kWh)' : reading.category === 'mobile' ? 'Monthly allowance (GB)' : 'Download speed (Mbps)'}<input type="number" min="0" max="100000" value={reading.usage ?? ''} onChange={e => number('usage', e.target.value)}/></label><label>Current contract exit fee (NZ$)<input type="number" min="0" max="10000" step="0.01" value={reading.exitFee ?? ''} onChange={e => number('exitFee', e.target.value)}/></label><label className="family-consent"><input type="checkbox" checked={confirmed} onChange={e => { setConfirmed(e.target.checked); setApplied(false); if (e.target.checked) setReading({ ...reading, currency: "NZD" }); }}/><span>I checked these figures against my bill. Costs shown are NZ dollars including GST.</span></label><button type="button" className="family-primary" disabled={!confirmed || !valid} onClick={() => { if (reading) { onConfirm(reading); setApplied(true); } }}>Use checked figures</button>{applied && <p role="status">Added to the comparison form below. Choose your region, then decide whether to research alternatives.</p>}</fieldset>}<p>Reading and researching are separate tasks within your three-task trial. You can also enter figures below without uploading anything.</p></section>;
}
