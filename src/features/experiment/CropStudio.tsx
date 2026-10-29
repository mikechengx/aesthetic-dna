import {
  PHOTO_SCENES,
  photoScene,
  photoView,
  photoSource,
  framingPresets,
  type SceneId,
} from '../../photoScenarios.ts';
import { useRef, useState } from 'react';
import { cropSVG } from '../../art.ts';
import { Art } from '../../components/ui.tsx';
import { INTENTS } from '../../content.ts';
import { clamp, defaultCrop, type Answer, type Crop } from '../../core.ts';
import { useDraft } from '../../draft.ts';
import { useI18n } from '../../i18n/index.tsx';

export function CropEditor({
  initial,
  onChange,
  practice = false,
}: {
  initial?: Crop;
  onChange: (a: Answer) => void;
  practice?: boolean;
}) {
  const { tr, locale } = useI18n();
  const l = (zh: string, en: string) => (locale === 'zh' ? zh : en);

  const [c, setC] = useDraft<Crop>(initial ?? defaultCrop(), (value) =>
    onChange({ type: 'crop', value }),
  );
  const scene = photoScene(c),
    view = photoView(c);
  const [grid, setGrid] = useState(true);
  const drag = useRef<{ x: number; y: number } | null>(null);
  const change = (p: Partial<Crop>) => setC((old) => ({ ...old, ...p, frozen: false }));
  const aspect = c.ratio
    .split(':')
    .map(Number)
    .reduce((a, b) => a / b);
  return (
    <div className="photo-experiment">
      <div className="photo-scene-tabs" aria-label={l('选择摄影场景', 'Choose a photo scenario')}>
        {PHOTO_SCENES.map((item, i) => (
          <button
            key={item.id}
            data-scene={item.id}
            aria-pressed={c.scene === item.id}
            onClick={() => setC({ ...defaultCrop(), scene: item.id as SceneId })}
          >
            <img src={photoSource({ scene: item.id, camera: 'eye' })} alt="" />
            <span>
              <small>0{i + 1}</small>
              <b>{l(item.name, item.english)}</b>
            </span>
          </button>
        ))}
      </div>
      <div className="photo-brief">
        <span className="eyebrow">ON LOCATION / YOUR CALL</span>
        <h2>
          {scene
            ? l(scene.brief, scene.briefEn)
            : l(
                '你的旧版定格已保留，也可以选择上方的新场景。',
                'Your earlier frame is preserved. Choose a new scene above to explore.',
              )}
        </h2>
        <p>
          {l(
            '先选机位，再决定想强调什么。取景起点可继续调整，没有唯一标准答案。',
            'Choose a viewpoint, then decide what matters. Every framing preset is a starting point, not a correct answer.',
          )}
        </p>
      </div>
      <div className="studio crop-studio">
        <div className="studio-canvas">
          <div
            className={`crop-frame ${c.frozen ? 'is-frozen' : ''}`}
            style={{ aspectRatio: aspect, width: `min(100%, ${aspect * 520}px)` }}
            onPointerDown={(e) => {
              if (c.frozen) return;
              e.currentTarget.setPointerCapture(e.pointerId);
              drag.current = { x: e.clientX, y: e.clientY };
            }}
            onPointerMove={(e) => {
              if (!drag.current) return;
              const dx = e.clientX - drag.current.x,
                dy = e.clientY - drag.current.y;
              drag.current = { x: e.clientX, y: e.clientY };
              setC((o) => ({
                ...o,
                panX: clamp(o.panX - dx / 250, 0, 1),
                panY: clamp(o.panY - dy / 250, 0, 1),
                frozen: false,
              }));
            }}
            onPointerUp={() => (drag.current = null)}
            onPointerCancel={() => (drag.current = null)}
          >
            <Art source={cropSVG(c)} alt={tr('你的场景取景预览；可使用下方滑块和方向按钮调整')} />
            {grid && !c.frozen && (
              <div className="thirds">
                <i />
                <i />
                <i />
                <i />
              </div>
            )}
            <div className="crop-corner top-left" />
            <div className="crop-corner bottom-right" />
            {c.frozen && <span className="frozen-label">{tr('✓ 就这一帧')}</span>}
          </div>
          <span className="canvas-caption">
            {scene ? l('AI 写实场景 ·', 'AI-generated photo scenario ·') : tr('原创场景插画 ·')}
            {tr(c.frozen ? '已定格' : '拖动画面，寻找你的视角')}
          </span>
        </div>
        <div className="studio-controls">
          {scene && (
            <>
              <div className="control-heading">
                <span>{l('机位素材', 'Camera viewpoint')}</span>
                <small>{l('切换原始视角', 'Change the source view')}</small>
              </div>
              <div className="camera-options">
                {scene.viewpoints.map((v) => (
                  <button
                    key={v.id}
                    data-camera={v.id}
                    className={view?.id === v.id ? 'active' : ''}
                    aria-pressed={view?.id === v.id}
                    onClick={() => setC({ ...defaultCrop(), scene: scene.id, camera: v.id })}
                  >
                    {l(v.name, v.english)}
                    <span>{view?.id === v.id ? '●' : '○'}</span>
                  </button>
                ))}
              </div>
              <p className="camera-note">{view ? l(view.note, view.noteEn) : ''}</p>
              <span className="control-title">
                {l('这张图，你想突出哪里？', 'What should this frame emphasize?')}
              </span>
              <div className="framing-presets">
                {framingPresets(c).map((p) => (
                  <button key={p.id} data-framing={p.id} onClick={() => change(p.crop)}>
                    <span>{l(p.name, p.english)}</span>
                    <i>↗</i>
                  </button>
                ))}
              </div>
            </>
          )}
          <div className="control-heading">
            <span>{tr('画幅比例')}</span>
            <button
              className="text-button"
              onClick={() => setC({ ...defaultCrop(), scene: c.scene, camera: c.camera })}
            >
              {tr('重置 ↻')}
            </button>
          </div>
          <div className="segmented ratios">
            {['1:1', '4:3', '16:9', '9:16'].map((r) => (
              <button
                key={r}
                className={c.ratio === r ? 'active' : ''}
                onClick={() => change({ ratio: r })}
              >
                {tr(r)}
              </button>
            ))}
          </div>
          <label className="range-label">
            {tr('靠近一点')}
            <span>{tr(c.zoom.toFixed(1))}×</span>
            <input
              aria-label={tr('取景缩放')}
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={c.zoom}
              onChange={(e) => change({ zoom: +e.target.value })}
            />
          </label>
          <div className="move-controls">
            <span>{tr('移动取景')}</span>
            <div>
              {[
                ['←', -0.08, 0],
                ['↑', 0, -0.08],
                ['↓', 0, 0.08],
                ['→', 0.08, 0],
              ].map(([t, x, y]) => (
                <button
                  key={t}
                  aria-label={tr(`取景${t}`)}
                  onClick={() =>
                    change({
                      panX: clamp(c.panX + Number(x), 0, 1),
                      panY: clamp(c.panY + Number(y), 0, 1),
                    })
                  }
                >
                  {tr(t)}
                </button>
              ))}
            </div>
          </div>
          <label className="checkbox">
            <input type="checkbox" checked={grid} onChange={(e) => setGrid(e.target.checked)} />
            {tr('显示三分辅助线')}
          </label>
          <button className="primary" onClick={() => setC((o) => ({ ...o, frozen: true }))}>
            {tr(c.frozen ? '重新确认这一帧' : '就这一帧')} <span>⌁</span>
          </button>
          {c.frozen && (
            <div className="intent-block">
              <span className="control-title">{tr('这一帧，你想要……')}</span>
              <div className="chips">
                {INTENTS.map((t) => (
                  <button
                    className={c.intent === t ? 'active' : ''}
                    key={t}
                    onClick={() => setC((o) => ({ ...o, intent: t }))}
                  >
                    {tr(t)}
                  </button>
                ))}
              </div>
            </div>
          )}
          {practice && <small>{tr('练习副本，不改变原档案。')}</small>}
        </div>
      </div>
      <p className="photo-disclosure">
        {l(
          '场景为 AI 生成的写实练习素材，人物为虚构；机位切换使用不同视角素材，拖动与缩放调整当前画幅。只记录你最终确认的一张。',
          'Scenes are AI-generated with fictional people. Camera choices switch between prepared viewpoints; dragging and zooming adjust the current frame. Only your final confirmed frame is recorded.',
        )}
      </p>
    </div>
  );
}
