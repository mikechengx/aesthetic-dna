import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  newSession,
  defaultCrop,
  defaultPalette,
  defaultPoster,
  type Session,
} from '../src/core.ts';
import { QUESTIONS } from '../src/content.ts';
import { getCardProfile } from '../src/cardProfile.ts';
import { shareSVG } from '../src/art.ts';

function concentrated(): Session {
  const s = newSession();
  for (const q of QUESTIONS) if (q.kind === 'pair') s.answers[q.id] = { type: 'pair', value: 'a' };
  s.answers.q05 = { type: 'crop', value: { ...defaultCrop(), frozen: true, intent: '凭感觉' } };
  s.answers.q08 = { type: 'palette', value: defaultPalette() };
  s.answers.q10 = { type: 'poster', value: defaultPoster() };
  return s;
}
function authored(s: Session) {
  s.answers.q05 = {
    type: 'crop',
    value: { ...defaultCrop(), ratio: '16:9', zoom: 2, intent: '只想要线条和形状', frozen: true },
  };
  s.answers.q10 = {
    type: 'poster',
    value: { ...defaultPoster(), custom: true, layout: 2, y: 0.5, size: 130 },
  };
}
test('concentrated answers and unchanged submitted work get a quiet monochrome card', () => {
  const p = getCardProfile(concentrated());
  assert.equal(p.palette, 'moss');
  assert.equal(p.dynamic, false);
  assert.equal(p.authored, 0);
  assert.equal(p.label, '偏好集中型');
});
test('bright color preference alone never becomes a creativity claim or dynamic card', () => {
  const s = concentrated();
  for (const id of ['q03', 'q07', 'q16']) s.answers[id] = { type: 'pair', value: 'd' };
  const p = getCardProfile(s);
  assert.equal(p.dynamic, false);
  assert.equal(p.authored, 0);
});
test('skipped creation tasks are not described as leaving the default unchanged', () => {
  const s = concentrated();
  for (const id of ['q05', 'q08', 'q10']) s.answers[id] = { type: 'skip' };
  const p = getCardProfile(s);
  assert.notEqual(p.label, '偏好集中型');
  assert.ok(!p.description.includes('保留起始方案'));
});
test('muted color plus substantial authoring stays quiet and acknowledges ideas', () => {
  const s = concentrated();
  authored(s);
  const p = getCardProfile(s);
  assert.equal(p.dynamic, false);
  assert.equal(p.label, '安静的编排者');
  assert.equal(p.authored, 2);
  assert.ok(p.headline.join('').includes('想法'));
});
test('bright choices plus independent authoring produce an expressive pink card', () => {
  const s = concentrated();
  authored(s);
  for (const id of ['q03', 'q07', 'q16']) s.answers[id] = { type: 'pair', value: 'd' };
  const p = getCardProfile(s);
  assert.equal(p.dynamic, true);
  assert.equal(p.palette, 'kinetic');
  assert.equal(p.label, '主动实验型');
});
test('an authored lime-led palette selects fluorescent lime, with monochrome work rendering', () => {
  const s = concentrated();
  authored(s);
  for (const id of ['q03', 'q07', 'q16']) s.answers[id] = { type: 'pair', value: 'd' };
  s.answers.q08 = {
    type: 'palette',
    value: { ...defaultPalette(), colors: ['#deff4b', '#234032', '#ff51a3'] },
  };
  const p = getCardProfile(s);
  assert.equal(p.palette, 'volt');
  const source = shareSVG(s);
  assert.match(source, /#deff4b/);
  assert.match(source, /unified-tone/);
  assert.match(source, /width="1080" height="1440"/);
});
test('insufficient direction data stays neutral and never infers low exploration', () => {
  const s = newSession();
  authored(s);
  const p = getCardProfile(s);
  assert.equal(p.palette, 'mist');
  assert.equal(p.dynamic, false);
  assert.equal(p.label, '线索待展开');
  assert.deepEqual(p.evidenceIds, []);
});
