import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {afterEach,describe,it,expect,vi} from 'vitest';
import {createInterviewExample} from './interview-examples';
import MediaStudio from '@/components/client-hub-migration/original/app/creative/media-studio';
import CinemaStudio from '@/components/client-hub-migration/original/app/hub/cinema-studio';

afterEach(()=>vi.unstubAllGlobals());
describe('unconnected Studio controls',()=>{
 it('renders disabled image generation/uploads and an explicit unavailable boundary',()=>{
  vi.stubGlobal('React',React);
  const hub=createInterviewExample('airnz');
  const html=renderToStaticMarkup(React.createElement(MediaStudio,{design:hub.design,onArtwork:vi.fn(),onView:vi.fn(),curatedAssets:[]}));
  expect(html).toMatch(/<button[^>]*class="ms-generate"[^>]*disabled=""[^>]*>/);
  expect(html).toMatch(/<input[^>]*type="file"[^>]*disabled=""/);
  expect(html).toContain('Image generation and hosted uploads are not connected.');
  expect(html).not.toContain('src="/cinematic/pursuit-story');
 });
 it('renders disabled film uploads without hosted playback or a delivery/revocation promise',()=>{
  vi.stubGlobal('React',React);
  const hub=createInterviewExample('airnz');
  const html=renderToStaticMarkup(React.createElement(CinemaStudio,{hub,onChange:vi.fn()}));
  expect(html).toMatch(/<input[^>]*type="file"[^>]*disabled=""/);
  expect(html).not.toContain('<video');
  expect(html).toContain('Hosted film storage, recipient film delivery and access revocation are not connected.');
  expect(html).not.toContain('Company footage stays private until');
 });
});
