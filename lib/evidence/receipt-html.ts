/**
 * Single-page printable HTML for an evidence pack.
 *
 * Stub for the Day 8.5 brand-styled receipt template (Cowork ships).
 * Until that lands, we use minimal Tailwind-free print styles so the file
 * is self-contained and prints cleanly without external assets.
 */
import type { ManaReceipt } from './types';

const POU_LABELS = {
  rangatiratanga: 'Rangatiratanga · self-determination',
  kaitiakitanga: 'Kaitiakitanga · guardianship',
  manaakitanga: 'Manaakitanga · care for people',
  whanaungatanga: 'Whanaungatanga · relationships',
} as const;

export function renderReceiptHtml(receipt: ManaReceipt): string {
  const issued = receipt.issued_at ?? receipt.created_at ?? '';
  const citationsHtml = (receipt.citations ?? [])
    .map((c) => {
      const headline =
        ('clause' in c && c.clause)
          ? `${c.clause} · ${c.doc ?? ''} ${c.version ?? ''}`.trim()
          : ('code' in c && c.code)
            ? `${c.code} · ${('gir' in c && c.gir) ? c.gir : ''}`.trim()
            : ('act' in c && c.act)
              ? `${c.act}${'section' in c && c.section ? ' s.' + c.section : ''}`
              : JSON.stringify(c);
      const note = 'note' in c && c.note ? String(c.note) : '';
      return `<li><strong>${escapeHtml(String(c.type))}</strong> — ${escapeHtml(
        headline,
      )}${note ? `<div class="muted">${escapeHtml(note)}</div>` : ''}</li>`;
    })
    .join('');

  const pouHtml = (Object.keys(POU_LABELS) as Array<keyof typeof POU_LABELS>)
    .map((k) => {
      const v = receipt.pou?.[k];
      const mark = v?.passed === true ? '✓' : v?.passed === false ? '✗' : '·';
      return `<li><strong>${mark} ${escapeHtml(POU_LABELS[k])}</strong>${
        v?.note ? `<div class="muted">${escapeHtml(v.note)}</div>` : ''
      }</li>`;
    })
    .join('');

  const gates = receipt.gates ?? {};
  const gatesHtml = (['voice', 'tikanga', 'truth'] as const)
    .map((g) => {
      const ok = gates[g];
      const mark = ok === true ? '✓' : ok === false ? '✗' : '·';
      return `<span class="badge">${mark} ${g}</span>`;
    })
    .join(' ');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Mana Receipt — ${escapeHtml(receipt.id)}</title>
<style>
  @page { margin: 22mm 18mm; }
  :root { --ink:#1a1a1a; --muted:#6b6b6b; --paper:#faf7f2; --line:#e5e0d6; --good:#2a7a3e; --bad:#b3261e; --accent:#2d4a3e; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: 'Fraunces', Georgia, serif; color: var(--ink); background: var(--paper); }
  header, section { padding: 10px 0; }
  h1 { font-size: 28px; margin: 0 0 6px; font-weight: 300; letter-spacing: -0.01em; }
  h2 { font-size: 12px; margin: 22px 0 8px; text-transform: uppercase; letter-spacing: 0.18em; color: var(--muted); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-weight: 600; }
  .lede { color: var(--muted); margin: 0; font-size: 13px; }
  .grid { display: grid; grid-template-columns: 160px 1fr; gap: 6px 16px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; }
  .grid dt { color: var(--muted); }
  .grid dd { margin: 0; word-break: break-all; }
  ul { margin: 0; padding-left: 18px; }
  li { margin-bottom: 6px; font-size: 14px; line-height: 1.5; }
  .muted { color: var(--muted); font-size: 12px; margin-top: 2px; }
  .badge { display: inline-block; padding: 4px 10px; border: 1px solid var(--line); border-radius: 2px; margin-right: 6px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 0.16em; }
  .verdict-good { color: var(--good); }
  .verdict-bad { color: var(--bad); }
  footer { margin-top: 28px; padding-top: 12px; border-top: 1px solid var(--line); font-size: 11px; color: var(--muted); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
</style>
</head>
<body>
  <header>
    <p class="lede">Assembl · Mana Receipt</p>
    <h1>Why this happened</h1>
    <p class="lede">${escapeHtml(receipt.issuer ?? 'Assembl Limited')} · ${escapeHtml(receipt.issuer_domain ?? 'assembl.co.nz')}</p>
  </header>

  <section>
    <h2>Issuance</h2>
    <dl class="grid">
      <dt>Agent</dt><dd>${escapeHtml(receipt.agent)} v${escapeHtml(receipt.agent_version)}</dd>
      <dt>Domain</dt><dd>${escapeHtml(receipt.domain)}</dd>
      <dt>Issued</dt><dd>${escapeHtml(issued)}</dd>
      <dt>Receipt id</dt><dd>${escapeHtml(receipt.id)}</dd>
      <dt>Schema</dt><dd>${escapeHtml(receipt.schema_version)}</dd>
    </dl>
  </section>

  <section>
    <h2>Citations</h2>
    ${citationsHtml ? `<ul>${citationsHtml}</ul>` : '<p class="muted">No citations attached.</p>'}
  </section>

  <section>
    <h2>Pou attestations</h2>
    <ul>${pouHtml}</ul>
  </section>

  <section>
    <h2>Three gates</h2>
    <p>${gatesHtml}</p>
  </section>

  <section>
    <h2>Human-in-the-loop</h2>
    <dl class="grid">
      <dt>Status</dt><dd>${escapeHtml(receipt.hitl?.status ?? '—')}</dd>
      <dt>Reviewer</dt><dd>${escapeHtml(receipt.hitl?.reviewer_role ?? '—')}</dd>
      ${receipt.hitl?.deadline ? `<dt>Deadline</dt><dd>${escapeHtml(receipt.hitl.deadline)}</dd>` : ''}
    </dl>
  </section>

  <section>
    <h2>Signature & chain</h2>
    <dl class="grid">
      <dt>Status</dt><dd class="${signatureLooksReal(receipt) ? 'verdict-good' : 'verdict-bad'}">${signatureLooksReal(receipt) ? '✓ Verified' : '✗ Unverified'}</dd>
      <dt>Key id</dt><dd>${escapeHtml(receipt.key_id)}</dd>
      <dt>Receipt hash</dt><dd>${escapeHtml(receipt.receipt_hash)}</dd>
      <dt>Prev hash</dt><dd>${escapeHtml(receipt.prev_hash ?? '(genesis)')}</dd>
    </dl>
  </section>

  <footer>
    Verify at <a href="${escapeHtml(receipt.verifier_url ?? 'https://assembl.co.nz/verify')}">${escapeHtml(receipt.verifier_url ?? 'assembl.co.nz/verify')}</a><br/>
    Public keyring at https://assembl.co.nz/.well-known/assembl-agent-keys.json
  </footer>
</body>
</html>`;
}

function signatureLooksReal(receipt: ManaReceipt): boolean {
  const sig = receipt.signature_b64 ?? '';
  return !sig.toLowerCase().startsWith('fake') && sig.length > 32;
}

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
