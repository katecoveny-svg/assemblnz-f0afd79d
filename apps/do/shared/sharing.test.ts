import { describe, expect, it, vi } from 'vitest';
import { DO_INVITE_URL, shareDo } from './sharing';

const content = { title: 'Meeting notes', text: 'Agreed action: prepare the proposal.', filename: 'meeting-notes.txt' };
describe('phone sharing boundaries', () => {
  it('shares only the fixed public URL when inviting someone to DO', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    await shareDo({ kind: 'invite' }, { share });
    expect(share).toHaveBeenCalledExactlyOnceWith({ title: 'DO by assembl', url: DO_INVITE_URL });
  });
  it('shares a reviewed text file if the device supports files, with no source or recording', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    await shareDo({ kind: 'content', content }, { share, canShare: () => true });
    const data = share.mock.calls[0][0];
    expect(Object.keys(data).sort()).toEqual(['files', 'title']);
    expect(data.files).toHaveLength(1); expect(data.files[0].name).toBe('meeting-notes.txt');
    expect(await data.files[0].text()).toBe(content.text);
  });
  it('uses text when the share menu cannot accept files', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    await shareDo({ kind: 'content', content }, { share, canShare: () => false });
    expect(share).toHaveBeenCalledExactlyOnceWith({ title: content.title, text: content.text });
  });
  it('copies only the chosen content when native sharing is unavailable', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    expect(await shareDo({ kind: 'invite' }, { clipboard: { writeText } })).toContain('link copied');
    expect(writeText).toHaveBeenCalledExactlyOnceWith(DO_INVITE_URL);
  });
  it('does not fall back to copying after the user cancels sharing', async () => {
    const writeText = vi.fn(), share = vi.fn().mockRejectedValue(new DOMException('Cancelled', 'AbortError'));
    expect(await shareDo({ kind: 'content', content }, { share, clipboard: { writeText } })).toBe('Sharing cancelled.');
    expect(writeText).not.toHaveBeenCalled();
  });
  it('does not claim delivery or retry through another channel on permission denial', async () => {
    const writeText = vi.fn(), share = vi.fn().mockRejectedValue(new DOMException('Denied', 'NotAllowedError'));
    await expect(shareDo({ kind: 'content', content }, { share, clipboard: { writeText } })).rejects.toThrow('Sharing is unavailable');
    expect(writeText).not.toHaveBeenCalled();
  });
  it('refuses empty notes and reports an unavailable sharing/copying surface', async () => {
    await expect(shareDo({ kind: 'content', content: { ...content, text: ' ' } }, {})).rejects.toThrow('nothing to share');
    await expect(shareDo({ kind: 'invite' }, {})).rejects.toThrow('unavailable');
  });
});
