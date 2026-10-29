import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync } from 'node:fs';
import { mockPosterImages } from './poster-fixture.mjs';
const chrome =
  process.env.CHROME_PATH ??
  ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'].find(existsSync);
const browser = await chromium.launch({
  executablePath: chrome,
  headless: true,
  args: ['--no-sandbox'],
});
const p = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
const errors = [];
p.on('pageerror', (e) => errors.push(e.message));
await mockPosterImages(p);
mkdirSync('test-results', { recursive: true });
await p.goto('http://127.0.0.1:5173');
await p.getByRole('button', { name: 'See my Aesthetic DNA' }).click();
await p.getByRole('button', { name: 'Skip for now' }).click();
await p.locator('[data-choice=a]').click();
assert.equal(await p.locator('.choice-selected-badge').count(), 1);
assert.match(await p.getByRole('status').innerText(), /Selected [AB]/);
await p.locator('[data-reason=read-first]').click();
await p.reload();
await p.locator('[data-reason=read-first][aria-pressed=true]').waitFor();
await p.locator('[data-choice=a]').click();
assert.equal(await p.locator('[data-reason=read-first]').getAttribute('aria-pressed'), 'true');
await p.locator('[data-choice=b]').click();
assert.equal(await p.locator('[data-reason][aria-pressed=true]').count(), 0);
await p.locator('[data-choice=a]').click();
await p.locator('[data-reason=read-first]').click();
await p.getByRole('button', { name: 'Keep this choice' }).click();
await p.locator('[data-choice=a]').click();
await p.locator('[data-reason=room-focus]').click();
await p.getByRole('button', { name: 'Keep this choice' }).click();
await p.getByRole('button', { name: 'Skip for now' }).click();
assert.equal(await p.locator('[data-scene]').count(), 3);
assert.equal(await p.locator('[data-camera]').count(), 8);
const originalSource = await p.locator('.crop-frame img').getAttribute('src');
await p.getByRole('button', { name: 'Walk ←', exact: true }).click();
assert.notEqual(await p.locator('.crop-frame img').getAttribute('src'), originalSource);
await p.getByLabel('Camera height', { exact: true }).fill('3.2');
await p.reload();
assert.equal(await p.getByLabel('Camera height', { exact: true }).inputValue(), '3.2');
await p.locator('[data-camera=low]').click();
const lowSource = await p.locator('.crop-frame img').getAttribute('src');
await p.locator('[data-camera=eye]').click();
assert.notEqual(await p.locator('.crop-frame img').getAttribute('src'), lowSource);
await p.locator('[data-camera=low]').click();
await p.locator('[data-framing=story]').click();
await p.getByRole('button', { name: '中文', exact: true }).click();
await p.locator('[data-camera=low]').filter({ hasText: '蹲下仰拍' }).waitFor();
assert.equal(await p.locator('[data-camera=low]').getAttribute('aria-pressed'), 'true');
await p.screenshot({ path: 'test-results/photo-studio-zh.png', fullPage: true });
await p.getByRole('button', { name: 'EN', exact: true }).click();
for (const scene of ['coast', 'mountains']) {
  await p.locator(`[data-scene=${scene}]`).click();
  assert.equal(await p.locator('[data-camera]').count(), 8);
  await p.locator('[data-framing=landscape]').click();
  await p
    .locator('.ratios button')
    .filter({ hasText: /^16:9$/ })
    .click();
  assert.equal(await p.locator('.ratios button.active').innerText(), '16:9');
}
await p.reload();
await p.locator('[data-scene=mountains][aria-pressed=true]').waitFor();
assert.equal(await p.locator('.ratios button.active').innerText(), '16:9');
await p.locator('[data-scene=shanghai]').click();
await p.locator('[data-camera=low]').click();
await p.locator('[data-framing=story]').click();
await p.getByRole('button', { name: /(Keep this frame|Take photo)/ }).click();
await p.getByLabel('Frame zoom').fill('1.25');
assert.equal(await p.locator('.crop-frame.is-frozen').count(), 0);
assert.equal(await p.getByRole('button', { name: 'Keep this choice' }).isEnabled(), false);
await p.getByRole('button', { name: /(Keep this frame|Take photo)/ }).click();
await p.setViewportSize({ width: 390, height: 844 });
await p
  .locator('.photo-control-nav button')
  .filter({ hasText: /^Frame$/ })
  .click();
