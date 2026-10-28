import { useRef, useState } from 'react';
import { posterSVG } from '../../art.ts';
import { ColorPicker, ColorStories } from '../../components/ColorControls.tsx';
import { Art } from '../../components/ui.tsx';
import { clamp, defaultPoster, type Answer, type Palette, type Poster } from '../../core.ts';
import { useDraft } from '../../draft.ts';
import { useI18n } from '../../i18n/index.tsx';

export function PosterEditor({
  initial,
  palette,
  onChange,
}: {
  initial?: Poster;
  palette?: Palette;
  onChange: (a: Answer) => void;
}) {
  const { tr, locale } = useI18n();

  const [p, setP] = useDraft(initial ?? defaultPoster(palette?.colors), (value) =>
    onChange({ type: 'poster', value }),
  );
  const [role, setRole] = useState(1);
  const drag = useRef<{ x: number; y: number } | null>(null);
  function pos(n: Partial<Poster>) {
    setP((o) => {
      const v = { ...o, ...n };
      const half = v.align === 'middle' ? 1.5 : v.align === 'end' ? 3 : 0;
      const width = (v.size * 3) / 600;
      v.x = clamp(v.x, 0.05 + (half * v.size) / 600, 0.95 - ((3 - half) * v.size) / 600);
      v.y = clamp(v.y, 0.17, 0.72);
      if (width > 0.9) v.size = 170;
      return v;
    });
  }
  return (
    <div className="studio">
      <div className="studio-canvas poster-preview">
        <div
          className="poster-drag"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            drag.current = { x: e.clientX, y: e.clientY };
          }}
          onPointerMove={(e) => {
            if (!drag.current) return;
            const b = e.currentTarget.getBoundingClientRect(),
              dx = e.clientX - drag.current.x,
              dy = e.clientY - drag.current.y;
            drag.current = { x: e.clientX, y: e.clientY };
            pos({ x: p.x + dx / b.width, y: p.y + dy / b.height });
          }}
          onPointerUp={() => (drag.current = null)}
          onPointerCancel={() => (drag.current = null)}
        >
          <Art
            source={posterSVG(p, locale)}
            alt={tr('慢一拍海报预览；拖动画面移动标题，也可用下方滑块')}
          />
        </div>
        <span className="canvas-caption">{tr('虚构放映活动 · 拖动画布可移动标题')}</span>
      </div>
      <div className="studio-controls">
        <div className="control-heading">
          <span>{tr('换一种布局起点')}</span>
          <span className="subtle">{tr('可选')}</span>
        </div>
        <div className="layout-options">
          {['规则网格', '偏心排版', '自由叠放'].map((t, i) => (
            <button
              key={t}
              className={p.custom && p.layout === i ? 'active' : ''}
              onClick={() => {
                const coords = [
                  [0.12, 0.25],
                  [0.53, 0.3],
                  [0.12, 0.48],
                ][i];
                pos({
                  layout: i,
                  x: coords[0],
                  y: coords[1],
                  custom: true,
                  align: i === 1 ? 'middle' : 'start',
                });
              }}
            >
              {tr(t)}
            </button>
          ))}
        </div>
        <span className="control-title">{tr('标题的语气')}</span>
        <div className="segmented">
          <button className={p.serif ? 'active' : ''} onClick={() => pos({ serif: true })}>
            {tr('衬线 · 文艺')}
          </button>
          <button className={!p.serif ? 'active' : ''} onClick={() => pos({ serif: false })}>
            {tr('无衬线 · 利落')}
          </button>
        </div>
        <label className="range-label">
          {tr('标题大小')}
          <span>{tr(p.size)}px</span>
          <input
            aria-label={tr('标题大小')}
            type="range"
            min="55"
            max="145"
            value={p.size}
            onChange={(e) => pos({ size: +e.target.value })}
          />
        </label>
        <label className="range-label">
          {tr('标题上下位置')}
          <input
            aria-label={tr('标题上下位置')}
            type="range"
            min=".17"
            max=".72"
            step=".01"
            value={p.y}
            onChange={(e) => pos({ y: +e.target.value })}
          />
        </label>
        <label className="range-label">
          {tr('标题左右位置')}
          <input
            aria-label={tr('标题左右位置')}
            type="range"
            min=".05"
            max=".95"
            step=".01"
            value={p.x}
            onChange={(e) => pos({ x: +e.target.value })}
          />
        </label>
        <div className="segmented">
          {(['start', 'middle', 'end'] as const).map((v, i) => (
            <button
              key={v}
              className={p.align === v ? 'active' : ''}
              onClick={() => pos({ align: v })}
            >
              {tr(['左对齐', '居中', '右对齐'][i])}
            </button>
          ))}
        </div>
        <span className="control-title">{tr('颜色沿用上一件作品，也可以换')}</span>
        <div className="role-tabs">
          {['背景', '文字', '点缀'].map((t, i) => (
            <button key={t} className={role === i ? 'active' : ''} onClick={() => setRole(i)}>
              <i style={{ background: p.colors[i] }} />
              {tr(t)}
            </button>
          ))}
        </div>
        <ColorPicker
          prefix={tr('海报颜色')}
          color={p.colors[role]}
          onColor={(c) =>
            setP((o) => ({ ...o, colors: o.colors.map((v, i) => (i === role ? c : v)) }))
          }
        />
        <ColorStories onSelect={(colors) => setP((o) => ({ ...o, colors }))} />
      </div>
    </div>
  );
}
