/**
 * warm_transfer — hand the call to a human.
 *
 * Returns the TwiML that <Dial>s the transfer target (phase-1 demo: Kate's
 * mobile, TWILIO_TRANSFER_TO). The agent calls this tool when the caller asks
 * for a person, when a party is too large to self-serve, or when consent to
 * record is declined. The announce line is warm and in-character.
 */
import { transferTwiml } from '@/lib/voice/clients/twilio';

export const TRANSFER_ANNOUNCE =
  'No worries — I’ll pop you through to one of the team at Whetū now. Kia ora.';

export interface TransferResult {
  twiml: string;
  transfer_to: string;
}

export function warmTransfer(opts?: { transferTo?: string; announce?: string }): TransferResult {
  const transferTo = opts?.transferTo ?? process.env.TWILIO_TRANSFER_TO;
  if (!transferTo) {
    throw new Error('TWILIO_TRANSFER_TO must be set for warm transfer');
  }
  return {
    twiml: transferTwiml(transferTo, opts?.announce ?? TRANSFER_ANNOUNCE),
    transfer_to: transferTo,
  };
}
