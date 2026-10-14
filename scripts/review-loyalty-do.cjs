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
  let syntheticVisionRequests = 0;
  await context.route("**/*", (route) => {
    const r = route.request();
    const pathname = new URL(r.url()).pathname;
    if (pathname === "/api/do/vision" && r.method() === "POST") {
      const body = r.postDataJSON();
      assert.equal(body.consent, true);
      assert.equal(body.purpose, "observation");
      assert(body.question.includes("Do not guess weights"));
      syntheticVisionRequests++;
      return route.fulfill({
        json: {
          text: JSON.stringify({
            ingredients: [
              {
                name: "Tomatoes",
                amount: null,
                unit: "g",
                uncertainty: "Weight cannot be seen.",
              },
              {
                name: "Rice",
                amount: 500,
                unit: "g",
                uncertainty: "Illustrative package quantity.",
              },
            ],
          }),
          receipt: {
            model: "synthetic-fixture-no-provider",
            imageHash: "a".repeat(64),
            outputHash: "b".repeat(64),
            createdAt: "2026-10-13T00:00:00Z",
            boundary: "Synthetic test only",
          },
        },
      });
    }
    if (pathname === "/api/do/live-token" && r.method() === "GET")
      return route.fulfill({
        json: {
          enabled: true,
          configured: true,
          signedIn: false,
          remaining: 0,
          dailyLimit: 3,
          sessionSeconds: 300,
          model: "synthetic",
        },
      });
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
    await page.getByRole("checkbox", { name: "Confirm entire pantry" }).check();
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
    await page
      .getByRole("checkbox", { name: "Confirm simulated basket" })
      .check();
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
  // The prior viewport deliberately skipped. Start a fresh demo for the non-skip branch.
  await page.getByRole("button", { name: "Reset demonstration" }).click();
  await page.getByRole("checkbox", { name: "Confirm entire pantry" }).check();
  await page.getByRole("button", { name: "Make a plan", exact: true }).click();
  await page
    .getByRole("button", { name: "Review the basket", exact: true })
    .click();
  await page
    .getByRole("checkbox", { name: "Confirm simulated basket" })
    .check();
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
  // Synthetic photo -> uncertain rows -> explicit corrections -> chosen recipe -> receipt.
  await page.goto(origin + "/do/loyalty/everyday-rewards");
  await page.getByRole("button", { name: "Review a fridge photo" }).click();
  assert.equal(
    await page.getByText("Pages to text", { exact: true }).count(),
    0,
  );
  await page
    .getByLabel("Choose fridge or pantry photo", { exact: true })
    .setInputFiles("public/loyalty/everyday-rewards/kitchen.jpg");
  await page
    .getByRole("checkbox", { name: "Consent to grocery photo review" })
    .check();
  await page
    .getByRole("button", { name: "Find ingredient candidates" })
    .click();
  await page.getByLabel("Review photo observation").waitFor();
  assert.equal(
    await page
      .getByLabel("Ingredient 1 quantity", { exact: true })
      .inputValue(),
    "400",
    "extraction never silently changes stock",
  );
  await page
    .getByRole("button", { name: "Map observation to ingredient review" })
    .click();
  assert.equal(
    await page
      .getByLabel("Ingredient 1 quantity", { exact: true })
      .inputValue(),
    "",
  );
  assert(
    await page
      .getByRole("checkbox", { name: "Confirm entire pantry" })
      .isDisabled(),
  );
  await page.getByLabel("Ingredient 1 quantity", { exact: true }).fill("600");
  await page
    .getByRole("checkbox", { name: "Confirm ingredient 1", exact: true })
    .check();
  await page
    .getByRole("checkbox", { name: "Confirm ingredient 2", exact: true })
    .check();
  await page
    .getByRole("button", { name: "Add ingredient", exact: true })
    .click();
  assert(
    await page
      .getByRole("checkbox", { name: "Confirm entire pantry" })
      .isDisabled(),
  );
  await page
    .getByRole("button", { name: "Remove ingredient 3", exact: true })
    .click();
  await page
    .locator(".ld-ingredients")
    .screenshot({ path: `${output}/phone-photo-ingredients.png` });
  await page.getByRole("checkbox", { name: "Confirm entire pantry" }).check();
  await page.getByRole("button", { name: "Make a plan", exact: true }).click();
  await page
    .getByRole("button", { name: "Choose Tomato & aubergine rice bowls", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Review the basket", exact: true })
    .click();
  await page.getByText("NZ$10.00", { exact: true }).waitFor();
  await page
    .getByRole("checkbox", { name: "Confirm simulated basket" })
    .check();
  await page.getByRole("button", { name: "Continue to handoff" }).click();
  await page
    .getByRole("button", { name: "Approve simulated handoff", exact: true })
    .click();
  await page
    .getByText(
      "Model: synthetic-fixture-no-provider; observed 2026-10-13T00:00:00Z",
      { exact: true },
    )
    .waitFor();
  assert(
    await page
      .locator(".ld-receipt")
      .innerText()
      .then(
        (t) =>
          t.includes("User edited: yes") &&
          t.includes("a".repeat(64)) &&
          t.includes("b".repeat(64)),
      ),
  );
  await page
    .locator(".ld-workspace")
    .screenshot({ path: `${output}/phone-photo-receipt.png` });
  // Sign-in is deliberately separate and carries only a static return locator.
  await page.getByRole("button", { name: "Reset demonstration" }).click();
  await page.getByLabel("Ingredient 1 quantity", { exact: true }).fill("725");
  await page.getByRole("button", { name: "Talk through dinner" }).click();
  const signIn = page.getByRole("link", { name: "Sign in in a new tab" });
  assert.equal(await signIn.getAttribute("target"), "_blank");
  assert.equal(
    await signIn.getAttribute("href"),
    "/login?redirect=%2Fdo%2Floyalty%2Feveryday-rewards",
  );
  await page
    .getByRole("button", { name: "Check call availability after sign-in" })
    .click();
  assert.equal(
    await page
      .getByLabel("Ingredient 1 quantity", { exact: true })
      .inputValue(),
    "725",
  );
  // Written/voice-format notes require an explicit mapping and per-row confirmation.
  await page.getByRole("button", { name: "Reset demonstration" }).click();
  await page
    .getByLabel("Ingredient notes", { exact: true })
    .fill("Tomatoes | 600 | g\nRice | 500 | g");
  assert.equal(
    await page
      .getByLabel("Ingredient 1 quantity", { exact: true })
      .inputValue(),
    "400",
  );
  await page
    .getByRole("button", {
      name: "Map reviewed notes to ingredient candidates",
    })
    .click();
  assert.equal(
    await page
      .getByLabel("Ingredient 1 quantity", { exact: true })
      .inputValue(),
    "600",
  );
  assert(
    await page
      .getByRole("button", { name: "Make a plan", exact: true })
      .isDisabled(),
  );
  await page
    .getByRole("checkbox", { name: "Confirm ingredient 1", exact: true })
    .check();
  await page
    .getByRole("checkbox", { name: "Confirm ingredient 2", exact: true })
    .check();
  // Empty pantry is valid; the editable cap, not a hidden NZ$40 rule, governs review.
  await page
    .getByRole("button", { name: "Remove ingredient 2", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Remove ingredient 1", exact: true })
    .click();
  await page.getByRole("checkbox", { name: "Confirm entire pantry" }).check();
  await page.getByRole("button", { name: "Make a plan", exact: true }).click();
  for (let n = 0; n < 4; n++)
    await page.getByRole("button", { name: "One more person" }).click();
  await page
    .getByRole("button", { name: "Review the basket", exact: true })
    .click();
  await page.getByText("NZ$43.00", { exact: true }).waitFor();
  await page
    .getByRole("checkbox", { name: "Confirm simulated basket" })
    .check();
  assert(
    await page
      .getByRole("button", { name: "Continue to handoff" })
      .isDisabled(),
  );
  await page
    .getByRole("button", { name: "Edit the plan", exact: true })
    .click();
  await page.getByLabel("Basket budget NZD", { exact: true }).fill("50");
  await page
    .getByRole("button", { name: "Review the basket", exact: true })
    .click();
  assert(
    !(await page
      .getByRole("checkbox", { name: "Confirm simulated basket" })
      .isChecked()),
  );
  await page
    .getByRole("checkbox", { name: "Confirm simulated basket" })
    .check();
  assert(
    await page.getByRole("button", { name: "Continue to handoff" }).isEnabled(),
  );
  assert.equal(syntheticVisionRequests, 1);
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
        syntheticVisionRequests,
        photoIngredientReview: true,
        explicitRecipeChoice: true,
        signInKeepsOriginalTab: true,
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
