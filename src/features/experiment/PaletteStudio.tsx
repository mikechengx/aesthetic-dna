import { useState } from 'react';
import { paletteSVG } from '../../art.ts';
import { ColorPicker, ColorStories } from '../../components/ColorControls.tsx';
import { Art } from '../../components/ui.tsx';
import { clamp, defaultPalette, type Answer, type Palette } from '../../core.ts';
import { useDraft } from '../../draft.ts';
import { useI18n } from '../../i18n/index.tsx';

export function PaletteEditor({
  initial,
  onChange,
}: {
  initial?: Palette;
  onChange: (a: Answer) => void;
}) {
  const { tr, locale } = useI18n();

  const [p, setP] = useDraft(
    initial ?? { ...defaultPalette(), name: tr(defaultPalette().name) },
    (value) => onChange({ type: 'palette', value }),
  );
  const [role, setRole] = useState(0);
  function area(i: number, v: number) {
    setP((o) => {
      let [a, b] = o.areas;
      if (i === 0) {
        a = clamp(v, 5, 90);
        b = Math.min(b, 95 - a);
      } else b = clamp(v, 5, 95 - a);
      return { ...o, areas: [a, b, 100 - a - b] };
    });
  }
  return (
    <div className="studio">
      <div className="studio-canvas palette-preview">
        <Art source={paletteSVG(p, locale)} alt={tr('你制作的三色配色卡预览')} />
      </div>
      <div className="studio-controls">
        <span className="control-title">{tr('先选一个颜色角色')}</span>
        <div className="role-tabs">
          {['背景', '主体', '点缀'].map((r, i) => (
            <button key={r} className={role === i ? 'active' : ''} onClick={() => setRole(i)}>
              <i style={{ background: p.colors[i] }} />
              {tr(r)}
            </button>
          ))}
        </div>
        <ColorPicker
          color={p.colors[role]}
          onColor={(c) =>
            setP((o) => ({ ...o, colors: o.colors.map((v, i) => (i === role ? c : v)) }))
          }
        />
        <span className="control-title">{tr('给颜色分一点位置')}</span>
        {[0, 1].map((i) => (
          <label className="range-label" key={i}>
            {tr(i ? '主体' : '背景')} <span>{tr(p.areas[i])}%</span>
            <input
              type="range"
              aria-label={tr(i ? '主体面积' : '背景面积')}
              min="5"
              max={i ? 95 - p.areas[0] : 90}
              value={p.areas[i]}
              onChange={(e) => area(i, +e.target.value)}
            />
          </label>
        ))}
        <div className="color-total">
          {tr('点缀')}
          {tr(p.areas[2])}% <span>{tr('总和 100%')}</span>
        </div>
        <label className="field-label">
          {tr('给这组颜色取个名字')}
          <input
            maxLength={18}
            value={p.name}
            placeholder={tr('我的三色片段')}
            onChange={(e) => setP((o) => ({ ...o, name: e.target.value }))}
          />
        </label>
        <small>{tr('比例只代表你的分配，没有标准答案。')}</small>
        <ColorStories onSelect={(colors, name) => setP((o) => ({ ...o, colors, name }))} />
      </div>
    </div>
  );
}
