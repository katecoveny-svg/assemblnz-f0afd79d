import Link from 'next/link';
import { KeeperShell, DogAvatar, DemoPill } from '../KeeperShell';
import { HAPPY_TAILS_BRAND } from '@/lib/tenants/happy-tails/data';
import { reconcileMonth, mockedFranklinInvoice, xeroCredStatus } from '@/lib/xero/happy-tails';

export default function InvoicingPage() {
  const base = '/customers/happy-tails/keeper';
  const rows = reconcileMonth();
  const franklin = mockedFranklinInvoice();
  const cred = xeroCredStatus();

  return (
    <KeeperShell active="invoicing">
      <div className="top">
        <div>
          <h1 className="h1">Xero invoice reconciliation</h1>
          <div className="sub">June bookings summed by dog, matched to each Xero draft invoice. Liana reviews + issues.</div>
        </div>
        <DemoPill />
      </div>

      <div className="xero" style={{ marginBottom: 20 }}>
        <div className="lg">X</div>
        <div><b>Xero — {HAPPY_TAILS_BRAND.legalName}</b> · GST {HAPPY_TAILS_BRAND.gst} · June 2026 draft run</div>
        <div style={{ marginLeft: 'auto', fontSize: 11.5, fontWeight: 600, color: 'var(--good)' }}>
          {cred.mode === 'live' ? '● Connected · live' : '● Connected · mocked (INV-3031)'}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', border: '1px solid var(--line)', borderRadius: 16, overflow: 'hidden', background: 'var(--card)' }}>
        <div style={{ padding: '20px 22px', borderRight: '1px dashed var(--line2)', background: '#fbfcfb' }}>
          <h3>Bookings summed by dog</h3>
          <div className="note" style={{ marginBottom: 16 }}>From the running roster — June · 14 dogs</div>
          {rows.map(({ dog, matched }, i) => (
            <div key={dog.slug} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 12px', borderRadius: 11, marginBottom: 8, ...(i === 0 ? { background: 'var(--canary-soft)', border: '1px solid rgba(184, 150, 79, 0.38)' } : {}) }}>
              <div className="av" style={{ width: 32, height: 32, background: '#fff' }}><DogAvatar /></div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13.5 }}>{dog.name}</div>
                <div style={{ color: 'var(--mute)', fontSize: 11.5 }}>{dog.slug === 'franklin' ? '4 daycare · 5 overnight (small pup)' : `${dog.latestInvoice.period} bookings`}</div>
              </div>
              {i === 0 ? (
                <span style={{ marginLeft: 'auto', fontWeight: 700, fontVariantNumeric: 'tabular-nums', fontSize: 13.5 }}>{dog.latestInvoice.total}</span>
              ) : (
                <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 600, color: matched ? 'var(--good)' : 'var(--warn)', background: matched ? '#eef4ef' : '#fdf3dd', padding: '3px 8px', borderRadius: 999 }}>{matched ? 'matched ✓' : 'check swap ⚠'}</span>
              )}
            </div>
          ))}
          <div className="note" style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--line)' }}>12 of 14 matched cleanly · 2 need a swap-day check before issue.</div>
        </div>

        <div style={{ padding: '20px 22px' }}>
          <h3>Xero draft invoice · Franklin</h3>
          <div className="note" style={{ marginBottom: 16 }}>Matched to bookings · modelled on real INV-3031</div>
          <div style={{ border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', background: '#fff', borderBottom: '1px solid var(--line)' }}>
              <h4 style={{ fontFamily: 'var(--serif)', fontSize: 20, margin: '0 0 6px', fontWeight: 600 }}>{franklin.invoiceNumber} · Draft</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--mute)', marginTop: 3 }}><span>To</span><b style={{ color: 'var(--ink)' }}>{franklin.contactName}</b></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--mute)', marginTop: 3 }}><span>Invoice date</span><b style={{ color: 'var(--ink)' }}>{franklin.date} (part-month)</b></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--mute)', marginTop: 3 }}><span>Due</span><b style={{ color: 'var(--ink)' }}>{franklin.dueDate} · 7 days</b></div>
            </div>
            <table className="invtable">
              <thead><tr><th>Service</th><th className="r">Qty</th><th className="r">Rate</th><th className="r">Amount</th></tr></thead>
              <tbody>
                {franklin.lines.map((l, i) => (
                  <tr key={i}>
                    <td><span className="svc">{l.description}</span><br /><span style={{ color: 'var(--mute)' }}>{l.note}</span></td>
                    <td className="r">{l.quantity ?? '—'}</td>
                    <td className="r">{l.unitAmount != null ? `$${l.unitAmount.toFixed(2)}` : '—'}</td>
                    <td className="r">${l.lineAmount.toFixed(2)}</td>
                  </tr>
                ))}
                <tr className="totrow"><td colSpan={3}>Total (GST inclusive)</td><td className="r">NZ${franklin.total.toFixed(2)}</td></tr>
              </tbody>
            </table>
          </div>
          <div className="recnote">
            <b>Reconciled ✓</b> — booking roster (${franklin.itemisedSubtotal.toFixed(2)} itemised + $9.50 rounding) equals the issued INV-3031 total of <b>NZ${franklin.total.toFixed(2)}</b>. Small-pup discount, GST-inclusive rates and 7-day terms all applied automatically.
          </div>
          <div className="stamp">
            <b>Mana Receipt</b> · drafted by Keeper · source: June roster + pricing schema (daycare $57 / overnight $95 / small-pup 10%) + Xero contact &ldquo;{franklin.contactName.split(' — ')[0]}&rdquo; · <b>Privacy Act 2020 IPP 3A</b> notice attached · Keeper drafts as a Draft in Liana&apos;s Xero — she reviews + hits Issue. Keeper never issues.
          </div>
          <div className="dactions" style={{ padding: '16px 0 0', background: 'transparent', border: 'none' }}>
            <button type="button" className="btn g">Open in Xero</button>
            <button type="button" className="btn x">Approve draft</button>
            <button type="button" className="btn p" style={{ marginLeft: 'auto' }}>Send to owner</button>
          </div>
        </div>
      </div>

      <div className="nextnav">
        <Link className="prev" href={`${base}/route`}>← Bus route</Link>
        <Link className="next" href={`${base}/receipts`}>Next: Mana Receipt viewer →</Link>
      </div>
      <div className="footattr">concept — happytails × assembl · Xero data stays in the Happy Tails tenant · demo pending Liana sign-off</div>
    </KeeperShell>
  );
}
