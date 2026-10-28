import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newSession, defaultCrop, defaultPalette, defaultPoster, analyze } from '../src/core.ts';
import { QUESTIONS } from '../src/content.ts';
import { POSTERS } from '../src/posters.ts';
import { shuffledPosters, togglePoster } from '../src/features/posters/catalog.ts';
import { localizedReport } from '../src/i18n/report.ts';
import { translate } from '../src/i18n/translate.ts';
import { shareSVG, posterSVG, paletteSVG } from '../src/art.ts';
import { markdown } from '../src/export.ts';

test('poster shuffle is reproducible, filtered and independent of film origin scoring', () => {
  const first = shuffledPosters('session-one').map((p) => p.id);
  assert.deepEqual(
    first,
    shuffledPosters('session-one').map((p) => p.id),
  );
  assert.notDeepEqual(
    first,
    shuffledPosters('session-two').map((p) => p.id),
  );
  assert.equal(new Set(first).size, 16);
  for (const style of ['minimal', 'expressive', 'japanese', 'illustrated'] as const) {
    const list = shuffledPosters('session-one', style);
    assert.ok(list.length >= 4);
    assert.ok(list.every((p) => p.styles.includes(style)));
  }
  const s = newSession();
  s.answers.q01 = {
    type: 'archive',
    value: { ids: POSTERS.slice(0, 3).map((p) => p.id), why: '直觉' },
  };
  assert.ok(analyze(s).axes.every((a) => a.count === 0));
});
test('poster wall caps picks at three, replaces oldest and permits removal', () => {
  let ids: string[] = [];
  for (const id of ['a', 'b', 'c', 'd']) ids = togglePoster(ids, id);
  assert.deepEqual(ids, ['b', 'c', 'd']);
  assert.deepEqual(togglePoster(ids, 'c'), ['b', 'd']);
});
test('every question and control choice has English copy', () => {
  for (const q of QUESTIONS)
    for (const copy of [q.title, q.subtitle, q.label, ...(q.options ?? [])])
      assert.doesNotMatch(translate('en', copy), /[\u3400-\u9fff]/, copy);
});
test('English reports preserve canonical scores, evidence IDs and answers', () => {
  for (const side of ['a', 'b', 'c', 'd'] as const) {
    const s = newSession();
    for (const q of QUESTIONS)
      if (q.kind === 'pair')
        s.answers[q.id] = { type: 'pair', value: q.colorVariants ? side : 'a' };
    s.answers.q01 = {
      type: 'archive',
      value: { ids: ['amelie', 'perfect-days', 'eeaao'], why: '色彩冲击' },
    };
    s.answers.q05 = {
      type: 'crop',
      value: { ...defaultCrop(), ratio: '16:9', zoom: 2, frozen: true, intent: '保留现场故事' },
    };
    s.answers.q08 = { type: 'palette', value: defaultPalette() };
    s.answers.q10 = { type: 'poster', value: { ...defaultPoster(), custom: true, layout: 2 } };
    s.answers.q12 = { type: 'outfit', value: { item: 2, reason: '颜色呼应' } };
    s.answers.q14 = { type: 'observe', value: 0 };
    s.answers.q15 = { type: 'observe', value: 1 };
    const before = structuredClone(s),
      zh = analyze(s),
      en = localizedReport(s, 'en');
    assert.deepEqual(
      en.axes.map((a) => a.score),
      zh.axes.map((a) => a.score),
    );
    assert.deepEqual(
      en.evidence.map((e) => e.id),
      zh.evidence.map((e) => e.id),
    );
    assert.deepEqual(s, before);
    for (const c of [...en.claims, ...en.thinking, ...en.focus, en.temperament])
      assert.doesNotMatch(c.title + c.text, /[\u3400-\u9fff]/);
    for (const e of en.evidence) assert.doesNotMatch(e.fact, /[\u3400-\u9fff]/);
    assert.doesNotMatch(markdown(s, 'en'), /[\u3400-\u9fff]/);
    assert.match(markdown(s, 'zh'), /审美 DNA/);
    for (const theme of ['moss', 'slate', 'kinetic', 'volt', 'mist'] as const) {
      const svg = shareSVG(s, theme, 'en');
      assert.doesNotMatch(svg, /[\u3400-\u9fff]/);
      assert.match(svg, /1080/);
    }
  }
  assert.doesNotMatch(posterSVG(defaultPoster(), 'en'), /[\u3400-\u9fff]/);
  assert.doesNotMatch(paletteSVG(defaultPalette(), 'en'), /[\u3400-\u9fff]/);
});
