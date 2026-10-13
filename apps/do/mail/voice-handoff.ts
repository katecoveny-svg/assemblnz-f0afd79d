/** Voice releases its resources and permission before offering inert reviewed text.
 * This port cannot select a mailbox, provide mail consent or dispatch a read.
 */
export function handoffReviewedMail(text: string, ports: {
  endVoice: () => void;
  clearConsent: () => void;
  accept: (text: string) => boolean;
}): boolean {
  if (!text.trim() || text.length > 1200) return false;
  ports.endVoice();
  ports.clearConsent();
  return ports.accept(text.trim());
}
