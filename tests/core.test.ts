import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  analyze,
  newSession,
  upgradeSession,
  cropRect,
  defaultCrop,
  defaultPalette,
  defaultPoster,
  type Session,
} from '../src/core.ts';
import { QUESTIONS } from '../src/content.ts';
import { contrast, cropSVG, shareSVG } from '../src/art.ts';
import { markdown } from '../src/export.ts';
import { POSTERS } from '../src/posters.ts';
import { COLORS, COLOR_STORIES } from '../src/content.ts';

test('exactly sixteen steps, four making tools, two observation tasks', () => {
  assert.equal(QUESTIONS.length, 16);
  assert.equal(
    QUESTIONS.filter((q) => ['crop', 'palette', 'poster', 'outfit'].includes(q.kind)).length,
    4,
  );
  assert.equal(QUESTIONS.filter((q) => q.kind === 'observe').length, 2);
  assert.equal(new Set(QUESTIONS.map((q) => q.id)).size, 16);
});
test('missing, skipped and unconfirmed answers never invent preferences or artworks', () => {
  const s = newSession();
  s.answers.q02 = { type: 'skip' };
  s.drafts = {
    q05: { type: 'crop', value: defaultCrop() },
    q10: { type: 'poster', value: defaultPoster() },
  };
  const r = analyze(s);
  assert.equal(r.answered, 0);
  assert.equal(r.claims.length, 0);
  assert.equal(r.evidence.length, 0);
  assert.ok(r.axes.every((a) => a.count === 0));
  assert.equal(r.title, '你的偏好，还在展开。');
  assert.doesNotMatch(markdown(s), /定格照片.png/);
});
test('same semantic choice is independent of left/right presentation', () => {
  const a = newSession();
  a.answers.q02 = { type: 'pair', value: 'a' };
  const b = { ...a, flips: a.flips.map((v) => !v) };
  assert.deepEqual(analyze(a), analyze(b));
});
test('changing an answer replaces old evidence and recomputes the report', () => {
  const a = newSession();
  a.answers.q02 = { type: 'pair', value: 'a' };
  a.answers.q06 = { type: 'pair', value: 'a' };
  assert.equal(analyze(a).axes[0].score, -1);
  assert.equal(analyze(a).claims.length, 1);
  a.answers.q02 = { type: 'pair', value: 'b' };
  const r = analyze(a);
  assert.equal(r.axes[0].score, 0);
  assert.equal(r.axes[0].count, 2);
  assert.equal(r.axes[0].mixed, true);
  assert.equal(r.evidence.filter((e) => e.questionId === 'q02').length, 1);
});
test('inherited palette and default poster do not count as independent preference evidence', () => {
  const s = newSession();
  s.answers.q08 = { type: 'palette', value: defaultPalette() };
  s.answers.q10 = { type: 'poster', value: defaultPoster() };
  assert.equal(analyze(s).axes[1].count, 0);
  assert.equal(analyze(s).axes[0].count, 0);
  s.answers.q10 = { type: 'poster', value: { ...defaultPoster(), custom: true, layout: 2 } };
  assert.equal(analyze(s).axes[0].count, 1);
  assert.equal(analyze(s).claims.length, 0);
});
test('both/neither do not silently become neutral direction evidence', () => {
  const s = newSession();
  s.answers.q02 = { type: 'pair', value: 'both' };
  s.answers.q06 = { type: 'pair', value: 'neither' };
  const r = analyze(s);
  assert.equal(r.answered, 2);
  assert.equal(r.axes[0].count, 0);
});
test('crop rectangles stay inside original and preserve selected aspect at all controls', () => {
  for (const ratio of ['1:1', '4:3', '16:9', '9:16'])
    for (const zoom of [1, 1.2, 3])
      for (const panX of [0, 0.5, 1])
        for (const panY of [0, 0.5, 1]) {
          const c = { ...defaultCrop(), ratio, zoom, panX, panY },
            r = cropRect(c),
            [x, y] = ratio.split(':').map(Number);
          assert.ok(r.x >= 0 && r.y >= 0 && r.x + r.w <= 1200.00001 && r.y + r.h <= 900.00001);
          assert.ok(Math.abs(r.w / r.h - x / y) < 0.00001);
          assert.ok(cropSVG(c).includes(`viewBox="${r.x} ${r.y} ${r.w} ${r.h}"`));
        }
});
test('report is deterministic and every conclusion cites existing evidence', () => {
  const s: Session = newSession();
  for (const q of QUESTIONS) if (q.kind === 'pair') s.answers[q.id] = { type: 'pair', value: 'a' };
  assert.deepEqual(analyze(s), analyze(s));
  const r = analyze(s);
  for (const c of r.claims)
    for (const id of c.evidenceIds) assert.ok(r.evidence.find((e) => e.id === id));
  for (const id of r.titleEvidenceIds) assert.ok(r.evidence.find((e) => e.id === id));
  assert.ok(shareSVG(s).includes('<svg'));
  assert.ok(markdown(s).includes('未经测评常模验证'));
});
test('contrast measures readable differences and identical colors', () => {
  assert.equal(contrast('#ffffff', '#ffffff'), 1);
  assert.equal(contrast('#000000', '#ffffff'), 21);
  assert.ok(contrast('#efe5cd', '#244b3e') > 4.5);
});
test('all sixteen posters reference official publishers and retain credits', () => {
  assert.equal(POSTERS.length, 16);
  for (const p of POSTERS) {
    assert.match(p.image, /^https:\/\//);
    assert.match(p.source, /^https:\/\//);
    assert.ok(p.credit.length >= 3);
  }
  assert.ok(COLORS.length >= 36);
  assert.equal(COLOR_STORIES.length, 8);
  for (const p of COLOR_STORIES) for (const c of p.colors) assert.match(c, /^#[a-f0-9]{6}$/);
});
test('four-way color answers preserve direction and cite the actual choice label', () => {
  const s = newSession();
  s.answers.q03 = { type: 'pair', value: 'd' };
  s.answers.q07 = { type: 'pair', value: 'c' };
  const r = analyze(s);
  assert.ok(r.axes[1].score > 0);
  assert.equal(r.axes[1].count, 2);
  assert.match(r.evidence[0].fact, /高能撞色/);
  assert.match(r.evidence[1].fact, /暖调有主张/);
  assert.ok(r.temperament.available);
});
test('poster preferences are descriptive and never counted as color or order scores', () => {
  const s = newSession();
  s.answers.q01 = { type: 'archive', value: { ids: ['eeaao', 'chihiro'], why: '故事氛围' } };
  const r = analyze(s);
  assert.equal(r.axes[0].count, 0);
  assert.equal(r.axes[1].count, 0);
  assert.equal(r.temperament.available, false);
  assert.ok(r.evidence[0].fact.includes('瞬息全宇宙'));
  assert.equal(r.thinking.length, 1);
});
test('creative portraits change with evidence and never cite fabricated answers', () => {
  const s = newSession();
  s.answers.q02 = { type: 'pair', value: 'a' };
  s.answers.q06 = { type: 'pair', value: 'a' };
  s.answers.q04 = { type: 'pair', value: 'a' };
  s.answers.q13 = { type: 'pair', value: 'a' };
  const r = analyze(s);
  assert.equal(r.temperament.title, '有边界的浪漫派');
  for (const p of [r.temperament, ...r.focus, ...r.thinking])
    for (const id of p.evidenceIds) assert.ok(r.evidence.find((e) => e.id === id));
  s.answers.q03 = { type: 'pair', value: 'd' };
  s.answers.q07 = { type: 'pair', value: 'd' };
  assert.equal(analyze(s).temperament.title, '热烈的结构控');
  assert.match(markdown(s), /你的创作思路/);
  assert.match(markdown(s), /热烈的结构控/);
});
test('upgrading preserves old artwork and maps the old high-energy choice to d', () => {
  const old = { ...newSession(), questionSetVersion: undefined, analysisVersion: 1 };
  old.answers.q01 = { type: 'pair', value: 'b' };
  old.answers.q03 = { type: 'pair', value: 'b' };
  old.answers.q05 = { type: 'crop', value: defaultCrop() };
  old.drafts = { q07: { type: 'pair', value: 'b' } };
  const n = upgradeSession(old);
  assert.deepEqual(n.answers.q03, { type: 'pair', value: 'd' });
  assert.deepEqual(n.drafts?.q07, { type: 'pair', value: 'd' });
  assert.deepEqual(n.answers.q05, old.answers.q05);
  assert.ok(n.legacyAnswers?.q01);
  assert.equal(n.answers.q01, undefined);
  assert.equal(n.questionSetVersion, 2);
  assert.deepEqual(upgradeSession(n), n);
});
test('card themes change presentation without mutating conclusions', () => {
  const s = newSession();
  const r = analyze(s);
  const blue = shareSVG(s, 'slate'),
    orange = shareSVG(s, 'moss'),
    purple = shareSVG(s, 'kinetic');
  assert.notEqual(blue, orange);
  assert.notEqual(orange, purple);
  assert.deepEqual(analyze(s), r);
  assert.match(blue, /1080/);
  assert.match(blue, /1440/);
});
