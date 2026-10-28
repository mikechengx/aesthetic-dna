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
  const { tr } = useI18n();

  const [c, setC] = useDraft<Crop>(initial ?? defaultCrop(), (value) =>
    onChange({ type: 'crop', value }),
  );
  const [grid, setGrid] = useState(true);
  const drag = useRef<{ x: number; y: number } | null>(null);
  const change = (p: Partial<Crop>) => setC((old) => ({ ...old, ...p, frozen: false }));
  const aspect = c.ratio
    .split(':')
    .map(Number)
    .reduce((a, b) => a / b);
  return (
    <div className="studio crop-studio">
      <div className="studio-canvas">
        <div
          className={`crop-frame ${c.frozen ? 'is-frozen' : ''}`}
          style={{ aspectRatio: aspect, width: `min(100%, ${aspect * 385}px)` }}
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
          {tr('原创场景插画 ·')}
          {tr(c.frozen ? '已定格' : '拖动画面，寻找你的视角')}
        </span>
      </div>
      <div className="studio-controls">
        <div className="control-heading">
          <span>{tr('画幅比例')}</span>
          <button className="text-button" onClick={() => setC(defaultCrop())}>
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
  );
}
