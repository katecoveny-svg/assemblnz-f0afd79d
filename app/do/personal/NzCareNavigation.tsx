"use client";

import { useEffect, useId, useRef, useState } from 'react';
import { ArrowDownToLine, ArrowUpRight, Check, ChevronRight, Phone } from 'lucide-react';
import { NZ_CARE_BOUNDARY, NZ_CARE_CONTACTS, NZ_CARE_GUIDES, NZ_CARE_SOURCES, nextNzCareStep, nzCareChecklistText, nzCareGuide, nzCareReviewNeedsChecking, type NzCareContact, type NzCareSource } from '@/apps/do/personal/care-navigation/catalogue';
import styles from './NzCareNavigation.module.css';

function OfficialLink({ source }: { source: NzCareSource }) {
  return <a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}<ArrowUpRight size={16} aria-hidden="true" /><span className={styles.srOnly}> (opens a new tab)</span></a>;
}
function Contact({ contact }: { contact: NzCareContact }) {
  return <div className={styles.contact}>
    <strong>{contact.title}</strong>
    <a className={styles.call} href={contact.href}><Phone size={16} aria-hidden="true" />Call {contact.number}</a>
    <p>{contact.description}</p>
    <OfficialLink source={NZ_CARE_SOURCES[contact.sourceId]} />
  </div>;
}
/** Keyed to the verified owner by its parent. No storage, network calls or personal-data fields. */
export function NzCareNavigation({ storageScope = 'guest' }: { storageScope?: string }) {
  return <NzCareWorkspace key={storageScope} />;
}
function NzCareWorkspace() {
  const id = useId();
  const [selected, setSelected] = useState('home-support');
  const [checkedByGuide, setCheckedByGuide] = useState<Record<string, string[]>>({});
  const [large, setLarge] = useState(false);
  const [oneStep, setOneStep] = useState(false);
  const [notice, setNotice] = useState('');
  const [needsChecking] = useState(() => nzCareReviewNeedsChecking());
  const activeStep = useRef<HTMLInputElement>(null);
  const completion = useRef<HTMLParagraphElement>(null);
  const moveStepFocus = useRef(false);
  const guide = nzCareGuide(selected) ?? NZ_CARE_GUIDES[0];
  const checked = checkedByGuide[guide.id] ?? [];
  const next = nextNzCareStep(guide, checked);
  const visibleSteps = oneStep ? (next ? [next] : []) : guide.steps;
  useEffect(() => {
    if (!moveStepFocus.current) return;
    moveStepFocus.current = false;
    if (oneStep) (activeStep.current ?? completion.current)?.focus();
  }, [next?.id, oneStep]);
  function toggle(stepId: string) {
    if (!guide.steps.some((step) => step.id === stepId)) return;
    moveStepFocus.current = oneStep;
    setCheckedByGuide((current) => {
      const previous = current[guide.id] ?? [];
      return { ...current, [guide.id]: previous.includes(stepId) ? previous.filter((item) => item !== stepId) : [...previous, stepId] };
    });
    setNotice('Preparation updated on this page only. No service or application has been completed.');
  }
  function download() {
    try {
      const url = URL.createObjectURL(new Blob([nzCareChecklistText(guide, checked)], { type: 'text/plain;charset=utf-8' }));
      const anchor = document.createElement('a');
      anchor.href = url; anchor.download = `nz-care-${guide.id}-checklist.txt`; anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1_000);
      setNotice('Download requested for this guide only. Keep the file private; it has not been sent to anyone.');
    } catch { setNotice('This browser could not download the guide. You can still use the checklist and official links here.'); }
  }
  return <section id="nz-care-navigation" className={`${styles.panel} ${large ? styles.large : ''}`} aria-labelledby={`${id}-heading`}>
    <header className={styles.header}>
      <div><p className={styles.eyebrow}>Aotearoa New Zealand</p><h2 id={`${id}-heading`}>Care, health & later life</h2><p>Find the right place to start, for you or someone you care about.</p></div>
      <button className={styles.textSize} type="button" aria-pressed={large} onClick={() => setLarge(!large)}>Aa · {large ? 'Standard text' : 'Larger text'}</button>
    </header>
    <div className={styles.urgent} aria-label="Emergency and health advice contacts">
      {NZ_CARE_CONTACTS.slice(0, 2).map((contact) => <Contact key={contact.id} contact={contact} />)}
      <p className={styles.urgentBoundary}>DO does not monitor emergencies or place calls. These links open your device’s phone app if available.</p>
    </div>
    <div className={styles.selection}>
      <label htmlFor={`${id}-topic`}>What would help?</label>
      <select id={`${id}-topic`} value={guide.id} onChange={(event) => { setSelected(event.target.value); setNotice(''); }}>
        {NZ_CARE_GUIDES.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
      </select>
      <p className={styles.privacy}>Use this without entering health or financial details. Your choices and ticks stay in this open page; they are not saved or sent to a model, service or whānau.</p>
    </div>
    <article aria-labelledby={`${id}-guide-heading`}>
      <div className={styles.guideHeading}><p className={styles.eyebrow}>Your starting point</p><h3 id={`${id}-guide-heading`}>{guide.title}</h3><p>{guide.summary}</p></div>
      <p className={styles.start}><ChevronRight size={22} aria-hidden="true" /><span>{guide.startWith}</span></p>
      <ul className={styles.facts}>{guide.facts.map((fact) => <li key={fact}>{fact}</li>)}</ul>
      <div className={styles.checklistHeading}><h4>Get ready for the conversation</h4><button type="button" aria-pressed={oneStep} onClick={() => { setOneStep(!oneStep); setNotice(''); }}>{oneStep ? 'Show all steps' : 'One step at a time'}</button></div>
      <p className={styles.meta}>{checked.length} of {guide.steps.length} preparation steps reviewed by you. Ticks do not mean a booking, application or assessment is complete.</p>
      <ol className={styles.steps}>
        {visibleSteps.map((step) => <li key={`${guide.id}-${step.id}`} value={guide.steps.indexOf(step) + 1}>
          <label><input ref={oneStep ? activeStep : undefined} type="checkbox" checked={checked.includes(step.id)} onChange={() => toggle(step.id)} /><span><strong>{step.title}</strong><span className={styles.stepDetail}>{step.detail}</span><span className={styles.checkLabel}>{checked.includes(step.id) ? 'Preparation reviewed' : 'Mark preparation reviewed'}</span></span></label>
        </li>)}
      </ol>
      {oneStep && !next && <p ref={completion} tabIndex={-1} className={styles.finished}><Check size={20} aria-hidden="true" />You’ve reviewed the preparation. The service still needs to confirm any next steps.</p>}
      <details className={styles.details} open key={`${guide.id}-questions`}><summary>Questions to ask</summary><ul>{guide.questions.map((question) => <li key={question}>{question}</li>)}</ul></details>
      <details className={styles.details} key={`${guide.id}-documents`}><summary>Documents to keep privately</summary><p>Bring or send documents directly to the relevant service only when needed. Do not upload them here.</p><ul>{guide.documents.map((document) => <li key={document}>{document}</li>)}</ul></details>
      <p className={styles.boundary}>{guide.boundary}</p>
      <div className={styles.actions}><button type="button" className={styles.download} onClick={download}><ArrowDownToLine size={18} aria-hidden="true" />Download this checklist</button>{checked.length > 0 && <button type="button" onClick={() => { setCheckedByGuide((current) => ({ ...current, [guide.id]: [] })); setNotice('Preparation ticks cleared for this guide. Other guides are unchanged.'); }}>Clear these ticks</button>}</div>
      <p className={styles.meta}>The download contains this guide and its ticks only. Review it before sharing. Refreshing or leaving this workspace clears the on-page ticks.</p>
      <p className={styles.notice} role="status" aria-live="polite">{notice}</p>
      <div className={styles.sources}><h4>Official sources</h4><p>Guidance checked 30 September 2026. {needsChecking ? 'This review is over 90 days old or the date could not be verified. Recheck the official pages before acting.' : 'Curated guidance, not a live feed. Recheck the official pages before acting.'}</p><ul>{guide.sourceIds.map((sourceId) => <li key={sourceId}><OfficialLink source={NZ_CARE_SOURCES[sourceId]} /><span>{NZ_CARE_SOURCES[sourceId].organisation}</span></li>)}</ul></div>
    </article>
    <details className={styles.details}><summary>More people who can help</summary><div className={styles.contacts}>{NZ_CARE_CONTACTS.slice(2).map((contact) => <Contact key={contact.id} contact={contact} />)}</div><p>If you are Deaf, hard of hearing or speech impaired, 111 TXT requires registration before it will work.</p><OfficialLink source={NZ_CARE_SOURCES.accessibleEmergency} /></details>
    <footer className={styles.footer}>{NZ_CARE_BOUNDARY} Only share someone else’s information with their permission or appropriate authority. Any future use of sensitive details for model drafting or sharing needs a separate, specific choice.</footer>
  </section>;
}
