import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Source-contract checks only. A Kotlin build and signed-device tests remain separate.
const root = 'apps/do/android/DoIme';
const source = readFileSync(`${root}/src/main/java/nz/assembl/doime/DoKeyboardService.kt`, 'utf8');
const config = readFileSync(`${root}/src/main/java/nz/assembl/doime/DoImeConfig.kt`, 'utf8');
const manifest = readFileSync(`${root}/src/main/AndroidManifest.xml`, 'utf8');
function method(name: string) {
  const start = source.indexOf(`fun ${name}(`);
  expect(start).toBeGreaterThanOrEqual(0);
  const bodyStart = source.indexOf('{', start);
  let depth = 1, end = bodyStart + 1;
  while (depth && end < source.length) {
    if (source[end] === '{') depth++;
    else if (source[end] === '}') depth--;
    end++;
  }
  return source.slice(bodyStart, end);
}

describe('Android DO IME privacy source contracts', () => {
  it('removes native networking and the obsolete compile/placeholder flow', () => {
    expect(manifest).not.toContain('android.permission.INTERNET');
    expect(source).not.toMatch(/HttpURLConnection|java\.net|JSONObject|kotlin\.concurrent|\/api\/do\/message|hostBundleId|packageName/);
    expect(source).not.toContain('commitText(" ✦DO ", 1)');
    expect(config).toContain('Native preparation is not connected');
  });
  it('accesses the clipboard only after the explicit paste action, without URI coercion', () => {
    expect(source).toContain('button("Paste to review") { pasteForReview() }');
    const paste = method('pasteForReview');
    expect(paste).toContain('if (protectedField)');
    expect(paste).toContain('clipboard.primaryClip');
    expect(paste).toContain('clip.getItemAt(0).text?.toString()');
    expect(source.match(/clipboard\.primaryClip/g)).toHaveLength(1);
    expect(source).not.toMatch(/coerceToText|getSelectedText|getTextBeforeCursor|getTextAfterCursor|addPrimaryClipChangedListener/);
    expect(paste).toContain('value.length > DoImeConfig.maxDraftLength');
  });
  it('requires separate exact-text review and current-session validation before insertion', () => {
    expect(source).toContain('I have reviewed this exact text');
    expect(source).toContain('draftSession == inputSession');
    const insert = method('insertReviewed');
    expect(insert.indexOf('reviewed?.isChecked != true || !canInsert()')).toBeLessThan(insert.indexOf('connection.commitText(value, 1)'));
    expect(insert.indexOf('clearDraft()')).toBeLessThan(insert.indexOf('connection.commitText(value, 1)'));
    expect(insert).toContain('val inserted = connection.commitText(value, 1)');
    expect(insert).toContain('if (inserted)');
    expect(insert).toContain('Nothing was confirmed inserted');
  });
  it('clears draft and consent at input lifecycle boundaries and blocks private fields', () => {
    for (const name of ['onStartInput', 'onUpdateSelection', 'onFinishInput', 'onFinishInputView', 'onDestroy']) {
      expect(method(name), name).toContain('clearDraft()');
    }
    expect(method('clearDraft')).toContain('draft = ""; draftSession = -1');
    expect(method('clearDraft')).toContain('reviewed?.isChecked = false');
    for (const flag of ['TYPE_TEXT_VARIATION_PASSWORD', 'TYPE_TEXT_VARIATION_VISIBLE_PASSWORD', 'TYPE_TEXT_VARIATION_WEB_PASSWORD', 'TYPE_NUMBER_VARIATION_PASSWORD', 'IME_FLAG_NO_PERSONALIZED_LEARNING']) {
      expect(method('isProtected')).toContain(flag);
    }
  });
  it('opens a fixed HTTPS workspace without transmitting source and offers keyboard switching', () => {
    expect(config).toContain('workspaceUrl = "https://www.assembl.co.nz/do/personal"');
    const open = method('openDo');
    expect(open).toContain('Intent.ACTION_VIEW, Uri.parse(DoImeConfig.workspaceUrl)');
    expect(open).not.toMatch(/putExtra|setPrimaryClip|draft\)|appendQueryParameter/);
    expect(open).toContain('ActivityNotFoundException');
    expect(open).toContain('SecurityException');
    expect(source).toContain('showInputMethodPicker()');
    const methodXml = readFileSync(`${root}/src/main/res/xml/method.xml`, 'utf8');
    expect(methodXml).not.toContain('SettingsStub');
  });
});