assert.equal(await p.locator('[data-panel=camera]').isVisible(), false);
assert.equal(await p.locator('[data-panel=focus]').isVisible(), false);
await p
  .locator('.ratios button')
  .filter({ hasText: /^9:16$/ })
  .click();
await p.locator('.studio.crop-studio').scrollIntoViewIfNeeded();
const geometry = await p.evaluate(() => {
  const frame = document.querySelector('.crop-frame').getBoundingClientRect();
  const zoom = document.querySelector('.range-label input').getBoundingClientRect();
  return { ratio: frame.width / frame.height, height: frame.height, gap: zoom.top - frame.bottom };
});
assert.ok(Math.abs(geometry.ratio - 9 / 16) < 0.01, JSON.stringify(geometry));
assert.ok(geometry.height <= 281, JSON.stringify(geometry));
assert.ok(geometry.gap < 210, JSON.stringify(geometry));
await p.getByLabel('Frame zoom').fill('1.5');
await p
  .locator('.photo-control-nav button')
  .filter({ hasText: /^Camera$/ })
  .click();
assert.equal(await p.locator('[data-panel=frame]').isVisible(), false);
await p.locator('[data-camera=eye]').click();
await p.locator('[data-camera=low]').click();
await p
  .locator('.photo-control-nav button')
  .filter({ hasText: /^Focus$/ })
  .click();
await p.locator('[data-framing=story]').click();
await p
  .locator('.photo-control-nav button')
  .filter({ hasText: /^Frame$/ })
  .click();
await p.getByRole('button', { name: /(Keep this frame|Take photo)/ }).click();
assert.equal(await p.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
await p.screenshot({ path: 'test-results/photo-studio-mobile.png', fullPage: true });
await p.setViewportSize({ width: 1440, height: 1100 });
await p.screenshot({ path: 'test-results/photo-studio-en.png', fullPage: true });
await p.getByRole('button', { name: 'Keep this choice' }).click();
for (let i = 5; i < 16; i++) await p.getByRole('button', { name: 'Skip for now' }).click();
await p.locator('[data-personal-report]').waitFor();
await p.getByRole('heading', { name: 'Make it clear. Let the focal point shine.' }).waitFor();
await p.locator('[data-insight=motive]').waitFor();
await p.locator('[data-insight=crop]').waitFor();
assert.match(await p.locator('[data-insight=crop]').innerText(), /crouch/);
assert.doesNotMatch(await p.locator('main').innerText(), /[\u3400-\u9fff]/);
await p
  .locator('[data-personal-report]')
  .screenshot({ path: 'test-results/personal-report-en.png' });
await p.getByRole('button', { name: '中文', exact: true }).click();
await p
  .locator('[data-personal-report]')
  .screenshot({ path: 'test-results/personal-report-zh.png' });
await p.setViewportSize({ width: 390, height: 844 });
assert.equal(await p.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
await p
  .locator('[data-personal-report]')
  .screenshot({ path: 'test-results/personal-report-mobile.png' });
const [download] = await Promise.all([
  p.waitForEvent('download'),
  p.getByRole('button', { name: '保存我的结果卡 ↓', exact: true }).click(),
]);
await download.saveAs('test-results/photo-personal-card.png');
assert.equal(await download.failure(), null);
assert.deepEqual(errors, []);
await browser.close();
console.log(
  'PASS: follow-up explanations, all three photo scenarios, distinct camera sources, draft recovery, freezing, personal report and photo card export',
);
