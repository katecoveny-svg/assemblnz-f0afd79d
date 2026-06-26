/**
 * Inbound email safety — quarantine detection.
 *
 * An inbound email that carries credentials, passwords, or payment data must
 * never reach the agent in cleartext. We flag it, store the original only in the
 * service-role-only `raw` column, and show the agent + admin a placeholder. A
 * human triages it.
 *
 * This is the pure, testable detector. The Deno inbound edge function carries an
 * equivalent (it can't import this module across the runtime boundary).
 */

export type SensitiveScan = {
  quarantine: boolean;
  reason: string | null;
};

// Credit-card-shaped runs: 13–16 digits, optionally split into 4-digit groups.
const CARD_RE = /\b(?:\d[ -]?){13,16}\b/;
const CVV_RE = /\b(?:cvv|cvc|cvv2|security code)\b\s*[:#]?\s*\d{3,4}\b/i;
// Password / credential markers paired with a value.
const PASSWORD_RE = /\b(?:password|passwd|pwd|passcode|pass\s?phrase)\b\s*[:=]\s*\S+/i;
const PIN_RE = /\b(?:pin|pin\s?number)\b\s*[:=#]?\s*\d{3,8}\b/i;
// API keys / secrets / tokens.
const SECRET_RE =
  /\b(?:api[_-]?key|secret[_-]?key|access[_-]?token|bearer|client[_-]?secret)\b\s*[:=]?\s*\S+/i;
const KEY_PREFIX_RE = /\b(?:sk_live_|sk_test_|pk_live_|xox[baprs]-|ghp_|AKIA)[A-Za-z0-9_-]{8,}/;
const PRIVATE_KEY_RE = /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/;

function luhnValid(digits: string): boolean {
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = digits.charCodeAt(i) - 48;
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

/** Scan inbound text (subject + body) for sensitive content. */
export function scanSensitive(text: string): SensitiveScan {
  if (!text) return { quarantine: false, reason: null };

  if (PRIVATE_KEY_RE.test(text)) return { quarantine: true, reason: 'private key' };
  if (KEY_PREFIX_RE.test(text)) return { quarantine: true, reason: 'API key / token' };
  if (SECRET_RE.test(text)) return { quarantine: true, reason: 'credential or secret' };
  if (PASSWORD_RE.test(text)) return { quarantine: true, reason: 'password' };
  if (PIN_RE.test(text)) return { quarantine: true, reason: 'PIN' };
  if (CVV_RE.test(text)) return { quarantine: true, reason: 'card security code' };

  const cardMatch = text.match(CARD_RE);
  if (cardMatch) {
    const digits = cardMatch[0].replace(/[^\d]/g, '');
    if (digits.length >= 13 && digits.length <= 16 && luhnValid(digits)) {
      return { quarantine: true, reason: 'payment card number' };
    }
  }

  return { quarantine: false, reason: null };
}

/** The placeholder body shown in place of quarantined content. */
export const QUARANTINE_PLACEHOLDER =
  'This email contained sensitive content (credentials or payment data) and was held for human review. The agent has not seen the raw message.';
