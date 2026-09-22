'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowRight, ArrowUpRight, Check, Download, Search } from 'lucide-react';
import { Draft, type PublicResearchResult } from '@/lib/pursuit/public-contract';
import { outreachExport, parseOutreach, publicWebsite, reviewFingerprint, type OutreachCopy } from '@/lib/pursuit/outreach';
import styles from './website-outreach.module.css';

type Status = 'checking' | 'ready' | 'unavailable';
export function WebsiteOutreach() {
  const [status, setStatus] = useState<Status>('checking');
  const [website, setWebsite] = useState('');
  const [market, setMarket] = useState('');
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [result, setResult] = useState<PublicResearchResult | null>(null);
  const [selected, setSelected] = useState(0);
  const [copies, setCopies] = useState<OutreachCopy[]>([]);
  const [review, setReview] = useState('');
  const request = useRef<AbortController | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/pursuit/research', { cache: 'no-store', signal: controller.signal })
      .then(r => r.ok ? r.json() : null).then(r => setStatus(r?.ready ? 'ready' : 'unavailable'))
      .catch(() => { if (!controller.signal.aborted) setStatus('unavailable'); });
    return () => { controller.abort(); request.current?.abort(); };
  }, []);

  async function research(event: FormEvent) {
    event.preventDefault();
    const url = publicWebsite(website.trim());
    if (!url) { setError('Enter a public HTTPS business website, such as assembl.co.nz.'); return; }
    if (busy || !consent || status !== 'ready') return;
    setBusy(true); setError(''); setNotice(''); setResult(null); setReview('');
    const controller = new AbortController(); request.current = controller;
    const timeout = setTimeout(() => controller.abort(), 85000);
    try {
      const response = await fetch('/api/pursuit/research', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal,
        body: JSON.stringify({ requestId: crypto.randomUUID(), company: url, goal: market.trim() || 'Infer a plausible customer profile and geography from the seller website. Find relevant businesses with published signals. Treat the inferred target market as a proposal.', consent: true, workflow: 'website_outreach' }),
      });
      const value = await response.json();
      if (!response.ok) throw new Error(typeof value.error === 'string' ? value.error : 'Research could not be completed.');
      Draft.parse(value.draft);
      if (value.mode !== 'live' || !Array.isArray(value.trace?.sources) || !value.trace.sources.length) throw new Error('The research did not return a source trail.');
      const campaign = parseOutreach(value.campaign, value.trace.sources.map((s: { url: string }) => s.url), url);
      setResult({ ...value, campaign }); setSelected(0);
      setCopies(campaign.prospects.map(p => ({ subject: p.subject, opening: p.opening, followUp: p.followUp })));
    } catch (e) { setError(controller.signal.aborted ? 'The request timed out. No result has been substituted. You can try again.' : e instanceof Error ? e.message : 'Research could not be completed.'); }
    finally { clearTimeout(timeout); request.current = null; setBusy(false); }
  }
  const campaign = result?.campaign;
  const prospect = campaign?.prospects[selected];
  const copy = copies[selected];
  const fingerprint = result && prospect && copy ? reviewFingerprint(result.trace.id, prospect, copy) : '';
  const approved = Boolean(fingerprint && review === fingerprint);
  const validCopy = Boolean(copy?.subject.trim() && copy?.opening.trim() && copy?.followUp.trim());
  function edit(field: keyof OutreachCopy, value: string) {
    setCopies(current => current.map((item, i) => i === selected ? { ...item, [field]: value } : item));
    setReview(''); setNotice('');
  }
  function exportDraft() {
    if (!approved || !result || !campaign || !prospect || !copy) return;
    const content = outreachExport(campaign, prospect, copy, result.trace.id, result.trace.at);
    const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = 'pursuit-reviewed-outreach.txt'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    setNotice('Reviewed draft downloaded with its sources. Nothing has been sent.');
  }
  return <section id="website-outreach" className={styles.section} aria-labelledby="outreach-title">
    <header className={styles.heading}><div><p className={styles.eyebrow}>Pursuit / website to conversation</p><h2 id="outreach-title">Your website.<br /><span>Your next opening.</span></h2></div><p>Start with what you sell. Find businesses with a reason to talk. Shape an approach that earns its place in their inbox.</p></header>
    <ol className={styles.steps} aria-label="Outreach steps"><li aria-current={!result ? 'step' : undefined}>01 <span>Understand your offer</span></li><li aria-current={result && !approved ? 'step' : undefined}>02 <span>Review the fit</span></li><li aria-current={approved ? 'step' : undefined}>03 <span>Prepare the approach</span></li></ol>
    <div className={styles.workspace}>
      <form className={styles.brief} onSubmit={research}>
        <span className={styles.eyebrow}>The starting point</span>
        <label htmlFor="seller-website">Your business website</label><input id="seller-website" name="website" inputMode="url" autoComplete="url" placeholder="yourcompany.co.nz" value={website} maxLength={120} required disabled={busy} onChange={e => { setWebsite(e.target.value); setReview(''); setResult(null); }} />
        <label htmlFor="outreach-market">Who would you like to work with? (optional)</label><textarea id="outreach-market" name="market" placeholder="Leave blank to suggest a market from your website, or specify a sector, location and opportunity." value={market} minLength={12} maxLength={700} rows={5} disabled={busy} onChange={e => { setMarket(e.target.value); setReview(''); setResult(null); }} />
        <button className={styles.example} type="button" disabled={busy} onClick={() => { setWebsite('https://www.assembl.co.nz'); setMarket('Find New Zealand energy retailers with published household flexibility or electrification initiatives. Assembl proposes a governed household-energy agent concept. Find a plausible pilot conversation; do not imply the concept is already a live integration.'); setReview(''); setResult(null); }}>Use the Assembl Flex brief <ArrowUpRight size={14} /></button>
        <label className={styles.check}><input type="checkbox" checked={consent} disabled={busy} onChange={e => setConsent(e.target.checked)} /><span>Research these public details with the provider. Results are stored for retries and abuse control. I have excluded private information.</span></label>
        <button type="submit" className={styles.primary} disabled={busy || status !== 'ready' || !consent}>{busy ? 'Researching your next openings…' : 'Find my next openings'}<Search size={17} /></button>
        <p className={styles.small} role="status">{status === 'checking' ? 'Checking live research availability…' : status === 'unavailable' ? 'Live research is unavailable on this deployment. No sample leads will be substituted.' : 'A bounded live search. Up to three accounts, with sources.'}</p>
        <p className={styles.small}>Draft preparation only. Contact verification and connected sending are not available here. Draft edits stay in this tab; download to keep them.</p>
        {error && <p role="alert" className={styles.error}>{error}</p>}
      </form>
      <div className={styles.results} aria-busy={busy}>
        {!campaign ? <div className={styles.empty}><span className={styles.eyebrow}>{busy ? 'Research in progress' : 'A useful approach starts here'}</span><div className={styles.assembly} aria-hidden="true"><span>your offer</span><ArrowRight /><span>their signal</span><ArrowRight /><span>a reason to talk</span></div><h3>Something specific<br />to bring to the table.</h3><p>{busy ? 'Reading the public offer and looking for relevant accounts. The completed result will include sources, hypotheses and missing facts.' : 'Your shortlist will show what is published, why your offer may fit, and the smallest useful proof to propose.'}</p><div className={styles.emptyNotes}><span>01 / Published evidence</span><span>02 / Commercial hypothesis</span><span>03 / Your review</span></div></div> : <>
          <header className={styles.seller}><span className={styles.eyebrow}>Offer understood / check before using</span><h3>{campaign.seller.name}</h3><p>{campaign.seller.offer}</p><a href={campaign.seller.website} target="_blank" rel="noopener noreferrer">Seller source <ArrowUpRight size={14} /></a><p className={styles.small}>{campaign.market}</p></header>
          <div className={styles.accounts} aria-label="Researched accounts">{campaign.prospects.map((p, index) => <button type="button" key={p.website} aria-pressed={selected === index} onClick={() => { setSelected(index); setReview(''); setNotice(''); }}><span>0{index + 1}</span>{p.company}<ArrowUpRight size={14} /></button>)}</div>
          {!prospect && <p className={styles.noMatches}>No sufficiently supported accounts were found. Refine the market brief using the research gaps below.</p>}
          {prospect && copy && <div className={styles.detail}>
            <div className={styles.evidence}><span className={styles.eyebrow}>Published signal / check the source</span><p>{prospect.signal.claim}</p><a href={prospect.signal.url} target="_blank" rel="noopener noreferrer">Read the evidence <ArrowUpRight size={14} /></a><small>Published: {prospect.signal.publishedAt ?? 'date unknown'} · Retrieved: {result?.trace.at.slice(0, 10)}. Retrieval does not establish recency or buying intent.</small></div>
            <div className={styles.reasonGrid}><article><span className={styles.eyebrow}>Why it may fit</span><p>{prospect.fit}</p></article><article><span className={styles.eyebrow}>Hypothesis to test</span><p>{prospect.hypothesis}</p></article></div>
            <article className={styles.proof}><span className={styles.eyebrow}>Bring something useful</span><p>{prospect.proof}</p></article>
            <details className={styles.checks}><summary>Buyer route &amp; what still needs checking</summary><p>Suggested role: {prospect.buyerRole}. No individual or email address has been verified.</p>{prospect.contactUrl ? <a href={prospect.contactUrl} target="_blank" rel="noopener noreferrer">Published contact route <ArrowUpRight size={14} /></a> : <p>No public contact route found.</p>}<ul>{prospect.unknowns.map(item => <li key={item}>{item}</li>)}</ul><p>A public contact route does not establish permission to send.</p></details>
            <div className={styles.editor}><div className={styles.editorHeading}><h4>Make the approach yours.</h4><span className={styles.eyebrow}>Draft / not sent</span></div><label htmlFor="outreach-subject">Subject</label><input id="outreach-subject" value={copy.subject} maxLength={120} onChange={e => edit('subject', e.target.value)} /><label htmlFor="outreach-opening">Opening message</label><textarea id="outreach-opening" value={copy.opening} rows={7} maxLength={1200} onChange={e => edit('opening', e.target.value)} /><label htmlFor="outreach-followup">Possible follow-up</label><textarea id="outreach-followup" value={copy.followUp} rows={4} maxLength={800} onChange={e => edit('followUp', e.target.value)} /><p className={styles.small}>Add your identity and check each claim. Follow up only if appropriate; this is not a scheduled sequence.</p><label className={styles.check}><input type="checkbox" checked={approved} disabled={!validCopy} onChange={e => setReview(e.target.checked ? fingerprint : '')} /><span>I have reviewed these exact drafts, sources and missing facts. Approve for export only.</span></label><button type="button" className={styles.primary} disabled={!approved} onClick={exportDraft}>{approved ? <Check size={16} /> : <Download size={16} />}Download reviewed outreach</button><p role="status" className={styles.small}>{notice || 'Editing a draft clears its review. Nothing is sent from this page.'}</p></div>
          </div>}
          <details className={styles.trace}><summary>Research gaps &amp; receipt</summary><ul>{campaign.gaps.map(gap => <li key={gap}>{gap}</li>)}</ul><p>Source-linked research is not independent fact-checking.</p><p>Receipt: {result?.trace.id} · {result?.trace.webSearches} searches · {result?.trace.at}</p></details>
        </>}
      </div>
    </div>
  </section>;
}
