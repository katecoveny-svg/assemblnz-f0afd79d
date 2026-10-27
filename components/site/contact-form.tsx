'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowRight, ArrowUpRight, Check, Copy, Pencil } from 'lucide-react';
import { CONTACT_EMAIL, PROJECT_TOPICS, contactEmailDraft, type ContactBrief } from '@/lib/contact/email-draft';
import styles from '@/app/contact/contact.module.css';

export function ContactForm({ initialInterest = 'other' }: { initialInterest?: string }) {
  const [ready, setReady] = useState(false);
  useEffect(() => { const frame = requestAnimationFrame(() => setReady(true)); return () => cancelAnimationFrame(frame); }, []);
  const [brief, setBrief] = useState<ContactBrief>({ name: '', email: '', business: '', topic: initialInterest, message: '' });
  const [review, setReview] = useState(false);
  const [copyState, setCopyState] = useState('');
  const reviewHeading = useRef<HTMLHeadingElement>(null);
  const firstField = useRef<HTMLInputElement>(null);
  const draft = contactEmailDraft(brief);
  function update(key: keyof ContactBrief, value: string) { setBrief(previous => ({ ...previous, [key]: value })); setCopyState(''); }
  function prepare(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setReview(true);
    requestAnimationFrame(() => reviewHeading.current?.focus());
  }
  async function copyDraft() {
    try { await navigator.clipboard.writeText(`To: ${draft.to}\nSubject: ${draft.subject}\n\n${draft.body}`); setCopyState('Draft copied. Paste it into your email app and review before sending.'); }
    catch { setCopyState('Copy is unavailable. Select and copy the draft below, then paste it into your email app.'); }
  }
  return <div className={styles.formSurface} id="project-brief" tabIndex={-1}>
    <div className={styles.formTop}><span>{review ? '02 / Review' : '01 / Your brief'}</span><span>Prepared here. Sent by you.</span></div>
    {!review ? <form onSubmit={prepare} className={styles.form} data-hj-suppress>
      <fieldset disabled={!ready} className={styles.formFields}><legend className="sr-only">Your project brief</legend>
      <fieldset className={styles.topics}><legend>What are you thinking about?</legend><div>{PROJECT_TOPICS.map(topic => <label key={topic.value}><input type="radio" name="topic" value={topic.value} checked={brief.topic === topic.value} onChange={event => update('topic', event.target.value)} /><span>{topic.label}<Check size={15} aria-hidden="true" /></span></label>)}</div></fieldset>
      <div className={styles.field}><label htmlFor="message">The work you have in mind <span>Required</span></label><p id="message-hint">{PROJECT_TOPICS.find(topic => topic.value === brief.topic)?.prompt}</p><textarea id="message" name="message" required minLength={10} maxLength={4000} rows={5} value={brief.message} onChange={event => update('message', event.target.value)} aria-describedby="message-hint message-count" placeholder="A few sentences are plenty. Include a useful link if you have one." /><small id="message-count">{brief.message.length.toLocaleString()} / 4,000 characters</small></div>
      <div className={styles.fieldPair}>
        <div className={styles.field}><label htmlFor="name">Your name <span>Required</span></label><input ref={firstField} id="name" name="name" autoComplete="name" required maxLength={120} value={brief.name} onChange={event => update('name', event.target.value)} /></div>
        <div className={styles.field}><label htmlFor="email">Your email <span>Required</span></label><input id="email" name="email" type="email" autoComplete="email" required maxLength={254} value={brief.email} onChange={event => update('email', event.target.value)} /></div>
      </div>
      <div className={styles.field}><label htmlFor="business">Business or organisation <span>Optional</span></label><input id="business" name="business" autoComplete="organization" maxLength={160} value={brief.business} onChange={event => update('business', event.target.value)} /></div>
      <div className={styles.formBottom}><p>This prepares an email on your device. Nothing is submitted to assembl by this form. Please leave out confidential information.</p><button type="submit" className={styles.primary}>Review email draft <ArrowRight size={18} aria-hidden="true" /></button></div>
      </fieldset>
      <noscript><p>This draft builder needs JavaScript. You can email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> directly.</p></noscript>
    </form> : <section className={styles.review} aria-labelledby="draft-heading">
      <h3 ref={reviewHeading} tabIndex={-1} id="draft-heading">Your words, ready to share.</h3><p>Nothing has been sent. Review the draft, then open your email app or copy it.</p>
      <dl><div><dt>To</dt><dd>{draft.to}</dd></div><div><dt>Subject</dt><dd>{draft.subject}</dd></div></dl>
      <label htmlFor="email-preview" className={styles.previewLabel}>Email draft</label><textarea id="email-preview" readOnly value={draft.body} rows={11} />
      <div className={styles.reviewActions}><a href={draft.href} className={styles.primary}>Open email draft <ArrowUpRight size={18} aria-hidden="true" /></a><button type="button" onClick={copyDraft}><Copy size={16} aria-hidden="true" /> Copy draft</button><button type="button" onClick={() => { setReview(false); setCopyState(''); requestAnimationFrame(() => firstField.current?.focus()); }}><Pencil size={16} aria-hidden="true" /> Edit brief</button></div>
      <p className={styles.handoff}>Your email app must be set up. If it doesn’t open, copy the draft and email {CONTACT_EMAIL}. You press Send there.</p>
      <p role="status" className={styles.copyStatus}>{copyState}</p>
    </section>}
  </div>;
}
