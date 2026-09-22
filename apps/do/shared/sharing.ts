/** Public invitations never include the current URL, account context, source or notes. */
export const DO_INVITE_URL = 'https://www.assembl.co.nz/do';
export type DoShareContent = { title: string; text: string; filename: string };
export type DoShareRequest = { kind: 'invite' } | { kind: 'content'; content: DoShareContent };
type SharePlatform = {
  share?: (data: ShareData) => Promise<void>;
  canShare?: (data: ShareData) => boolean;
  clipboard?: { writeText: (text: string) => Promise<void> };
};

/** Called only from a user click. Cancellation never falls through to another sharing channel. */
export async function shareDo(request: DoShareRequest, platform: SharePlatform = navigator): Promise<string> {
  const invite = request.kind === 'invite';
  const title = invite ? 'DO by assembl' : request.content.title;
  const text = invite ? DO_INVITE_URL : request.content.text;
  if (!text.trim()) throw new Error('There is nothing to share yet.');
  let data: ShareData = invite ? { title, url: DO_INVITE_URL } : { title, text };
  if (!invite && platform.share && platform.canShare && typeof File !== 'undefined') {
    const file = new File([text], request.content.filename, { type: 'text/plain' });
    if (platform.canShare({ files: [file] })) data = { title, files: [file] };
  }
  if (platform.share) {
    try {
      await platform.share(data);
      return 'Share menu opened. Your chosen app handles delivery.';
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return 'Sharing cancelled.';
      throw new Error('Sharing is unavailable here. Use Copy, or open DO in its own window.');
    }
  }
  if (platform.clipboard?.writeText) {
    await platform.clipboard.writeText(text);
    return invite ? 'DO link copied. Paste it into a message to share.' : 'Text copied. Paste it into your chosen app.';
  }
  throw new Error('Sharing and copying are unavailable here. Download your notes or open DO in your browser.');
}
