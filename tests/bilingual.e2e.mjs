import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { mockPosterImages } from './poster-fixture.mjs';
const chrome =
  process.env.CHROME_PATH ??
  ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'].find(existsSync);
const browser = await chromium.launch({
  executablePath: chrome,
  headless: true,
  args: ['--no-sandbox'],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await mockPosterImages(page);
mkdirSync('test-results', { recursive: true });
await page.goto('http://127.0.0.1:5173');
await page.getByRole('button', { name: 'See my Aesthetic DNA' }).waitFor();
assert.equal(await page.locator('html').getAttribute('lang'), 'en');
assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
await page.screenshot({ path: 'test-results/home-en.png', fullPage: true });
await page.getByRole('button', { name: 'See my Aesthetic DNA' }).click();
assert.equal(await page.locator('[data-poster]').count(), 16);
const order = await page
  .locator('[data-poster]')
  .evaluateAll((items) => items.map((n) => n.dataset.poster));
for (const id of ['amelie', 'eeaao', 'parasite', 'perfect-days'])
  await page.locator(`[data-poster="${id}"]`).click();
assert.equal(await page.locator('[data-poster][aria-pressed=true]').count(), 3);
assert.equal(await page.locator('[data-poster=amelie]').getAttribute('aria-pressed'), 'false');
await page.getByRole('button', { name: /Japanese aesthetics/ }).click();
assert.ok((await page.locator('[data-poster]').count()) >= 4);
assert.equal(await page.locator('.poster-picks button').count(), 3);
await page.getByRole('button', { name: '中文', exact: true }).click();
await page.getByRole('heading', { name: '如果你的房间只能挂三张。' }).waitFor();
assert.equal(await page.locator('.poster-picks button').count(), 3);
await page.getByRole('button', { name: 'EN', exact: true }).click();
await page.getByRole('button', { name: /All posters/ }).click();
assert.deepEqual(
  await page.locator('[data-poster]').evaluateAll((items) => items.map((n) => n.dataset.poster)),
  order,
);
await page.reload();
await page.getByRole('heading', { name: 'Three posters. One wall. Your call.' }).waitFor();
assert.equal(await page.locator('[data-poster][aria-pressed=true]').count(), 3);
assert.deepEqual(
  await page.locator('[data-poster]').evaluateAll((items) => items.map((n) => n.dataset.poster)),
  order,
);
await page.getByRole('button', { name: 'Color impact', exact: true }).click();
await page.getByRole('button', { name: 'Keep this choice' }).click();
for (let step = 2; step <= 16; step++) {
  if (step === 5) {
    await page.getByLabel('Frame zoom').fill('1.8');
    await page.getByRole('button', { name: '16:9', exact: true }).click();
    await page.getByRole('button', { name: /(Keep this frame|Take photo)/ }).click();
    await page.getByRole('button', { name: 'Keep the scene’s story', exact: true }).click();
    await page.getByRole('button', { name: '中文', exact: true }).click();
    assert.equal(await page.getByLabel('取景缩放').inputValue(), '1.8');
    await page.getByRole('button', { name: 'EN', exact: true }).click();
    assert.equal(await page.getByLabel('Frame zoom').inputValue(), '1.8');
  } else if (step === 8) {
    await page
      .getByRole('button', { name: 'Apply palette Violet after hours', exact: true })
      .click();
    await page.getByPlaceholder('My three-color story').fill('After the rain');
  } else if (step === 10) {
    await page.getByRole('button', { name: 'Free layers', exact: true }).click();
    await page.getByLabel('Title size').fill('85');
  } else if (step === 12) {
    await page.getByRole('button', { name: /Try a blue shoulder bag/ }).click();
    await page.getByRole('button', { name: 'Color harmony', exact: true }).click();
  } else if (step === 14) await page.getByRole('button', { name: /The subject moved/ }).click();
  else if (step === 15)
    await page.getByRole('button', { name: /The hierarchy of type sizes/ }).click();
  else await page.locator('[data-choice=a]').click();
  const visible = await page.locator('main').innerText();
  assert.doesNotMatch(visible, /[\u3400-\u9fff]/, `Untranslated copy at step ${step}`);
  await page
    .getByRole('button', { name: step === 16 ? 'Open my portrait' : 'Keep this choice' })
    .click();
}
await page.locator('.report-hero').waitFor();
assert.doesNotMatch(await page.locator('main').innerText(), /[\u3400-\u9fff]/);
const [report] = await Promise.all([
  page.waitForEvent('download'),
  page.getByRole('button', { name: 'Download full report ↓' }).click(),
]);
assert.equal(report.suggestedFilename(), 'My-Aesthetic-DNA.md');
await report.saveAs(resolve('test-results/report-en.md'));
assert.doesNotMatch(readFileSync('test-results/report-en.md', 'utf8'), /[\u3400-\u9fff]/);
const [card] = await Promise.all([
  page.waitForEvent('download'),
  page
    .locator('.share-studio')
    .getByRole('button', { name: 'Save my portrait ↓', exact: true })
    .click(),
]);
assert.match(card.suggestedFilename(), /^My-Aesthetic-DNA-/);
await card.saveAs(resolve('test-results/card-en.png'));
await page.setViewportSize({ width: 390, height: 844 });
assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
await page.screenshot({ path: 'test-results/report-en-mobile.png', fullPage: true });
await page.getByRole('button', { name: '中文', exact: true }).click();
await page.getByText('16 / 16 步已作答', { exact: true }).waitFor();
await page.reload();
assert.equal(await page.locator('html').getAttribute('lang'), 'zh-CN');
await page.getByText('16 / 16 步已作答', { exact: true }).waitFor();
await page.getByRole('button', { name: 'EN', exact: true }).click();
await page.getByRole('button', { name: '← Back home' }).click();
assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
await page.screenshot({ path: 'test-results/home-en-mobile.png', fullPage: true });
assert.deepEqual(errors, []);
await browser.close();
console.log(
  'PASS: bilingual flow, gallery filters, saved selections, English exports and mobile layouts',
);
