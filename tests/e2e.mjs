import { mockPosterImages } from './poster-fixture.mjs';
import { chromium } from 'playwright';
import { existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
const results = resolve('test-results');
mkdirSync(results, { recursive: true });
const chrome =
  process.env.CHROME_PATH ??
  ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'].find(existsSync);
const browser = await chromium.launch({
  executablePath: chrome,
  headless: true,
  args: ['--no-sandbox'],
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 1050 },
  deviceScaleFactor: 1,
});
await page.addInitScript(() => localStorage.setItem('aesthetic-dna-locale', 'zh'));
await mockPosterImages(page);
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.goto('http://127.0.0.1:5173');
await page.getByRole('heading', { name: /好看这件事/ }).waitFor();
await page.screenshot({ path: resolve(results, 'home.png'), fullPage: true });
console.log(
  'desktop',
  await page.title(),
  'overflow',
  await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
);
await page.setViewportSize({ width: 390, height: 844 });
await page.screenshot({ path: resolve(results, 'mobile-home.png'), fullPage: true });
await page.getByRole('button', { name: '看看我的审美 DNA' }).click();
await page.locator('[data-poster="amelie"]').click();
await page.locator('[data-poster="eeaao"]').click();
await page.getByRole('button', { name: '色彩冲击', exact: true }).click();
await page.getByRole('button', { name: /留下这个选择/ }).click();
await page.locator('[data-choice="b"]').click();
await page.reload();
await page.locator('[data-choice="b"][aria-pressed="true"]').waitFor();
console.log('refresh preserves selection');
for (let step = 2; step <= 16; step++) {
  const h = await page.locator('.question-heading h1').innerText();
  console.log(step, h);
  if ([3, 7, 16].includes(step) && (await page.locator('[data-choice]').count()) !== 4)
    throw new Error('Expected four color variants');
  if (step === 5) {
    await page.getByLabel('取景缩放').fill('1.8');
    await page.getByRole('button', { name: '16:9', exact: true }).click();
    await page.getByRole('button', { name: /^(就这一帧|按下快门)/ }).click();
    await page.getByRole('button', { name: '保留现场故事', exact: true }).click();
    await page.screenshot({ path: resolve(results, 'crop.png'), fullPage: true });
  } else if (step === 8) {
    if ((await page.locator('.color-grid.expanded button').count()) !== 38)
      throw new Error('Missing extended color palette');
    await page.getByRole('button', { name: '套用配色 紫色夜游', exact: true }).click();
    await page.getByLabel('选择颜色 HEX', { exact: true }).fill('#1255ab');
    await page.getByRole('button', { name: '选择颜色 #c8ccad', exact: true }).click();
    await page.getByLabel('背景面积').fill('55');
    await page.getByPlaceholder('我的三色片段').fill('雨后还没散场');
  } else if (step === 10) {
    await page.getByRole('button', { name: '偏心排版', exact: true }).click();
    await page.getByLabel('标题大小').fill('85');
  } else if (step === 12) {
    await page.getByRole('button', { name: /换一个蓝色挎包/ }).click();
    await page.getByRole('button', { name: '颜色呼应', exact: true }).click();
  } else if (step === 14) {
    await page.getByRole('button', { name: /主体的位置改变了/ }).click();
  } else if (step === 15) {
    await page.getByRole('button', { name: /文字的字号层级/ }).click();
  } else {
    await page.locator(`[data-choice="${step === 7 ? 'd' : 'a'}"]`).click();
  }
  const next = page.getByRole('button', {
    name: step === 16 ? /打开我的审美档案/ : /留下这个选择/,
  });
  await next.click();
}
await page.locator('.report-hero h1').waitFor();
console.log('report', await page.locator('.report-hero h1').innerText());
await page.screenshot({ path: resolve(results, 'mobile-report.png'), fullPage: true });
await page.getByRole('heading', { name: '有边界的浪漫派', exact: true }).waitFor();
if (!(await page.locator('[data-card-palette]').getAttribute('data-card-palette')))
  throw new Error('Missing result-driven card palette');
