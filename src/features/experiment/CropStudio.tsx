import {
  PHOTO_SCENES,
  photoScene,
  photoView,
  photoSource,
  framingPresets,
  type SceneId,
} from '../../photoScenarios.ts';
import { CAMERA_POSITIONS, cameraRig, renderPhotoWorld, type CameraRig } from '../../photoWorld.ts';
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

  const [c, setC] = useDraft<Crop>(initial ?? { ...defaultCrop(), rig: cameraRig() }, (value) =>
    onChange({ type: 'crop', value }),
  );
  const scene = photoScene(c),
    view = photoView(c);
  const [grid, setGrid] = useState(true);
  const [panel, setPanel] = useState<'frame' | 'camera' | 'focus'>('frame');
  const drag = useRef<{ x: number; y: number } | null>(null);
  const change = (p: Partial<Crop>) => setC((old) => ({ ...old, ...p, frozen: false }));
  const moveCamera = (patch: Partial<CameraRig>) =>
    change({ rig: { ...(c.rig ?? cameraRig(c.camera)), ...patch } });
  const aspect = c.ratio
    .split(':')
    .map(Number)
    .reduce((a, b) => a / b);
  return (
    <div className="photo-experiment">
      {!c.rig && (
        <div className="photo-upgrade">
          <p>
            {l(
              '这是一张旧版取景记录。可以保留，也可以进入新的三维场景自己拍。',
              'This is an earlier framing record. Keep it, or enter the 3D scene to take your own photograph.',
            )}
          </p>
          <button
            className="primary"
            onClick={() =>
              setC({ ...defaultCrop(), scene: c.scene ?? 'shanghai', rig: cameraRig() })
            }
          >
            {l('进入自主拍摄 →', 'Enter the camera scene →')}
          </button>
        </div>
      )}
      <div className="photo-scene-tabs" aria-label={l('选择摄影场景', 'Choose a photo scenario')}>
        {PHOTO_SCENES.map((item, i) => (
          <button
            key={item.id}
            data-scene={item.id}
            aria-pressed={c.scene === item.id}
            onClick={() => setC({ ...defaultCrop(), scene: item.id as SceneId, rig: cameraRig() })}
          >
            <img
              src={
                'data:image/svg+xml;charset=utf-8,' +
                encodeURIComponent(
                  renderPhotoWorld({ ...defaultCrop(), scene: item.id, rig: cameraRig() }),
                )
              }
              alt=""
            />
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
            '走动找机位，拖动镜头转向，调整焦距。由你决定人物和环境的关系，再按下快门。',
            'Walk to your viewpoint, drag to aim and adjust the lens. Decide how the person and setting relate, then release the shutter.',
          )}
        </p>
      </div>
      <div className="studio crop-studio">
        <div className="studio-canvas">
          <div
            className={`crop-frame ${c.frozen ? 'is-frozen' : ''}`}
            style={{
              aspectRatio: aspect,
              width: `min(100%, calc(${aspect} * var(--photo-preview-height, 520px)))`,
            }}
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
              if (c.rig) {
                moveCamera({
                  yaw: clamp(c.rig.yaw - dx / 300, -1.2, 1.2),
                  pitch: clamp(c.rig.pitch + dy / 300, -0.7, 0.7),
                });
                return;
              }
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
            {c.rig
              ? l('3D 实时取景 ·', '3D live view ·')
              : scene
                ? l('旧版照片 ·', 'Earlier photo ·')
                : tr('原创场景插画 ·')}
            {tr(c.frozen ? '已定格' : '拖动画面，寻找你的视角')}
          </span>
        </div>
        <div className="studio-controls" data-active-panel={panel}>
          <div
            className="photo-control-nav"
            aria-label={l('摄影调整工具', 'Photo adjustment tools')}
          >
            {(['frame', ...(scene ? ['camera', 'focus'] : [])] as const).map((id) => (
              <button
                key={id}
                aria-pressed={panel === id}
                onClick={() => setPanel(id as typeof panel)}
              >
                {id === 'frame'
                  ? l('取景', 'Frame')
                  : id === 'camera'
                    ? l('机位', 'Camera')
                    : l('重点', 'Focus')}
              </button>
            ))}
          </div>
          {scene && (
            <>
              <div className="photo-control-panel" data-panel="camera">
                <div className="control-heading">
                  <span>{l('机位素材', 'Camera viewpoint')}</span>
                  <small>{l('切换原始视角', 'Change the source view')}</small>
                </div>
                <div className="camera-options">
                  {(c.rig
                    ? CAMERA_POSITIONS.map((v) => ({ ...v, name: v.zh, english: v.en }))
                    : scene.viewpoints
                  ).map((v) => (
                    <button
                      key={v.id}
                      data-camera={v.id}
                      className={c.camera === v.id ? 'active' : ''}
                      aria-pressed={c.camera === v.id}
                      onClick={() =>
                        setC({
                          ...defaultCrop(),
                          scene: scene.id,
                          camera: v.id,
                          ...(c.rig ? { rig: cameraRig(v.id) } : {}),
                        })
                      }
                    >
                      {l(v.name, v.english)}
                      <span>{c.camera === v.id ? '●' : '○'}</span>
                    </button>
                  ))}
                </div>
                {c.rig ? (
                  <>
                    <p className="camera-note">
                      {l(
                        '起始机位可继续走动；拖动预览转动镜头。',
                        'Keep walking from any starting point. Drag the view to aim.',
                      )}
                    </p>
                    <label className="range-label">
                      {l('相机高度', 'Camera height')}
                      <span>{c.rig.height.toFixed(2)} m</span>
                      <input
                        aria-label={l('相机高度', 'Camera height')}
                        type="range"
                        min=".2"
                        max="5"
                        step=".05"
                        value={c.rig.height}
                        onChange={(e) => moveCamera({ height: +e.target.value })}
                      />
                    </label>
                    <div className="camera-walk">
                      {(
                        [
                          ['←', -0.5, 0],
                          ['↑', 0, 0.5],
                          ['↓', 0, -0.5],
                          ['→', 0.5, 0],
                        ] as const
                      ).map(([label, x, z]) => (
                        <button
                          key={label}
                          aria-label={l(`走动${label}`, `Walk ${label}`)}
                          onClick={() =>
                            moveCamera({
                              x: clamp(c.rig!.x + x, -7, 7),
                              z: clamp(c.rig!.z + z, -16, -2.5),
                            })
                          }
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    <small>
                      {l('站位', 'Position')} X {c.rig.x.toFixed(1)} / Z {c.rig.z.toFixed(1)} m
                    </small>
                  </>
                ) : (
                  <p className="camera-note">{view ? l(view.note, view.noteEn) : ''}</p>
                )}
              </div>
              <div className="photo-control-panel" data-panel="focus">
                <span className="control-title">
                  {l('这张图，你想突出哪里？', 'What should this frame emphasize?')}
                  {c.rig && (
                    <small className="focus-hint">
                      {l(
                        '只记录意图，画面由你自己走位、转向和调焦完成。',
                        'This records your intention. Position, aim and lens are yours to set.',
                      )}
                    </small>
                  )}
                </span>
                <div className="framing-presets">
                  {framingPresets(c).map((p) => (
                    <button
                      key={p.id}
                      data-framing={p.id}
                      aria-pressed={c.intent === p.crop.intent}
                      onClick={() => (c.rig ? change({ intent: p.crop.intent }) : change(p.crop))}
                    >
                      <span>{l(p.name, p.english)}</span>
                      <i>↗</i>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
          <div className="photo-control-panel" data-panel="frame">
            <div className="control-heading">
              <span>{tr('画幅比例')}</span>
              <button
                className="text-button"
                onClick={() =>
                  setC({
                    ...defaultCrop(),
                    scene: c.scene,
                    camera: c.camera,
                    ...(c.rig ? { rig: cameraRig(c.camera) } : {}),
                  })
                }
              >
                {tr('重置 ↻')}
              </button>
            </div>
            <div className="segmented ratios">
              {['1:1', '4:3', '16:9', '9:16'].map((r) => (
                <button
                  key={r}
                  className={c.ratio === r ? 'active' : ''}
                  aria-pressed={c.ratio === r}
                  onClick={() => change({ ratio: r })}
                >
                  {tr(r)}
                </button>
              ))}
            </div>
            <label className="range-label">
              {c.rig ? l('镜头焦距', 'Lens focal length') : tr('靠近一点')}
              <span>{c.rig ? `${Math.round(28 * c.zoom)} mm` : `${c.zoom.toFixed(1)}×`}</span>
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
              <span>{c.rig ? l('镜头转向', 'Aim camera') : tr('移动取景')}</span>
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
          </div>
          <button
            className="primary"
            onClick={() => setC((o) => ({ ...o, frozen: c.rig ? !o.frozen : true }))}
          >
            {c.rig
              ? c.frozen
                ? l('重新拍一张', 'Retake photo')
                : l('按下快门', 'Take photo')
              : tr(c.frozen ? '重新确认这一帧' : '就这一帧')}{' '}
            <span>⌁</span>
          </button>
          {c.frozen && (
            <div className="intent-block">
              <span className="control-title">{tr('这一帧，你想要……')}</span>
              <div className="chips">
                {INTENTS.map((t) => (
                  <button
                    className={c.intent === t ? 'active' : ''}
                    aria-pressed={c.intent === t}
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
          '三维模型摄影练习，人物为虚构。走动改变机位与透视，拖动转动镜头，焦距改变视角；按快门保存最终画面。旧版记录仍保留原照片。',
          'A 3D model photography exercise with a fictional subject. Walking changes perspective; dragging aims the camera and focal length changes the field of view. The shutter saves your final frame. Earlier records retain their original photos.',
        )}
      </p>
    </div>
  );
}
