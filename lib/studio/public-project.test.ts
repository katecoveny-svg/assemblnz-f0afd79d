import { describe, expect, it, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { exportPublicProject, MAX_AUDIO_BYTES, MAX_IMAGE_BYTES, parsePublicProject, projectVideo, seedProject, validateMedia } from './public-project';
import { videoVtt } from './motion-video';
vi.mock('@/lib/supabase/middleware', () => ({ updateSession: vi.fn(async () => NextResponse.next()) }));
import { updateSession } from '@/lib/supabase/middleware';
import { middleware } from '@/middleware';

describe('public Studio project boundary', () => {
  it.each(['property', 'customer', 'services'])('round trips the %s fictional example', id => {
    const project = seedProject(id);
    expect(parsePublicProject(exportPublicProject(project))).toEqual(project);
    expect(projectVideo(project, 'Instrument Sans').scenes).toHaveLength(4);
  });
  it.each([
    { version: 2 }, { scenes: [] }, { seconds: 100000 }, { format: 'script' },
    { image: 'https://private.example/asset' }, { audio: 'data:audio/wav;base64,evil' },
    { approved: { by: 'owner' } }, { title: '' }, { title: 'a'.repeat(81) },
    { example: '__proto__' }, { brief: '\u0000' },
  ])('rejects malformed or extended projects %j', patch => {
    expect(() => parsePublicProject(JSON.stringify({ ...seedProject(), ...patch }))).toThrow();
  });
  it('rejects prototype keys, nested media and excessive bytes before parsing', () => {
    expect(() => parsePublicProject('{"__proto__":{"polluted":true}}')).toThrow();
    const project = seedProject();
    expect(() => parsePublicProject(JSON.stringify({ ...project, scenes: project.scenes.map(scene => ({ ...scene, url: 'https://example.com' })) }))).toThrow();
    expect(() => parsePublicProject(' '.repeat(32769))).toThrow('too large');
    expect(() => parsePublicProject('💻'.repeat(9000))).toThrow('too large');
  });
  it('keeps HTML-shaped text inert and escapes VTT markup and cue injection', () => {
    const project = seedProject();
    project.scenes[0] = { title: '<script>alert(1)</script>', body: 'a\n\n00:00 --> 01:00\n<b>claim</b>' };
    expect(parsePublicProject(exportPublicProject(project)).scenes[0].title).toContain('<script>');
    const vtt = videoVtt(projectVideo(project, 'Arial'), 8);
    expect(vtt).toContain('00:00:24.000 --> 00:00:32.000');
    expect(vtt.match(/ --> /g)).toHaveLength(4);
    expect(vtt).not.toContain('<script>');
    expect(vtt).toContain('&lt;b&gt;claim&lt;/b&gt;');
  });
  it('bounds file sizes and rejects SVG, HTML and empty uploads', () => {
    expect(() => validateMedia({ type: 'image/png', size: MAX_IMAGE_BYTES }, 'image')).not.toThrow();
    expect(() => validateMedia({ type: 'audio/wav', size: MAX_AUDIO_BYTES }, 'audio')).not.toThrow();
    for (const file of [{ type: 'image/svg+xml', size: 10 }, { type: 'text/html', size: 10 }, { type: 'image/png', size: 0 }, { type: 'image/png', size: MAX_IMAGE_BYTES + 1 }]) expect(() => validateMedia(file, 'image')).toThrow();
    expect(() => validateMedia({ type: 'audio/wav', size: MAX_AUDIO_BYTES + 1 }, 'audio')).toThrow();
  });
});

describe('public route is isolated from private access', () => {
  it.each(['assembl.co.nz', 'www.assembl.co.nz', 'preview.vercel.app'])('opens anonymously without session access on %s', async host => {
    vi.mocked(updateSession).mockClear();
    const response = await middleware(new NextRequest(`https://${host}/pursuit/studio`, { headers: { host } }));
    expect(response.headers.get('location')).toBeNull();
    expect(response.headers.get('x-middleware-rewrite')).toBeNull();
    expect(response.headers.get('x-middleware-next')).toBe('1');
    expect(updateSession).not.toHaveBeenCalled();
  });
  it.each(['/customers/example', '/journeys/one-nz', '/worlds/onenz'])('retains anonymous denial for %s', async pathname => {
    const response = await middleware(new NextRequest(`https://www.assembl.co.nz${pathname}`, { headers: { host: 'www.assembl.co.nz' } }));
    expect(response.status).toBe(401);
  });
});
