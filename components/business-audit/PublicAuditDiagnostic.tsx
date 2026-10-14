'use client';
import { useState, useSyncExternalStore } from 'react';
import { prepareDiagnostic, snapshotSchema, type DiagnosticAnswers, type DiagnosticSnapshot } from '../../lib/business-audit/diagnostic';
import { AUDIT_ENQUIRY_EMAIL, diagnosticEmailDraft, emailDraftFingerprint, reviewedDiagnosticMailto } from '../../lib/business-audit/public-handoff';
import './audit.css';
const labels = { businessType: 'Business type', goal: 'Goal', task: 'One recurring task', role: 'Your role', frequency: 'How often?', count: 'Approximate count', tools: 'Tool names only', outcome: 'Desired outcome' };
const subscribeHydration = () => () => {};
const emptyAnswers = { businessType: '', goal: '', task: '', role: '', frequency: '', count: '', tools: '', outcome: '' };
/** Public-only entry: no owner context, persistence port, private models or records. */
export function PublicAuditDiagnostic() {
    const ready = useSyncExternalStore(subscribeHydration, () => true, () => false);
    const [focus, setFocus] = useState<DiagnosticAnswers['bottleneck'] | ''>('');
    const [answers, setAnswers] = useState(emptyAnswers), [consent, setConsent] = useState(false);
    const [snapshot, setSnapshot] = useState<DiagnosticSnapshot | null>(null), [contact, setContact] = useState(false);
    const [reviewed, setReviewed] = useState<string | null>(null), [notice, setNotice] = useState('');
    const parsedSnapshot = snapshot ? snapshotSchema.safeParse(snapshot) : null;
    const validSnapshot = parsedSnapshot?.success ? parsedSnapshot.data : null;
    const draft = validSnapshot ? diagnosticEmailDraft(validSnapshot) : null;
    const stepErrors = snapshot?.steps.map(text => !text.trim() ? 'Add a suggested step before downloading or preparing an email.' : text.length > 300 ? 'Keep this step to 300 characters or fewer.' : null) ?? [];
    function changed() { setSnapshot(null); setReviewed(null); setContact(false); setNotice('Answers changed. Prepare a new outline when ready.'); }
    function prepare() {
        if (!ready || !focus || !consent) return;
        try { setSnapshot(prepareDiagnostic({ ...answers, bottleneck: focus })); setReviewed(null); setContact(false); setNotice('Outline prepared in this tab. Nothing sent or saved on a server.'); }
        catch { setNotice('Check the high-level answers and try again.'); }
    }
    function exportOutline() {
        if (!validSnapshot) return;
        try { const valid = validSnapshot; const url = URL.createObjectURL(new Blob([JSON.stringify(valid, null, 2)], { type: 'application/json' })); const a = document.createElement('a'); a.href = url; a.download = 'assembl-diagnostic-outline.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); setNotice('Downloaded to this device. Nothing submitted.'); }
        catch { setNotice('Complete the suggested steps before downloading.'); }
    }
    function openEmail() {
        if (!validSnapshot || !ready) return;
        try { const href = reviewedDiagnosticMailto(validSnapshot, reviewed); window.location.assign(href); setNotice('Your email app should open a draft. Review it there and press Send if you choose. Nothing was submitted or saved by this page. If no app opens, copy the displayed brief and email assembl@assembl.co.nz.'); }
        catch (error) { setNotice(error instanceof Error ? error.message : 'Review the exact email draft first.'); }
    }
    return <div className="audit-shell" data-private="true" data-hj-suppress data-clarity-mask="true">
        <p className="audit-eyebrow">business audit / your outline · your next step</p>
        <div className="audit-layout"><aside className="audit-story"><p className="audit-eyebrow">understand → build → measure</p><h1>less friction.<br />more room<br /><span>to grow.</span></h1><p>Find the work that costs you time. See what can change. Measure what actually improves.</p><div className="audit-map" aria-label="Audit stages: systems, workflow, opportunity, proof"><div>your systems <span>01</span></div><i aria-hidden="true">↓</i><div className="offset">the work between them <span>02</span></div><i aria-hidden="true">↓</i><div>one useful change <span>03</span></div><i aria-hidden="true">↓</i><div className="proof">proof of progress <span>04</span></div></div></aside>
        <section id="public-audit-main" className="audit-panel" aria-label="Public business diagnostic"><p className="audit-eyebrow">01 / a small first step</p><h2>where does work<br />get stuck?</h2><p>Shape a focused audit in a few minutes. Keep it high level: no confidential details, customer names, credentials or uploads.</p><p>Your answers stay in this tab until you choose a download or email draft. Refreshing clears them. This page does not submit a lead.</p>
        <noscript><p>The interactive outline needs JavaScript. Nothing here submits a form. You can email <a href={`mailto:${AUDIT_ENQUIRY_EMAIL}`}>{AUDIT_ENQUIRY_EMAIL}</a> yourself with a short high-level brief.</p></noscript>
        {!ready && <p role="status">Preparing the local outline controls… You can also email {AUDIT_ENQUIRY_EMAIL} yourself.</p>}
        {/* Deliberately no form, named answer controls or submit buttons: safe before hydration. */}
        <fieldset className="audit-options" disabled={!ready}><legend>What would you like to improve first?</legend>{(['Too many subscriptions', 'Repeated admin', 'Slow handoffs', 'Lost enquiries'] as const).map(item => <label key={item} className={focus === item ? 'selected' : ''}><input type="radio" checked={focus === item} onChange={() => { setFocus(item); changed(); }}/>{item}<span aria-hidden="true">↗</span></label>)}</fieldset>
        <details><summary>Add the task you want to understand</summary>{Object.entries(labels).map(([key, label]) => <label key={key}>{label}<input disabled={!ready} maxLength={300} autoComplete="off" data-private="true" value={answers[key as keyof typeof answers]} onChange={e => { setAnswers({ ...answers, [key]: e.target.value }); changed(); }}/></label>)}</details>
        <label className="audit-consent"><input type="checkbox" disabled={!ready} checked={consent} onChange={e => { setConsent(e.target.checked); setReviewed(null); }}/>Prepare a local snapshot from these answers. Nothing is submitted or saved on a server.</label><button type="button" className="audit-primary" disabled={!ready || !focus || !consent} onClick={prepare}>prepare my audit outline ↗</button>
        {snapshot && <section className="audit-diagnostic-result" aria-label="Prepared diagnostic snapshot"><p className="audit-eyebrow">your outline / editable draft</p><h3>{snapshot.answers.task || 'Choose a recurring task'}</h3><p>{snapshot.evidenceQualification}</p>{snapshot.steps.map((text, i) => <label key={i}>Suggested step {i + 1}<textarea className="audit-step-edit" rows={2} maxLength={300} aria-label={`Suggested step ${i + 1}`} aria-invalid={!!stepErrors[i]} aria-describedby={stepErrors[i] ? `public-step-error-${i}` : undefined} value={text} ref={element => { if (element) { element.style.height = 'auto'; element.style.height = `${element.scrollHeight}px`; } }} onChange={e => { setSnapshot({ ...snapshot, revision: snapshot.revision + 1, steps: snapshot.steps.map((s, index) => index === i ? e.target.value : s) }); setReviewed(null); }}/>{stepErrors[i] && <span id={`public-step-error-${i}`} className="audit-field-error" role="status">{stepErrors[i]}</span>}</label>)}<h4>One opportunity to test</h4><p>{snapshot.opportunity}</p><h4>One question to answer</h4><p>{snapshot.missingQuestion}</p><h4>Measure before changing</h4><p>{snapshot.measurement}</p><button type="button" className="audit-text" disabled={!validSnapshot} onClick={exportOutline}>download my outline</button><button type="button" className="audit-secondary" onClick={() => { setContact(!contact); setReviewed(null); }}>enquire about an audit</button>
        {contact && !draft && <p role="status">Complete the suggested steps to preview an email. Your edits remain here.</p>}{contact && draft && <section aria-label="Review email draft"><h3>your email. your choice.</h3><p>To: {draft.to}<br />Subject: {draft.subject}</p><p>The draft includes only this displayed high-level brief. Your email app supplies your sender address. Opening a draft does not send it; you choose Send in your email app. No marketing sign-up.</p><pre className="audit-email-preview">{draft.body}</pre><label className="audit-consent"><input type="checkbox" checked={reviewed === emailDraftFingerprint(draft)} onChange={e => setReviewed(e.target.checked ? emailDraftFingerprint(draft) : null)}/>I reviewed this exact brief and want to open it in my email app.</label><button type="button" className="audit-primary" disabled={!ready || reviewed !== emailDraftFingerprint(draft)} onClick={openEmail}>Open email draft</button><p>If your email app does not open, copy the displayed brief and email {draft.to}. <a href="https://www.assembl.co.nz/privacy" rel="noreferrer">Read assembl’s privacy information</a> before choosing to send.</p></section>}</section>}
        <p role="status" aria-live="polite" className="audit-notice">{notice}</p></section></div><footer className="audit-footer">understand the work · test one change · measure the result</footer>
    </div>;
}
