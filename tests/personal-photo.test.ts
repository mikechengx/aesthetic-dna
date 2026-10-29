import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  analyze,
  newSession,
  defaultCrop,
  defaultPalette,
  cropRect,
  upgradeSession,
  type Crop,
} from '../src/core.ts';
import { localizedReport } from '../src/i18n/report.ts';
import { QUESTION_DETAILS } from '../src/questionDetails.ts';
import {
  PHOTO_SCENES,
  photoSource,
  photoView,
  framingPresets,
  referenceCrop,
} from '../src/photoScenarios.ts';
import { cropSVG, shareSVG } from '../src/art.ts';
import { markdown } from '../src/export.ts';

test('optional explanations distinguish equal selections without adding axis votes', () => {
  const first = newSession();
  first.answers.q02 = { type: 'pair', value: 'a', reason: 'read-first' };
  first.answers.q06 = { type: 'pair', value: 'a', reason: 'facade-clarity' };
  const second = structuredClone(first);
  second.answers.q02 = { type: 'pair', value: 'a', reason: 'type-rhythm' };
  second.answers.q06 = { type: 'pair', value: 'a', reason: 'facade-rhythm' };
  assert.deepEqual(
    analyze(first).axes.map((a) => [a.count, a.score]),
    analyze(second).axes.map((a) => [a.count, a.score]),
  );
  assert.notEqual(localizedReport(first, 'en').title, localizedReport(second, 'en').title);
  assert.deepEqual(localizedReport(first, 'en').titleEvidenceIds, ['q02-reason', 'q06-reason']);
  assert.equal(localizedReport(first, 'en').personal.reasonCount, 2);
});
test('invalid reasons, both/neither and drafts never invent personal motive claims', () => {
  const s = newSession();
  s.answers.q02 = { type: 'pair', value: 'a', reason: 'not-a-real-reason' };
  s.answers.q06 = { type: 'pair', value: 'both', reason: 'facade-clarity' };
  s.drafts = { q03: { type: 'pair', value: 'a', reason: 'room-focus' } };
  const r = localizedReport(s, 'en');
  assert.equal(r.personal.reasonCount, 0);
  assert.ok(!r.personal.insights.some((c) => c.kind === 'self-report'));
  assert.ok(!r.evidence.some((e) => e.id.endsWith('-reason')));
});
test('same overall color average preserves different context-specific stories', () => {
  const s = newSession();
  s.answers.q03 = { type: 'pair', value: 'a' };
  s.answers.q07 = { type: 'pair', value: 'd' };
  const other = structuredClone(s);
  other.answers.q03 = { type: 'pair', value: 'd' };
  other.answers.q07 = { type: 'pair', value: 'a' };
  assert.equal(analyze(s).axes[1].score, analyze(other).axes[1].score);
  assert.notEqual(localizedReport(s, 'en').title, localizedReport(other, 'en').title);
  assert.match(localizedReport(s, 'en').title, /Quiet room/);
});
test('personal observations and tailored exercises cite only confirmed evidence in both languages', () => {
  const s = newSession();
  for (const [id, d] of Object.entries(QUESTION_DETAILS))
    s.answers[id] = { type: 'pair', value: 'a', reason: d.reasons[0].id };
  s.answers.q05 = {
    type: 'crop',
    value: {
      ...defaultCrop(),
      camera: 'low',
      ratio: '16:9',
      zoom: 2,
      frozen: true,
      intent: '保留现场故事',
    },
  };
  s.answers.q08 = { type: 'palette', value: { ...defaultPalette(), areas: [70, 20, 10] } };
  const before = structuredClone(s);
  for (const lang of ['en', 'zh'] as const) {
    const r = localizedReport(s, lang);
    for (const c of [...r.personal.insights, ...r.personal.nextSteps])
      for (const id of c.evidenceIds)
        assert.ok(
          r.evidence.some((e) => e.id === id),
          id,
        );
    assert.match(
      r.personal.insights.find((i) => i.id === 'crop')!.text,
      lang === 'en' ? /low angle/ : /低机位/,
    );
    assert.ok(markdown(s, lang).includes(r.personal.insights[0].text));
    if (lang === 'en')
      for (const i of r.personal.insights) assert.doesNotMatch(i.title + i.text, /[\u3400-\u9fff]/);
  }
  assert.deepEqual(s, before);
});
test('every scene, camera and preset has an offline source and bounded geometry', () => {
  for (const scene of PHOTO_SCENES)
    for (const v of scene.viewpoints) {
      const c = { ...defaultCrop(), scene: scene.id, camera: v.id };
      assert.match(photoSource(c)!, /^data:image\/jpeg;base64,/);
      assert.equal(photoView(c)!.id, v.id);
      for (const p of framingPresets(c)) {
        const rect = cropRect({ ...c, ...p.crop });
        assert.ok(
          rect.x >= 0 && rect.y >= 0 && rect.x + rect.w <= 1200.001 && rect.y + rect.h <= 900.001,
        );
        assert.match(cropSVG({ ...c, ...p.crop }), /<image href="data:image\/jpeg;base64,/);
      }
    }
  assert.notEqual(
    photoSource({ ...defaultCrop(), camera: 'eye' }),
    photoSource({ ...defaultCrop(), camera: 'low' }),
  );
});
test('legacy crop records retain the original scene, reference and session answers', () => {
  const legacy: Crop = {
    ratio: '4:3',
    zoom: 1.2,
    panX: 0.5,
    panY: 0.5,
    frozen: true,
    intent: '凭感觉',
  };
  assert.equal(photoSource(legacy), undefined);
  assert.ok(!cropSVG(legacy).includes('<image'));
  assert.equal(referenceCrop(legacy).scene, undefined);
  const s = newSession();
  s.questionSetVersion = 2;
  s.analysisVersion = 2;
  s.answers.q05 = { type: 'crop', value: legacy };
  const migrated = upgradeSession(s);
  assert.deepEqual(migrated.answers, s.answers);
  assert.equal(migrated.analysisVersion, 3);
  assert.ok(!localizedReport(newSession(), 'en').personal.headline);
  assert.match(shareSVG(s, undefined, 'en'), /<svg/);
});
