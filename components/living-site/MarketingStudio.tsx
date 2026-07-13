'use client';

import { useState } from 'react';
import type { GenomeFact } from '@/lib/customers/auckland-dog-trainer/genome';
import type { SampleVertical } from '@/lib/living-site/verticals';
import styles from './living-site-tools.module.css';

type Channel = 'Instagram post' | 'LinkedIn post' | 'customer email' | 'campaign outline';

export function MarketingStudio({
  v,
  services,
  voice,
}: {
  v: SampleVertical;
  services: GenomeFact[];
  voice: string;
}) {
  const [channel, setChannel] = useState<Channel>('Instagram post');
  const [brief, setBrief] = useState('');
  const [audience, setAudience] = useState('local customers considering their first booking');
  const [output, setOutput] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const fallback = () => {
    const service = services[0];
    return [
      `${service?.label ?? v.businessName}: a useful place to start`,
      '',
      brief || v.heroLede,
      '',
      service ? `${service.value}.` : '',
      `Talk with ${v.owner} before deciding what fits.`,
      '',
      `Draft for ${channel} · review before publishing.`,
    ].filter(Boolean).join('\n');
  };

  const generate = async () => {
    setBusy(true);
    setOutput('');
    setError('');
    setNotice('');
    try {
      const response = await fetch('/api/creative/copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent: 'muse',
          messages: [{
            role: 'user',
            content: [
              `Draft one ${channel} for ${v.businessName}, a fictional ${v.industryLabel} sample business.`,
              `Audience: ${audience}.`,
              `Business voice: ${voice}.`,
              `Brief: ${brief || v.heroLede}`,
              `Available services: ${services.map((item) => `${item.label} — ${item.value}`).join('; ')}.`,
              'Use NZ English. Be concrete. Do not invent proof, outcomes, availability or customer quotes.',
              `End with a human-reviewed next step involving ${v.owner}. Return copy only; do not say it was published or sent.`,
            ].join('\n'),
          }],
        }),
      });
      const contentType = response.headers.get('content-type') ?? '';
      if (contentType.includes('application/json')) {
        const result = await response.json().catch(() => ({}));
        if (result.notConfigured) {
          setOutput(fallback());
          setNotice(`Muse is not configured in this environment (${result.envVar}); showing the deterministic studio draft.`);
          return;
        }
        if (!response.ok || result.error) throw new Error(result.error ?? 'Could not draft the campaign.');
      }
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let text = '';
      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        setOutput(text);
      }
      if (!text.trim()) {
        setOutput(fallback());
        setNotice('The model returned no copy, so the studio produced a deterministic draft instead.');
      }
    } catch (cause) {
      setOutput(fallback());
      setError(cause instanceof Error ? cause.message : 'Could not draft the campaign.');
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setNotice('Draft copied. Review it before publishing or sending.');
  };

  return (
    <>
      <section className={styles.intro}>
        <p className={styles.eyebrow}>marketing & social · genome grounded</p>
        <h2>Turn one business fact into useful campaign copy.</h2>
        <p>The studio reads this vertical&apos;s services and voice, then drafts for the channel you choose. Nothing connects to a publishing account and nothing goes out without a person&apos;s approval.</p>
      </section>
      <div className={styles.twoColumn}>
        <section className={styles.card}>
          <p className={styles.eyebrow}>campaign brief</p>
          <h2>Tell Muse what matters</h2>
          <form className={styles.form} onSubmit={(event) => event.preventDefault()}>
            <label>Channel<select value={channel} onChange={(event) => setChannel(event.target.value as Channel)}><option>Instagram post</option><option>LinkedIn post</option><option>customer email</option><option>campaign outline</option></select></label>
            <label>Audience<input value={audience} onChange={(event) => setAudience(event.target.value)} /></label>
            <label>Brief<textarea rows={7} value={brief} onChange={(event) => setBrief(event.target.value)} placeholder={`Promote ${services[0]?.label ?? 'our lead service'} without sounding salesy…`} /></label>
            <div className={styles.buttonRow}>
              <button className={styles.primaryButton} type="button" disabled={busy} onClick={() => void generate()}>{busy ? 'drafting…' : 'Draft campaign copy'}</button>
              <button className={styles.secondaryButton} type="button" disabled={!output} onClick={() => void copy()}>Copy draft</button>
            </div>
            {notice ? <p className={styles.notice} role="status">{notice}</p> : null}
            {error ? <p className={styles.error} role="alert">{error} A local draft is shown so the workflow still works.</p> : null}
          </form>
        </section>
        <section className={styles.preview}>
          <p className={styles.eyebrow}>draft · {channel.toLowerCase()} · awaiting approval</p>
          <h2>{output ? 'Campaign draft' : 'Your copy will assemble here'}</h2>
          <div className={styles.output}>{output || `Voice: ${voice}\n\nServices and prices come from the same Business Genome as the customer site.`}</div>
          <p className={styles.approval}>Draft-only. Check claims, dates, prices, licences, likeness consent and channel requirements before anything is published or sent.</p>
        </section>
      </div>
    </>
  );
}
