/**
 * Generate the Mana Receipt #1 artifact for the demo call.
 *
 * Standalone (no lib imports, so it runs under plain node) but uses the EXACT
 * canonicalisation + chain rules as lib/voice/hashing.ts + lib/evidence/verify.ts:
 *   canonical = sorted-key, no-whitespace JSON
 *   sha256    = sha256hex(canonical(payload))
 *   chain     = sha256hex(prev_hash || sha256)
 * so the hashes below are real and independently verifiable.
 *
 * Writes docs/voice/DEMO-CALL-1.md (transcript + receipt) and
 * outputs/mana-receipt-001.html (the evidence-pack artifact).
 */
import { createHash } from 'node:crypto';
import { writeFileSync, mkdirSync } from 'node:fs';

const GENESIS = '0'.repeat(64);
const sha256 = (s) => createHash('sha256').update(s, 'utf8').digest('hex');
function canonicalize(v) {
  if (v === null || typeof v !== 'object') return JSON.stringify(v);
  if (Array.isArray(v)) return '[' + v.map(canonicalize).join(',') + ']';
  const keys = Object.keys(v).sort();
  return '{' + keys.map((k) => JSON.stringify(k) + ':' + canonicalize(v[k])).join(',') + '}';
}

const payload = {
  schema_version: 'voice-1',
  agent: 'aria.manaaki@demo',
  agent_version: 'manaaki-phase1-0.1.0',
  customer_id: 'whetu',
  call_sid: 'CA-demo-0001',
  caller_number_masked: '********999',
  started_at: '2026-06-17T19:02:11+12:00',
  ended_at: '2026-06-17T19:04:48+12:00',
  status: 'completed',
  consent: {
    granted: true,
    prompt_text: 'I record calls just to confirm your booking — is that OK?',
    response_text: 'yeah, that’s fine',
    captured_method: 'speech',
    ts: '2026-06-17T19:02:19+12:00',
  },
  booking: { booking_id: 'evt_9af3demo', date: '2026-06-20', time: '19:00', party_size: 4 },
  sms_sent: true,
  transferred: false,
  tool_calls: [
    { tool: 'capture_consent', args: { verdict: 'granted' }, result_summary: 'consent granted', ok: true, ts: '2026-06-17T19:02:19+12:00' },
    { tool: 'check_availability', args: { date: '2026-06-20', party_size: 4 }, result_summary: '8 slots', ok: true, ts: '2026-06-17T19:03:05+12:00' },
    { tool: 'book_reservation', args: { date: '2026-06-20', time: '19:00', party_size: 4, booking_id: 'evt_9af3demo' }, result_summary: 'booked evt_9af3demo', ok: true, ts: '2026-06-17T19:04:02+12:00' },
    { tool: 'send_sms', args: { to_masked: '***999' }, result_summary: 'sms SM_demo', ok: true, ts: '2026-06-17T19:04:30+12:00' },
  ],
  privacy: {
    retention_class: 'call-with-recording',
    ipps_satisfied: ['IPP 1', 'IPP 2', 'IPP 3', 'IPP 4', 'IPP 5', 'IPP 6', 'IPP 9', 'IPP 10', 'IPP 11', 'IPP 12', 'IPP 13'],
  },
};

const sha = sha256(canonicalize(payload));
const chain = sha256(GENESIS + sha);

const transcript = `# Demo call #1 — end-to-end (simulated)

> **Status: SIMULATED.** No live +64 DID is provisioned yet (that needs Kate's
> Twilio account + an approved NZ Regulatory Bundle — see PR open questions).
> This is the scripted end-to-end flow the integration tests exercise
> (\`lib/voice/tests/integration.inbound-call.test.ts\`). The Mana Receipt below
> is **real**: its hashes are computed with the same canonical-hash rules the
> production code uses (\`lib/voice/hashing.ts\`) and are independently
> verifiable. Replace with a recording of the first live call once the DID is
> live.

## Transcript

**Aria:** Kia ora, you’ve reached Whetū — I’m Aria, the booking assistant. I record calls just to confirm your booking; is that OK?
**Caller:** Yeah, that’s fine.
**Aria:** Ka pai, ngā mihi. What name’s the booking under, and how many of you?
**Caller:** Mere, table for four.
**Aria:** Lovely. What night were you thinking?
**Caller:** Saturday the 20th, around seven if you’ve got it.
**Aria:** *(check_availability → 8 slots)* We’ve got 7:00 pm on Saturday the 20th for four — shall I lock that in?
**Caller:** Yes please.
**Aria:** *(book_reservation → evt_9af3demo)* Done — four guests, Saturday 20 June at 7:00 pm. What’s the best mobile for your confirmation text?
**Caller:** Oh-two-one… two-three-four, nine-nine-nine.
**Aria:** *(send_sms → ***999)* Sent. You’ll have a text confirming it. Anything else I can help with?
**Caller:** No, that’s all. Cheers.
**Aria:** Ka kite, see you Saturday. Ngā mihi.

**Confirmation SMS sent:** “Kia ora Mere, your table at Whetū is booked: Sat 20 Jun at 7:00 pm, 4 guests. Need to change it? Just reply or call us back. Ngā mihi.”

## Mana Receipt #1 (the evidence pack)

Plain English: a downloadable bundle recording exactly what happened on the
call — consent, booking, the confirmation text — with timestamps. The hash
chain below makes it tamper-evident.

\`\`\`json
${JSON.stringify(payload, null, 2)}
\`\`\`

**Chain integrity**

| field | value |
|---|---|
| sha256 (payload) | \`${sha}\` |
| prev_hash (genesis — receipt #1) | \`${GENESIS}\` |
| chain_hash | \`${chain}\` |

Verify independently:

\`\`\`
chain_hash == sha256( prev_hash + sha256 )
${chain}
  == sha256("${GENESIS}" + "${sha}")  ✓
\`\`\`
`;

mkdirSync('docs/voice', { recursive: true });
mkdirSync('outputs', { recursive: true });
writeFileSync('docs/voice/DEMO-CALL-1.md', transcript);

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const html = `<!doctype html><html lang="en-NZ"><head><meta charset="utf-8"/>
<title>Evidence pack — call ${esc(payload.call_sid)}</title></head><body>
<h1>Evidence pack</h1>
<p>A downloadable record of what happened on this call — consent, booking, messages — with timestamps. (Cryptographically tamper-evident: this is a Mana Receipt.)</p>
<pre>${esc(JSON.stringify(payload, null, 2))}</pre>
<h3>Chain integrity</h3>
<pre>sha256    ${esc(sha)}
prev_hash ${esc(GENESIS)}
chain_hash ${esc(chain)}</pre>
<footer>Generated by assembl. Built and signed off by Kate Hudson, Aotearoa. Built with tikanga values in the prompt design.</footer>
</body></html>`;
writeFileSync('outputs/mana-receipt-001.html', html);

console.log('sha256:    ', sha);
console.log('chain_hash:', chain);
console.log('wrote docs/voice/DEMO-CALL-1.md + outputs/mana-receipt-001.html');
