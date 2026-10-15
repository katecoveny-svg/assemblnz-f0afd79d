/** Fixed typed-turn wire shape for the already-consented live call. */
export function typedLivePacket(text: string): string {
  const value = text.trim();
  if (!value || value.length > 4000 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/u.test(value)) throw new Error('Invalid typed turn');
  return JSON.stringify({ clientContent: { turns: [{ role: 'user', parts: [{ text: value }] }], turnComplete: true } });
}
