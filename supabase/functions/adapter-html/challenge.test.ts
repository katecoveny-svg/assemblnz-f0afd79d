import assert from "node:assert/strict";
import test from "node:test";
import { assertNotHtmlChallenge, HtmlResponseError } from "./challenge.ts";
test("concrete HTTP200 Incapsula/Cloudflare challenge resources fail closed", () => {
  for (const html of ['<html><iframe src="/_Incapsula_Resource?secret=fixture"></iframe></html>', '<html><script src="/cdn-cgi/challenge-platform/test"></script></html>', '<html><script>window._cf_chl_opt = {};</script></html>']) {
    assert.throws(() => assertNotHtmlChallenge(html, 200, "text/html"), HtmlResponseError);
  }
});
test("short legitimate pages and challenge documentation are not falsely rejected", () => {
  for (const body of ['<html>OK</html>', '<p>No announcements.</p>', '<p>Incapsula and CAPTCHA documentation.</p>', '<code>&lt;iframe src="/_Incapsula_Resource"&gt;</code>']) {
    assert.doesNotThrow(() => assertNotHtmlChallenge(body, 200, "text/html"));
  }
});
test("concrete markup handles mislabeled content, scanning remains bounded", () => {
  assert.throws(() => assertNotHtmlChallenge('<html><iframe src="/_Incapsula_Resource"></iframe></html>', 200, "text/plain"), HtmlResponseError);
  assert.doesNotThrow(() => assertNotHtmlChallenge('Documentation /_Incapsula_Resource', 200, "text/plain"));
});
