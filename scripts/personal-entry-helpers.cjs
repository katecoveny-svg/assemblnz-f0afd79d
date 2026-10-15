/** Use the product's explicit entry controls; never expose an editor through DOM mutation. */
async function openPersonalEntry(page, mode = 'write') {
  const entry = page.getByRole('navigation', { name: 'Choose how to start' });
  await entry.waitFor();
  if (mode === 'note') {
    const add = entry.locator('details');
    if (!await add.evaluate(el => el.open)) await add.locator('summary').click();
    await entry.getByRole('button', { name: 'Note or checklist', exact: true }).click();
    await page.locator('#life-admin-source').waitFor();
  } else {
    await entry.getByRole('button', { name: 'Write', exact: true }).click();
    await page.locator('#personal-assistant-input').waitFor();
  }
}
module.exports = { openPersonalEntry };
