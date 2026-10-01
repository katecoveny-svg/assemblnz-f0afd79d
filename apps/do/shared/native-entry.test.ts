import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('native DO source entry boundaries', () => {
  it('opens the unified DO and keeps reviewed text in the existing capture receiver', () => {
    const source = readFileSync('apps/do/macos/DOCompanion.swift', 'utf8');
    expect(source).toContain('URL(string: "https://www.assembl.co.nz/do")');
    expect(source).toContain('web.url?.path == "/do/widget"');
    expect(source).toContain('Writing & capture');
    expect(source).toContain('Moving shares nothing');
  });
  it('allows microphone prompts at the unified path without granting permission', () => {
    const source = readFileSync('apps/do/macos/CompanionMedia.swift', 'utf8');
    expect(source).toContain('["/do", "/do/personal", "/do/widget", "/do/meetings"]');
    for (const boundary of ['origin.protocol == "https"', 'origin.host == "www.assembl.co.nz"', 'origin.port == 0 || origin.port == 443', 'frame.isMainFrame', 'type == .microphone ? .prompt : .deny']) expect(source).toContain(boundary);
    expect(source).not.toContain('.grant');
  });
});
