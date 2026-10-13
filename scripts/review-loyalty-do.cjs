const assert = require("node:assert/strict");
const fs = require("node:fs");
const { chromium } = require(
  process.env.ASSEMBL_PLAYWRIGHT_MODULE || "playwright",
);
const origin = process.env.ASSEMBL_REVIEW_ORIGIN || "http://localhost:3047";
const output = "output/loyalty-do";
(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ serviceWorkers: "block" });
  const writes = [],
    errors = [];
  await context.route("**/*", (route) => {
    const r = route.request();
    if (r.method() !== "GET") {
      writes.push(r.url());
      return route.abort();
    }
    if (new URL(r.url()).origin !== origin) return route.abort();
    if (new URL(r.url()).pathname.startsWith("/api/"))
      return route.fulfill({
        status: 503,
        json: { message: "Unavailable in synthetic review" },
      });
    return route.continue();
  });
  const page = await context.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  for (const [name, width, height] of [
    ["desktop", 1440, 1000],
    ["tablet", 820, 1180],
    ["phone", 375, 812],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto(origin + "/do/loyalty/everyday-rewards");
    await page
      .getByRole("heading", { name: "Everyday, a little easier." })
      .waitFor();
    await page.locator(".ld-hero-image").evaluate((img) => img.decode());
    assert(
      await page
        .locator('meta[name="robots"]')
        .getAttribute("content")
        .then((s) => s.includes("noindex")),
    );
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
      "no horizontal overflow " + name,
    );
    await page.locator(".ld-reward-object").evaluate(async (e) => {
      await Promise.all(e.getAnimations().map((a) => a.finished));
    });
    await page.screenshot({ path: `${output}/${name}-hero.png` });
    await page.getByRole("button", { name: "Let’s make dinner" }).click();
    await page.getByRole("checkbox").check();
    await page
      .getByRole("button", { name: "Make a plan", exact: true })
      .click();
    await page.getByRole("button", { name: "One more person" }).click();
    await page
      .getByRole("button", { name: "Review the basket", exact: true })
      .click();
    assert(
      await page
        .getByRole("button", { name: "Continue to handoff" })
        .isDisabled(),
    );
    await page.getByRole("checkbox").check();
    await page
      .locator(".ld-workspace")
      .screenshot({ path: `${output}/${name}-basket.png` });
    await page.getByRole("button", { name: "Continue to handoff" }).click();
    await page
      .getByRole("button", { name: "Skip and continue", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Approve simulated handoff", exact: true })
      .click();
    await page
      .getByRole("status")
      .filter({ hasText: "Nothing sent to Woolworths" })
      .waitFor();
    await page
      .locator(".ld-workspace")
      .screenshot({ path: `${output}/${name}-receipt.png` });
    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: "Download demo receipt" }).click();
    await (await download).saveAs(`${output}/${name}-receipt.txt`);
    await page.getByRole("button", { name: "Back to basket" }).click();
    await page
      .getByRole("button", { name: "Edit the plan", exact: true })
      .click();
    await page.getByRole("button", { name: "One more person" }).click();
    await page
      .getByRole("button", { name: "Review the basket", exact: true })
      .click();
    assert(
      await page
        .getByRole("button", { name: "Continue to handoff" })
        .isDisabled(),
      "changed plan invalidates approval",
    );
  }
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Continue to handoff" }).click();
  await page
    .getByRole("button", { name: "I’ve checked the leftovers" })
    .click();
  await page
    .getByRole("status")
    .filter({ hasText: "Demo acknowledgement recorded once" })
    .waitFor();
  assert.equal(
    await page
      .getByRole("button", { name: "I’ve checked the leftovers" })
      .count(),
    0,
  );
  await page
    .getByRole("button", { name: "Approve simulated handoff", exact: true })
    .click();
  await page
    .getByRole("status")
    .filter({ hasText: "Nothing sent to Woolworths" })
    .waitFor();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(origin + "/do/loyalty/everyday-rewards");
  await page.getByRole("button", { name: "Motion reduced" }).waitFor();
  assert.equal(
    await page
      .locator(".ld-reward-object")
      .evaluate((e) => getComputedStyle(e).animationName),
    "none",
  );
  await page.screenshot({ path: `${output}/phone-reduced-motion.png` });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.getByRole("button", { name: "Pause motion" }).click();
  assert.equal(
    await page
      .locator(".ld-reward-object")
      .evaluate((e) => getComputedStyle(e).animationName),
    "none",
  );
  assert.deepEqual(writes, []);
  assert.deepEqual(errors, []);
  fs.writeFileSync(
    `${output}/checks.json`,
    JSON.stringify(
      {
        viewports: ["1440", "820", "375"],
        writes,
        errors,
        reducedMotion: true,
        paused: true,
        staleReviewBlocked: true,
        downloadedReceipts: true,
      },
      null,
      2,
    ),
  );
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
