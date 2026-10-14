'use client';
import { useEffect, useRef, useState } from 'react';
import { brandVoiceDraftSchema, initialBrandVoice, referenceProblem, stockVoiceCandidates, type BrandVoiceDraft } from '@/lib/voice/assembl/brand';
import styles from './voices.module.css';
export function BrandVoiceWorkspace() {
  const [draft, setDraft] = useState<BrandVoiceDraft>({ ...initialBrandVoice });
  const [audio, setAudio] = useState<{ url: string; file: File; seconds: number }>();
  const [transcript, setTranscript] = useState('');
  const [consent, setConsent] = useState(false);
  const [problem, setProblem] = useState('');
  const [notice, setNotice] = useState('Your brand kit is a local draft. Download it to keep these settings.');
  const fileInput = useRef<HTMLInputElement>(null);
  const audioUrl = audio?.url;
  useEffect(() => () => { if (audioUrl) URL.revokeObjectURL(audioUrl); }, [audioUrl]);
  const update = (next: Partial<BrandVoiceDraft>) => { setDraft(previous => ({ ...previous, ...next, approval: 'not-auditioned' })); setConsent(false); };
  const chooseAudio = (file?: File) => {
    setConsent(false); setProblem(''); setAudio(undefined);
    if (!file) return;
    if (file.size > 10 * 1024 * 1024 || !file.type.startsWith('audio/')) { setProblem('Choose an audio file up to 10 MB.'); return; }
    setAudio({ url: URL.createObjectURL(file), file, seconds: 0 });
  };
  const download = () => {
    const checked = brandVoiceDraftSchema.safeParse(draft);
    if (!checked.success) { setNotice('Add a brand, voice name and short script before downloading.'); return; }
    const url = URL.createObjectURL(new Blob([JSON.stringify(checked.data, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = 'assembl-brand-voice-draft.json'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice('Brand kit downloaded. It contains settings only: no audio, recording consent or voice approval.');
  };
  return <section className={styles.brief} aria-labelledby="brand-voice-heading">
    <h2 id="brand-voice-heading">Build your brand voice</h2>
    <p>A reusable brand identity can use a licensed stock voice, a consented own-voice clone or a designed voice. Choose and review here; connection and audition come before approval.</p>
    <label>Brand or workspace name<input value={draft.brand} maxLength={80} onChange={e => update({ brand: e.target.value })} /></label>
    <label>Voice profile name<input value={draft.name} maxLength={80} onChange={e => update({ name: e.target.value })} /></label>
    <label>Voice source<select value={draft.kind} onChange={e => { update({ kind: e.target.value as BrandVoiceDraft['kind'], voiceId: '' }); setAudio(undefined); setTranscript(''); }}>
      <option value="licensed-stock">Licensed stock voice</option><option value="own-clone">Consented own voice</option><option value="designed">Original designed voice</option>
    </select></label>
    {draft.kind === 'licensed-stock' && <><label>NZ audition candidate<select value={draft.voiceId} onChange={e => update({ voiceId: e.target.value })}><option value="">Choose a candidate</option>{stockVoiceCandidates.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}</select></label><p>Microsoft Azure Speech catalogue candidates: API access, not owned/downloadable model weights. Availability, commercial usage, account costs and listening approval must be verified. <a href={stockVoiceCandidates[0].source} target="_blank" rel="noreferrer">Official language support</a></p></>}
    {draft.kind === 'own-clone' && <><p>Choose your own recording or one you have explicit speaker permission to use. The audio stays in this tab; selecting it does not upload, save a server profile, train or clone it.</p>
      <label>Private reference recording<input ref={fileInput} type="file" accept="audio/wav,audio/mpeg,audio/mp4,audio/webm,audio/ogg" onChange={e => chooseAudio(e.target.files?.[0])} /></label>
      {audio && <><audio controls preload="metadata" src={audio.url} onLoadedMetadata={e => { const seconds = e.currentTarget.duration; setProblem(referenceProblem(audio.file.size, audio.file.type, seconds) ?? ''); setAudio(previous => previous ? { ...previous, seconds } : previous); }} onError={() => setProblem('This reference could not be decoded. Choose another recording.')} /><button type="button" onClick={() => { setAudio(undefined); setConsent(false); setProblem(''); if (fileInput.current) fileInput.current.value = ''; }}>Remove reference</button></>}
      <label>Exact words in the reference<textarea value={transcript} maxLength={2000} rows={3} onChange={e => { setTranscript(e.target.value); setConsent(false); }} /></label>
      <label className={styles.consent}><input type="checkbox" disabled={!audio?.seconds || !!problem || !transcript.trim()} checked={consent} onChange={e => setConsent(e.target.checked)} />I own this voice or have explicit speaker permission, and approve this recording for a private reference review. Any later provider upload or generation needs a separate review.</label>
      <p role="status">{problem || (consent ? 'Reference and transcript reviewed locally. Nothing uploaded or cloned.' : 'Review the recording and transcript before confirming permission.')}</p></>}
    <label>Tone and delivery direction<textarea value={draft.direction} maxLength={3000} rows={4} onChange={e => update({ direction: e.target.value })} /></label>
    <label>Pronunciation notes<textarea value={draft.pronunciation} maxLength={2000} rows={3} placeholder="Approved pronunciations; optional Māori terms need separate review." onChange={e => update({ pronunciation: e.target.value })} /></label>
    <label>Avatar or visual identity reference<input value={draft.avatarReference} maxLength={500} placeholder="Existing approved asset reference, if any" onChange={e => update({ avatarReference: e.target.value })} /></label>
    <p>This links a draft identity reference only. Still-image generation, avatar rendering and lip sync are separate capabilities; none starts here.</p>
    <label>Short audition script<textarea value={draft.script} maxLength={300} rows={3} onChange={e => update({ script: e.target.value })} /></label>
    <button type="button" onClick={download}>Download reusable brand kit</button>
    <label>Restore a brand kit<input type="file" accept="application/json,.json" onChange={async e => { const f = e.target.files?.[0]; if (!f) return; if (f.size > 16000) { setNotice('Choose a small brand kit JSON file.'); return; } try { const next = brandVoiceDraftSchema.parse(JSON.parse(await f.text())); setDraft(next); setAudio(undefined); setTranscript(''); setConsent(false); setNotice('Settings restored as an unauditioned local draft. Reselect the private reference separately.'); } catch { setNotice('This file is not a supported brand kit.'); } }} /></label>
    <p role="status">{notice}</p>
    <h3>Next: preview, listen, approve</h3><p>Own-voice cloning needs a compatible Base engine and owner-bound private storage. The current Qwen worker is VoiceDesign with fixed presets; these brand settings do not change its requests. Provider-specific controls must be supported before use. No brand preview or approved default has been created.</p>
    <p>The three legacy Warm, Clear and Bright examples failed Kate’s NZ-accent listening test. They remain rejected audition evidence, not approved NZ brand voices.</p>
  </section>;
}