const [themed] = await Promise.all([
  page.waitForEvent('download'),
  page.getByRole('button', { name: '保存我的结果卡 ↓', exact: true }).click(),
]);
await themed.saveAs(resolve(results, 'share-result.png'));
console.log('automatic palette and creative portrait verified');
console.log(
  'mobile report overflow',
  await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
);
await page.reload();
await page.locator('.report-hero h1').waitFor();
const [png] = await Promise.all([
  page.waitForEvent('download'),
  page.getByRole('button', { name: '保存我的审美卡', exact: false }).first().click(),
]);
await png.saveAs(resolve(results, 'share.png'));
console.log('png', png.suggestedFilename(), await png.failure());
const [md] = await Promise.all([
  page.waitForEvent('download'),
  page.getByRole('button', { name: /下载完整文字报告/ }).click(),
]);
await md.saveAs(resolve(results, 'report.md'));
console.log('md', await md.failure());
await page.setViewportSize({ width: 1440, height: 1000 });
await page.screenshot({ path: resolve(results, 'report.png'), fullPage: true });
const [photo] = await Promise.all([
  page.waitForEvent('download'),
  page
    .locator('.artwork')
    .first()
    .getByRole('button', { name: /保存 PNG/ })
    .click(),
]);
await photo.saveAs(resolve(results, 'crop-export.png'));
await page.getByRole('button', { name: /回看选择/ }).click();
await page.getByRole('button', { name: /这题先跳过/ }).click();
await page.getByRole('button', { name: /查看已保存报告/ }).click();
await page.getByText('15 / 16 步已作答', { exact: true }).waitFor();
console.log('answer revision updates report');
await page.getByRole('button', { name: /做一张练习副本/ }).click();
await page.getByRole('dialog', { name: '取景练习副本' }).waitFor();
await page.getByRole('button', { name: /^(就这一帧|按下快门)/ }).click();
console.log('practice reachable');
await page.getByRole('button', { name: '关闭练习' }).click();
await page.setViewportSize({ width: 1440, height: 1000 });
await page.getByRole('button', { name: '关于这场实验', exact: false }).click();
await page.getByRole('button', { name: '删除本设备的实验记录' }).click();
await page.getByRole('button', { name: '确认删除', exact: true }).click();
await page.getByRole('heading', { name: /好看这件事/ }).waitFor();
await page.reload();
await page.getByRole('button', { name: '看看我的审美 DNA', exact: true }).waitFor();
console.log('delete persists across reload');
// Partial editor state is recoverable but does not appear as a confirmed artwork.
await page.getByRole('button', { name: '看看我的审美 DNA', exact: true }).click();
for (let i = 0; i < 4; i++) await page.getByRole('button', { name: /这题先跳过/ }).click();
await page.getByLabel('取景缩放').fill('2');
await page.reload();
await page.getByLabel('取景缩放').waitFor();
if ((await page.getByLabel('取景缩放').inputValue()) !== '2')
  throw new Error('Crop draft lost on refresh');
for (let i = 4; i < 16; i++) await page.getByRole('button', { name: /这题先跳过/ }).click();
await page.getByText('0 / 16 步已作答', { exact: true }).waitFor();
await page.getByRole('heading', { name: '你的偏好，还在展开。' }).waitFor();
if ((await page.locator('.artwork').count()) !== 0)
  throw new Error('Skipped tasks invented artworks');
if ((await page.locator('.evidence-card').count()) !== 0)
  throw new Error('Skipped tasks invented claims');
console.log('all-skipped flow and unconfirmed editor draft verified');
const [emptyShare] = await Promise.all([
  page.waitForEvent('download'),
  page.getByRole('button', { name: '保存我的审美卡', exact: false }).first().click(),
]);
await emptyShare.saveAs(resolve(results, 'empty-share.png'));
for (const [name, fn] of [
  ['palette', 'paletteSVG'],
  ['poster', 'posterSVG'],
]) {
  const result = await page.evaluate(
    async ({ fn }) => {
      const art = await import('/src/art.ts');
      const core = await import('/src/core.ts');
      const svg = art[fn](fn === 'paletteSVG' ? core.defaultPalette() : core.defaultPoster());
      const img = new Image();
      await new Promise((res, rej) => {
        img.onload = res;
        img.onerror = rej;
        img.src = art.uri(svg);
      });
      return { w: img.naturalWidth, h: img.naturalHeight };
    },
    { fn },
  );
  if (!result.w || !result.h) throw new Error('Invalid artwork ' + name);
  console.log(name, result);
}
await page.setViewportSize({ width: 1440, height: 1000 });
await page.getByRole('button', { name: '关于这场实验', exact: false }).click();
await page.keyboard.press('Tab');
if (
  !(await page.evaluate(() =>
    document.querySelector('[role="dialog"]').contains(document.activeElement),
  ))
)
  throw new Error('Modal focus escaped');
await page.keyboard.press('Escape');
if (await page.getByRole('dialog').count()) throw new Error('Escape failed to close modal');
console.log('keyboard dialog verified');
console.log('errors', JSON.stringify(errors));
await browser.close();
if (errors.length) process.exitCode = 1;
