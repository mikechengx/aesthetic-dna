import test from 'node:test';
import assert from 'node:assert/strict';
import { cameraRig, CAMERA_POSITIONS, renderPhotoWorld } from '../src/photoWorld.ts';
import { defaultCrop, newSession, analyze } from '../src/core.ts';
import { cropSVG } from '../src/art.ts';
import { personalReport } from '../src/reportInsights.ts';

test('camera positions create distinct 3D perspectives in every scene without source photos', () => {
  for (const scene of ['shanghai', 'coast', 'mountains'] as const) {
    const views = CAMERA_POSITIONS.map((p) => {
      const c = { ...defaultCrop(), scene, camera: p.id, rig: cameraRig(p.id) };
      const svg = cropSVG(c);
      assert.match(svg, /data-renderer="camera-world"/);
      assert.doesNotMatch(svg, /<image|NaN|Infinity/);
      return svg;
    });
    assert.equal(new Set(views).size, 8);
  }
});

test('physical walking differs from lens zoom and preserves the camera position on export', () => {
  const c = { ...defaultCrop(), rig: cameraRig() };
  const walked = { ...c, rig: { ...c.rig, z: -5 } };
  const zoomed = { ...c, zoom: 1.4 };
  assert.notEqual(renderPhotoWorld(walked), renderPhotoWorld(zoomed));
  assert.equal(cropSVG(JSON.parse(JSON.stringify(walked))), renderPhotoWorld(walked));
});

test('3D photography reports observed camera settings without claiming a retained source area', () => {
  const s = newSession();
  s.answers.q05 = {
    type: 'crop',
    value: {
      ...defaultCrop(),
      rig: { ...cameraRig('left'), height: 2.4 },
      camera: 'left',
      zoom: 1.5,
      intent: '保留现场故事',
      frozen: true,
    },
  };
  const report = personalReport(s, analyze(s), 'en');
  const output = JSON.stringify(report);
  assert.match(output, /42 mm/);
  assert.match(output, /2.40 m/);
  assert.doesNotMatch(output, /source area retained|keeps about/);
});
